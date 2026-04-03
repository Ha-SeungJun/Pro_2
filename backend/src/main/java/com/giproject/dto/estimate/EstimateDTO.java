package com.giproject.dto.estimate;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.giproject.entity.delivery.DeliveryStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EstimateDTO {
	private Long eno;
	
	private String startAddress;
	private String endAddress;
	private double distanceKm;
	private String cargoWeight;
	private String cargoType;
	private LocalDateTime startTime;
	private int totalCost;
	private boolean matched;
	private String memberId;
	private boolean isTemp;
	@JsonProperty("isAccepted")
	private boolean accepted;
	private Long matchingNo;

	private boolean isOrdered;
	private int baseCost;
	private int distanceCost;
	private int specialOption;
	private Long paymentNo;
	private DeliveryStatus deliveryStatus;
	private String driverName; 
	private LocalDateTime deliveryCompletedAt;
}
