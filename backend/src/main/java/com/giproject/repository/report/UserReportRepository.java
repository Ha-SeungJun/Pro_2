package com.giproject.repository.report;

import com.giproject.entity.report.UserReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserReportRepository extends JpaRepository<UserReport, Long> {

    long countByAdminReadFalse();

    Page<UserReport> findByAdminRead(boolean adminRead, Pageable pageable);

    List<UserReport> findByAdminRead(boolean adminRead);

    Page<UserReport> findByReporterIdContainingIgnoreCaseOrTargetIdContainingIgnoreCaseOrContentContainingIgnoreCase(
            String reporterId, String targetId, String content, Pageable pageable
    );
}