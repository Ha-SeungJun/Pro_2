package com.example.demo;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.giproject.dto.estimate.EstimateDTO;
import com.giproject.service.estimate.EstimateService;

import jakarta.transaction.Transactional;

@SpringBootTest
class BackendApplicationTests {
	@Autowired
	EstimateService estimateService;
	//@Test
	void contextLoads() {
			System.out.println("1수정");
	}
	@Transactional
	@Test
	void test() {
		EstimateDTO dto =  EstimateDTO.builder().startAddress("서울시")
		.endAddress("김포시")

		.cargoType("물류")
		.startTime(LocalDateTime.of(2025, 11,1,15,30))
		.totalCost(1000000)
		.build();
			
	
		
		estimateService.sendEstimate(dto);
				
				
	}
}
