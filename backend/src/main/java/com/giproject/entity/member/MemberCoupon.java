package com.giproject.entity.member;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.giproject.entity.Coupon;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Table(name = "member_coupon")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"member", "coupon"})
public class MemberCoupon {

    // 🚨 3단계 상태 관리를 위한 Enum 선언
    public enum CouponStatus {
        ACTIVE,   // 사용 가능
        USED,     // 사용 완료
        EXPIRED   // 기간 만료 (논리적 삭제용)
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long mcno;
    
    // 쿠폰 소유자
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mem_id")
    private Member member;

    // 쿠폰 종류 (정책 마스터)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cno")
    private Coupon coupon;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private CouponStatus status = CouponStatus.ACTIVE;

    private LocalDateTime expiryDate;  // 만료 일시
    private LocalDateTime usedDate;    // 실제 사용 일시
    
    // 1. 쿠폰 사용 처리
    public void useCoupon() {
        this.status = CouponStatus.USED;
        this.usedDate = LocalDateTime.now();
    }

    // 2. 쿠폰 만료 처리 (스케줄러가 호출)
    public void expireCoupon() {
        this.status = CouponStatus.EXPIRED;
    }
    private LocalDateTime issuedAt;  // 발급 일시
}