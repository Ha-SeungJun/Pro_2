package com.giproject.service.payment;

import org.springframework.stereotype.Service;

import com.giproject.dto.payment.PaymentCompleteDTO;
import com.giproject.dto.payment.PaymentDTO;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.estimate.Estimate;
import com.giproject.entity.matching.Matching;
import com.giproject.entity.order.OrderSheet;
import com.giproject.entity.payment.Payment;
import com.giproject.repository.order.OrderRepository;
import com.giproject.repository.payment.PaymentRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;


@Service
@Transactional
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService  {
		private final PaymentRepository paymentRepository;
		private final OrderRepository orderRepository;
	
	@Override
	public Long acceptedPayment(PaymentDTO.CreateRequest dto) {
		OrderSheet orderSheet=orderRepository.findById(dto.getOrderSheetNo()).orElseThrow();
		Payment payment = dtoToEntity(dto, orderSheet);
		
		Long paymentNo = paymentRepository.save(payment).getPaymentNo();
		return paymentNo;
	}

	@Override
	public PaymentCompleteDTO complete(Long paymentNo) {
		Payment payment =paymentRepository.findByPaymentNo(paymentNo).orElseThrow(() -> new RuntimeException("결제번호가 존재하지않습니다"));
		OrderSheet orderSheet = payment.getOrderSheet();
		Matching matching = orderSheet.getMatching();
		CargoOwner cargoOwner = matching.getCargoOwner();
		Estimate estimate = matching.getEstimate();
		String paymentMethodLabel;
		
	    if ("EASY_PAY".equals(payment.getPaymentMethod())) {
	        String prov = payment.getEasyPayProvider();
	        if ("TOSSPAY".equals(prov)) paymentMethodLabel = "토스 간편결제";
	        else if ("KAKAOPAY".equals(prov)) paymentMethodLabel = "카카오페이 간편결제";
	        else paymentMethodLabel = "간편결제";
	    } else {
	        paymentMethodLabel = "카드 결제";
	    }
		
		PaymentCompleteDTO dto = PaymentCompleteDTO.builder()
				.orderUuid(orderSheet.getOrderUuid())
				.cargoName(cargoOwner.getCargoName())
				.cargoPhone(cargoOwner.getCargoPhone())
				.addressee(orderSheet.getAddressee())
				.addresseePhone(orderSheet.getPhone())
				.endAddress(estimate.getEndAddress())
				.endRestAdreess(orderSheet.getEndRestAddress())
				.paymentMethod(paymentMethodLabel)
				.totalCost(estimate.getTotalCost())
				.paidAt(payment.getPaidAt())
				.build();
				
		
		return dto;
	}
	
	
}
