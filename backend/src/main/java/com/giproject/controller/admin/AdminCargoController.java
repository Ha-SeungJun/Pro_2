package com.giproject.controller.admin;

import java.util.*;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.giproject.entity.cargo.Cargo;
import com.giproject.repository.cargo.CargoRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/g2i4/admin/cargo")
@RequiredArgsConstructor
public class AdminCargoController {

    private final CargoRepository cargoRepository;

    // 1. 대기 중(PENDING)인 차량 목록 조회
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingCargos() {
        List<Cargo> pendingList = cargoRepository.findByStatus("PENDING");
        List<Map<String, Object>> response = new ArrayList<>();
        
        for (Cargo c : pendingList) {
            Map<String, Object> map = new HashMap<>();
            map.put("cargoNo", c.getCargoNo());
            map.put("cargoName", c.getCargoName());
            map.put("cargoCapacity", c.getCargoCapacity());
            map.put("cargoImage", c.getCargoImage());
            map.put("cargoNumber", c.getCargoNumber());
            map.put("ownerId", c.getCargoOwner() != null ? c.getCargoOwner().getCargoId() : "알 수 없음");
            response.add(map);
        }
        return ResponseEntity.ok(response);
    }

 
    @PutMapping("/approve/{cargoNo}")
    public ResponseEntity<?> approveCargo(@PathVariable("cargoNo") Integer cargoNo) {
        Cargo cargo = cargoRepository.findById(cargoNo)
                .orElseThrow(() -> new RuntimeException("해당 차량을 찾을 수 없습니다."));
        
        cargo.approve(); 
        cargoRepository.save(cargo); // DB에 확실하게 저장
        return ResponseEntity.ok(Collections.singletonMap("message", "승인 완료"));
    }

    @PutMapping("/reject/{cargoNo}")
    public ResponseEntity<?> rejectCargo(@PathVariable("cargoNo") Integer cargoNo) {
        Cargo cargo = cargoRepository.findById(cargoNo)
                .orElseThrow(() -> new RuntimeException("해당 차량을 찾을 수 없습니다."));
        
        cargo.reject(); 
        cargoRepository.save(cargo);
        return ResponseEntity.ok(Collections.singletonMap("message", "거절 완료"));
    }
}