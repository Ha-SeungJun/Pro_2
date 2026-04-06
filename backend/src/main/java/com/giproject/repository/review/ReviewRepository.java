package com.giproject.repository.review;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.giproject.entity.review.Review;

public interface ReviewRepository extends JpaRepository<Review, Long>{
	boolean existsByDeliveryNo(Long deliveryNo);// 중복확인용 
	
	Optional<Review> findByDeliveryNo(Long deliveryNo);

    List<Review> findAllByOrderByCreatedAtDesc();
}
