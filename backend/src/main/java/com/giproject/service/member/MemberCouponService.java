package com.giproject.service.member;

import com.giproject.entity.Coupon;
import com.giproject.entity.member.MemberCoupon;
import com.giproject.entity.member.MemberCoupon.CouponStatus; // 🚨 Enum 임포트 추가
import com.giproject.entity.member.Member;
import com.giproject.repository.CouponRepository;
import com.giproject.repository.member.MemberCouponRepository;
import com.giproject.repository.member.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MemberCouponService {

    private final MemberRepository memberRepository;
    private final CouponRepository couponRepository;
    private final MemberCouponRepository memberCouponRepository;

    // ==========================================
    // 1. 실무용 단건 발급 서비스 (컨트롤러에서 호출)
    // ==========================================
    public ResponseEntity<String> issueCouponToMember(String memId, Long cno) {
        
        // 1) 중복 발급 방지 검증 (가장 중요)
        boolean hasActiveCoupon = memberCouponRepository.existsByMember_MemIdAndCoupon_CnoAndStatusAndExpiryDateAfter(
            memId, cno, CouponStatus.ACTIVE, LocalDateTime.now()
        );

        if (hasActiveCoupon) {
            return ResponseEntity.badRequest().body("이미 유효한 해당 쿠폰을 보유하고 있습니다.");
        }

        // 2) 유저 및 마스터 쿠폰 조회
        Member member = memberRepository.findById(memId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        Coupon coupon = couponRepository.findById(cno)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 쿠폰입니다."));

        // 3) 팀장님의 권한 체크 로직 적용 (화주인지 확인)
        if (!member.getMemberRoleList().contains("USER")) {
            return ResponseEntity.badRequest().body("쿠폰 발급은 일반 회원(화주)만 가능합니다.");
        }

        // 4) 발급 및 저장
        MemberCoupon newMemberCoupon = MemberCoupon.builder()
                .member(member)
                .coupon(coupon)
                .status(CouponStatus.ACTIVE) // 🚨 Enum 적용
                .issuedAt(LocalDateTime.now()) // 발급일 기록
                .expiryDate(LocalDateTime.now().plusDays(coupon.getValidDays()))
                .build();

        memberCouponRepository.save(newMemberCoupon);
        return ResponseEntity.ok("쿠폰이 발급되었습니다.");
    }

    // ==========================================
    // 2. 테스트용 일괄 발급 (팀장님 코드 + Enum 수정)
    // ==========================================
    public void issueTestCoupons(String memId) {
    	long activeCount = memberCouponRepository.countByMember_MemIdAndStatus(memId, CouponStatus.ACTIVE);
    	if (activeCount > 0) {
    	    throw new IllegalArgumentException("이미 유효한 쿠폰을 보유 중입니다.");
    	}
        Member member = memberRepository.findById(memId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. ID: " + memId));

        // 실제 로그에 찍힌 "USER" 권한을 확인
        boolean hasMemberRole = member.getMemberRoleList().contains("USER"); 

        if (!hasMemberRole) {
            throw new IllegalArgumentException("쿠폰 발급은 일반 회원(화주)만 가능합니다.");
        }

        List<Coupon> allCoupons = couponRepository.findAll();

        for (Coupon coupon : allCoupons) {
            MemberCoupon mc = MemberCoupon.builder()
                    .member(member)
                    .coupon(coupon)
                    .status(CouponStatus.ACTIVE) // 🚨 isUsed(false) 대신 Enum 사용
                    .issuedAt(LocalDateTime.now()) // 발급일 추가
                    .expiryDate(LocalDateTime.now().plusDays(coupon.getValidDays()))
                    .build();

            memberCouponRepository.save(mc);
        }
    }

    // ==========================================
    // 3. 내 쿠폰 목록 조회 (Enum 파라미터 적용)
    // ==========================================
    public List<MemberCoupon> getAvailableCoupons(String memId) {
        // 🚨 Repository 쿼리에 맞춰 CouponStatus.ACTIVE를 파라미터로 넘겨줍니다.
        return memberCouponRepository.findAvailableCoupons(memId, CouponStatus.ACTIVE, LocalDateTime.now());
    } 
}