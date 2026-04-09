package com.giproject.service.report;

import com.giproject.dto.report.UserReportDTO;
import com.giproject.entity.report.UserReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface UserReportService {

    default UserReportDTO entityToDto(UserReport e){
        if (e == null) return null;
        return UserReportDTO.builder()
                .id(e.getId())
                .reporterId(e.getReporterId())
                .targetId(e.getTargetId())
                .content(e.getContent())
                .createdAt(e.getCreatedAt())
                .adminRead(e.isAdminRead())
                // 수정: 기본값 false, 실제 create()에서 상황에 맞게 다시 세팅
                .updated(false)
                .build();
    }

    default UserReport dtoToEntity(UserReportDTO d){
        if (d == null) return null;
        return UserReport.builder()
                .id(d.getId())
                .reporterId(d.getReporterId())
                .targetId(d.getTargetId())
                .content(d.getContent())
                .createdAt(d.getCreatedAt() != null ? d.getCreatedAt() : LocalDateTime.now())
                .adminRead(d.isAdminRead())
                .build();
    }

    long countUnread();

    Page<UserReportDTO> list(Boolean unreadOnly, String keyword, String searchType, Pageable pageable);

    UserReportDTO markRead(Long id, boolean read);

    int markAllRead();

    UserReportDTO create(UserReportDTO dto);

    UserReportDTO reportUser(Long deNo);
}