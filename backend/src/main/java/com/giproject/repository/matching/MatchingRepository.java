package com.giproject.repository.matching;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.estimate.Estimate;
import com.giproject.entity.matching.Matching;

public interface MatchingRepository extends JpaRepository<Matching, Long> {

	@Query("""
		    SELECT m FROM Matching m
		    WHERE m.cargoOwner IS NULL
		      AND m.isAccepted = false
		      AND m.estimate.isTemp = false
		      And m.estimate.matched = false
		      And m.estimate.isOrdered = false
		      And m.estimate.startTime >=:now
		      AND NOT EXISTS (
		        SELECT 1 FROM RejectedMatching r
		        WHERE r.cargoOwner = :cargoOwner
		          AND r.estimate = m.estimate
		      )
		    """)
	Page<Matching> findValidMatchingList(@Param("cargoOwner") CargoOwner cargoOwner,@Param("now")LocalDateTime now, Pageable pageable);
	
	@Query("SELECT COUNT(m) > 0 FROM Matching m WHERE m.estimate.eno = :estimateNo AND m.estimate.matched = true")
	boolean checkMached(@Param("estimateNo") Long estimateNo);
	
	Optional<Matching> findByEstimate(Estimate estimate);
	@Query("SELECT m FROM Matching m WHERE m.estimate.eno = :eno AND m.isAccepted = true")
	Optional<Matching> findByEstimateEnoAndIsAcceptedTrue(@Param("eno") Long eno);
	
	@Query("SELECT m.isAccepted FROM Matching m WHERE m.estimate.eno = :estimateNo")
	Optional<Boolean> findIsAcceptedByEstimateNo(@Param("estimateNo") Long estimateNo);
	
	@Query("SELECT m.matchingNo FROM Matching m WHERE m.estimate.eno = :estimateNo")
	Optional<Long> findMatchingNoByEstimateNo(@Param("estimateNo") Long estimateNo);
}
