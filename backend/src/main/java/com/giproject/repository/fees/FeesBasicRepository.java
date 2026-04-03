package com.giproject.repository.fees;

import com.giproject.entity.fees.FeesBasic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.*;

public interface FeesBasicRepository extends JpaRepository<FeesBasic, Long> {
	Optional<FeesBasic> findByWeight(String weight);

	@Query("select distinct f.weight from FeesBasic f order by f.weight asc")
	List<String> findDistinctWeights();
	
	@Query("Select f from FeesBasic f order by f.ratePerKm")
	List<FeesBasic> findAllAsc();

	void deleteByWeight(String weight);
}
