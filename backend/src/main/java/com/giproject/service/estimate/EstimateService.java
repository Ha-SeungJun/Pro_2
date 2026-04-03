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

	default EstimateDTO entityToDTO(Estimate estimate) {
		EstimateDTO dto =  EstimateDTO.builder()
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
				.totalCost(estimate.getTotalCost())
				.isTemp(estimate.isTemp())
				.matched(estimate.isMatched())
				.isOrdered(estimate.isOrdered())
				.memberId(estimate.getMember() != null ? estimate.getMember().getMemId() : null)
				.build();
		return dto;
	}
	
	default Estimate DTOToEntity(EstimateDTO dto,Member member) {
		Estimate estimate= Estimate.builder()
				.startAddress(dto.getStartAddress())
				.endAddress(dto.getEndAddress())
				.cargoWeight(dto.getCargoWeight())
				.distanceKm(dto.getDistanceKm())
				.cargoType(dto.getCargoType())
				.startTime(dto.getStartTime())
				.baseCost(dto.getBaseCost())
				.distanceCost(dto.getDistanceCost())
				.specialOption(dto.getSpecialOption())
				.totalCost(dto.getTotalCost())
				.isTemp(dto.isTemp())
				.matched(dto.isMatched())
				.isOrdered(dto.isOrdered())
				.member(member)
				.build();
		return estimate;
	}
	
	Long sendEstimate(EstimateDTO dto);
	
	Long saveDraft(EstimateDTO dto);
	
	EstimateDTO exportEstimate(String mameberId,Long eno);
	
	List<EstimateDTO> getSaveEstimate(String memberId);
	
	List<EstimateDTO> myEstimateList(String memberId);

	List<FeesBasicDTO> searchFees();
	
	List<FeesExtraDTO> searchExtra();
	
	List<EstimateDTO> findMyEstimatesWithoutPayment(String memberId);
	
	 List<EstimateDTO> findMyPaidEstimates(String memberId);
}
