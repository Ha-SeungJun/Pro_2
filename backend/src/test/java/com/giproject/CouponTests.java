package com.giproject; 

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Commit;
import org.springframework.transaction.annotation.Transactional;

import com.giproject.entity.Coupon;
import com.giproject.entity.Coupon.DiscountType;
import com.giproject.repository.CouponRepository;
import com.giproject.service.member.MemberCouponService;

@SpringBootTest
public class CouponTests {

    @Autowired
    private CouponRepository couponRepository;

//    @Test
    @Transactional
    @Commit // 테스트가 끝나도 롤백되지 않고 DB에 남도록 설정 ✅
    public void insertBaseCoupons() {
        // 1. 정액 할인 쿠폰 (5,000원)
        Coupon c1 = Coupon.builder()
                .couponName("신규가입 5천원 할인쿠폰")
                .discountType(DiscountType.FLAT)
                .discountValue(5000)
                .maxDiscount(5000)
                .minOrderPrice(20000)
                .validDays(30)
                .build();

        // 2. 정율 할인 쿠폰 (10%)
        Coupon c2 = Coupon.builder()
                .couponName("오픈기념 10% 할인쿠폰")
                .discountType(DiscountType.PERCENT)
                .discountValue(10)
                .maxDiscount(10000)
                .minOrderPrice(0)
                .validDays(30)
                .build();

        couponRepository.save(c1);
        couponRepository.save(c2);

        System.out.println(">>> 테스트 쿠폰 마스터 데이터 삽입 완료!");
    }
    @Autowired
    private MemberCouponService memberCouponService; // 서비스 주입

    @Test
    @Transactional
    @Commit
    public void testIssueCoupons() {
        // HeidiSQL의 member 테이블에 있는 아이디 중 하나를 넣으세요 (예: 'admin')
        String testId = "admin"; 
        
        memberCouponService.issueTestCoupons(testId);
        
        System.out.println(">>> " + testId + " 사용자에 대해 쿠폰 발급 완료!");
    }
}