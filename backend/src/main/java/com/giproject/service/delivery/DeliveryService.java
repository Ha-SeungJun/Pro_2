package com.giproject.service.delivery;

import com.giproject.dto.delivery.DeliveryDTO;
import com.giproject.entity.delivery.Delivery;
import com.giproject.entity.payment.Payment;

public interface DeliveryService {
	default DeliveryDTO entityToDTO(Delivery delivery) {
		DeliveryDTO deliveryDTO = DeliveryDTO.builder()
									.deliveryNo(delivery.getDeliveryNo())
									.status(delivery.getStatus())
									.paymentNo(delivery.getPayment().getPaymentNo())
									.completTime(delivery.getCompletTime())
									.build();
		return deliveryDTO;
	}
	
	default Delivery dtoToEntity(Payment payment) {
		Delivery delivery = Delivery.builder()
							.payment(payment)
							.cargoOwner(payment.getOrderSheet().getMatching().getCargoOwner()) // Added cargoOwner
							.build();
		return delivery;
	}
	
	DeliveryDTO createDelivery(Long paymentNo);
	
	DeliveryDTO changeStatusInTransit(Long deliveryNo);
	
	DeliveryDTO changeStatusCompleted(Long deliveryNo);
	}
