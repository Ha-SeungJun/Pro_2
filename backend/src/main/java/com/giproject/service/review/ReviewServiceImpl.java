package com.giproject.service.review;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.giproject.dto.review.DriverDetailDTO;
import com.giproject.dto.review.DriverProfileCardDTO;
import com.giproject.dto.review.MyReviewListDTO;
import com.giproject.dto.review.MyReviewWithDriverIdDTO;
import com.giproject.dto.review.ReviewCreateRequest;
import com.giproject.dto.review.ReviewDTO;
import com.giproject.dto.review.ReviewImageDTO;
import com.giproject.dto.review.ReviewModifyRequest;
import com.giproject.dto.review.ReviewSummaryDTO;
import com.giproject.entity.delivery.Delivery;
import com.giproject.entity.delivery.DeliveryStatus;
import com.giproject.entity.review.Review;
import com.giproject.entity.review.ReviewImage;
import com.giproject.repository.delivery.DeliveryRepository;
import com.giproject.repository.review.ReviewImageRepository;
import com.giproject.repository.review.ReviewRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import net.coobird.thumbnailator.Thumbnails;

@Transactional
@Service
@RequiredArgsConstructor
@Log4j2
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final DeliveryRepository deliveryRepository;
    private final ReviewImageRepository reviewImageRepository;
    @Value("${com.fullstack.upload.path}")
    private String uploadPath;

    @Override
    public Long register(ReviewCreateRequest request) {

        //필수값 검증
        if (request.getDeliveryNo() == null) {
            throw new IllegalArgumentException("배송 번호가 필요합니다.");
        }

        if (request.getRating() == null) {
            throw new IllegalArgumentException("별점은 필수입니다.");
        }

        //배송 존재 확인
        Delivery delivery = deliveryRepository.findById(request.getDeliveryNo())
                .orElseThrow(() -> new IllegalStateException("배송 정보가 존재하지 않습니다."));

        //배송 완료 상태 검증
        if (delivery.getStatus() != DeliveryStatus.COMPLETED) {
            throw new IllegalStateException("배송 완료된 건만 리뷰 작성이 가능합니다.");
        }

        //중복 리뷰 확인
        if (reviewRepository.existsByDeliveryNo(request.getDeliveryNo())) {
            throw new IllegalStateException("이미 리뷰가 작성된 배송입니다.");
        }

        //별점 검증 (0.0 ~ 5.0, 0.5 단위)
        BigDecimal rating = request.getRating();

        if (rating.compareTo(BigDecimal.ZERO) < 0 ||
            rating.compareTo(new BigDecimal("5.0")) > 0) {
            throw new IllegalArgumentException("별점은 0.0 이상 5.0 이하만 가능합니다.");
        }

        if (rating.remainder(new BigDecimal("0.5")).compareTo(BigDecimal.ZERO) != 0) {
            throw new IllegalArgumentException("별점은 0.5 단위만 가능합니다.");
        }

        //저장
        Review review = Review.builder()
                .deliveryNo(request.getDeliveryNo())
                .rating(rating)
                .comment(request.getComment())
                .build();

        Review savedReview = reviewRepository.save(review);

        validateImages(request.getImages());
        saveImages(savedReview, request.getImages());

        return savedReview.getReviewNo();
    }
    
    //이미지 검증
    private void validateImages(List<MultipartFile> images) {
        if (images == null || images.isEmpty()) {
            return;
        }

        if (images.size() > 3) {
            throw new IllegalArgumentException("이미지는 최대 3장까지 업로드 가능합니다.");
        }

        for (MultipartFile image : images) {
            if (image == null || image.isEmpty()) {
                continue;
            }

            if (image.getSize() > 10 * 1024 * 1024) {
                throw new IllegalArgumentException("이미지 1개당 최대 10MB까지 업로드 가능합니다.");
            }

            String contentType = image.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new IllegalArgumentException("이미지 파일만 업로드 가능합니다.");
            }

            String originalFilename = image.getOriginalFilename();
            if (originalFilename == null || originalFilename.isBlank()) {
                throw new IllegalArgumentException("파일명이 올바르지 않습니다.");
            }

            String lower = originalFilename.toLowerCase();
            if (!(lower.endsWith(".jpg")
                    || lower.endsWith(".jpeg")
                    || lower.endsWith(".png")
                    || lower.endsWith(".webp"))) {
                throw new IllegalArgumentException("jpg, jpeg, png, webp 파일만 업로드 가능합니다.");
            }
        }
    }
    private void storeImages(Review review, List<MultipartFile> images, int startSortOrder) {
        if (images == null || images.isEmpty()) {
            return;
        }

        File originalDir = new File(uploadPath, "review/original");
        File thumbDir = new File(uploadPath, "review/thumb");

        if (!originalDir.exists()) {
            originalDir.mkdirs();
        }

        if (!thumbDir.exists()) {
            thumbDir.mkdirs();
        }

        int sortOrder = startSortOrder;

        for (MultipartFile image : images) {
            if (image == null || image.isEmpty()) {
                continue;
            }

            String originalFilename = image.getOriginalFilename();
            String savedFileName = UUID.randomUUID() + "_" + originalFilename;

            File originalFile = new File(originalDir, savedFileName);
            File thumbnailFile = new File(thumbDir, savedFileName);

            try {
                // 원본 저장
                image.transferTo(originalFile);

                // 썸네일 생성
                Thumbnails.of(originalFile)
                        .size(300, 300)
                        .keepAspectRatio(true)
                        .toFile(thumbnailFile);

            } catch (IOException e) {
                throw new RuntimeException("이미지 저장 중 오류가 발생했습니다.", e);
            }

            String imagePath = "review/original/" + savedFileName;
            String thumbnailPath = "review/thumb/" + savedFileName;

            ReviewImage reviewImage = ReviewImage.builder()
                    .review(review)
                    .imagePath(imagePath)
                    .thumbnailPath(thumbnailPath)
                    .sortOrder(sortOrder++)
                    .build();

            reviewImageRepository.save(reviewImage);
        }
    }
    //이미지 저장
    private void saveImages(Review review, List<MultipartFile> images) {
    	storeImages(review, images, 0);
    }
    @Override
    public ReviewDTO getByDeliveryNo(Long deliveryNo) {
        Review review = reviewRepository.findByDeliveryNo(deliveryNo)
                .orElseThrow(() -> new IllegalStateException("리뷰가 존재하지 않습니다."));

        return entityToDTO(review);
    }

    @Override
    public List<ReviewDTO> getList() {
        log.info("getList call .....");

        return reviewRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::entityToDTO)
                .toList();
    }

    // 엔티티 -> DTO 변환
    private ReviewDTO entityToDTO(Review review) {

        List<ReviewImageDTO> images = reviewImageRepository
        		.findByReviewOrderBySortOrderAsc(review)
                .stream()
                .map(image -> ReviewImageDTO.builder()
                        .reviewImageNo(image.getReviewImageNo())
                        .imagePath(image.getImagePath())
                        .thumbnailPath(image.getThumbnailPath())
                        .build())
                .toList();

        return ReviewDTO.builder()
                .reviewNo(review.getReviewNo())
                .deliveryNo(review.getDeliveryNo())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .images(images)
                .build();
    }

  //작성자, 관리자만 삭제 가능
	@Override
	public void remove(Long reviewNo, String loginId, boolean isAdmin) {

	    Review review = reviewRepository.findById(reviewNo)
	            .orElseThrow(() -> new IllegalStateException("삭제할 리뷰가 존재하지 않습니다."));

	    if (isAdmin) {
	        deleteAllReviewImageFiles(review);
	        reviewRepository.delete(review);
	        return;
	    }

	    String writerMemId = reviewRepository.findWriterMemIdByReviewNo(reviewNo)
	            .orElseThrow(() -> new IllegalStateException("리뷰 작성자 정보를 찾을 수 없습니다."));

	    if (!writerMemId.equals(loginId)) {
	        throw new IllegalStateException("본인이 작성한 리뷰만 삭제할 수 있습니다.");
	    }

	    deleteAllReviewImageFiles(review);
	    reviewRepository.delete(review);
	}

    @Override
    public void modify(Long reviewNo, ReviewModifyRequest request, String loginId) {

        Review review = reviewRepository.findById(reviewNo)
                .orElseThrow(() -> new IllegalStateException("수정할 리뷰가 존재하지 않습니다."));

        String writerMemId = reviewRepository.findWriterMemIdByReviewNo(reviewNo)
                .orElseThrow(() -> new IllegalStateException("리뷰 작성자 정보를 찾을 수 없습니다."));

        if (!writerMemId.equals(loginId)) {
            throw new IllegalStateException("본인이 작성한 리뷰만 수정할 수 있습니다.");
        }

        if (request.getRating() == null) {
            throw new IllegalArgumentException("별점은 필수입니다.");
        }

        validateRating(request.getRating());

        // 1. 리뷰 본문 수정
        review.changeRating(request.getRating());
        review.changeComment(request.getComment());
        reviewRepository.save(review);

        // 2. 삭제할 이미지 삭제
        deleteReviewImages(reviewNo, request.getDeleteImageIds());

        // 3. 새 이미지 추가
        validateImages(request.getNewImages());
        appendImages(review, request.getNewImages());

        // 4. 정렬번호 재정리
        reorderImages(review);
    }
    private void deleteFileIfExists(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) {
            return;
        }

        File file = new File(uploadPath, relativePath);

        if (file.exists() && !file.delete()) {
            log.warn("파일 삭제 실패: {}", file.getAbsolutePath());
        }
    }
    private void deleteReviewImages(Long reviewNo, List<Long> deleteImageIds) {
        if (deleteImageIds == null || deleteImageIds.isEmpty()) {
            return;
        }

        List<ReviewImage> images = reviewImageRepository.findByReviewImageNoIn(deleteImageIds);

        List<Long> validImageIds = images.stream()
                .filter(image -> reviewNo.equals(image.getReview().getReviewNo()))
                .map(ReviewImage::getReviewImageNo)
                .toList();

        for (ReviewImage image : images) {
            if (!reviewNo.equals(image.getReview().getReviewNo())) {
                continue;
            }

            deleteFileIfExists(image.getImagePath());
            deleteFileIfExists(image.getThumbnailPath());
        }

        if (!validImageIds.isEmpty()) {
            reviewImageRepository.deleteByReviewImageNoIn(validImageIds);
        }
    }
    private void deleteAllReviewImageFiles(Review review) {
        List<ReviewImage> images = reviewImageRepository.findByReviewOrderBySortOrderAsc(review);

        for (ReviewImage image : images) {
            File file = new File(uploadPath, image.getImagePath());
            if (file.exists()) {
                file.delete();
            }
        }

        reviewImageRepository.deleteByReview(review);
    }
    private void reorderImages(Review review) {
        List<ReviewImage> images = reviewImageRepository.findByReviewOrderBySortOrderAsc(review);

        for (int i = 0; i < images.size(); i++) {
            images.get(i).setSortOrder(i);
        }

        reviewImageRepository.saveAll(images);
    }
    private void appendImages(Review review, List<MultipartFile> images) {
    	 if (images == null || images.isEmpty()) {
    	        return;
    	    }

    	    int startSortOrder = reviewImageRepository
    	            .findByReviewOrderBySortOrderAsc(review)
    	            .size();

    	    storeImages(review, images, startSortOrder);
    }
    private void validateRating(BigDecimal rating) {
        if (rating.compareTo(BigDecimal.ZERO) < 0 ||
            rating.compareTo(new BigDecimal("5.0")) > 0) {
            throw new IllegalArgumentException("별점은 0.0 이상 5.0 이하만 가능합니다.");
        }

        if (rating.remainder(new BigDecimal("0.5")).compareTo(BigDecimal.ZERO) != 0) {
            throw new IllegalArgumentException("별점은 0.5 단위만 가능합니다.");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewSummaryDTO getSummaryByCargoId(String cargoId) {

        return reviewRepository.findReviewSummaryByCargoId(cargoId)
                .orElse(
                    ReviewSummaryDTO.builder()
                        .cargoId(cargoId)
                        .avgRating(0.0)
                        .reviewCount(0L)
                        .build()
                );
    }
    @Override
    @Transactional(readOnly = true)
    public Page<ReviewDTO> getReviewsByCargoId(String cargoId, Pageable pageable) {
        return reviewRepository.findReviewsByCargoId(cargoId, pageable)
                .map(this::entityToDTO);
    }

	@Override
	public boolean existsByDeliveryNo(Long deliveryNo) {
		return reviewRepository.existsByDeliveryNo(deliveryNo);
	}
	
	@Override
	@Transactional(readOnly = true)
	public List<MyReviewListDTO> getMyReviews(String memId) {
	    return reviewRepository.findMyReviewsByWriterMemId(memId);
	}
	@Override
	@Transactional(readOnly = true)
	public List<MyReviewListDTO> getReceivedReviews(String cargoId) {
	    List<MyReviewListDTO> list = reviewRepository.findReceivedReviewsByCargoId(cargoId);

	    if (list.isEmpty()) {
	        return list;
	    }

	    List<Long> reviewNos = list.stream()
	            .map(MyReviewListDTO::getReviewNo)
	            .toList();

	    List<ReviewImage> allImages = reviewImageRepository.findAllByReviewNos(reviewNos);

	    Map<Long, List<ReviewImageDTO>> imageMap = allImages.stream()
	            .collect(Collectors.groupingBy(
	                    image -> image.getReview().getReviewNo(),
	                    Collectors.mapping(
	                            image -> ReviewImageDTO.builder()
	                                    .reviewImageNo(image.getReviewImageNo())
	                                    .imagePath(image.getImagePath())
	                                    .build(),
	                            Collectors.toList()
	                    )
	            ));

	    list.forEach(dto ->
	            dto.setImages(imageMap.getOrDefault(dto.getReviewNo(), List.of()))
	    );

	    return list;
	}
	@Override
	@Transactional(readOnly = true)
	public List<MyReviewWithDriverIdDTO> getMyReviewsWithDriverId(String memId) {
	    List<MyReviewWithDriverIdDTO> list =
	            reviewRepository.findMyReviewsWithDriverIdByWriterMemId(memId);

	    if (list.isEmpty()) {
	        return list;
	    }

	    List<Long> reviewNos = list.stream()
	            .map(MyReviewWithDriverIdDTO::getReviewNo)
	            .toList();

	    List<ReviewImage> allImages =
	            reviewImageRepository.findAllByReviewNos(reviewNos);

	    Map<Long, List<ReviewImageDTO>> imageMap = allImages.stream()
	            .collect(Collectors.groupingBy(
	                    image -> image.getReview().getReviewNo(),
	                    Collectors.mapping(
	                            image -> ReviewImageDTO.builder()
	                                    .reviewImageNo(image.getReviewImageNo())
	                                    .imagePath(image.getImagePath())
	                                    .build(),
	                            Collectors.toList()
	                    )
	            ));

	    list.forEach(dto ->
	            dto.setImages(imageMap.getOrDefault(dto.getReviewNo(), List.of()))
	    );

	    return list;
	}

	@Override
	public DriverProfileCardDTO getDriverProfileCard(String cargoId) {
	    DriverProfileCardDTO dto = reviewRepository.findDriverProfileCardByCargoId(cargoId)
	        .orElseThrow(() -> new IllegalArgumentException("차주 프로필을 찾을 수 없습니다. cargoId=" + cargoId));

	    if (dto.getAvgRating() == null) {
	        dto.setAvgRating(java.math.BigDecimal.ZERO);
	    }

	    if (dto.getReviewCount() == null) {
	        dto.setReviewCount(0L);
	    }

	    if (dto.getIsVerified() == null) {
	        dto.setIsVerified(false);
	    }

	    return dto;
	}
	@Override
	public DriverDetailDTO getDriverDetail(String cargoId) {
	    DriverProfileCardDTO profile = getDriverProfileCard(cargoId);
	    List<MyReviewListDTO> reviews = reviewRepository.findReceivedReviewsByCargoId(cargoId);

	    return DriverDetailDTO.builder()
	            .profile(profile)
	            .reviews(reviews)
	            .build();
	}

	@Override
	public ReviewDTO getByReviewNo(Long reviewNo) {
	    Review review = reviewRepository.findById(reviewNo)
	            .orElseThrow(() -> new IllegalStateException("리뷰가 존재하지 않습니다."));

	    return entityToDTO(review);
	}
	


}