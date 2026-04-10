package com.giproject.controller.review;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.giproject.dto.review.MyReviewListDTO;
import com.giproject.dto.review.ReviewDTO;
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

    @PostMapping("/register")
    public ResponseEntity<Long> register(@RequestBody ReviewDTO reviewDTO) {
        log.info("리뷰 등록 : "+ reviewDTO);

        Long reviewNo = reviewService.register(reviewDTO);

        log.info("등록된 reviewNo : "+ reviewNo);

        return ResponseEntity.ok(reviewNo);
    }

    @GetMapping("/{deliveryNo}")
    public ResponseEntity<ReviewDTO> getByDeliveryNo(@PathVariable Long deliveryNo) {
        return ResponseEntity.ok(reviewService.getByDeliveryNo(deliveryNo));
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
    @PutMapping("/{reviewNo}")
    public ResponseEntity<String> modify(
            @PathVariable(name = "reviewNo") Long reviewNo,
            @RequestBody ReviewDTO reviewDTO,
            Authentication authentication){

        String loginId = authentication.getName();

        reviewService.modify(reviewNo, reviewDTO, loginId);
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
    
}