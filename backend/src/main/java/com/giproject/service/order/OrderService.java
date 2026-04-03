package com.giproject.service.order;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import com.giproject.dto.order.OrderFormDTO;
import com.giproject.dto.order.OrderSheetDTO;
import com.giproject.entity.matching.Matching;
import com.giproject.entity.order.OrderSheet;

public interface OrderService {
	
	default OrderSheetDTO entityToDTO(OrderSheet orderSheet) {
		OrderSheetDTO dto = OrderSheetDTO.builder()
				.orderNo(orderSheet.getOrderNo())
				.matchingNo(orderSheet.getMatching().getMatchingNo())
				.startRestAddress(orderSheet.getStartRestAddress())
				.endRestAddress(orderSheet.getEndRestAddress())
				.orderUuid(orderSheet.getOrderUuid())
				.orderTime(orderSheet.getOrderTime())
				.Addressee(orderSheet.getAddressee())
				.phone(orderSheet.getPhone())
				.AddresseeEmail(orderSheet.getAddresseeEmail())
				.build();
		return dto;
	}
	default OrderSheet dtoToEntity(OrderSheetDTO dto , Matching matching) {
		String orderCord = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmm")) 
				+UUID.randomUUID().toString().substring(0, 6);
		OrderSheet order = OrderSheet.builder()
				.matching(matching)
				.orderUuid(orderCord)
				.startRestAddress(dto.getStartRestAddress())
				.endRestAddress(dto.getEndRestAddress())
				.orderTime(LocalDateTime.now())
				.Addressee(dto.getAddressee())
				.phone(dto.getPhone())
				.AddresseeEmail(dto.getAddresseeEmail())
				.build();
		return order;
	}
	
	public OrderFormDTO loadOrderForm(Long matchingNo);
	
	public Long placeOrderFromPayment(OrderSheetDTO dto,Long matchingNo);
}
