package com.giproject.service.report;

import com.giproject.dto.report.UserReportDTO;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.delivery.Delivery;
import com.giproject.entity.estimate.Estimate;
import com.giproject.entity.matching.Matching;
import com.giproject.entity.member.Member;
import com.giproject.entity.order.OrderSheet;
import com.giproject.entity.payment.Payment;
import com.giproject.entity.report.UserReport;
import com.giproject.repository.delivery.DeliveryRepository;
import com.giproject.repository.matching.MatchingRepository;
import com.giproject.repository.report.UserReportRepository;
import com.giproject.repository.member.MemberRepository;
import com.giproject.repository.cargo.CargoOwnerRepository;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional(readOnly = true)
public class UserReportServiceImpl implements UserReportService {
	
    private final UserReportRepository repo;
    private final MatchingRepository matchingRepository;
    private final MemberRepository memberRepository;
    private final CargoOwnerRepository cargoOwnerRepository;

    @Override
    public long countUnread() {
        return repo.countByAdminReadFalse();
    }

    @Override
    public Page<UserReportDTO> list(Boolean unreadOnly, String keyword, String searchType, Pageable pageable) {
        
        if ("name".equalsIgnoreCase(searchType) && keyword != null && !keyword.isBlank()) {
            List<UserReport> allReports;
            if (Boolean.TRUE.equals(unreadOnly)) {
                allReports = repo.findByAdminRead(false);
            } else {
                allReports = repo.findAll();
            }

            List<UserReportDTO> dtos = allReports.stream()
                .map(this::entityToDto)
                .filter(dto -> dto.getTargetName() != null && dto.getTargetName().toLowerCase().contains(keyword.toLowerCase()))
                .collect(Collectors.toList());

            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), dtos.size());
            List<UserReportDTO> pageContent = dtos.subList(start, end);
            
            return new PageImpl<>(pageContent, pageable, dtos.size());

        } else {
            Page<UserReport> page;
            if (Boolean.TRUE.equals(unreadOnly)) {
                page = (keyword == null || keyword.isBlank())
                        ? repo.findByAdminRead(false, pageable)
                        : repo.findByReporterIdContainingIgnoreCaseOrTargetIdContainingIgnoreCaseOrContentContainingIgnoreCase(
                            keyword, keyword, keyword, pageable
                        );
            } else {
                if (keyword == null || keyword.isBlank()) {
                    page = repo.findAll(pageable);
                } else {
                    page = repo.findByReporterIdContainingIgnoreCaseOrTargetIdContainingIgnoreCaseOrContentContainingIgnoreCase(
                            keyword, keyword, keyword, pageable
                    );
                }
            }
            return page.map(this::entityToDto);
        }
    }

    @Override
    @Transactional
    public UserReportDTO markRead(Long id, boolean read) {
        UserReport r = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Report not found: " + id));
        r = UserReport.builder()
                .id(r.getId())
                .reporterId(r.getReporterId())
                .targetId(r.getTargetId())
                .content(r.getContent())
                .createdAt(r.getCreatedAt())
                .adminRead(read)
                .build();
        r = repo.save(r);
        return entityToDto(r);
    }

    @Override
    @Transactional
    public int markAllRead() {
        int updated = 0;
        for (UserReport r : repo.findAll()) {
            if (!r.isAdminRead()) {
                UserReport saved = UserReport.builder()
                        .id(r.getId())
                        .reporterId(r.getReporterId())
                        .targetId(r.getTargetId())
                        .content(r.getContent())
                        .createdAt(r.getCreatedAt())
                        .adminRead(true)
                        .build();
                repo.save(saved);
                updated++;
            }
        }
        return updated;
    }

    @Override
    @Transactional
    public UserReportDTO create(UserReportDTO dto) {
        UserReport entity = dtoToEntity(dto);
        if (entity.getCreatedAt() == null) {
            entity = UserReport.builder()
                    .id(entity.getId())
                    .reporterId(entity.getReporterId())
                    .targetId(entity.getTargetId())
                    .content(entity.getContent())
                    .createdAt(LocalDateTime.now())
                    .adminRead(false)
                    .build();
        }
        return entityToDto(repo.save(entity));
    }

	@Override
	public UserReportDTO reportUser(Long maNo) {
		Matching matching=matchingRepository.findById(maNo).orElseThrow(() -> new RuntimeException("매칭번호가 존재하지않습니다"));
		CargoOwner cargoOwner = matching.getCargoOwner();
		Estimate estimate = matching.getEstimate();
		Member member = estimate.getMember();
		String cargoId = cargoOwner.getCargoId();
		String memberId = member.getMemId();
		UserReportDTO dto = UserReportDTO.builder()
							.reporterId(memberId)
							.targetId(cargoId)
							.build();
		return dto;
	}

    @Override
    public UserReportDTO entityToDto(UserReport e) {
        if (e == null) return null;

        String targetName = findUserName(e.getTargetId());

        return UserReportDTO.builder()
                .id(e.getId())
                .reporterId(e.getReporterId())
                .targetId(e.getTargetId())
                .targetName(targetName)
                .content(e.getContent())
                .createdAt(e.getCreatedAt())
                .adminRead(e.isAdminRead())
                .build();
    }

    private String findUserName(String userId) {
        if (userId == null) return null;
        Optional<Member> memberOpt = memberRepository.findByMemId(userId);
        if (memberOpt.isPresent()) {
            return memberOpt.get().getMemName();
        }
        Optional<CargoOwner> cargoOwnerOpt = cargoOwnerRepository.findByCargoId(userId);
        if (cargoOwnerOpt.isPresent()) {
            return cargoOwnerOpt.get().getCargoName();
        }
        return null;
    }
}