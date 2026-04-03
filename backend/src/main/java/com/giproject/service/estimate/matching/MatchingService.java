package com.giproject.service.estimate.matching;

import java.time.LocalDateTime;

import com.giproject.dto.matching.MatchingDTO;
import com.giproject.dto.matching.PageRequestDTO;
import com.giproject.dto.matching.PageResponseDTO;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.estimate.Estimate;
import com.giproject.entity.matching.Matching;

import jakarta.transaction.Transactional;

@Transactional
public interface MatchingService {
	
	default Matching dtoToEntity(MatchingDTO dto,Estimate estimate) {
		Matching.MatchingBuilder builder = Matching.builder()
				.matchingNo(dto.getMatchNo())
				.estimate(estimate)
				.isAccepted(dto.isAccepted());

		if (dto.isAccepted()) {
			builder.acceptedTime(LocalDateTime.now());
		}

		return builder.build();
	}
	
	default MatchingDTO entityToDTO(Matching matching) {
		Estimate e = matching.getEstimate();
		MatchingDTO dto = MatchingDTO.builder()
				.matchNo(matching.getMatchingNo())
				.eno(matching.getEstimate().getEno())
				.isAccepted(matching.isAccepted())
				.acceptedTime(matching.getAcceptedTime())
				.route(makeShortRoute(e.getStartAddress(), e.getEndAddress()))
				.cargoWeight(e.getCargoWeight())
				.distanceKm(e.getDistanceKm()+"KM")
				.cargoType(e.getCargoType())
				.startTime(e.getStartTime().toLocalDate().toString())
				.totalCost(String.format("%,d원", e.getTotalCost()))
				.build();
		
		return dto;
				
	}
	
	default String simpleAddress(String fullAddress) {
		if(fullAddress == null) {
			return "";
		}
		String[] parts = fullAddress.split(" ");
		if(parts.length>=2) {
			return parts[0].replaceAll("(시|광역시|특별자치도)$", "") + " "+ parts[1].replaceAll("(시|구|특별자치도)$", "");
		}
		return fullAddress;
	}
	
	default String makeShortRoute(String startAddress, String endAddress) {
	    String from = simpleAddress(startAddress);
	    String to = simpleAddress(endAddress);
	    return from + " → " + to;
	}
	
	PageResponseDTO<MatchingDTO> getList(PageRequestDTO requestDTO,String cargoId);
	
	void rejectMatching(Long estimateNo, CargoOwner cargoOwner);
	Long acceptMatching(Long estimateNo, CargoOwner cargoOwner);
	
}
