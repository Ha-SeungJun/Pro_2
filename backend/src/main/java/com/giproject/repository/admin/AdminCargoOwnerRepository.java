package com.giproject.repository.admin;

import com.giproject.dto.admin.MonthlyDataDTO;
import com.giproject.entity.cargo.CargoOwner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface AdminCargoOwnerRepository extends JpaRepository<CargoOwner, String> {

    // 신규 CargoOwner 수
    @Query("SELECT COUNT(c) FROM CargoOwner c WHERE FUNCTION('YEAR', c.cargoCreatedDateTime) = FUNCTION('YEAR', :date) AND FUNCTION('MONTH', c.cargoCreatedDateTime) = FUNCTION('MONTH', :date)")
    long countNewCargoOwnersByDate(@Param("date") LocalDate date);

        // 월별 신규 CargoOwner 수
    @Query(value = "SELECT DATE_FORMAT(c.cargo_created_date_time, '%Y-%m') as month, COUNT(*) as count FROM cargo_owner c GROUP BY month ORDER BY month", nativeQuery = true)
     List<MonthlyDataDTO> findMonthlyNewCargoOwnerCounts();
}