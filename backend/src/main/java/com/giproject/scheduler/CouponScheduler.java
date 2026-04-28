package com.giproject.scheduler;

import com.giproject.entity.member.MemberCoupon.CouponStatus;
import com.giproject.repository.member.MemberCouponRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component // 🚨 중요: 스프링이 이 클래스를 관리하도록 등록
@RequiredArgsConstructor
@Log4j2
public class CouponScheduler {

    private final MemberCouponRepository memberCouponRepository;

    /**
     * 10초마다 만료된 쿠폰을 체크하여 상태를 EXPIRED로 변경합니다. (폴링 방식)
     */
    @Scheduled(fixedRate = 10000) // 10초 주기
    @Transactional
    public void expireCoupons() {
        log.info("--- [배치] 만료 쿠폰 상태 업데이트 가동 ---");

        LocalDateTime now = LocalDateTime.now();

        // 🚨 Repository에 만든 updateStatusForExpiredCoupons 호출
        int updatedCount = memberCouponRepository.updateStatusForExpiredCoupons(
                CouponStatus.EXPIRED, // 새 상태
                CouponStatus.ACTIVE,  // 기존 상태
                now                   // 기준 시간
        );

        if (updatedCount > 0) {
            log.info("✅ [배치] 총 {}개의 쿠폰이 만료 처리되었습니다.", updatedCount);
        }
    }
}