package com.giproject.repository.admin;

import com.giproject.dto.admin.MonthlyDataDTO;
import com.giproject.entity.member.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface AdminMemberRepository extends JpaRepository<Member, String> {
    
    // 신규 Member 수
    @Query("SELECT COUNT(m) FROM Member m WHERE FUNCTION('YEAR', m.memCreateIdDateTime) = FUNCTION('YEAR', :date) AND FUNCTION('MONTH', m.memCreateIdDateTime) = FUNCTION('MONTH', :date)")
    long countNewMembersByDate(@Param("date") LocalDate date);

    // 월별 Member 수
    @Query(value = "SELECT DATE_FORMAT(m.mem_create_id_datetime, '%Y-%m') as month, COUNT(*) as count FROM member m GROUP BY month ORDER BY month", nativeQuery = true)
     List<MonthlyDataDTO> findMonthlyNewMemberCounts();
}