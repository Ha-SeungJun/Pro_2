package com.giproject.controller.member;

import com.giproject.entity.member.MemberCoupon;
import com.giproject.service.member.MemberCouponService; 
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/g2i4/coupons") 
@RequiredArgsConstructor
@Slf4j
public class MemberCouponController {

    private final MemberCouponService membercouponService; 

    // ==========================================
    // 1. 실무형 쿠폰 발급 API (투트랙 로직 적용)
    // ==========================================
    @PostMapping("/issue")
    public ResponseEntity<String> issueCoupon(@RequestBody Map<String, Object> body, Principal principal) {
        
        if (principal == null) {
            return ResponseEntity.status(401).body("로그인이 필요한 서비스입니다.");
        }

        try {
            String currentLoginId = principal.getName();
            Long cno = Long.valueOf(body.get("cno").toString()); 

            log.info("🎫 쿠폰 발급 요청 - 회원: {}, 쿠폰번호(cno): {}", currentLoginId, cno);
            
            return membercouponService.issueCouponToMember(currentLoginId, cno);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("쿠폰 발급 에러", e);
            return ResponseEntity.internalServerError().body("서버 오류가 발생했습니다.");
        }
    }

    // ==========================================
    // 2. 내 쿠폰 목록 조회 (ACTIVE 상태만)
    // ==========================================
    // @PreAuthorize("hasAnyAuthority('SHIPPER', 'ROLE_SHIPPER', 'ADMIN', 'ROLE_ADMIN')")
    @GetMapping("/my-list")
    public ResponseEntity<List<MemberCoupon>> getMyCoupons(Principal principal) {
        
        if (principal == null) {
            log.warn("🚨 앗! 프론트에서 토큰을 안 보냈거나 만료되었습니다!");
            return ResponseEntity.status(401).build();
        }

        String currentLoginId = principal.getName(); 
        log.info("✅ 통과된 사용자 아이디: {}", currentLoginId);

        List<MemberCoupon> list = membercouponService.getAvailableCoupons(currentLoginId);
        
        return ResponseEntity.ok(list);
    }

    // ==========================================
    // 3. 테스트용 마스터 쿠폰 일괄 발급 API (🚨 새로 추가된 부분)
    // ==========================================
    @PostMapping("/issue-test")
    public ResponseEntity<String> issueTest(@RequestBody Map<String, String> body) {
        try {
            // 프론트(또는 포스트맨)에서 {"memId": "test1"} 형태로 보낸다고 가정
            String memId = body.get("memId");
            
            log.info("🎫 테스트용 쿠폰 일괄 발급 요청 - 대상 아이디: {}", memId);
            
            // 서비스의 테스트 발급 메서드 호출
            membercouponService.issueTestCoupons(memId);
            
            return ResponseEntity.ok("테스트 쿠폰이 성공적으로 발급되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("테스트 쿠폰 발급 에러", e);
            return ResponseEntity.internalServerError().body("발급 중 오류가 발생했습니다.");
        }
    }
}