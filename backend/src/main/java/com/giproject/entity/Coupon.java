package com.giproject.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;


@Entity
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
// 지연 로딩 시 발생하는 가짜 프록시 객체를 무시
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Coupon {
	
	public enum DiscountType { FLAT, PERCENT } // FLAT: 원, PERCENT: %

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cno;

    private String couponName;
    
    @Enumerated(EnumType.STRING)
    private DiscountType discountType; // 할인 방식 (FLAT 또는 PERCENT)

    private int discountValue;   // 금액(예: 3000) 또는 비율(예: 10)
    private int maxDiscount;     // % 할인일 때 최대 할인 한도 (예: 최대 5000원)
    private int minOrderPrice;   // 최소 사용 가능 금액
    private int validDays;
}