package com.giproject.controller.member;

import com.giproject.entity.member.MemberCoupon;
import com.giproject.service.member.MemberCouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
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
        return ResponseEntity.ok(Map.of("result", "테스트 쿠폰이 발급되었습니다."));
    }

 // 🚨 이 줄을 맨 앞에 // 를 붙여서 작동하지 않게 만듭니다!
 // @PreAuthorize("hasAnyAuthority('SHIPPER', 'ROLE_SHIPPER', 'ADMIN', 'ROLE_ADMIN')")
 @GetMapping("/my-list")
 public ResponseEntity<List<MemberCoupon>> getMyCoupons(Principal principal) {
     
     // 안전장치 하나만 걸어둡니다. (누군지 모르면 튕겨내기)
     if (principal == null) {
         System.out.println("🚨 앗! 프론트에서 토큰을 안 보냈거나 만료되었습니다!");
         return ResponseEntity.status(401).build();
     }

     String currentLoginId = principal.getName(); 
     System.out.println("✅ 통과된 사용자 아이디: " + currentLoginId);

     List<MemberCoupon> list = memberCouponService.getAvailableCoupons(currentLoginId);
     return ResponseEntity.ok(list);
 }
}