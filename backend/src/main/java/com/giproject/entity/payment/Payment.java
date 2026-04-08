package com.giproject.entity.payment;

import java.time.LocalDateTime;

import com.giproject.entity.order.OrderSheet;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.giproject.entity.member.MemberCoupon;

@Entity
@Table(name = "Payment")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentNo;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_sheet_no", nullable = false, unique = true)
    private OrderSheet orderSheet;

    // ✅ int에서 long으로 변경하여 89억 결제 방어
    private long totalPrice;    
    private long discountPrice; 
    private long finalPrice;    

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mcno")
    private MemberCoupon usedMemberCoupon;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private PaymentStatus paymentStatus;

    private String paymentMethod;
    private LocalDateTime paidAt;

    @Column(unique = true)
    private String paymentId;
    private String currency;
    private String easyPayProvider;

    @PrePersist
    void onCreate() {
        if (paymentStatus == null) paymentStatus = PaymentStatus.PAID;
        if (paidAt == null) paidAt = LocalDateTime.now();
    }
}
