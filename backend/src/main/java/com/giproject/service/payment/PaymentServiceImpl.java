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
        OrderSheet orderSheet = orderRepository.findById(dto.getOrderSheetNo()).orElseThrow();
        
        long totalPrice = orderSheet.getTotalPrice(); // 이제 0이 아닌 진짜 금액이 나옵니다.
        long discountAmt = 0;

        if (dto.getMcno() != null) {
            MemberCoupon mc = memberCouponRepository.findById(dto.getMcno()).orElseThrow();
            // 100.0 실수 연산으로 정확하게 계산
            discountAmt = Math.round(totalPrice * (mc.getCoupon().getDiscountValue() / 100.0));
        }

        long finalPrice = totalPrice - discountAmt;

        Payment payment = Payment.builder()
                .orderSheet(orderSheet)
                .totalPrice(totalPrice)
                .discountPrice(discountAmt)
                .finalPrice(finalPrice)
                .paymentStatus(PaymentStatus.PAID)
                .paidAt(LocalDateTime.now())
                // ... 나머지 필드 세팅
                .build();

        return paymentRepository.save(payment).getPaymentNo();
    }

    @Override
    public PaymentCompleteDTO complete(Long paymentNo) {
        // 리포지토리의 @EntityGraph가 적용된 findByPaymentNo 사용 권장
        Payment payment = paymentRepository.findByPaymentNo(paymentNo)
                .orElseThrow(() -> new RuntimeException("결제 정보 없음"));

        if (payment.getUsedMemberCoupon() != null) {
            MemberCoupon mc = payment.getUsedMemberCoupon();
            mc.setUsed(true);
            mc.setUsedDate(LocalDateTime.now());
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

        // ✅ DTO 필드에 명확하게 매핑
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