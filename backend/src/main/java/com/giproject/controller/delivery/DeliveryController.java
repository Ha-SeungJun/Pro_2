package com.giproject.controller.delivery;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.giproject.dto.delivery.DeliveryDTO;
import com.giproject.service.delivery.DeliveryService;

import lombok.RequiredArgsConstructor;
@RequiredArgsConstructor
@Controller
@RequestMapping("/g2i4/delivery")
public class DeliveryController {
	private final DeliveryService deliveryService;
	
	@PostMapping("/create")
	public ResponseEntity<DeliveryDTO> createDelivery(@RequestBody DeliveryDTO dto){
		Long no = dto.getPaymentNo();
		DeliveryDTO deliveryDTO = deliveryService.createDelivery(no);
		
		return ResponseEntity.ok(deliveryDTO);
	}
	
	@PutMapping("/changeintransit")
	public ResponseEntity<DeliveryDTO> changeInTransit(@RequestBody DeliveryDTO deliveryDTO) {
		Long no = deliveryDTO.getDeliveryNo();
		DeliveryDTO dto = deliveryService.changeStatusInTransit(no);
		
		return ResponseEntity.ok(dto);
	}
	
	@PutMapping("/changecomplete")
	public ResponseEntity<DeliveryDTO> changeCompleted(@RequestBody DeliveryDTO deliveryDTO){
		Long no = deliveryDTO.getDeliveryNo();
		DeliveryDTO dto = deliveryService.changeStatusCompleted(no);
		
		return ResponseEntity.ok(dto);
	}
}
