package com.giproject.dto.delivery;

import java.time.LocalDateTime;

import com.giproject.entity.delivery.DeliveryStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryDTO {
	private Long deliveryNo;
	private DeliveryStatus status;
	private Long paymentNo;
	private LocalDateTime completTime;
}
