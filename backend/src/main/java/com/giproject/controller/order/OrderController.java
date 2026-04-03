package com.giproject.controller.order;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.giproject.dto.order.OrderFormDTO;
import com.giproject.dto.order.OrderSheetDTO;
import com.giproject.service.order.OrderService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/g2i4/subpath/order")
public class OrderController {
	private final OrderService orderService;
	
	@PostMapping("/")
	public ResponseEntity<OrderFormDTO> viewOrder(@RequestBody  Map<String, Long> requestNo) {
		OrderFormDTO dto = orderService.loadOrderForm(requestNo.get("mcNo"));
		
		return ResponseEntity.ok(dto);
		
	}
	
	@PostMapping("/create")
	public ResponseEntity<Long> createOrder(@RequestBody OrderSheetDTO dto) {
		Long no=dto.getMatchingNo();
		
		Long orderNo=orderService.placeOrderFromPayment(dto, no);
		
		return ResponseEntity.ok(orderNo);
	}
}
