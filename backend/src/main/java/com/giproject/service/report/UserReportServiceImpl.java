package com.giproject.service.report;

import com.giproject.dto.report.UserReportDTO;
import com.giproject.entity.delivery.Delivery;
import com.giproject.entity.report.UserReport;
import com.giproject.repository.delivery.DeliveryRepository;
import com.giproject.repository.report.UserReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserReportServiceImpl implements UserReportService {

    private final UserReportRepository userReportRepository;
    private final DeliveryRepository deliveryRepository;

    @Override
    @Transactional(readOnly = true)
    public long countUnread() {
        return userReportRepository.countByAdminReadFalse();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserReportDTO> list(Boolean unreadOnly, String keyword, String searchType, Pageable pageable) {
        Page<UserReport> result;

        if (Boolean.TRUE.equals(unreadOnly)) {
            result = userReportRepository.findByAdminRead(false, pageable);
        } else if (keyword != null && !keyword.isBlank()) {
            result = userReportRepository
                    .findByReporterIdContainingIgnoreCaseOrTargetIdContainingIgnoreCaseOrContentContainingIgnoreCase(
                            keyword, keyword, keyword, pageable
                    );
        } else {
            result = userReportRepository.findAll(pageable);
        }

        return result.map(this::entityToDto);
    }

    @Override
    public UserReportDTO markRead(Long id, boolean read) {
        UserReport report = userReportRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("신고 내역이 존재하지 않습니다."));

        report.setAdminRead(read);
        return entityToDto(report);
    }

    @Override
    public int markAllRead() {
        var unreadList = userReportRepository.findByAdminRead(false);
        unreadList.forEach(r -> r.setAdminRead(true));
        return unreadList.size();
    }

    @Override
    public UserReportDTO create(UserReportDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("신고 데이터가 없습니다.");
        }
        if (dto.getReporterId() == null || dto.getReporterId().isBlank()) {
            throw new IllegalArgumentException("신고자 정보가 없습니다.");
        }
        if (dto.getTargetId() == null || dto.getTargetId().isBlank()) {
            throw new IllegalArgumentException("신고 대상 정보가 없습니다.");
        }
        if (dto.getContent() == null || dto.getContent().isBlank()) {
            throw new IllegalArgumentException("신고 내용을 입력해주세요.");
        }

        // 수정: 같은 신고자-대상자 조합은 1회만 허용
        if (userReportRepository.existsByReporterIdAndTargetId(dto.getReporterId(), dto.getTargetId())) {
            throw new IllegalArgumentException("이미 신고한 사용자입니다.");
        }

        UserReport report = dtoToEntity(
                UserReportDTO.builder()
                        .reporterId(dto.getReporterId())
                        .targetId(dto.getTargetId())
                        .content(dto.getContent())
                        .adminRead(false)
                        .updated(false)
                        .build()
        );

        UserReport saved = userReportRepository.save(report);

        UserReportDTO result = entityToDto(saved);
        result.setUpdated(false); // 신규 생성만 허용하므로 항상 false
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public UserReportDTO reportUser(Long no) {
        // 수정: no를 deliveryNo로 먼저 시도하고, 없으면 matchingNo로 간주해서 delivery 찾기
        Delivery delivery = deliveryRepository.findById(no).orElse(null);

        if (delivery == null) {
            Long deliveryNo = deliveryRepository.findDeliveryNoByMatching(no)
                    .orElseThrow(() -> new IllegalArgumentException("배송 정보가 존재하지 않습니다."));
            delivery = deliveryRepository.findById(deliveryNo)
                    .orElseThrow(() -> new IllegalArgumentException("배송 정보가 존재하지 않습니다."));
        }

        if (delivery.getPayment() == null
                || delivery.getPayment().getOrderSheet() == null
                || delivery.getPayment().getOrderSheet().getMatching() == null
                || delivery.getPayment().getOrderSheet().getMatching().getEstimate() == null
                || delivery.getPayment().getOrderSheet().getMatching().getEstimate().getMember() == null
                || delivery.getPayment().getOrderSheet().getMatching().getCargoOwner() == null) {
            throw new IllegalArgumentException("신고 대상 정보를 찾을 수 없습니다.");
        }

        String reporterId = delivery.getPayment()
                .getOrderSheet()
                .getMatching()
                .getEstimate()
                .getMember()
                .getMemId();

        String targetId = delivery.getPayment()
                .getOrderSheet()
                .getMatching()
                .getCargoOwner()
                .getCargoId();

        String targetName = delivery.getPayment()
                .getOrderSheet()
                .getMatching()
                .getCargoOwner()
                .getCargoName();

        return UserReportDTO.builder()
                .reporterId(reporterId)
                .targetId(targetId)
                .targetName(targetName)
                .updated(false)
                .build();
    }
}