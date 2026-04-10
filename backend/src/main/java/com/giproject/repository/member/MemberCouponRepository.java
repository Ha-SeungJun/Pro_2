package com.giproject.repository.member;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.giproject.entity.member.MemberCoupon;

public interface MemberCouponRepository extends JpaRepository<MemberCoupon, Long>{

	@Query("Select mc From MemberCoupon mc Join Fetch mc.coupon "
	        + "Where mc.member.memId = :memId AND mc.isUsed = false AND mc.expiryDate > :now")
	List<MemberCoupon> findAvailableCoupons(@Param("memId") String memId, @Param("now") LocalDateTime now);
}
