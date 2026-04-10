package com.giproject.service.order;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.giproject.dto.order.OrderFormDTO;
import com.giproject.dto.order.OrderSheetDTO;
import com.giproject.entity.estimate.Estimate;
import com.giproject.entity.matching.Matching;
import com.giproject.entity.member.Member;
import com.giproject.entity.member.MemberCoupon;
import com.giproject.entity.order.OrderSheet;
import com.giproject.repository.matching.MatchingRepository;
import com.giproject.repository.member.MemberCouponRepository;
import com.giproject.repository.order.OrderRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService{
	
	private final OrderRepository orderRepository;
	private final MatchingRepository matchingRepository;
	private final MemberCouponRepository memberCouponRepository;
	 
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
	@Transactional
	// 🚨 파라미터에 Long mcno 추가 (컨트롤러에서 넘겨줘야 함)
	public Long placeOrderFromPayment(OrderSheetDTO dto, Long matchingNo, Long mcno) {
	    if (dto.getPhone() != null) {
	        dto.setPhone(dto.getPhone().replaceAll("[^0-9]", ""));
	    }

	    // 1. 매칭 및 견적 정보 조회
	    Matching matching = matchingRepository.findById(matchingNo)
	            .orElseThrow(() -> new RuntimeException("매칭 정보가 없습니다."));

	    // 2. UUID 직접 생성
	    String uniqueUuid = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) 
	                      + java.util.UUID.randomUUID().toString().substring(0, 8);

	    // 3. 엔티티 빌드
	    OrderSheet sheet = OrderSheet.builder()
	            .matching(matching)
	            .totalPrice(matching.getEstimate().getTotalCost()) 
	            .orderUuid(uniqueUuid)
	            .startRestAddress(dto.getStartRestAddress())
	            .endRestAddress(dto.getEndRestAddress())
	            .orderTime(java.time.LocalDateTime.now())
	            .Addressee(dto.getAddressee())
	            .phone(dto.getPhone())
	            .AddresseeEmail(dto.getAddresseeEmail())
	            .build();

	    // 🚨 [여기가 핵심!] 4. 쿠폰 사용 처리 로직 추가
	    if (mcno != null && mcno > 0) {
	        System.out.println("✅ 쿠폰 사용 처리 시작! mcno: " + mcno); // 👈 이 로그가 찍히는지 보세요!
	        MemberCoupon memberCoupon = memberCouponRepository.findById(mcno).orElseThrow();
	        memberCoupon.changeUsed(true);
	    } else {
	        System.out.println("🚨 쿠폰 번호가 넘어오지 않았습니다."); // 👈 이게 찍히면 프론트 문제입니다.
	    }

	    // 5. 저장
	    OrderSheet savedSheet = orderRepository.save(sheet);
	    return savedSheet.getOrderNo();
	}

	

}
