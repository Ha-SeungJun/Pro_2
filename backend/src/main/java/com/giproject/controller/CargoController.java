// src/main/java/com/giproject/controller/CargoController.java
package com.giproject.controller;

import com.giproject.dto.cargo.CargoDTO;
import com.giproject.entity.cargo.Cargo;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.repository.cargo.CargoOwnerRepository;
import com.giproject.repository.cargo.CargoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.util.*;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/g2i4/cargo")
@RequiredArgsConstructor
public class CargoController {

    private final CargoRepository cargoRepository;
    private final CargoOwnerRepository cargoOwnerRepository;

    // userinfo와 동일한 방식으로 '절대경로' 고정
    private static final Path UPLOAD_ROOT = Paths.get("../uploads").toAbsolutePath().normalize();
    private static final Path CARGO_DIR   = UPLOAD_ROOT.resolve("cargo");

    /**
     * 차량 목록 조회 (소유자 ID 기준)
     */
    @GetMapping("/list/{cargoId}")
    public ResponseEntity<List<Cargo>> getCargoList(@PathVariable("cargoId") String cargoId) {
        List<Cargo> list = cargoRepository.findByCargoOwner_CargoId(cargoId);
        return ResponseEntity.ok(list);
    }

    /**
     * 차량 등록
     */
    @PostMapping("/add/{cargoId}")
    public ResponseEntity<?> registerCargo(@PathVariable("cargoId") String cargoId, @RequestBody CargoDTO dto) {
        try {
            CargoOwner owner = cargoOwnerRepository.findById(cargoId)
                    .orElseThrow(() -> new RuntimeException("소유자 없음"));

            Cargo cargo = new Cargo();
            cargo.setCargoName(dto.getName());
            cargo.setCargoType(dto.getAddress());   // 네이밍 정리 전 호환 유지
            cargo.setCargoCapacity(dto.getWeight());
            cargo.setCargoOwner(owner);

            Cargo saved = cargoRepository.save(cargo);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(400).body("등록 실패: " + e.getMessage());
        }
    }

    /**
     * 차량 수정
     */
    @PutMapping("/update/{cargoNo}")
    public ResponseEntity<?> updateCargo(@PathVariable("cargoNo") Integer cargoNo, @RequestBody CargoDTO dto) {
        try {
            Cargo cargo = cargoRepository.findById(cargoNo)
                    .orElseThrow(() -> new IllegalArgumentException("차량 없음: " + cargoNo));

            cargo.setCargoName(dto.getName());
            cargo.setCargoType(dto.getAddress());
            cargo.setCargoCapacity(dto.getWeight());

            Cargo updated = cargoRepository.save(cargo);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("차량 수정 실패: " + e.getMessage());
        }
    }

    /**
     * 차량 삭제
     */
    @DeleteMapping("/delete/{cargoNo}")
    public ResponseEntity<?> deleteCargo(@PathVariable("cargoNo") Integer cargoNo) {
        try {
            // 물리 파일까지 지우고 싶으면 여기서 cargoImage 읽어서 파일 삭제 로직 추가 가능
            cargoRepository.deleteById(cargoNo);
            return ResponseEntity.ok("삭제 성공");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("삭제 실패: " + e.getMessage());
        }
    }

    /**
     * 이미지 업로드
     */
    @PostMapping("/upload/{cargoNo}")
    public ResponseEntity<?> uploadImage(
            @PathVariable("cargoNo") Integer cargoNo,
            @RequestParam("image") MultipartFile file) {
        try {
            Cargo cargo = cargoRepository.findById(cargoNo)
                    .orElseThrow(() -> new RuntimeException("차량 없음: " + cargoNo));

            if (file.isEmpty()) return ResponseEntity.badRequest().body("파일이 없습니다.");
            String ct = Optional.ofNullable(file.getContentType()).orElse("").toLowerCase();
            if (!ct.startsWith("image/")) {
                return ResponseEntity.badRequest().body("이미지 파일만 업로드 가능합니다.");
            }

            Files.createDirectories(CARGO_DIR);

            // 기존 이미지 삭제
            String prevWeb = cargo.getCargoImage(); // 예: /g2i4/uploads/cargo/xxx.jpg
            if (prevWeb != null && !prevWeb.isBlank()) {
                String prevName = prevWeb.replace('\\','/');
                int i = prevName.lastIndexOf('/');
                if (i != -1) {
                    prevName = prevName.substring(i + 1);
                    Files.deleteIfExists(CARGO_DIR.resolve(prevName));
                }
            }

            // 새 파일 저장
            String original = file.getOriginalFilename();
            String ext = (original != null && original.lastIndexOf('.') != -1)
                    ? original.substring(original.lastIndexOf('.')).toLowerCase()
                    : "";
            String savedFilename = UUID.randomUUID() + ext;

            Path savePath = CARGO_DIR.resolve(savedFilename).normalize();
            file.transferTo(savePath.toFile());

            // DB엔 정적매핑과 일치하는 "웹 경로" 저장
            String webPath = "/g2i4/uploads/cargo/" + savedFilename;
            cargo.setCargoImage(webPath);
            cargoRepository.save(cargo);

            // 프론트에서 곧바로 미리보기 가능하도록 webPath 반환
            Map<String, Object> res = new HashMap<>();
            res.put("webPath", webPath);
            res.put("filename", savedFilename);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("이미지 업로드 실패: " + e.getMessage());
        }
    }
}
