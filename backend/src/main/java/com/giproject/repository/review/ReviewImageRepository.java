package com.giproject.repository.review;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.giproject.entity.review.Review;
import com.giproject.entity.review.ReviewImage;

public interface ReviewImageRepository extends JpaRepository<ReviewImage, Long> {
	
	//리뷰 번호로 이미지 목록 조회
	List<ReviewImage> findByReviewOrderBySortOrderAsc(Review review);
	
	//나중에 리뷰 삭제할 때 같이 삭제
	void deleteByReview(Review review);
	//삭제 이미지
	void deleteByReviewImageNoIn(List<Long> reviewImageNos);
	
	List<ReviewImage> findByReviewImageNoIn(List<Long> reviewImageNos);
	
	List<ReviewImage> findByReview_ReviewNoOrderBySortOrderAsc(Long reviewNo);
	
	@Query("""
		    SELECT ri
		    FROM ReviewImage ri
		    WHERE ri.review.reviewNo IN :reviewNos
		    ORDER BY ri.review.reviewNo ASC, ri.sortOrder ASC
		""")
		List<ReviewImage> findAllByReviewNos(@Param("reviewNos") List<Long> reviewNos);
	
	
	
}
