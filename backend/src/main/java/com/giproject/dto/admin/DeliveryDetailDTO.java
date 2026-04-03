package com.giproject.dto.admin;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class DeliveryDetailDTO {
    private String date;
    private String start;
    private String end;
    private String distance;
    private String type;
    private String amount;
    private String owner;
    private String carrierName; // Added field
    private String deliveryStatus; // Added field
}
