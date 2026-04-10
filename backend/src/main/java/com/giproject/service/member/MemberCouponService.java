package com.giproject.service.member;

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

    public void issueTestCoupons(String memId) {
        // 1. 회원 존재 확인
        Member member = memberRepository.findById(memId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. ID: " + memId));

        // 🚨 [핵심 방어 추가] 화주(MEMBER)가 아닌 경우 발급 거부!
        // 팀장님 프로젝트의 Role 필드명에 맞춰 수정하세요 (예: getRole(), getUserType() 등)
        // 7급 전산직 관점에서 '인가(Authorization)' 처리를 서버에서 한 번 더 하는 겁니다.
        if (!"MEMBER".equals(member.getUserIndex())) { 
            throw new IllegalArgumentException("쿠폰 발급은 일반 회원(화주)만 가능합니다.");
        }

        // 2. 현재 DB에 있는 모든 쿠폰 종류 가져오기
        List<Coupon> allCoupons = couponRepository.findAll();

        // 3. 각 쿠폰을 유저에게 발급
        for (Coupon coupon : allCoupons) {
            // MemberCoupon 엔티티의 필드명이 'isUsed'라면 그대로, 'used'로 바꾸셨다면 .used(false)로 수정
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