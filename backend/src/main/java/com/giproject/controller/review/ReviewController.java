package com.giproject.controller.review;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.giproject.dto.review.ReviewDTO;
import com.giproject.service.review.ReviewService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@RequestMapping("/api/review")
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

    @GetMapping("/list")
    public ResponseEntity<List<ReviewDTO>> getList() {
        return ResponseEntity.ok(reviewService.getList());
    }
}