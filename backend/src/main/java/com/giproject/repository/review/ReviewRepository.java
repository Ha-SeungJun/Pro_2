package com.giproject.repository.review;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.giproject.dto.review.MyReviewListDTO;
import com.giproject.dto.review.ReviewSummaryDTO;
import com.giproject.entity.review.Review;

public interface ReviewRepository extends JpaRepository<Review, Long>{
	boolean existsByDeliveryNo(Long deliveryNo);// 중복확인용 
	
	Optional<Review> findByDeliveryNo(Long deliveryNo);

    List<Review> findAllByOrderByCreatedAtDesc();
    
    
    //리뷰 작성자 memId 찾기
    @Query("""
    	    select e.member.memId
    	    from Review r, Delivery d
    	    join d.payment p
    	    join p.orderSheet os
    	    join os.matching m
    	    join m.estimate e
    	    where r.reviewNo = :reviewNo
    	      and r.deliveryNo = d.deliveryNo
    	""")
    	Optional<String> findWriterMemIdByReviewNo(@Param("reviewNo") Long reviewNo);
    //리뷰의 cargoId 찾기
    @Query("""
            select m.cargoOwner.cargoId
            from Review r, Delivery d
            join d.payment p
            join p.orderSheet os
            join os.matching m
            where r.reviewNo = :reviewNo
              and r.deliveryNo = d.deliveryNo
        """)
        Optional<String> findTargetCargoIdByReviewNo(@Param("reviewNo") Long reviewNo);

    @Query("""
    	    select new com.giproject.dto.review.ReviewSummaryDTO(
    	        m.cargoOwner.cargoId,
    	        avg(r.rating),
    	        count(r)
    	    )
    	    from Review r
    	    join Delivery d on r.deliveryNo = d.deliveryNo
    	    join d.payment p
    	    join p.orderSheet os
    	    join os.matching m
    	    where m.cargoOwner.cargoId = :cargoId
    	    group by m.cargoOwner.cargoId
    	""")
    	Optional<ReviewSummaryDTO> findReviewSummaryByCargoId(@Param("cargoId") String cargoId);
    
    @Query("""
    	    select r
    	    from Review r
    	    join Delivery d on r.deliveryNo = d.deliveryNo
    	    join d.payment p
    	    join p.orderSheet os
    	    join os.matching m
    	    where m.cargoOwner.cargoId = :cargoId
    	    order by r.createdAt desc
    	""")
    	List<Review> findReviewsByCargoId(@Param("cargoId") String cargoId);

    @Query(
            value = """
                select r
                from Review r
                join Delivery d on r.deliveryNo = d.deliveryNo
                join d.payment p
                join p.orderSheet os
                join os.matching m
                where m.cargoOwner.cargoId = :cargoId
                order by r.createdAt desc
            """,
            countQuery = """
                select count(r)
                from Review r
                join Delivery d on r.deliveryNo = d.deliveryNo
                join d.payment p
                join p.orderSheet os
                join os.matching m
                where m.cargoOwner.cargoId = :cargoId
            """
        )
        Page<Review> findReviewsByCargoId(@Param("cargoId") String cargoId, Pageable pageable);
    	
   
   
    @Query("""
    	    SELECT new com.giproject.dto.review.MyReviewListDTO(
    	        r.reviewNo,
    	        r.deliveryNo,
    	        r.rating,
    	        r.comment,
    	        r.createdAt,
    	        e.cargoType,
    	        e.cargoWeight,
    	        e.startAddress,
    	        e.endAddress,
    	        d.completTime,
    	        m.cargoOwner.cargoName,
    	        d.status
    	    )
    	    FROM Review r
    	    JOIN Delivery d ON r.deliveryNo = d.deliveryNo
    	    JOIN d.payment p
    	    JOIN p.orderSheet os
    	    JOIN os.matching m
    	    JOIN m.estimate e
    	    WHERE e.member.memId = :memId
    	    ORDER BY r.createdAt DESC
    	    """)
    	List<MyReviewListDTO> findMyReviewsByWriterMemId(@Param("memId") String memId);
    @Query("""
    	    SELECT new com.giproject.dto.review.MyReviewListDTO(
    	        r.reviewNo,
    	        r.deliveryNo,
    	        r.rating,
    	        r.comment,
    	        r.createdAt,
    	        e.cargoType,
    	        e.cargoWeight,
    	        e.startAddress,
    	        e.endAddress,
    	        d.completTime,
    	        m.cargoOwner.cargoName,
    	        d.status
    	    )
    	    FROM Review r
    	    JOIN Delivery d ON r.deliveryNo = d.deliveryNo
    	    JOIN d.payment p
    	    JOIN p.orderSheet os
    	    JOIN os.matching m
    	    JOIN m.estimate e
    	    WHERE m.cargoOwner.cargoId = :cargoId
    	    ORDER BY r.createdAt DESC
    	    """)
    	List<MyReviewListDTO> findReceivedReviewsByCargoId(@Param("cargoId") String cargoId);
}
