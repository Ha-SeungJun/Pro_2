package com.giproject;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.test.annotation.Rollback;

import com.giproject.dto.estimate.EstimateDTO;
import com.giproject.dto.matching.MatchingDTO;
import com.giproject.dto.matching.PageRequestDTO;
import com.giproject.dto.matching.PageResponseDTO;
import com.giproject.entity.estimate.Estimate;
import com.giproject.entity.matching.Matching;
import com.giproject.repository.estimate.EsmateRepository;
import com.giproject.repository.matching.MatchingRepository;
import com.giproject.service.delivery.DeliveryService;
import com.giproject.service.estimate.EstimateService;
import com.giproject.service.estimate.matching.MatchingService;

import jakarta.transaction.Transactional;

@Transactional
@SpringBootTest
@Rollback(false)
public class EstimateTest {

	@Autowired
	EstimateService estimateService;
	@Autowired
	MatchingService matchingService;
	@Autowired
	MatchingRepository matchingRepository;
	@Autowired
	EsmateRepository esmateRepository;
	
	@Autowired
 DeliveryService deliveryService;
	// @Test
	void contextLoads() {
		System.out.println("1수정");
	}
	@Transactional
	//@Test
	void test() {
		String user = "user";
		List<EstimateDTO> dtolist = estimateService.getSaveEstimate(user);
		for(int i = 0 ; i<dtolist.size();i++) {
			System.out.println(dtolist.get(i).getEno());
		}
	}

	 @Transactional
	 //@Test
	void test2() {
		for (long eno = 1; eno <= 20; eno++) {
		    final long finalEno = eno;
		    Estimate estimate = esmateRepository.findById(finalEno)
		        .orElseThrow(() -> new IllegalArgumentException("eno 없음: " + finalEno));
		    
		    Matching matching = Matching.builder()
		        .estimate(estimate)
		        .isAccepted(false)
		        .acceptedTime(LocalDateTime.of(2025, 11, 1, 15, 30))
		        .build();

		    matchingRepository.save(matching);
		}

	}
		
		

	@Transactional
	//@Test
	void list() {
		  PageRequestDTO requestDTO = PageRequestDTO.builder()
		            .page(1)
		            .size(10)
		            .build();

//		        PageResponseDTO<MatchingDTO> response = matchingService.getList(requestDTO);
//		        
//		        System.out.println(response.getDtoList());
//		        for(MatchingDTO dto : response.getDtoList()) {
//		        	System.out.println(dto.getEno() +" : "+ dto.getCargoType() + dto.getStartTime() + dto.getRoute());
//		        }
//		       
	}
	@Transactional
	@Test
	void changeTest() {
		Long no =3L;
		deliveryService.changeStatusCompleted(no);
	}
}
