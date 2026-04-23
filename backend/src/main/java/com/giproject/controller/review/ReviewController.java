package com.giproject.controller.review;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.giproject.dto.review.DriverDetailDTO;
import com.giproject.dto.review.DriverProfileCardDTO;
import com.giproject.dto.review.MyReviewListDTO;
import com.giproject.dto.review.MyReviewWithDriverIdDTO;
import com.giproject.dto.review.ReviewCreateRequest;
import com.giproject.dto.review.ReviewDTO;
import com.giproject.dto.review.ReviewModifyRequest;
import com.giproject.dto.review.ReviewSummaryDTO;
import com.giproject.service.review.ReviewService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@RequestMapping("/g2i4/review")
@RequiredArgsConstructor
@Log4j2
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Long> register(@ModelAttribute ReviewCreateRequest request) {
        log.info("리뷰 등록 요청 deliveryNo={}, rating={}, imageCount={}",
                request.getDeliveryNo(),
                request.getRating(),
                request.getImages() == null ? 0 : request.getImages().size());

        Long reviewNo = reviewService.register(request);

        log.info("등록된 reviewNo : {}", reviewNo);

        return ResponseEntity.ok(reviewNo);
    }

    @GetMapping("/{deliveryNo}")
    public ResponseEntity<ReviewDTO> getByDeliveryNo(@PathVariable Long deliveryNo) {
        return ResponseEntity.ok(reviewService.getByDeliveryNo(deliveryNo));
    }
    @GetMapping("/detail/{reviewNo}")
    public ResponseEntity<ReviewDTO> getByReviewNo(
            @PathVariable(name = "reviewNo") Long reviewNo) {
        return ResponseEntity.ok(reviewService.getByReviewNo(reviewNo));
    }
    
    @GetMapping("/exists/{deliveryNo}")
    public ResponseEntity<Boolean> existsByDeliveryNo(
    		@PathVariable(name = "deliveryNo") Long deliveryNo) {
        return ResponseEntity.ok(reviewService.existsByDeliveryNo(deliveryNo));
    }

    @GetMapping("/list")
    public ResponseEntity<List<ReviewDTO>> getList() {
        return ResponseEntity.ok(reviewService.getList());
    }

    @DeleteMapping("/{reviewNo}")
    public ResponseEntity<String> remove(
            @PathVariable(name = "reviewNo") Long reviewNo,
            @RequestParam(value = "isAdmin", defaultValue = "false") boolean isAdmin,
            Authentication authentication) {

        String loginId = authentication.getName();

        reviewService.remove(reviewNo, loginId, isAdmin);
        return ResponseEntity.ok("리뷰가 삭제되었습니다.");
    }
    @PutMapping(value = "/{reviewNo}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> modify(
            @PathVariable(name = "reviewNo") Long reviewNo,
            @ModelAttribute ReviewModifyRequest request,
            Authentication authentication) {

        String loginId = authentication.getName();
        reviewService.modify(reviewNo, request, loginId);
        return ResponseEntity.ok("리뷰가 수정되었습니다.");
    }
 
    @GetMapping("/summary/{cargoId}")
    public ResponseEntity<ReviewSummaryDTO> getSummary(
    		@PathVariable(name = "cargoId") String cargoId){
    	return ResponseEntity.ok(reviewService.getSummaryByCargoId(cargoId));
    }
    @GetMapping("/driver/{cargoId}")
    public ResponseEntity<Page<ReviewDTO>> getReviewsByCargoId(
            @PathVariable("cargoId") String cargoId,
            @PageableDefault(size = 10) Pageable pageable) {

        return ResponseEntity.ok(reviewService.getReviewsByCargoId(cargoId, pageable));
    }
    @GetMapping("/my")
    public ResponseEntity<List<MyReviewListDTO>> getMyReviews(Authentication authentication) {
        log.info("authentication = {}", authentication);
        log.info("loginId = {}", authentication.getName());

        String loginId = authentication.getName();
        return ResponseEntity.ok(reviewService.getMyReviews(loginId));
    }
    @GetMapping("/received")
    public ResponseEntity<List<MyReviewListDTO>> getReceivedReviews(Authentication authentication) {
        String loginId = authentication.getName();
        return ResponseEntity.ok(reviewService.getReceivedReviews(loginId));
    }
    @GetMapping("/summary/my")
    public ResponseEntity<ReviewSummaryDTO> getMyReceivedReviewSummary(Authentication authentication) {
        String loginId = authentication.getName();
        return ResponseEntity.ok(reviewService.getSummaryByCargoId(loginId));
    }
    @GetMapping("/my/with-driver-id")
    public ResponseEntity<List<MyReviewWithDriverIdDTO>> getMyReviewsWithDriverId(Authentication authentication) {
        log.info("authentication = {}", authentication);
        log.info("loginId = {}", authentication.getName());

        String loginId = authentication.getName();
        return ResponseEntity.ok(reviewService.getMyReviewsWithDriverId(loginId));
    }

    @GetMapping("/driver-profile/{cargoId}")
    public ResponseEntity<DriverProfileCardDTO> getDriverProfileCard(
            @PathVariable(name = "cargoId") String cargoId) {
        return ResponseEntity.ok(reviewService.getDriverProfileCard(cargoId));
    }
    @GetMapping("/driver-detail/{cargoId}")
    public ResponseEntity<DriverDetailDTO> getDriverDetail(
            @PathVariable(name = "cargoId") String cargoId) {
        return ResponseEntity.ok(reviewService.getDriverDetail(cargoId));
    }
    
    
}