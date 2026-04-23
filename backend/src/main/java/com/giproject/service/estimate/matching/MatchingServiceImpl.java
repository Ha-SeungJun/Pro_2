package com.giproject.service.estimate.matching;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.giproject.controller.order.OrderController;
import com.giproject.dto.matching.MatchingDTO;
import com.giproject.dto.matching.PageRequestDTO;
import com.giproject.dto.matching.PageResponseDTO;
import com.giproject.entity.cargo.Cargo;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.estimate.Estimate;
import com.giproject.entity.matching.Matching;
import com.giproject.entity.matching.RejectedMatching;
import com.giproject.repository.cargo.CargoOwnerRepository;
import com.giproject.repository.cargo.CargoRepository; // 🚨 추가된 임포트
import com.giproject.repository.estimate.EsmateRepository;
import com.giproject.repository.matching.MatchingRepository;
import com.giproject.repository.matching.RejectedMatchingRepository;
import com.giproject.security.JwtService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@RequiredArgsConstructor
@Log4j2
public class MatchingServiceImpl implements MatchingService {

    private final OrderController orderController;
    private final MatchingRepository matchingRepository;
    private final CargoOwnerRepository cargoOwnerRepository;
    private final EsmateRepository esmateRepository;
    private final RejectedMatchingRepository rejectedMatchingRepository;
    private final JwtService jwtService;
    
    // 🚨 [핵심 추가] 차주의 등록 차량 상태를 확인하기 위해 CargoRepository 주입
    private final CargoRepository cargoRepository;

    @Override
    public PageResponseDTO<MatchingDTO> getList(PageRequestDTO requestDTO, String cargoId) {
        if (cargoId == null || cargoId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "인증 정보가 없습니다.");
        }

        // ✅ 기존 로직 보존: 기사 정보를 찾되, 없어도 즉시 예외를 던지지 않도록 수정
        CargoOwner owner = cargoOwnerRepository.findById(cargoId).orElse(null);

        // ✅ 권한 확인 로직 추가: 현재 사용자가 화주(SHIPPER)인지 확인
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isShipper = auth.getAuthorities().stream()
                               .anyMatch(a -> a.getAuthority().equals("ROLE_SHIPPER"));

        // 기사도 아니고 화주도 아닌 경우에만 403 에러 발생
        if (owner == null && !isShipper) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "운전기사만 접근 가능합니다");
        }

        Pageable pageable = PageRequest.of(requestDTO.getPage() - 1, requestDTO.getSize(), Sort.by("matchingNo").descending());
        LocalDateTime now = LocalDateTime.now();

        // ✅ 데이터 조회 분기 추가
        Page<Matching> result;
        if (owner != null) {
            // 기사님일 경우: 기존 유효 매칭 리스트 조회
            result = matchingRepository.findValidMatchingList(owner, now, pageable);
        } else {
            // 화주일 경우: 전체 리스트 조회 (추후 본인 필터링 쿼리로 교체 가능)
            result = matchingRepository.findAll(pageable);
        }

        System.out.println(result);
        
        // ✅ 인터페이스의 entityToDTO를 사용하여 변환 (기존 구현 방식 유지)
        List<MatchingDTO> dtoList = result.getContent().stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
        
        System.out.println(dtoList);

        long totalCount = result.getTotalElements();
        return PageResponseDTO.<MatchingDTO>withAll()
                .dtoList(dtoList)
                .pageRequestDTO(requestDTO)
                .totalCount(totalCount)
                .build();
    }

    @Override
    public void rejectMatching(Long estimateNo, CargoOwner cargoOwner) {
        Estimate estimate = esmateRepository.findById(estimateNo)
                .orElseThrow(() -> new RuntimeException("해당 견적이 존재하지 않습니다"));
        if (rejectedMatchingRepository.existsByCargoOwnerAndEstimate(cargoOwner, estimate)) {
            return;
        }
        RejectedMatching rejected = RejectedMatching.builder()
                .cargoOwner(cargoOwner)
                .estimate(estimate)
                .rejectedTime(LocalDateTime.now())
                .build();
        rejectedMatchingRepository.save(rejected);
    }

    @Override
    public Long acceptMatching(Long estimateNo, CargoOwner cargoOwner) {
        // 1. 견적서 정보를 가장 먼저 조회 (요구 무게를 알아야 하므로)
        Estimate estimate = esmateRepository.findById(estimateNo)
                .orElseThrow(() -> new RuntimeException("해당 견적이 존재하지 않습니다"));

        // 2. 차주가 보유한 '승인 완료(APPROVED)' 차량 목록 전체 조회
        List<Cargo> approvedCargos = cargoRepository.findByCargoOwner_CargoIdAndStatus(cargoOwner.getCargoId(), "APPROVED");
        
        // 3. 승인된 차량 자체가 아예 없는 경우 원천 차단
        if (approvedCargos.isEmpty()) {
            throw new RuntimeException("관리자 승인이 완료된 차량이 등록되어 있어야 견적을 수락할 수 있습니다.");
        }

        // 4. 🚨 [핵심 보안 로직] 내 승인 차량 중 견적서의 무게(weight)와 똑같은 차량이 있는지 검사
        // 💡 주의: Estimate 엔티티의 무게 필드가 getWeight() 인지 getCargoWeight() 인지 팀장님 엔티티에 맞게 수정해 주세요! (여기선 getWeight()로 가정)
        boolean hasRightVehicle = approvedCargos.stream()
                .anyMatch(cargo -> cargo.getCargoCapacity().equals(estimate.getCargoWeight())); 

        if (!hasRightVehicle) {
            // 무게가 다르면 수락 불가 에러 발생!
            throw new RuntimeException("수락 불가: 해당 견적(" + estimate.getCargoWeight() + ")에 맞는 승인된 차량을 보유하고 있지 않습니다.");
        }

        // 5. 아래는 기존 수락 로직 동일
        Matching matching = matchingRepository.findByEstimate(estimate)
                .orElseThrow(() -> new RuntimeException("해당 매칭이 없습니다"));

        if (matchingRepository.checkMached(estimateNo)) {
            throw new RuntimeException("이미 다른 기사님이 수락하셨습니다");
        }
        
        estimate.changeMatched(true);
        matching.changeCargoOwner(cargoOwner);
        matching.changeIsAccepted(true);
        matching.changeAcceptedTime(LocalDateTime.now());
        esmateRepository.save(estimate);
        matchingRepository.save(matching);

        return matching.getMatchingNo();
    }
}