package com.giproject.controller.member;

import com.giproject.entity.member.MemberCoupon;
import com.giproject.service.member.MemberCouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/g2i4/coupons") // 
@RequiredArgsConstructor
public class MemberCouponController {

    private final MemberCouponService memberCouponService;

    // 1. 테스트용 쿠폰 발급
    @PostMapping("/issue-test")
    public ResponseEntity<Map<String, String>> issueTest(@RequestBody Map<String, String> body) {
        String memId = body.get("memId");
        memberCouponService.issueTestCoupons(memId);
        return ResponseEntity.ok(Map.of("result", "테스트 쿠폰 2종이 발급되었습니다."));
    }

    // 2. 내 쿠폰 목록 조회 (결제 화면에서 내 쿠폰 리스트 불러올 때 사용)
    @GetMapping("/my-list/{memId}")
    public ResponseEntity<List<MemberCoupon>> getMyCoupons(@PathVariable("memId") String memId) {
        // MemberCouponService에 getAvailableCoupons 메서드 추가 필요
        List<MemberCoupon> list = memberCouponService.getAvailableCoupons(memId);
        return ResponseEntity.ok(list);
    }
}