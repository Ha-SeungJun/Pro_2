package com.giproject.service.estimate.matching;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.giproject.controller.order.OrderController;
import com.giproject.dto.matching.MatchingDTO;
import com.giproject.dto.matching.PageRequestDTO;
import com.giproject.dto.matching.PageResponseDTO;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.estimate.Estimate;
import com.giproject.entity.matching.Matching;
import com.giproject.entity.matching.RejectedMatching;
import com.giproject.repository.cargo.CargoOwnerRepository;
import com.giproject.repository.estimate.EsmateRepository;
import com.giproject.repository.matching.MatchingRepository;
import com.giproject.repository.matching.RejectedMatchingRepository;
import com.giproject.security.JwtService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@RequiredArgsConstructor
@Log4j2
public class MatchingServiceImpl implements MatchingService{

    private final OrderController orderController;
	
	private final MatchingRepository matchingRepository;
	private final CargoOwnerRepository cargoOwnerRepository;
	private final EsmateRepository esmateRepository;
	private final RejectedMatchingRepository rejectedMatchingRepository;
	private final JwtService jwtService;


   

	@Override
	public PageResponseDTO<MatchingDTO> getList(PageRequestDTO requestDTO,String cargoId) {
		 if (cargoId == null || cargoId.isBlank()) {
		        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "인증 정보가 없습니다.");
		    }
		CargoOwner owner = cargoOwnerRepository.findById(cargoId).orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN,"운전기사만 접근 가능합니다"));
		
		Pageable pageable= PageRequest.of(requestDTO.getPage()-1, requestDTO.getSize(),Sort.by("matchingNo").descending());
		LocalDateTime now = LocalDateTime.now();
		Page<Matching> result = matchingRepository.findValidMatchingList(owner,now,pageable);
		System.out.println(result);
		List<MatchingDTO> dtoList = result.getContent().stream().map(this::entityToDTO).collect(Collectors.toList());
		System.out.println(dtoList);
		
		long totalCount = result.getTotalElements();
		return PageResponseDTO.<MatchingDTO>withAll()
				.dtoList(dtoList)
				.pageRequestDTO(requestDTO)
				.totalCount(totalCount)
				.build();
	}
	
	@Override
	public void rejectMatching(Long estimateNo, CargoOwner cargoOwner) {
		Estimate estimate = esmateRepository.findById(estimateNo)
				.orElseThrow(() -> new RuntimeException("해당 견적이 존재하지 않습니다"));
		if (rejectedMatchingRepository.existsByCargoOwnerAndEstimate(cargoOwner, estimate)) {
			return;
		}
		RejectedMatching rejected = RejectedMatching.builder()
				.cargoOwner(cargoOwner)
				.estimate(estimate)
				.rejectedTime(LocalDateTime.now())
				.build();
		rejectedMatchingRepository.save(rejected);
	}

	@Override
	public Long acceptMatching(Long estimateNo, CargoOwner cargoOwner) {
		Estimate estimate = esmateRepository.findById(estimateNo)
				.orElseThrow(() -> new RuntimeException("해당 견적이 존재하지 않습니다"));
		
		Matching matching = matchingRepository.findByEstimate(estimate).orElseThrow(() -> new RuntimeException("해당 매칭이 없습니다"));
		
		if(matchingRepository.checkMached(estimateNo)) {
			throw new RuntimeException("이미 다른 기사님이 수락하셨습니다");
		}
		estimate.changeMatched(true);
		matching.changeCargoOwner(cargoOwner);
		matching.changeIsAccepted(true);
		matching.changeAcceptedTime(LocalDateTime.now());
		esmateRepository.save(estimate);
		matchingRepository.save(matching);
		
		return  matching.getMatchingNo();
	
	}

}
