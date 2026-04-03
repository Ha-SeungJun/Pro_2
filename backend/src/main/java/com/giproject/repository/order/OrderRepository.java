package com.giproject.repository.order;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.giproject.entity.order.OrderSheet;

public interface OrderRepository extends JpaRepository<OrderSheet, Long>{
	  @Query("""
		      select os
		      from OrderSheet os
		        join os.matching m
		        join m.cargoOwner co
		      where m.matchingNo = :matchingNo
		        and co.cargoId = :cargoId
		    """)
		    Optional<OrderSheet> findByMatchingNoAndCargoId(@Param("matchingNo") Long matchingNo,
		                                                    @Param("cargoId") String cargoId);
	  Optional<OrderSheet> findTopByMatching_MatchingNoOrderByOrderNoDesc(Long matchingNo);
}
