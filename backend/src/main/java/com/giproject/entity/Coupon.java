package com.giproject.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Entity;
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
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cno;

    private String couponName;
        
    private int discountValue;   

    // % 할인일 때 자칫하면 할인액이 너무 커질 수 있으므로 '최대 할인 한도'는 유지
    private int maxDiscount;     

    private int minOrderPrice;   // 최소 주문 금액 조건
    private int validDays;       // 발급 후 유효 기간
}