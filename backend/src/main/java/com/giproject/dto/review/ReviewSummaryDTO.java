package com.giproject.dto.review;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Builder
@Data
@NoArgsConstructor
public class ReviewSummaryDTO {//차주 평점 관리
	private String cargoId;
	private Double avgRating;
	private Long reviewCount;
	
	public ReviewSummaryDTO(String cargoId, Double avgRating, Long reviewCount) {
	    this.cargoId = cargoId;
	    this.avgRating = avgRating;
	    this.reviewCount = reviewCount;
	}
}

