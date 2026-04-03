package com.giproject.service.payment;

import com.giproject.dto.payment.PaymentCompleteDTO;
import com.giproject.dto.payment.PaymentDTO;
import com.giproject.entity.order.OrderSheet;
import com.giproject.entity.payment.Payment;

public interface PaymentService {

	default PaymentDTO.Response entityToResponse(Payment payment) {
		PaymentDTO.Response dto = PaymentDTO.Response.builder()
				.paymentNo(payment.getPaymentNo())
				.orderSheetNo(payment.getOrderSheet().getOrderNo()) // ← 이름 통일
				.paymentId(payment.getPaymentId())
				.paymentMethod(payment.getPaymentMethod())
				.easyPayProvider(payment.getEasyPayProvider())
				.currency(payment.getCurrency()) // ← 오탈자 주의
				.paymentStatus(payment.getPaymentStatus())
				.paidAt(payment.getPaidAt()) // ← paidAt로 통일
				.build();
		return dto;
	}

	default Payment dtoToEntity(PaymentDTO.CreateRequest  dto, OrderSheet orderSheet) {

		Payment payment = Payment.builder()
				.orderSheet(orderSheet)
		        .paymentId(dto.getPaymentId())
		        .paymentMethod(dto.getPaymentMethod())
		        .easyPayProvider(dto.getEasyPayProvider()) // CARD면 null 들어가도 OK
		        .currency(dto.getCurrency())
		        .build();

		return payment;
	}

	public Long acceptedPayment(PaymentDTO.CreateRequest dto);
	public PaymentCompleteDTO complete(Long paymentNo);
}
