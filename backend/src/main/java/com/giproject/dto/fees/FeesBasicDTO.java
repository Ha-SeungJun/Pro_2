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
public class FeesBasicDTO {

	private Long tno;
	
	private String weight;
	
	private BigDecimal ratePerKm;

	private BigDecimal initialCharge;

	private LocalDateTime updatedAt;
	
	private String cargoImage;
}
