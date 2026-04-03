package com.giproject.dto.payment;

import java.time.LocalDateTime;

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
public class PaymentCompleteDTO {
	private String orderUuid;//주문번호
	private String cargoName;//화물 운반자 이름
	private String cargoPhone;//화물 운반자 전화번호
	private String addressee;//받는분 이름
	private String addresseePhone;
	private String endAddress;//주소
	private String endRestAdreess;//주소 상세정보
	private String paymentMethod;//결제 방식
	private LocalDateTime paidAt;//결제 시간
	private int totalCost;
}
