package com.giproject.service.fees;

import com.giproject.dto.fees.FeesBasicDTO;
import com.giproject.entity.fees.FeesBasic;

import jakarta.transaction.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

@Transactional
public interface FeesBasicService {

    default FeesBasicDTO entityToDTO(FeesBasic entity) {
        if (entity == null) return null;
        return FeesBasicDTO.builder()
                .tno(entity.getTno())
                .weight(entity.getWeight())
                .ratePerKm(entity.getRatePerKm())
                .initialCharge(entity.getInitialCharge())
                .updatedAt(entity.getUpdatedAt())
                .cargoImage(entity.getCargoImage())
                .build();
    }

    default FeesBasic dtoToEntity(FeesBasicDTO dto) {
        if (dto == null) return null;
        return FeesBasic.builder()
                .tno(dto.getTno())
                .weight(dto.getWeight())
                .ratePerKm(dto.getRatePerKm())
                .initialCharge(dto.getInitialCharge())
                .updatedAt(dto.getUpdatedAt() == null ? LocalDateTime.now() : dto.getUpdatedAt())
                .cargoImage(dto.getCargoImage())
                .build();
    }
    
	List<String> getRowNames();
		
	List<List<String>> getGrid();
	
	FeesBasicDTO saveCell(String weight, String column, BigDecimal price);
	
	void addRow(String weight);
	void deleteRow(String weight);//행 추가삭제
	
	List<FeesBasicDTO> findAllAsDto();
	
	Map<String,String> uploadImg(Long tno,MultipartFile file);
}