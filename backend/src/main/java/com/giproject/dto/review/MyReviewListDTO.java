package com.giproject.dto.review;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyReviewListDTO {

    private Long reviewNo;
    private Long deliveryNo;
    private BigDecimal rating;
    private String comment;
    private LocalDateTime createdAt;
}