package com.giproject.dto.fees;

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
public class FeesExtraDTO {
	
	private Long exno;

	private String extraChargeTitle;

	private BigDecimal extraCharge;

	private LocalDateTime updatedAt;

}
