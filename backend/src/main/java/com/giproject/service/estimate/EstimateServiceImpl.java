package com.giproject.service.estimate;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.giproject.dto.estimate.EstimateDTO;
import com.giproject.dto.fees.FeesBasicDTO;
import com.giproject.dto.fees.FeesExtraDTO;
import com.giproject.entity.estimate.Estimate;
import com.giproject.entity.fees.FeesBasic;
import com.giproject.entity.fees.FeesExtra;
import com.giproject.entity.matching.Matching;
import com.giproject.entity.member.Member;
import com.giproject.repository.delivery.DeliveryRepository;
import com.giproject.repository.estimate.EsmateRepository;
import com.giproject.repository.fees.FeesBasicRepository;
import com.giproject.repository.fees.FeesExtraRepository;
import com.giproject.repository.matching.MatchingRepository;
import com.giproject.repository.payment.PaymentRepository;
import com.giproject.service.fees.FeesBasicService;
import com.giproject.service.fees.FeesExtraService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@RequiredArgsConstructor
@Log4j2
public class EstimateServiceImpl implements EstimateService {
    private final EsmateRepository esmateRepository;
    private final MatchingRepository matchingRepository;
    private final FeesBasicRepository basicRepository;
    private final FeesBasicService basicService;
    private final FeesExtraRepository extraRepository;
    private final FeesExtraService extraService;
    private final PaymentRepository paymentRepository;
    private final DeliveryRepository deliveryRepository;


    @Override
    @Transactional
    public Long sendEstimate(EstimateDTO dto) {
    	log.info("견적서 제출 시작 - 회원: {}, 거리: {}km", dto.getMemberId(), dto.getDistanceKm());

            // 1. [어드민 정책 조회]
            FeesBasic feeConfig = basicRepository.findByWeight(dto.getCargoWeight())
                    .orElseThrow(() -> new RuntimeException("해당 화물 무게에 대한 요금 정책이 없습니다."));

            // 2. [원가 계산]
            int baseCost = feeConfig.getInitialCharge().intValue(); // 기본료
            int distanceCost = (int) (dto.getDistanceKm() * feeConfig.getRatePerKm().intValue()); // 거리료
            
            // 🚨 [거리별 할인 시스템 가동]
            // 인터페이스에서 정의한 100/200/300/400 단위 할인 로직 호출
            int autoDiscount = calculateDistanceDiscount(dto.getDistanceKm(), baseCost + distanceCost);
            
            // 3. [금액 확정 및 DTO 주입]
            dto.setBaseCost(baseCost);
            dto.setDistanceCost(distanceCost);
            dto.setDistanceDiscount(autoDiscount); // 🚨 10원 단위 절사된 금액 저장
            
            // 최종 결제 금액 = (기본료 + 거리료 + 상하차/냉동옵션) - 거리할인 - 쿠폰할인
            int totalCost = (baseCost + distanceCost + dto.getSpecialOption()) - autoDiscount - dto.getCouponDiscount();
            dto.setTotalCost(Math.max(totalCost, 0)); // 마이너스 방지
            dto.setTemp(false);

            // 4. [DB 저장]
            Member member = esmateRepository.getMemId(dto.getMemberId())
                    .orElseThrow(() -> new RuntimeException("회원 정보가 없습니다."));
            
            Estimate estimate = DTOToEntity(dto, member);
            esmateRepository.save(estimate);
            
            // 5. [매칭 생성]
            Matching matching = Matching.builder()
                    .estimate(estimate)
                    .isAccepted(false)
                    .build();
            matchingRepository.save(matching);

            log.info("견적 확정! 원가: {}, 자동할인: {}, 최종금액: {}", 
                      (baseCost + distanceCost), autoDiscount, dto.getTotalCost());
            
            return estimate.getEno();
        }

        @Override
        @Transactional
        public Long saveDraft(EstimateDTO estimateDTO) {
            Member member = esmateRepository.getMemId(estimateDTO.getMemberId())
                    .orElseThrow(() -> new RuntimeException("회원 정보가 없습니다."));
            
            int count = esmateRepository.estimateCount(member.getMemId());
            if(count >= 3) {
                throw new IllegalStateException("임시저장은 최대 3개까지 가능합니다.");
            }

            // 🚨 임시저장 시에도 사용자가 할인된 금액을 미리 볼 수 있도록 계산 반영
            basicRepository.findByWeight(estimateDTO.getCargoWeight()).ifPresent(config -> {
                int base = config.getInitialCharge().intValue();
                int dist = (int) (estimateDTO.getDistanceKm() * config.getRatePerKm().intValue());
                
                // 인터페이스의 할인 로직 적용
                int autoDisc = calculateDistanceDiscount(estimateDTO.getDistanceKm(), base + dist);
                
                estimateDTO.setBaseCost(base);
                estimateDTO.setDistanceCost(dist);
                estimateDTO.setDistanceDiscount(autoDisc);
                
                int total = (base + dist + estimateDTO.getSpecialOption()) - autoDisc - estimateDTO.getCouponDiscount();
                estimateDTO.setTotalCost(Math.max(total, 0));
            });

            estimateDTO.setTemp(true);
            Estimate estimate = DTOToEntity(estimateDTO, member);
            esmateRepository.save(estimate);
            return estimate.getEno();
        }

    // ... 아래 목록 조회(myEstimateList 등)는 기존 로직 그대로 유지 (entityToDTO에서 할인 필드 자동 매핑됨) ...

    @Override
    public List<EstimateDTO> getSaveEstimate(String memberId) {
        return esmateRepository.saveEstimateList(memberId).stream()
                .map(this::entityToDTO).collect(Collectors.toList());
    }

    @Override
    public EstimateDTO exportEstimate(String mameberId, Long eno) {
        Estimate estimate = esmateRepository.exportEs(mameberId, eno);
        return entityToDTO(estimate);
    }

    @Override
    public List<EstimateDTO> myEstimateList(String memberId) {
        List<Estimate> esList = esmateRepository.getMyEstimate(memberId);
        return esList.stream().map(estimate -> {
            EstimateDTO dto = entityToDTO(estimate);
            dto.setAccepted(matchingRepository.findIsAcceptedByEstimateNo(estimate.getEno()).orElse(false));
            dto.setMatchingNo(matchingRepository.findMatchingNoByEstimateNo(estimate.getEno()).orElse(null));
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public List<FeesBasicDTO> searchFees() {
        return basicRepository.findAllAsc().stream()
                .map(basicService::entityToDTO).collect(Collectors.toList());
    }

    @Override
    public List<FeesExtraDTO> searchExtra() {
        // 🚨 여기서 findAll()을 했을 때 DB에 있는 '냉동식품' 등이 여전히 나오는지 로그를 찍어보세요.
        List<FeesExtra> list = extraRepository.findAll();
        log.info("조회된 추가요금 리스트 개수: {}", list.size()); 
        return list.stream()
                .map(extraService::entityToDTO).collect(Collectors.toList());
    }
    
    @Override
    public List<EstimateDTO> findMyEstimatesWithoutPayment(String memberId) {
        return esmateRepository.findMyEstimatesWithoutPayment(memberId).stream()
                .filter(e -> !e.isTemp()).map(e -> {
                    EstimateDTO dto = entityToDTO(e);
                    dto.setAccepted(matchingRepository.findIsAcceptedByEstimateNo(e.getEno()).orElse(false));
                    Long matchingNo = matchingRepository.findMatchingNoByEstimateNo(e.getEno()).orElse(null);
                    dto.setMatchingNo(matchingNo);
                    if (matchingNo != null) {
                        matchingRepository.findById(matchingNo).ifPresent(m -> {
                            if (m.getCargoOwner() != null) dto.setDriverName(m.getCargoOwner().getCargoName());
                        });
                    }
                    return dto;
                }).collect(Collectors.toList());
    }

    @Override
    public List<EstimateDTO> findMyPaidEstimates(String memberId) {
        return esmateRepository.findMyPaidEstimates(memberId).stream()
                .filter(e -> !e.isTemp()).map(e -> {
                    EstimateDTO dto = entityToDTO(e);
                    dto.setAccepted(matchingRepository.findIsAcceptedByEstimateNo(e.getEno()).orElse(false));
                    Long matchingNo = matchingRepository.findMatchingNoByEstimateNo(e.getEno()).orElse(null);
                    dto.setMatchingNo(matchingNo);
                    if (matchingNo != null) {
                        paymentRepository.findByOrderSheet_Matching_MatchingNo(matchingNo).ifPresent(p -> {
                            dto.setPaymentNo(p.getPaymentNo());
                            if (p.getOrderSheet() != null && p.getOrderSheet().getMatching() != null && p.getOrderSheet().getMatching().getCargoOwner() != null) {
                                dto.setDriverName(p.getOrderSheet().getMatching().getCargoOwner().getCargoName());
                            }
                            deliveryRepository.findByPayment_PaymentNo(p.getPaymentNo()).ifPresent(d -> {
                                dto.setDeliveryStatus(d.getStatus());
                                dto.setDeliveryCompletedAt(d.getCompletTime());
                                dto.setDeliveryNo(d.getDeliveryNo());
                            });
                        });
                    }
                    return dto;
                }).toList();
    }
}