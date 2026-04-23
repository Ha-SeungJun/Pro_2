package com.giproject.dto.review;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.giproject.entity.delivery.DeliveryStatus;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
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
    private List<ReviewImageDTO> images;

    public MyReviewWithDriverIdDTO(
            Long reviewNo,
            Long deliveryNo,
            BigDecimal rating,
            String comment,
            LocalDateTime createdAt,
            String cargoType,
            String cargoWeight,
            String startAddress,
            String endAddress,
            LocalDateTime deliveryCompletedAt,
            String driverId,
            String driverName,
            DeliveryStatus deliveryStatus,
            String writerId) {
        this.reviewNo = reviewNo;
        this.deliveryNo = deliveryNo;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
        this.cargoType = cargoType;
        this.cargoWeight = cargoWeight;
        this.startAddress = startAddress;
        this.endAddress = endAddress;
        this.deliveryCompletedAt = deliveryCompletedAt;
        this.driverId = driverId;
        this.driverName = driverName;
        this.deliveryStatus = deliveryStatus;
        this.writerId = writerId;
    }
}