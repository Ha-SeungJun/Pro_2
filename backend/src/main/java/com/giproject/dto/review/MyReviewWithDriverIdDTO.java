package com.giproject.dto.review;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.giproject.entity.delivery.DeliveryStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyReviewWithDriverIdDTO {

    private Long reviewNo;
    private Long deliveryNo;
    private BigDecimal rating;
    private String comment;
    private LocalDateTime createdAt;

    private String cargoType;
    private String cargoWeight;
    private String startAddress;
    private String endAddress;
    private LocalDateTime deliveryCompletedAt;

    private String driverId;
    private String driverName;

    private DeliveryStatus deliveryStatus;
    private String writerId;
}