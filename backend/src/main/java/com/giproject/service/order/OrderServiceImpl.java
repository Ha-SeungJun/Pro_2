package com.giproject.service.order;

import org.springframework.stereotype.Service;

import com.giproject.dto.order.OrderFormDTO;
import com.giproject.dto.order.OrderSheetDTO;
import com.giproject.entity.estimate.Estimate;
import com.giproject.entity.matching.Matching;
import com.giproject.entity.member.Member;
import com.giproject.entity.order.OrderSheet;
import com.giproject.repository.matching.MatchingRepository;
import com.giproject.repository.order.OrderRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService{
	
	private final OrderRepository orderRepository;
	private final MatchingRepository matchingRepository;
	 
	@Override
	public OrderFormDTO loadOrderForm(Long matchingNo) {
		Matching matching =matchingRepository.findById(matchingNo).orElseThrow();
		Estimate estimate = matching.getEstimate();
		Member member = estimate.getMember();
		  var orderOpt = orderRepository.findTopByMatching_MatchingNoOrderByOrderNoDesc(matchingNo);

		
		return OrderFormDTO.builder()
				// 출발지(주문자)
			      .ordererName(member.getMemName())
			      .ordererPhone(member.getMemPhone())
			      .ordererEmail(member.getMemEmail())
			      .startAddress(estimate.getStartAddress())

			      // 도착지(받는분) — 주문서가 있으면 채움
			      .addressee(orderOpt.map(OrderSheet::getAddressee).orElse(null))
			      .receiverPhone(orderOpt.map(OrderSheet::getPhone).orElse(null))
			      .addresseeEmail(orderOpt.map(OrderSheet::getAddresseeEmail).orElse(null))
			      .endAddress(estimate.getEndAddress())
			      .startRestAddress(orderOpt.map(OrderSheet::getStartRestAddress).orElse(null))
			      .endRestAddress(orderOpt.map(OrderSheet::getEndRestAddress).orElse(null))

			      // 요금
			      .baseCost(estimate.getBaseCost())
			      .distanceCost(estimate.getDistanceCost())
			      .specialOptionCost(estimate.getSpecialOption())
			      .totalCost(estimate.getTotalCost())

			      // 주문 메타
			      .orderUuid(orderOpt.map(OrderSheet::getOrderUuid).orElse(null))
			      .orderTime(orderOpt.map(os -> String.valueOf(os.getOrderTime())).orElse(null))

			      .matchingNo(matchingNo)
			      .build();
				
	}

	@Override
	public Long placeOrderFromPayment(OrderSheetDTO dto,Long matchingNo) {
		Matching matching= matchingRepository.findById(dto.getMatchingNo()).orElseThrow();
		OrderSheet sheet = dtoToEntity(dto, matching);
		OrderSheet ordersheet= orderRepository.save(sheet);
		return ordersheet.getOrderNo();
	}

}
