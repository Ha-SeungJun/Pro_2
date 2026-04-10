package com.giproject.service.order;

import com.giproject.dto.order.OrderFormDTO;
import com.giproject.dto.order.OrderSheetDTO;
import com.giproject.entity.matching.Matching;
import com.giproject.entity.order.OrderSheet;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

public interface OrderService {
    
    default OrderSheetDTO entityToDTO(OrderSheet orderSheet) {
        return OrderSheetDTO.builder()
                .orderNo(orderSheet.getOrderNo())
                .matchingNo(orderSheet.getMatching().getMatchingNo())
                .totalPrice(orderSheet.getTotalPrice()) // DB의 값을 DTO로
                .startRestAddress(orderSheet.getStartRestAddress())
                .endRestAddress(orderSheet.getEndRestAddress())
                .orderUuid(orderSheet.getOrderUuid())
                .orderTime(orderSheet.getOrderTime())
                .Addressee(orderSheet.getAddressee())
                .phone(orderSheet.getPhone())
                .AddresseeEmail(orderSheet.getAddresseeEmail())
                .build();
    }

    default OrderSheet dtoToEntity(OrderSheetDTO dto, Matching matching) {
        String orderCord = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmm")) 
                + UUID.randomUUID().toString().substring(0, 6);
                
        return OrderSheet.builder()
                .matching(matching)
                // DTO의 할인된 금액을 엔티티의 totalPrice 필드(DB 컬럼)에 매핑
                .totalPrice(dto.getTotalPrice() != null ? dto.getTotalPrice() : matching.getEstimate().getTotalCost())
                .orderUuid(orderCord)
                .startRestAddress(dto.getStartRestAddress())
                .endRestAddress(dto.getEndRestAddress())
                .orderTime(LocalDateTime.now())
                .Addressee(dto.getAddressee())
                .phone(dto.getPhone())
                .AddresseeEmail(dto.getAddresseeEmail())
                .build();
    }
    
    public OrderFormDTO loadOrderForm(Long matchingNo);
    public Long placeOrderFromPayment(OrderSheetDTO dto, Long matchingNo, Long mcno);
}