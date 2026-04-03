package com.giproject.repository.delivery;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import com.giproject.dto.delivery.DeliveryRowDTO;
import com.giproject.entity.delivery.Delivery;

public interface OwnerDeliveryQueryRepository extends Repository<com.giproject.entity.delivery.Delivery, Long> {

    /** 미결제: 매칭 승인됨 + 주문서는 존재 + 해당 주문서에 결제 없음 */
	@Query("""
			select new com.giproject.dto.delivery.DeliveryRowDTO(
			    e.eno,
			    e.cargoType,
			    cast(e.cargoWeight as string),
			    e.startAddress,
			    e.endAddress,
			    e.startTime,
			    e.member.memId, 
			    e.member.memName,
			    co.cargoName,
			    null,          
			    m.matchingNo,
			    null            
			)
			from com.giproject.entity.matching.Matching m
			join m.estimate e
			join m.cargoOwner co
			left join m.orderSheet os
			left join com.giproject.entity.payment.Payment p on p.orderSheet = os
			left join com.giproject.entity.delivery.Delivery d on d.payment = p
			where co.cargoId = :cargoId
			  and m.isAccepted = true
			  and (os is null or p is null)  
			  and (d is null or d.status <> com.giproject.entity.delivery.DeliveryStatus.COMPLETED)
			order by m.matchingNo desc
			""")
			List<DeliveryRowDTO> findUnpaidByCargoId(@Param("cargoId") String cargoId);



    /** 결제됨(대기/배송중): 해당 주문서 결제 있음 + Delivery가 없거나(=대기) / 완료가 아님 */
    @Query("""
        select new com.giproject.dto.delivery.DeliveryRowDTO(
            e.eno,
            e.cargoType,
            cast(e.cargoWeight as string),
            e.startAddress,
            e.endAddress,
            e.startTime,
            e.member.memId, 
            
			    e.member.memName,
            co.cargoName,
            case
                when d.status is null then com.giproject.entity.delivery.DeliveryStatus.PENDING
                else d.status
            end,
            m.matchingNo,
            d.completTime
        )
        from com.giproject.entity.matching.Matching m
        join m.estimate e
        join m.cargoOwner co
        join m.orderSheet os
        join com.giproject.entity.payment.Payment p on p.orderSheet = os
        left join com.giproject.entity.delivery.Delivery d on d.payment = p
        where co.cargoId = :cargoId
          and m.isAccepted = true
          and (d.status is null or d.status <> com.giproject.entity.delivery.DeliveryStatus.COMPLETED)
        order by e.eno desc
    """)
    List<DeliveryRowDTO> findPaidInProgressByCargoId(@Param("cargoId") String cargoId);

    /** 완료: Delivery.status = COMPLETED */
    @Query("""
        select new com.giproject.dto.delivery.DeliveryRowDTO(
            e.eno,
            e.cargoType,
            cast(e.cargoWeight as string),
            e.startAddress,
            e.endAddress,
            e.startTime,
            e.member.memId, 
            
			    e.member.memName,
            co.cargoName,
            d.status,
            m.matchingNo,
            d.completTime
        )
        from com.giproject.entity.matching.Matching m
        join m.estimate e
        join m.cargoOwner co
        join m.orderSheet os
        join com.giproject.entity.payment.Payment p on p.orderSheet = os
        join com.giproject.entity.delivery.Delivery d on d.payment = p
        where co.cargoId = :cargoId
          and m.isAccepted = true
          and d.status = com.giproject.entity.delivery.DeliveryStatus.COMPLETED
        order by d.completTime desc
    """)
    List<DeliveryRowDTO> findCompletedByCargoId(@Param("cargoId") String cargoId);
    
    @Query("""
    	    select d
    	    from Delivery d
    	    join d.payment p
    	    join p.orderSheet os
    	    join os.matching m
    	    join m.cargoOwner co
    	    where m.matchingNo = :matchingNo
    	      and co.cargoId = :cargoId
    	""")
    	Optional<Delivery> findByMatchingNoAndCargoId(@Param("matchingNo") Long matchingNo,
    	                                              @Param("cargoId") String cargoId);
}
