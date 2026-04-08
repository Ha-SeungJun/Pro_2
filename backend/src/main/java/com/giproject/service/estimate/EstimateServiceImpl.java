package com.giproject.service.estimate;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.giproject.dto.estimate.EstimateDTO;
import com.giproject.dto.fees.FeesBasicDTO;
import com.giproject.dto.fees.FeesExtraDTO;
import com.giproject.entity.estimate.Estimate;
import com.giproject.entity.fees.FeesBasic;
import com.giproject.entity.matching.Matching;
import com.giproject.entity.member.Member;
import com.giproject.repository.delivery.DeliveryRepository;
import com.giproject.repository.estimate.EsmateRepository;
import com.giproject.repository.fees.FeesBasicRepository;
import com.giproject.repository.fees.FeesExtraRepository;
import com.giproject.repository.matching.MatchingRepository;
import com.giproject.repository.payment.PaymentRepository;
import com.giproject.service.estimate.matching.MatchingService;
import com.giproject.service.fees.FeesBasicService;
import com.giproject.service.fees.FeesExtraService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@RequiredArgsConstructor
@Log4j2

public class EstimateServiceImpl implements EstimateService{
	private final EsmateRepository esmateRepository;
	private final MatchingRepository matchingRepository;
	private final FeesBasicRepository basicRepository;
	private final FeesBasicService basicService;
	private final FeesExtraRepository extraRepository;
	private final FeesExtraService extraService;

    private final PaymentRepository paymentRepository;
    private final DeliveryRepository deliveryRepository;
	
    @Override
    @Transactional // 📍 데이터 일관성을 위해 트랜잭션 보장
    public Long sendEstimate(EstimateDTO dto) {
        log.info("견적서 제출 시작 - 회원: {}, 무게: {}", dto.getMemberId(), dto.getCargoWeight());

        // 1. [어드민 설정 조회] DB에서 관리자가 설정한 요금 정책을 가져옵니다.
        FeesBasic feeConfig = basicRepository.findByWeight(dto.getCargoWeight())
                .orElseThrow(() -> new RuntimeException("해당 화물 무게에 대한 요금 정책이 없습니다."));

        // 2. [서버 사이드 요금 계산] 프론트 값 대신 어드민 설정값으로 금액을 확정합니다.
        int baseCost = feeConfig.getInitialCharge().intValue(); // 어드민이 설정한 기본료
        int distanceCost = (int) (dto.getDistanceKm() * feeConfig.getRatePerKm().intValue()); // 어드민 설정 단가 적용
        int totalCost = baseCost + distanceCost + dto.getSpecialOption();

        // 3. [DTO 데이터 갱신] 계산된 '진짜' 금액들을 DTO에 주입합니다.
        dto.setBaseCost(baseCost);
        dto.setDistanceCost(distanceCost);
        dto.setTotalCost(totalCost);
        dto.setTemp(false);

        // 4. [DB 저장] Entity로 변환하여 저장 (이때 위경도 좌표도 DTOToEntity를 통해 함께 들어갑니다)
        Member member = esmateRepository.getMemId(dto.getMemberId()).orElseThrow();
        Estimate estimate = DTOToEntity(dto, member);
        
        esmateRepository.save(estimate);
        
        // 5. [매칭 생성]
        Matching matching = Matching.builder()
                .estimate(estimate)
                .isAccepted(false)
                .build();
        matchingRepository.save(matching);

        log.info("견적 확정 완료! 최종 금액: {}원", totalCost);
        return estimate.getEno();
    }

    @Override
    @Transactional
    public Long saveDraft(EstimateDTO estimateDTO) {
        Member member = esmateRepository.getMemId(estimateDTO.getMemberId()).orElseThrow();
        int count = esmateRepository.estimateCount(member.getMemId());
        
        if(count >= 3) {
            throw new IllegalStateException("임시저장은 최대 3개까지 가능합니다.");
        }

        // 임시저장 시에도 어드민 요금표를 미리 반영해주면 사용자가 혼란을 겪지 않습니다.
        basicRepository.findByWeight(estimateDTO.getCargoWeight()).ifPresent(config -> {
            int base = config.getInitialCharge().intValue();
            int dist = (int) (estimateDTO.getDistanceKm() * config.getRatePerKm().intValue());
            estimateDTO.setBaseCost(base);
            estimateDTO.setDistanceCost(dist);
            estimateDTO.setTotalCost(base + dist + estimateDTO.getSpecialOption());
        });

        estimateDTO.setTemp(true);
        Estimate estimate = DTOToEntity(estimateDTO, member);
        
        esmateRepository.save(estimate);
        return estimate.getEno();
    }


	@Override
	public List<EstimateDTO> getSaveEstimate(String memberId) {
		List<Estimate> tempEstimate = esmateRepository.saveEstimateList(memberId);
		
		return tempEstimate.stream()
				.map(this::entityToDTO)
				.collect(Collectors.toList());
	}

	@Override
	public EstimateDTO exportEstimate(String mameberId, Long eno) {
		Estimate estimate = esmateRepository.exportEs(mameberId, eno);
		EstimateDTO dto = entityToDTO(estimate);
		return dto;
		
	}

	@Override
	public List<EstimateDTO> myEstimateList(String memberId) {
	    List<Estimate> esList = esmateRepository.getMyEstimate(memberId);
	    log.info("myEstimateList() 진입 - 조회 결과 수: {}", esList.size());

	    return esList.stream().map(estimate -> {
	        if (estimate.getMember() == null) {
	            log.warn("estimate {} 의 member가 null입니다", estimate.getEno());
	        }

	        EstimateDTO dto = entityToDTO(estimate);

	        // matching 여부 조회
	        Optional<Boolean> isAcceptedOpt = matchingRepository.findIsAcceptedByEstimateNo(estimate.getEno());
	        dto.setAccepted(isAcceptedOpt.orElse(false)); // null이면 false 처리

	        log.info("DTO 변환 성공: {} (isAccepted: {})", dto.getEno(), dto.isAccepted());
	        Optional<Long> matchingNoOpt = matchingRepository.findMatchingNoByEstimateNo(estimate.getEno());
	        dto.setMatchingNo(matchingNoOpt.orElse(null));
	        
	        return dto;
	    }).collect(Collectors.toList());
	}
	@Override
	public List<FeesBasicDTO> searchFees() {
		return basicRepository.findAllAsc()
				.stream()
				.map(list -> basicService.entityToDTO(list))
				.collect(Collectors.toList());
	}
	@Override
	public List<FeesExtraDTO> searchExtra() {
		return extraRepository.findAll()
				.stream()
				.map(list -> extraService.entityToDTO(list))
				.collect(Collectors.toList());
	}
	
	@Override
	public List<EstimateDTO> findMyEstimatesWithoutPayment(String memberId) {
	    List<Estimate> esList = esmateRepository.findMyEstimatesWithoutPayment(memberId);
	    log.info("myEstimateList() 진입 - (결제 없는) 조회 결과 수: {}", esList.size());

	    return esList.stream() .filter(e -> !e.isTemp())   .map(e -> {
            EstimateDTO dto = entityToDTO(e);
            dto.setAccepted(matchingRepository.findIsAcceptedByEstimateNo(e.getEno()).orElse(false));
            Long matchingNo = matchingRepository.findMatchingNoByEstimateNo(e.getEno()).orElse(null);
            dto.setMatchingNo(matchingNo);

            // (선택) 운전기사 이름: 매칭에서 바로
            if (matchingNo != null) {
                matchingRepository.findById(matchingNo).ifPresent(m -> {
                    if (m.getCargoOwner() != null) {
                        dto.setDriverName(m.getCargoOwner().getCargoName());
                    }
                });
            }
            return dto;
	    }).collect(Collectors.toList());
	}

	@Override
	public List<EstimateDTO> findMyPaidEstimates(String memberId) {
	    List<Estimate> list = esmateRepository.findMyPaidEstimates(memberId);

	    return list.stream()
	        .filter(e -> !e.isTemp())
	        .map(e -> {
	            EstimateDTO dto = entityToDTO(e);

	            dto.setAccepted(
	                matchingRepository.findIsAcceptedByEstimateNo(e.getEno()).orElse(false)
	            );

	            Long matchingNo = matchingRepository.findMatchingNoByEstimateNo(e.getEno()).orElse(null);
	            dto.setMatchingNo(matchingNo);

	            if (matchingNo != null) {
	                paymentRepository.findByOrderSheet_Matching_MatchingNo(matchingNo)
	                    .ifPresent(p -> {
	                        dto.setPaymentNo(p.getPaymentNo());

	                        // 운전기사 이름
	                        String driverName = null;
	                        if (p.getOrderSheet() != null &&
	                            p.getOrderSheet().getMatching() != null &&
	                            p.getOrderSheet().getMatching().getCargoOwner() != null) {
	                            driverName = p.getOrderSheet().getMatching().getCargoOwner().getCargoName();
	                        }
	                        dto.setDriverName(driverName);

	                        // 배송 상태
	                        deliveryRepository.findByPayment_PaymentNo(p.getPaymentNo())
	                        .ifPresent(d -> {
	                            dto.setDeliveryStatus(d.getStatus());
	                            dto.setDeliveryCompletedAt(d.getCompletTime());
	                            dto.setDeliveryNo(d.getDeliveryNo());
	                        });
	                    });
	            }

	            return dto;
	        })
	        .toList();
	}
}
