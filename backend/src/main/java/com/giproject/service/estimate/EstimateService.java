package com.giproject.service.estimate;

import java.util.List;
import com.giproject.dto.estimate.EstimateDTO;
import com.giproject.dto.fees.FeesBasicDTO;
import com.giproject.dto.fees.FeesExtraDTO;
import com.giproject.entity.estimate.Estimate;
import com.giproject.entity.member.Member;
import jakarta.transaction.Transactional;

@Transactional
public interface EstimateService {

    //  Entity -> DTO 변환 시 할인 필드 추가
    default EstimateDTO entityToDTO(Estimate estimate) {
        return EstimateDTO.builder()
                .eno(estimate.getEno())
                .startAddress(estimate.getStartAddress())
                .endAddress(estimate.getEndAddress())
                .distanceKm(estimate.getDistanceKm())
                .cargoWeight(estimate.getCargoWeight())
                .cargoType(estimate.getCargoType())
                .startTime(estimate.getStartTime())
                .baseCost(estimate.getBaseCost())
                .specialOption(estimate.getSpecialOption())
                .distanceCost(estimate.getDistanceCost())
                
                // 🚨 [추가] 할인 관련 데이터 매핑
                .distanceDiscount(estimate.getDistanceDiscount())
                .couponNo(estimate.getCouponNo())
                .couponDiscount(estimate.getCouponDiscount())
                
                .totalCost(estimate.getTotalCost())
                .isTemp(estimate.isTemp())
                .matched(estimate.isMatched())
                .isOrdered(estimate.isOrdered())
                .memberId(estimate.getMember() != null ? estimate.getMember().getMemId() : null)
                .startLat(estimate.getStartLat()) 
                .startLng(estimate.getStartLng()) 
                .endLat(estimate.getEndLat())
                .endLng(estimate.getEndLng())
                .build();
    }
    
    // ✅ DTO -> Entity 변환 시 할인 필드 추가
    default Estimate DTOToEntity(EstimateDTO dto, Member member) {
        return Estimate.builder()
                .startAddress(dto.getStartAddress())
                .endAddress(dto.getEndAddress())
                .cargoWeight(dto.getCargoWeight())
                .distanceKm(dto.getDistanceKm())
                .cargoType(dto.getCargoType())
                .startTime(dto.getStartTime())
                .baseCost(dto.getBaseCost())
                .distanceCost(dto.getDistanceCost())
                .specialOption(dto.getSpecialOption())
                
                // 🚨 [추가] DB에 할인 정보 저장
                .distanceDiscount(dto.getDistanceDiscount())
                .couponNo(dto.getCouponNo())
                .couponDiscount(dto.getCouponDiscount())
                
                .totalCost(dto.getTotalCost())
                .isTemp(dto.isTemp())
                .matched(dto.isMatched())
                .isOrdered(dto.isOrdered())
                .member(member)
                .startLat(dto.getStartLat()) 
                .startLng(dto.getStartLng()) 
                .endLat(dto.getEndLat())     
                .endLng(dto.getEndLng())
                .build();
    }

    //  서비스단에서 공통으로 사용할 거리별 할인율 계산 로직
    default int calculateDistanceDiscount(double distance, int baseCost) {
        double rate = 0;
        if (distance >= 100) rate = 0.10;      // 100km+ : 10%
        else if (distance >= 50) rate = 0.07;  // 50km+  : 7%
        else if (distance >= 20) rate = 0.03;  // 20km+  : 3%
        
        // 10원 단위 절사
        return (int) (Math.floor((baseCost * rate) / 10) * 10);
    }
    
    Long sendEstimate(EstimateDTO dto);
    Long saveDraft(EstimateDTO dto);
    EstimateDTO exportEstimate(String memberId, Long eno);
    List<EstimateDTO> getSaveEstimate(String memberId);
    List<EstimateDTO> myEstimateList(String memberId);
    List<FeesBasicDTO> searchFees();
    List<FeesExtraDTO> searchExtra();
    List<EstimateDTO> findMyEstimatesWithoutPayment(String memberId);
    List<EstimateDTO> findMyPaidEstimates(String memberId);
}