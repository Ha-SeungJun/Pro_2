package com.giproject.repository.review;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.giproject.entity.review.ReviewImage;

public interface ReviewImageRepository extends JpaRepository<ReviewImage, Long> {
	
	//리뷰 번호로 이미지 목록 조회
	List<ReviewImage> findByReviewNoOrderBySortOrderAsc(Long reviewNo);
	
	//나중에 리뷰 삭제할 때 같이 삭제
	void deleteByReviewNo(Long reviewNo);
	//삭제 이미지
	void deleteByReviewImageNoIn(List<Long> reviewImageNos);
	
	List<ReviewImage> findByReviewImageNoIn(List<Long> reviewImageNos);

	
}
