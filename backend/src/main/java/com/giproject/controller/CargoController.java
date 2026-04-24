package com.giproject.controller;

import com.giproject.dto.cargo.CargoDTO;
import com.giproject.entity.cargo.Cargo;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.repository.cargo.CargoOwnerRepository;
import com.giproject.repository.cargo.CargoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.util.*;

@Slf4j
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/g2i4/cargo")
@RequiredArgsConstructor
public class CargoController {

    private final CargoRepository cargoRepository;
    private final CargoOwnerRepository cargoOwnerRepository;

    // 절대경로 설정
    private static final Path UPLOAD_ROOT = Paths.get("../uploads").toAbsolutePath().normalize();
    private static final Path CARGO_DIR   = UPLOAD_ROOT.resolve("cargo");

    /**
     * 차량 목록 조회
     */
    @GetMapping("/list/{cargoId}")
    public ResponseEntity<List<Cargo>> getCargoList(@PathVariable("cargoId") String cargoId) {
        List<Cargo> list = cargoRepository.findByCargoOwner_CargoId(cargoId);
        return ResponseEntity.ok(list);
    }

    /**
     * 차량 등록 (통합 버전)
     * 🚨 중요: 프론트엔드에서 'dto'와 'image'라는 키로 FormData를 보내야 합니다.
     */
    @PostMapping("/add/{cargoId}")
    @Transactional
    public ResponseEntity<?> registerCargo(
            @PathVariable("cargoId") String cargoId, 
            @RequestPart("dto") CargoDTO dto,              
            @RequestPart("image") MultipartFile file       
    ) {
        try {
            // 1. 필수 입력 검증 (전산직 무결성 원칙)
            if (file == null || file.isEmpty()) return ResponseEntity.badRequest().body("차량 사진 등록은 필수입니다.");
            if (dto.getName() == null || dto.getName().isBlank() ||
                dto.getAddress() == null || dto.getAddress().isBlank() ||
                dto.getWeight() == null || dto.getWeight().isBlank() ||
                dto.getCargoNumber() == null || dto.getCargoNumber().isBlank()) {
                return ResponseEntity.badRequest().body("모든 차량 정보를 입력해야 합니다.");
            }

            CargoOwner owner = cargoOwnerRepository.findById(cargoId)
                    .orElseThrow(() -> new RuntimeException("소유자 없음"));

            // 2. 이미지 파일 저장 처리
            Files.createDirectories(CARGO_DIR);
            String original = file.getOriginalFilename();
            String ext = (original != null && original.lastIndexOf('.') != -1)
                    ? original.substring(original.lastIndexOf('.')).toLowerCase() : "";
            String savedFilename = UUID.randomUUID() + ext;
            Path savePath = CARGO_DIR.resolve(savedFilename).normalize();
            file.transferTo(savePath.toFile());
            String webPath = "/g2i4/uploads/cargo/" + savedFilename;

            // 3. 엔티티 생성 및 필드 셋팅
            Cargo cargo = new Cargo();
            cargo.setCargoName(dto.getName());
            cargo.setCargoType(dto.getAddress());   
            cargo.setCargoCapacity(dto.getWeight());
            cargo.setCargoNumber(dto.getCargoNumber()); 
            cargo.setCargoImage(webPath);           // 이미지 경로 강제 주입
            cargo.setStatus("PENDING");             // 무조건 승인대기 상태
            cargo.setCargoOwner(owner);

            Cargo saved = cargoRepository.save(cargo);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            log.error("등록 에러: ", e);
            return ResponseEntity.status(400).body("등록 실패: " + e.getMessage());
        }
    }

    /**
     * 차량 수정
     */
    @PutMapping("/update/{cargoNo}")
    @Transactional
    public ResponseEntity<?> updateCargo(@PathVariable("cargoNo") Integer cargoNo, @RequestBody CargoDTO dto) {
        try {
            Cargo cargo = cargoRepository.findById(cargoNo)
                    .orElseThrow(() -> new IllegalArgumentException("차량 없음: " + cargoNo));

            cargo.setCargoName(dto.getName());
            cargo.setCargoType(dto.getAddress());
            cargo.setCargoCapacity(dto.getWeight());
            cargo.setCargoNumber(dto.getCargoNumber());
            
            // 정보 수정 시 다시 검증받도록 대기중으로 변경
            cargo.setStatus("PENDING"); 

            Cargo updated = cargoRepository.save(cargo);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("수정 실패: " + e.getMessage());
        }
    }

    /**
     * 차량 삭제
     */
    @DeleteMapping("/delete/{cargoNo}")
    public ResponseEntity<?> deleteCargo(@PathVariable("cargoNo") Integer cargoNo) {
        try {
            cargoRepository.deleteById(cargoNo);
            return ResponseEntity.ok("삭제 성공");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("삭제 실패: " + e.getMessage());
        }
    }

    /**
     * 이미지 단독 업로드 및 교체 (기존 호환성 및 개별 수정을 위해 유지)
     */
    @PostMapping("/upload/{cargoNo}")
    public ResponseEntity<?> uploadImage(
            @PathVariable("cargoNo") Integer cargoNo,
            @RequestParam("image") MultipartFile file) {
        try {
            Cargo cargo = cargoRepository.findById(cargoNo)
                    .orElseThrow(() -> new RuntimeException("차량 없음: " + cargoNo));

            if (file.isEmpty()) return ResponseEntity.badRequest().body("파일이 없습니다.");
            
            Files.createDirectories(CARGO_DIR);

            // 기존 파일 삭제
            if (cargo.getCargoImage() != null && !cargo.getCargoImage().isBlank()) {
                String prevName = cargo.getCargoImage().substring(cargo.getCargoImage().lastIndexOf("/") + 1);
                Files.deleteIfExists(CARGO_DIR.resolve(prevName));
            }

            String original = file.getOriginalFilename();
            String ext = (original != null && original.lastIndexOf('.') != -1)
                    ? original.substring(original.lastIndexOf('.')).toLowerCase() : "";
            String savedFilename = UUID.randomUUID() + ext;
            Path savePath = CARGO_DIR.resolve(savedFilename).normalize();
            file.transferTo(savePath.toFile());

            String webPath = "/g2i4/uploads/cargo/" + savedFilename;
            cargo.setCargoImage(webPath);
            cargoRepository.save(cargo);

            Map<String, Object> res = new HashMap<>();
            res.put("webPath", webPath);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("업로드 실패: " + e.getMessage());
        }
    }
}