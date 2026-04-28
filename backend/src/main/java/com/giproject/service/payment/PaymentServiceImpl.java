package com.giproject.service.payment;

import org.springframework.stereotype.Service;
import com.giproject.dto.payment.PaymentCompleteDTO;
import com.giproject.dto.payment.PaymentDTO;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.estimate.Estimate;
import com.giproject.entity.matching.Matching;
import com.giproject.entity.member.MemberCoupon;
import com.giproject.entity.order.OrderSheet;
import com.giproject.entity.payment.Payment;
import com.giproject.entity.payment.PaymentStatus;
import com.giproject.repository.member.MemberCouponRepository;
import com.giproject.repository.order.OrderRepository;
import com.giproject.repository.payment.PaymentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;

@Service
@Transactional
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final MemberCouponRepository memberCouponRepository;

    @Override
    public Long acceptedPayment(PaymentDTO.CreateRequest dto) {
        OrderSheet orderSheet = orderRepository.findById(dto.getOrderSheetNo())
                .orElseThrow(() -> new RuntimeException("주문 정보를 찾을 수 없습니다."));
        
        long totalPrice = orderSheet.getTotalPrice(); // 원래 결제해야 할 원금
        long discountAmt = 0;

        // 1. 쿠폰이 적용된 결제인 경우 (퍼센트 할인 계산)
        if (dto.getMcno() != null) {
            MemberCoupon mc = memberCouponRepository.findById(dto.getMcno())
                    .orElseThrow(() -> new RuntimeException("유효하지 않은 쿠폰입니다."));
            
            // 🚨 퍼센트 전용 계산 로직 (예: 10%면 10 / 100.0)
            discountAmt = Math.round(totalPrice * (mc.getCoupon().getDiscountValue() / 100.0));
            
            // (선택) 만약 '최대 할인 금액(maxDiscount)' 정책이 있다면 여기서 방어!
            if (mc.getCoupon().getMaxDiscount() > 0 && discountAmt > mc.getCoupon().getMaxDiscount()) {
                discountAmt = mc.getCoupon().getMaxDiscount();
            }
        }

        // 2. 최종 결제 금액 산출 (음수 방지 안전장치)
        long finalPrice = Math.max(0, totalPrice - discountAmt);

        // 3. 결제 내역 DB 저장
        Payment payment = Payment.builder()
                .orderSheet(orderSheet)
                .totalPrice(totalPrice)
                .discountPrice(discountAmt)
                .finalPrice(finalPrice)
                .paymentStatus(PaymentStatus.PAID)
                .paidAt(LocalDateTime.now())
                // ... (나머지 필요한 필드 세팅) ...
                .build();

        return paymentRepository.save(payment).getPaymentNo();
    }

    @Override
    public PaymentCompleteDTO complete(Long paymentNo) {
        Payment payment = paymentRepository.findByPaymentNo(paymentNo)
                .orElseThrow(() -> new RuntimeException("결제 정보 없음"));

        // 🚨 빨간줄 해결! (우리가 만든 상태 변경 메서드 적용)
        if (payment.getUsedMemberCoupon() != null) {
            MemberCoupon mc = payment.getUsedMemberCoupon();
            mc.useCoupon(); // 상태를 USED로 바꾸고 usedDate 기록
        }

        OrderSheet orderSheet = payment.getOrderSheet();
        Matching matching = orderSheet.getMatching();
        CargoOwner cargoOwner = matching.getCargoOwner();
        Estimate estimate = matching.getEstimate();
        
        String paymentMethodLabel = "카드 결제";
        if ("EASY_PAY".equals(payment.getPaymentMethod())) {
            String prov = payment.getEasyPayProvider();
            if ("TOSSPAY".equals(prov)) paymentMethodLabel = "토스 간편결제";
            else if ("KAKAOPAY".equals(prov)) paymentMethodLabel = "카카오페이 간편결제";
            else paymentMethodLabel = "간편결제";
        }

        return PaymentCompleteDTO.builder()
                .orderUuid(orderSheet.getOrderUuid())
                .cargoName(cargoOwner.getCargoName())
                .cargoPhone(cargoOwner.getCargoPhone())
                .addressee(orderSheet.getAddressee())
                .addresseePhone(orderSheet.getPhone())
                .endAddress(estimate.getEndAddress())
                .endRestAdreess(orderSheet.getEndRestAddress())
                .paymentMethod(paymentMethodLabel)
                .paidAt(payment.getPaidAt())
                .totalCost(payment.getTotalPrice())
                .discountPrice(payment.getDiscountPrice())
                .finalCost(payment.getFinalPrice())
                .build();
    }
}