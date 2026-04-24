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

    // 🔄 Entity -> DTO 변환
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
                .distanceDiscount(estimate.getDistanceDiscount()) // 🚨 할인 데이터 유지
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
    
    // 🔄 DTO -> Entity 변환
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
                .distanceDiscount(dto.getDistanceDiscount()) // 🚨 DB 저장용 할인 데이터
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

    /**
     * 💰 거리별 할인율 계산 로직 (100km/200km/300km/400km 단위)
     * 100(5%), 200(10%), 300(15%), 400(20%)
     */
    default int calculateDistanceDiscount(double distance, int currentTotal) {
        double rate = 0;
        
        if (distance >= 400) rate = 0.20;      // 400km+ : 20%
        else if (distance >= 300) rate = 0.15; // 300km+ : 15%
        else if (distance >= 200) rate = 0.10; // 200km+ : 10%
        else if (distance >= 100) rate = 0.05; // 100km+ : 5%
        
        // 🚨 10원 단위 절사 (컴퓨터 공학적 정밀도 유지)
        return (int) (Math.floor((currentTotal * rate) / 10) * 10);
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