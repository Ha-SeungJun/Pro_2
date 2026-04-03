package com.giproject.repository.fees;

import com.giproject.entity.fees.FeesExtra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.*;

public interface FeesExtraRepository extends JpaRepository<FeesExtra, Long> {
	Optional<FeesExtra> findByExtraChargeTitle(String extraChargeTitle);

	@Query("select distinct f.extraChargeTitle from FeesExtra f order by f.extraChargeTitle asc")
	List<String> findDistinctTitles();

	void deleteByExtraChargeTitle(String title);
}