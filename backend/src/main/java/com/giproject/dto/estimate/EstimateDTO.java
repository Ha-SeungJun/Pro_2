package com.giproject.dto.estimate;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.giproject.entity.delivery.DeliveryStatus;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EstimateDTO {
    private Long eno;
    private String startAddress;
    private String endAddress;
    private Double startLat;
    private Double startLng;
    private Double endLat;
    private Double endLng;
    private double distanceKm;
    private String cargoWeight;
    private String cargoType;
    private LocalDateTime startTime;
    private int totalCost; //  최종 결제 금액 (baseCost - distanceDiscount - couponDiscount)
    private boolean matched;
    private String memberId;
    private boolean isTemp;
    @JsonProperty("isAccepted")
    private boolean accepted;
    private Long matchingNo;
    
    private boolean isOrdered;
    private int baseCost;      //  할인 전 원가
    private int distanceCost;
    private int specialOption;
    
    // 
    private int distanceDiscount; //  거리별 자동 할인 금액
    private Long couponNo;        // 선택한 쿠폰 번호 (기존 쿠폰 로직용)
    private int couponDiscount;   // 수동 쿠폰 할인 금액
    
    private Long paymentNo;
    private Long deliveryNo;
    private DeliveryStatus deliveryStatus;
    private String driverName; 
    private LocalDateTime deliveryCompletedAt;
}