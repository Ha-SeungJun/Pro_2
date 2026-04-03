package com.giproject.repository.estimate;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.giproject.entity.estimate.Estimate;
import com.giproject.entity.member.Member;

public interface EsmateRepository extends JpaRepository<Estimate, Long>{
	
	
	@Query("Select m From Member m Where m.memId =:memberId")
	public Optional<Member> getMemId(@Param("memberId") String memberId) ;
	
	@Query("SELECT e FROM Estimate e WHERE e.isTemp = false")
	List<Estimate> findValidEstimates();
	
	@Query("Select e From Estimate e Where e.isTemp = true And e.member.memId =:memberId")
	public List<Estimate> saveEstimateList(@Param("memberId") String memberId);
	
	
	@Query("Select Count(e) From Estimate e Where e.member.memId =:memberId And e.isTemp = true")
	public int estimateCount(@Param("memberId")String memberId );
	
	@Query("Select e From Estimate e where e.member.memId =:memberId and e.eno =:eno")
	public Estimate exportEs(@Param("memberId")String memberId,@Param("eno") Long eno);
	
	@Query("Select e From Estimate e where e.member.memId =:memberId ")
	public List<Estimate> getMyEstimate(@Param("memberId") String memberId);
	@Query("""
		    select distinct e
		    from Estimate e
		    left join e.matchings m
		    left join m.orderSheet os
		    left join os.payment p
		    where e.member.memId = :memberId
		      and p is null
		""")
	public List<Estimate> findMyEstimatesWithoutPayment(@Param("memberId") String memberId);
	
	@Query("""
		    select distinct e
		    from Estimate e
		      join e.matchings m
		      join m.orderSheet os
		      join os.payment p
		    where e.member.memId = :memberId
		""")
	public List<Estimate> findMyPaidEstimates(@Param("memberId") String memberId);
}
