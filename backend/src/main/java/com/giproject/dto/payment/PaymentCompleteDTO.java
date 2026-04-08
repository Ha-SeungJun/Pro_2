package com.giproject.dto.payment;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class PaymentCompleteDTO {
    private String orderUuid;
    private String cargoName;
    private String cargoPhone;
    private String addressee;
    private String addresseePhone;
    private String endAddress;
    private String endRestAdreess;
    private String paymentMethod;
    private LocalDateTime paidAt;

    // ✅ 금액 필드 long으로 통일
    private long totalCost;     // 원금
    private long discountPrice; // 할인액
    private long finalCost;     // 최종 결제액 (리액트 출력용)
}