package com.giproject.service.delivery;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.giproject.dto.delivery.DeliveryDTO;
import com.giproject.entity.delivery.Delivery;
import com.giproject.entity.delivery.DeliveryStatus;
import com.giproject.entity.payment.Payment;
import com.giproject.repository.delivery.DeliveryRepository;
import com.giproject.repository.payment.PaymentRepository;
import com.giproject.service.mail.MailService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeliveryServiceImpl implements DeliveryService{

	private final DeliveryRepository deliveryRepository;
	private final PaymentRepository paymentRepository;
	private final MailService mailService;
	
	@Transactional
	@Override
	public DeliveryDTO createDelivery(Long paymentNo) {
		Payment payment = paymentRepository.findById(paymentNo).orElseThrow(() -> new RuntimeException("결제번호가 존재하지않습니다"));
		Delivery delivery = dtoToEntity(payment);
		Delivery saved= deliveryRepository.save(delivery);
		return entityToDTO(saved);
	}
	
	@Transactional
	@Override
	public DeliveryDTO changeStatusInTransit(Long deliveryNo) {
		Delivery delivery = deliveryRepository.findById(deliveryNo).orElseThrow(()-> new RuntimeException("배송정보가 존재하지않습니다"));
		delivery.setStatus(DeliveryStatus.IN_TRANSIT);
		return entityToDTO(delivery);
	}

	@Override
	public DeliveryDTO changeStatusCompleted(Long deliveryNo) {
		Delivery delivery = deliveryRepository.findById(deliveryNo).orElseThrow(()-> new RuntimeException("배송정보가 존재하지않습니다"));
		delivery.setStatus(DeliveryStatus.COMPLETED);
		delivery.setCompletTime(LocalDateTime.now());
		mailService.deliveryCompleted(deliveryNo);
		System.out.println("메일보냄");
		return entityToDTO(delivery);
		
	}
	
	
}
