package com.giproject.repository.member;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.giproject.entity.member.MemberCoupon;
import com.giproject.entity.member.MemberCoupon.CouponStatus;

public interface MemberCouponRepository extends JpaRepository<MemberCoupon, Long> {

    // 1. 프론트엔드 제공용 (팀장님 작성 코드 + Enum 적용)
    
//    	특정 회원의 '사용 가능(ACTIVE)' 상태이며 만료되지 않은 쿠폰 목록 조회
    
    @Query("SELECT mc FROM MemberCoupon mc JOIN FETCH mc.coupon "
         + "WHERE mc.member.memId = :memId "
         + "AND mc.status = :status "
         + "AND mc.expiryDate > :now")
    List<MemberCoupon> findAvailableCoupons(
            @Param("memId") String memId, 
            @Param("status") CouponStatus status, // Enum 파라미터 추가
            @Param("now") LocalDateTime now
    );

    // 2. 백엔드 쿠폰 발급 검증용
//      특정 회원이 해당 쿠폰을 이미 '사용 가능(ACTIVE)' 상태로 들고 있는지 중복 체크

    boolean existsByMember_MemIdAndCoupon_CnoAndStatusAndExpiryDateAfter(
            String memId, Long cno, CouponStatus status, LocalDateTime now
    );

    // 3. 스케줄러 배치 처리용 (투트랙 라이프사이클)
//     [트랙 1] 기한이 지난 ACTIVE 쿠폰을 EXPIRED(만료) 상태로 일괄 변경 (논리적 삭제)

    @Modifying(clearAutomatically = true)
    @Query("UPDATE MemberCoupon mc SET mc.status = :newStatus WHERE mc.status = :oldStatus AND mc.expiryDate < :now")
    int updateStatusForExpiredCoupons(
            @Param("newStatus") CouponStatus newStatus, 
            @Param("oldStatus") CouponStatus oldStatus, 
            @Param("now") LocalDateTime now
    );


//      [트랙 2] 상태가 EXPIRED(만료)이고 설정한 날짜(cutoffDate)가 지난 진짜 쓰레기 데이터 영구 삭제

    int deleteByStatusAndExpiryDateBefore(CouponStatus status, LocalDateTime cutoffDate);

	long countByMember_MemIdAndStatus(String memId, CouponStatus active);
}