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
public class DriverReviewItemDTO {

    private Long reviewNo;
    private BigDecimal rating;
    private String comment;
    private LocalDateTime createdAt;

    private String writerId;
    private String cargoType;
    private String cargoWeight;
    private String startAddress;
    private String endAddress;
    private LocalDateTime deliveryCompletedAt;
    private DeliveryStatus deliveryStatus;
}