package com.giproject.service.review;

import java.util.List;

import com.giproject.dto.review.ReviewDTO;


public interface ReviewService {
	Long register(ReviewDTO reviewDTO);
	
	ReviewDTO getByDeliveryNo(Long deliveryNo);
	
	List<ReviewDTO> getList();
	
}
