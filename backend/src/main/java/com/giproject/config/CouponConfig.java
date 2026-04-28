package com.giproject.config;

import com.giproject.entity.Coupon;
import com.giproject.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@Log4j2
public class CouponConfig implements CommandLineRunner {

    private final CouponRepository couponRepository;

    @Override
    public void run(String... args) throws Exception {
        // 쿠폰 종류(마스터)가 없을 때만 생성
        if (couponRepository.count() == 0) {
            log.info(">>> 시스템 마스터 쿠폰 데이터 생성을 시작합니다.");

            Coupon c1 = Coupon.builder()
                    .couponName("오픈기념 10% 할인쿠폰")
                    .discountValue(10)
                    .maxDiscount(10000)
                    .minOrderPrice(0)
                    .validDays(30)
                    .build();

            Coupon c2 = Coupon.builder()
                    .couponName("단골우대 20% 할인쿠폰")
                    .discountValue(20)
                    .maxDiscount(20000)
                    .minOrderPrice(0)
                    .validDays(30)
                    .build();

            Coupon c3 = Coupon.builder()
                    .couponName("VIP전용 30% 특별할인쿠폰")
                    .discountValue(30)
                    .maxDiscount(30000)
                    .minOrderPrice(0)
                    .validDays(30)
                    .build();

            couponRepository.saveAll(List.of(c1, c2, c3));
            log.info("✅ 마스터 쿠폰 3종 생성 완료 (화주가 버튼 클릭 시 발급 가능)");
        } else {
            log.info("ℹ️ 마스터 쿠폰 데이터가 이미 존재합니다.");
        }
    }
}