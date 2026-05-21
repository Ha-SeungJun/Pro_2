package com.giproject.controller.cargo;

import java.io.IOException;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.giproject.dto.common.AddressUpdateRequest;
import com.giproject.dto.common.PasswordChangeRequest;
import com.giproject.entity.cargo.Cargo;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.repository.cargo.CargoOwnerRepository;
import com.giproject.repository.cargo.CargoRepository;
import com.giproject.security.AuthzUtil;
import com.giproject.service.member.CloudinaryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/g2i4/cargo")
@RequiredArgsConstructor
public class CargoOwnerMutationController {

    private final CargoOwnerRepository cargoOwnerRepository;
    private final PasswordEncoder passwordEncoder;
    private final CloudinaryService cloudinaryService;
    private final CargoRepository cargoRepository;
    
    @PostMapping("/{id}/cargo/{cargoNo}/image")
    public ResponseEntity<?> uploadCargoImage(@PathVariable("id") String id,
                                               @PathVariable("cargoNo") Integer cargoNo,
                                               @RequestParam("file") MultipartFile file,
                                               Authentication auth) throws IOException {
        AuthzUtil.assertOwnerOrAdmin(auth, id);

        String imageUrl = cloudinaryService.uploadImage(file, "cargo");

        Cargo cargo = cargoRepository.findById(cargoNo)
                .orElseThrow(() -> new IllegalArgumentException("차량 없음"));
        cargo.setCargoImage(imageUrl);
        cargoRepository.save(cargo);

        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }
    
    
    @PutMapping("/{id}/address")
    public ResponseEntity<?> updateAddress(@PathVariable("id") String id,
                                           @RequestBody AddressUpdateRequest req,
                                           Authentication auth) {
        AuthzUtil.assertOwnerOrAdmin(auth, id);

        CargoOwner c = cargoOwnerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("화물(차량) 소유자 없음"));
        c.setCargoAddress(req.getAddress());
        // c.setPostcode(req.getPostcode()); // 컬럼 있으면 같이
        cargoOwnerRepository.save(c);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<?> changePassword(@PathVariable("id") String id,
                                            @RequestBody PasswordChangeRequest req,
                                            Authentication auth) {
        AuthzUtil.assertOwnerOrAdmin(auth, id);

        if (req.getCurrentPassword() == null || req.getNewPassword() == null) {
            return ResponseEntity.badRequest().body("비밀번호를 모두 입력하세요.");
        }

        CargoOwner c = cargoOwnerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("화물(차량) 소유자 없음"));

        if (!passwordEncoder.matches(req.getCurrentPassword(), c.getCargoPw())) {
            return ResponseEntity.status(400).body("현재 비밀번호가 일치하지 않습니다.");
        }

        c.setCargoPw(passwordEncoder.encode(req.getNewPassword()));
        cargoOwnerRepository.save(c);
        return ResponseEntity.noContent().build();
    }
}