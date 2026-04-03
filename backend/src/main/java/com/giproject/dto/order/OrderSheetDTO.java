package com.giproject.dto.order;

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
public class OrderSheetDTO {
	
	private Long orderNo;
	private Long matchingNo;
	private String orderUuid;
	private String startRestAddress;
	private String endRestAddress;
	private LocalDateTime orderTime;
	private String Addressee;
	private String phone;
	private String AddresseeEmail;
	
}
