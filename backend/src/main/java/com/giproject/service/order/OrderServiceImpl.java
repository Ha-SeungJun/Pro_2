package com.giproject.service.order;

import java.time.LocalDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final MatchingRepository matchingRepository;
    private final MemberCouponRepository memberCouponRepository;

    @Override
    public OrderFormDTO loadOrderForm(Long matchingNo) {
        Matching matching = matchingRepository.findById(matchingNo).orElseThrow();
        Estimate estimate = matching.getEstimate(); // 🚨 진짜 원금 정보가 들어있는 곳
        Member member = estimate.getMember();
        var orderOpt = orderRepository.findTopByMatching_MatchingNoOrderByOrderNoDesc(matchingNo);

        return OrderFormDTO.builder()
                .ordererName(member.getMemName())
                .ordererPhone(member.getMemPhone())
                .ordererEmail(member.getMemEmail())
                .startAddress(estimate.getStartAddress())
                .addressee(orderOpt.map(OrderSheet::getAddressee).orElse(null))
                .receiverPhone(orderOpt.map(OrderSheet::getPhone).orElse(null))
                .addresseeEmail(orderOpt.map(OrderSheet::getAddresseeEmail).orElse(null))
                .endAddress(estimate.getEndAddress())
                .startRestAddress(orderOpt.map(OrderSheet::getStartRestAddress).orElse(null))
                .endRestAddress(orderOpt.map(OrderSheet::getEndRestAddress).orElse(null))
                .baseCost(estimate.getBaseCost())
                .distanceCost(estimate.getDistanceCost())
                .specialOptionCost(estimate.getSpecialOption())
                
                // 🚨 [추가된 필드] 리액트 OrderComponent의 serverData.distanceDiscount와 매칭됩니다.
                .distanceDiscount(estimate.getDistanceDiscount())
                
                // 🚨 [핵심 수정] 
                // 어떤 경우에도 '견적서(Estimate)'에 기록된 정가 136,320원을 원금으로 보냅니다.
                // 이미 할인이 적용된 OrderSheet의 totalPrice를 참조하지 않도록 확정했습니다.
                .totalCost(estimate.getTotalCost()) 
                
                // 🚨 [핵심 수정] 
                // 여기는 '실제 결제할 금액'이므로 DB에 저장된 totalPrice를 가져옵니다. (95,424원)
                .finalPaymentAmount(orderOpt.map(os -> (int)os.getTotalPrice()).orElse(estimate.getTotalCost()))
                
                .orderUuid(orderOpt.map(OrderSheet::getOrderUuid).orElse(null))
                .orderTime(orderOpt.map(os -> String.valueOf(os.getOrderTime())).orElse(null))
                .matchingNo(matchingNo)
                .build();
    }

    @Override
    @Transactional
    public Long placeOrderFromPayment(OrderSheetDTO dto, Long matchingNo, Long mcno) {
        if (dto.getPhone() != null) {
            dto.setPhone(dto.getPhone().replaceAll("[^0-9]", ""));
        }

        Matching matching = matchingRepository.findById(matchingNo)
                .orElseThrow(() -> new RuntimeException("매칭 정보가 없습니다."));

        String uniqueUuid = LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) 
                          + java.util.UUID.randomUUID().toString().substring(0, 8);

        // 🚨 [저장 로직] 리액트에서 totalPrice 이름표로 보낸 할인액을 저장합니다.
        OrderSheet sheet = OrderSheet.builder()
                .matching(matching)
                .totalPrice(dto.getTotalPrice() != null ? dto.getTotalPrice() : matching.getEstimate().getTotalCost())
                .orderUuid(uniqueUuid)
                .startRestAddress(dto.getStartRestAddress())
                .endRestAddress(dto.getEndRestAddress())
                .orderTime(LocalDateTime.now())
                .Addressee(dto.getAddressee())
                .phone(dto.getPhone())
                .AddresseeEmail(dto.getAddresseeEmail())
                .build();

        if (mcno != null && mcno > 0) {
            MemberCoupon memberCoupon = memberCouponRepository.findById(mcno).orElseThrow();
            memberCoupon.useCoupon(); 
        }

        OrderSheet savedSheet = orderRepository.save(sheet);
        return savedSheet.getOrderNo();
    }
}