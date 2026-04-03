package com.giproject.dto.matching;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MatchingDTO {
	
	private Long matchNo;
	private Long eno;
	private String cargoId;
	@JsonProperty("isAccepted")
	private boolean isAccepted;
	private LocalDateTime acceptedTime;
	
	private String route;          // 출발지 - 도착지
    private String distanceKm;
    private String cargoWeight;
    private String startTime;
    private String cargoType;
    private String totalCost;
	
}
