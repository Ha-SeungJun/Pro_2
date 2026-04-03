package com.giproject.repository.matching;

import org.springframework.data.jpa.repository.JpaRepository;

import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.estimate.Estimate;
import com.giproject.entity.matching.RejectedMatching;

public interface RejectedMatchingRepository extends JpaRepository<RejectedMatching, Long>{
	boolean existsByCargoOwnerAndEstimate(CargoOwner cargoOwner,Estimate estimate);
}
