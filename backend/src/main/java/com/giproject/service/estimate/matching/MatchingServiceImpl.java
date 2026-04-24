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
import com.giproject.repository.cargo.CargoRepository;
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
    private final CargoRepository cargoRepository;

    @Override
    public PageResponseDTO<MatchingDTO> getList(PageRequestDTO requestDTO, String cargoId) {

        if (cargoId == null || cargoId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "인증 정보가 없습니다.");
        }

        CargoOwner owner = cargoOwnerRepository.findById(cargoId).orElse(null);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        boolean isShipper = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SHIPPER"));

        // 수정: 관리자 권한 체크 (ROLE_ADMIN / ADMIN 둘 다 대응)
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> {
                    String role = a.getAuthority();
                    return role.equals("ROLE_ADMIN") || role.equals("ADMIN");
                });

        // 수정: 관리자도 접근 허용
        if (owner == null && !isShipper && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "접근 권한이 없습니다.");
        }

        Pageable pageable = PageRequest.of(
                requestDTO.getPage() - 1,
                requestDTO.getSize(),
                Sort.by("matchingNo").descending()
        );

        LocalDateTime now = LocalDateTime.now();

        Page<Matching> result;

        // 🔥 핵심 수정: 관리자 우선 처리
        if (isAdmin) {
            // 수정: 관리자 → 승인/미승인 전체 조회
            result = matchingRepository.findAll(pageable);

        } else if (owner != null) {
            // 차주 → 미승인 + 내가 거절하지 않은 것
            result = matchingRepository.findValidMatchingList(owner, now, pageable);

        } else if (isShipper) {
            // 화주 → 미승인 견적만
            result = matchingRepository.findPendingMatchingListForShipper(now, pageable);

        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "접근 권한이 없습니다.");
        }

        List<MatchingDTO> dtoList = result.getContent().stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());

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
        Estimate estimate = esmateRepository.findById(estimateNo)
                .orElseThrow(() -> new RuntimeException("해당 견적이 존재하지 않습니다"));

        List<Cargo> approvedCargos =
                cargoRepository.findByCargoOwner_CargoIdAndStatus(cargoOwner.getCargoId(), "APPROVED");

        if (approvedCargos.isEmpty()) {
            throw new RuntimeException("관리자 승인이 완료된 차량이 등록되어 있어야 견적을 수락할 수 있습니다.");
        }

        boolean hasRightVehicle = approvedCargos.stream()
                .anyMatch(cargo -> cargo.getCargoCapacity().equals(estimate.getCargoWeight()));

        if (!hasRightVehicle) {
            throw new RuntimeException(
                    "수락 불가: 해당 견적(" + estimate.getCargoWeight() + ")에 맞는 승인된 차량을 보유하고 있지 않습니다."
            );
        }

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