package com.giproject.service.fees;

import com.giproject.dto.fees.FeesExtraDTO;
import com.giproject.entity.fees.FeesExtra;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface FeesExtraService {

    default FeesExtraDTO entityToDTO(FeesExtra entity) {
        if (entity == null) return null;
        return FeesExtraDTO.builder()
                .exno(entity.getExno())
                .extraChargeTitle(entity.getExtraChargeTitle())
                .extraCharge(entity.getExtraCharge())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    default FeesExtra dtoToEntity(FeesExtraDTO dto) {
        if (dto == null) return null;
        return FeesExtra.builder()
                .exno(dto.getExno())
                .extraChargeTitle(dto.getExtraChargeTitle())
                .extraCharge(dto.getExtraCharge())
                .updatedAt(dto.getUpdatedAt() == null ? LocalDateTime.now() : dto.getUpdatedAt())
                .build();
    }
    
    List<String> getRowNames();
    
    List<List<String>> getGrid();

    FeesExtraDTO saveCell(String title, BigDecimal price);

    void addRow(String title);
    void deleteRow(String title);

    List<FeesExtraDTO> findAllAsDto();
}
