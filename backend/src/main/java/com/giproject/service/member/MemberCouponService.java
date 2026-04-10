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
        Member member = memberRepository.findById(memId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. ID: " + memId));

        //  [수정] 실제 로그에 찍힌 "USER" 권한을 확인하도록 변경
        boolean hasMemberRole = member.getMemberRoleList().contains("USER"); 

        if (!hasMemberRole) {
            throw new IllegalArgumentException("쿠폰 발급은 일반 회원(화주)만 가능합니다.");
        }

        // 2. 현재 DB에 있는 모든 쿠폰 종류 가져오기
        List<Coupon> allCoupons = couponRepository.findAll();

        for (Coupon coupon : allCoupons) {
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