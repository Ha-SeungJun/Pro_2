package com.giproject.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.giproject.entity.Coupon;

public interface CouponRepository extends JpaRepository<Coupon, Long>{

}
