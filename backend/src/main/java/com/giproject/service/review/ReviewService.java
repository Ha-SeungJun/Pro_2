package com.giproject.service.review;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.giproject.dto.review.ReviewDTO;
import com.giproject.dto.review.ReviewSummaryDTO;


public interface ReviewService {
	//등록(create)
	Long register(ReviewDTO reviewDTO);
	
	
	ReviewDTO getByDeliveryNo(Long deliveryNo);
	
	//리뷰 리스트
	List<ReviewDTO> getList();

	//삭제(delete)
	void remove(Long reviewNo, String loginId, boolean isAdmin);
	
	//수정(update)
	void modify(Long reviewNo, ReviewDTO reviewDTO, String loginId);
	
	//조회 api
	ReviewSummaryDTO getSummaryByCargoId(String cargoId);
	
	//페이징 처리
	 Page<ReviewDTO> getReviewsByCargoId(String cargoId, Pageable pageable);
	
	 //버튼 숨기기용
	 boolean existsByDeliveryNo(Long deliveryNo);
}
