package com.giproject.service.member; // 팀장님 프로젝트 패키지 경로에 맞게 수정

import com.giproject.entity.Coupon;
import com.giproject.entity.member.MemberCoupon;
import com.giproject.entity.member.Member;
import com.giproject.repository.CouponRepository;
import com.giproject.repository.member.MemberCouponRepository;
import com.giproject.repository.member.MemberRepository;
import lombok.RequiredArgsConstructor;
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

    // 테스트용: 버튼(또는 테스트코드) 누를 때마다 쿠폰 2종 발급
    public void issueTestCoupons(String memId) {
        // 1. 회원 존재 확인
        Member member = memberRepository.findById(memId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. ID: " + memId));

        // 2. 현재 DB에 있는 모든 쿠폰 종류(마스터) 가져오기
        List<Coupon> allCoupons = couponRepository.findAll();

        // 3. 각 쿠폰을 유저에게 발급
        for (Coupon coupon : allCoupons) {
            // [나중에 발표할 때 주석 해제] 중복 발급 방지 로직
            /*
            if (memberCouponRepository.existsByMember_MemIdAndCoupon_Cno(memId, coupon.getCno())) {
                continue;
            }
            */

            MemberCoupon mc = MemberCoupon.builder()
                    .member(member)
                    .coupon(coupon)
                    .isUsed(false)
                    .expiryDate(LocalDateTime.now().plusDays(coupon.getValidDays()))
                    .build();

            memberCouponRepository.save(mc);
        }
        
    }
    public List<MemberCoupon> getAvailableCoupons(String memId) {
        // 현재 시간 기준으로 만료되지 않고 사용 전인 쿠폰 목록 조회
        return memberCouponRepository.findAvailableCoupons(memId, LocalDateTime.now());
    } 
}