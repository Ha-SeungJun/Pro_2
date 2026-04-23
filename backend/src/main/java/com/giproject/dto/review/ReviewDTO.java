package com.giproject.dto.review;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDTO {
	private Long reviewNo;
	private Long deliveryNo;
	private BigDecimal rating;
	private String comment;
	private LocalDateTime createdAt;
	private List<ReviewImageDTO> images;
}
