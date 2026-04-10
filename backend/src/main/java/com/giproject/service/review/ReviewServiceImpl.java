package com.giproject.service.review;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.giproject.dto.review.MyReviewListDTO;
import com.giproject.dto.review.ReviewDTO;
import com.giproject.dto.review.ReviewSummaryDTO;
import com.giproject.entity.delivery.Delivery;
import com.giproject.entity.delivery.DeliveryStatus;
import com.giproject.entity.review.Review;
import com.giproject.repository.delivery.DeliveryRepository;
import com.giproject.repository.review.ReviewRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Transactional
@Service
@RequiredArgsConstructor
@Log4j2
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final DeliveryRepository deliveryRepository;

    @Override
    public Long register(ReviewDTO reviewDTO) {

        //필수값 검증
        if (reviewDTO.getDeliveryNo() == null) {
            throw new IllegalArgumentException("배송 번호가 필요합니다.");
        }

        if (reviewDTO.getRating() == null) {
            throw new IllegalArgumentException("별점은 필수입니다.");
        }

        //배송 존재 확인
        Delivery delivery = deliveryRepository.findById(reviewDTO.getDeliveryNo())
                .orElseThrow(() -> new IllegalStateException("배송 정보가 존재하지 않습니다."));

        //배송 완료 상태 검증
        if (delivery.getStatus() != DeliveryStatus.COMPLETED) {
            throw new IllegalStateException("배송 완료된 건만 리뷰 작성이 가능합니다.");
        }

        //중복 리뷰 확인
        if (reviewRepository.existsByDeliveryNo(reviewDTO.getDeliveryNo())) {
            throw new IllegalStateException("이미 리뷰가 작성된 배송입니다.");
        }

        //별점 검증 (0.0 ~ 5.0, 0.5 단위)
        BigDecimal rating = reviewDTO.getRating();

        if (rating.compareTo(BigDecimal.ZERO) < 0 ||
            rating.compareTo(new BigDecimal("5.0")) > 0) {
            throw new IllegalArgumentException("별점은 0.0 이상 5.0 이하만 가능합니다.");
        }

        if (rating.remainder(new BigDecimal("0.5")).compareTo(BigDecimal.ZERO) != 0) {
            throw new IllegalArgumentException("별점은 0.5 단위만 가능합니다.");
        }

        //저장
        Review review = Review.builder()
                .deliveryNo(reviewDTO.getDeliveryNo())
                .rating(rating)
                .comment(reviewDTO.getComment())
                .build();

        return reviewRepository.save(review).getReviewNo();
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
        return ReviewDTO.builder()
                .reviewNo(review.getReviewNo())
                .deliveryNo(review.getDeliveryNo())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }

  //작성자, 관리자만 삭제 가능
	@Override
	public void remove(Long reviewNo, String loginId, boolean isAdmin) {

	    Review review = reviewRepository.findById(reviewNo)
	            .orElseThrow(() -> new IllegalStateException("삭제할 리뷰가 존재하지 않습니다."));

	    if (isAdmin) {
	        reviewRepository.delete(review);
	        return;
	    }

	    String writerMemId = reviewRepository.findWriterMemIdByReviewNo(reviewNo)
	            .orElseThrow(() -> new IllegalStateException("리뷰 작성자 정보를 찾을 수 없습니다."));

	    if (!writerMemId.equals(loginId)) {
	        throw new IllegalStateException("본인이 작성한 리뷰만 삭제할 수 있습니다.");
	    }

	    reviewRepository.delete(review);
	}

    @Override
    public void modify(Long reviewNo, ReviewDTO reviewDTO, String loginId) {

        Review review = reviewRepository.findById(reviewNo)
                .orElseThrow(() -> new IllegalStateException("수정할 리뷰가 존재하지 않습니다."));

        String writerMemId = reviewRepository.findWriterMemIdByReviewNo(reviewNo)
                .orElseThrow(() -> new IllegalStateException("리뷰 작성자 정보를 찾을 수 없습니다."));

        if (!writerMemId.equals(loginId)) {
            throw new IllegalStateException("본인이 작성한 리뷰만 수정할 수 있습니다.");
        }

        if (reviewDTO.getRating() == null) {
            throw new IllegalArgumentException("별점은 필수입니다.");
        }

        validateRating(reviewDTO.getRating());

        review.changeRating(reviewDTO.getRating());
        review.changeComment(reviewDTO.getComment());
        
        reviewRepository.save(review);
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
	


}