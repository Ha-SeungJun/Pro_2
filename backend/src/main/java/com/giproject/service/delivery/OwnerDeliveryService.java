package com.giproject.service.delivery;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.giproject.dto.delivery.DeliveryRowDTO;
import com.giproject.entity.delivery.Delivery;
import com.giproject.entity.delivery.DeliveryStatus;
import com.giproject.entity.payment.Payment;
import com.giproject.repository.delivery.DeliveryRepository;
import com.giproject.repository.delivery.OwnerDeliveryQueryRepository;
import com.giproject.repository.payment.PaymentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OwnerDeliveryService {

    private final OwnerDeliveryQueryRepository queryRepo;
    private final DeliveryRepository deliveryRepo;
    private final PaymentRepository paymentRepo;
    private final DeliveryService deliveryService; 

    public List<DeliveryRowDTO> getUnpaid(String cargoId) {
        return queryRepo.findUnpaidByCargoId(cargoId);
    }

    public List<DeliveryRowDTO> getPaidInProgress(String cargoId) {
        return queryRepo.findPaidInProgressByCargoId(cargoId);
    }

    public List<DeliveryRowDTO> getCompleted(String cargoId) {
        return queryRepo.findCompletedByCargoId(cargoId);
    }

    @Transactional
    public void completeByMatchingNo(Long matchingNo, String cargoId) {
        // Delivery가 있으면 사용하고, 없으면 Payment로 생성
        Delivery delivery = deliveryRepo.findByMatchingNo(matchingNo)
                .orElseGet(() -> paymentRepo.findByOrderSheet_Matching_MatchingNo(matchingNo)
                    .map(p -> deliveryRepo.save(
                        Delivery.builder().payment(p).status(DeliveryStatus.PENDING).build()
                    ))
                    .orElseThrow(() -> new IllegalArgumentException("결제 정보가 없습니다."))
                );

        deliveryService.changeStatusCompleted(delivery.getDeliveryNo());
    }
    @Transactional
    public void markInTransit(Long matchingNo, String cargoId) {
        var delivery = deliveryRepo
            .findByMatchingNoAndCargoId(matchingNo, cargoId)
            .orElseGet(() -> {
                var p = paymentRepo.findByOrderSheet_Matching_MatchingNo(matchingNo)
                        .orElseThrow(() -> new IllegalArgumentException("결제 정보가 없습니다."));
                return deliveryRepo.save(Delivery.builder().payment(p).build());
            });

        delivery.markInTransit(); // 상태 PENDING -> IN_TRANSIT
    }
}