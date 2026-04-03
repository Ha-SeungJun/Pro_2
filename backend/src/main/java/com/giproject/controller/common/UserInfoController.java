package com.giproject.controller.common;

import java.io.IOException;
import java.nio.file.*;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.member.Member;
import com.giproject.repository.cargo.CargoOwnerRepository;
import com.giproject.repository.member.MemberRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/g2i4/user")
@RequiredArgsConstructor
public class UserInfoController {

    private final MemberRepository memberRepository;
    private final CargoOwnerRepository cargoOwnerRepository;

    private static Path resolveUploadRoot() {
        Path rootA = Paths.get("../uploads").toAbsolutePath().normalize();
        Path rootB = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            if (Files.isDirectory(rootA) || (!Files.exists(rootA) && Files.createDirectories(rootA) != null)) {
                return rootA;
            }
        } catch (IOException ignore) {}
        try {
            if (Files.isDirectory(rootB) || (!Files.exists(rootB) && Files.createDirectories(rootB) != null)) {
                return rootB;
            }
        } catch (IOException ignore) {}
        // 둘 다 못 만들었을 때: 실행 디렉터리 하위 uploads 시도
        return Paths.get("uploads").toAbsolutePath().normalize();
    }
    // ✅ 상대경로 입력이더라도 런타임에서 절대경로로 고정
    private static final Path UPLOAD_ROOT = resolveUploadRoot();
    private static final Path USER_PROFILE_DIR = UPLOAD_ROOT.resolve("user_profile");
    
    @GetMapping("/info")
    public ResponseEntity<?> getUserInfo(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "UNAUTHORIZED"));
        }
        final String userId = auth.getName();

        Member m = memberRepository.findById(userId).orElse(null);
        if (m != null) {
            String fileName = m.getProfileImage();
            String webPath  = (fileName == null || fileName.isBlank()) ? null
                    : "/g2i4/uploads/user_profile/" + fileName;

            Map<String,Object> data = new LinkedHashMap<>();
            data.put("mem_id", m.getMemId());
            data.put("mem_name", m.getMemName());
            data.put("mem_email", m.getMemEmail());
            data.put("mem_phone", m.getMemPhone());
            data.put("mem_address", m.getMemAddress());
            data.put("mem_create_id_date_time", m.getMemCreateIdDateTime());
            data.put("profileImage", fileName);
            data.put("webPath", webPath);

            Map<String,Object> body = new LinkedHashMap<>();
            body.put("userType", "MEMBER");
            body.put("data", data);
            return ResponseEntity.ok(body);
        }

        CargoOwner c = cargoOwnerRepository.findById(userId).orElse(null);
        if (c != null) {
            String fileName = c.getProfileImage();
            String webPath  = (fileName == null || fileName.isBlank()) ? null
                    : "/g2i4/uploads/user_profile/" + fileName;

            Map<String,Object> data = new LinkedHashMap<>();
            data.put("cargo_id", c.getCargoId());
            data.put("cargo_name", c.getCargoName());
            data.put("cargo_email", c.getCargoEmail());
            data.put("cargo_phone", c.getCargoPhone());
            data.put("cargo_address", c.getCargoAddress());
            data.put("cargo_created_datetime", c.getCargoCreatedDateTime());
            data.put("profileImage", fileName);
            data.put("webPath", webPath);

            Map<String,Object> body = new LinkedHashMap<>();
            body.put("userType", "CARGO_OWNER");
            body.put("data", data);
            return ResponseEntity.ok(body);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "NOT_FOUND"));
    }


    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadProfileImage(
            @RequestParam("image") MultipartFile file,
            @RequestParam("userType") String userType,
            @RequestParam("id") String id) {

        if (file.isEmpty()) return ResponseEntity.badRequest().body("파일이 없습니다.");

        try {
            Files.createDirectories(USER_PROFILE_DIR);

            String original = file.getOriginalFilename();
            String ext = (original != null && original.lastIndexOf('.') != -1)
                    ? original.substring(original.lastIndexOf('.')).toLowerCase()
                    : "";
            String savedFilename = UUID.randomUUID() + ext;

            Path savePath = USER_PROFILE_DIR.resolve(savedFilename).normalize();
            file.transferTo(savePath.toFile());

            // DB 반영: DB에는 '파일명만' 저장
            if ("MEMBER".equalsIgnoreCase(userType)) {
                Member m = memberRepository.findById(id).orElseThrow();
                m.setProfileImage(savedFilename);
                memberRepository.save(m);
            } else if ("CARGO_OWNER".equalsIgnoreCase(userType)) {
                CargoOwner c = cargoOwnerRepository.findById(id).orElseThrow();
                c.setProfileImage(savedFilename);
                cargoOwnerRepository.save(c);
            } else {
                return ResponseEntity.badRequest().body("userType이 잘못되었습니다.");
            }

            // 프론트 미리보기용 웹경로 (정적 매핑과 일치)
            String webPath = "/g2i4/uploads/user_profile/" + savedFilename;
            return ResponseEntity.ok(Map.of("filename", savedFilename, "webPath", webPath));

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("업로드 실패: " + e.getMessage());
        }
    }

    @DeleteMapping("/profile-image")
    public ResponseEntity<?> deleteProfileImage(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error","UNAUTHORIZED"));
        }

        final String userId = auth.getName();
        String filename = null;

        Member m = memberRepository.findById(userId).orElse(null);
        if (m != null) {
            filename = m.getProfileImage();
            m.setProfileImage(null);
            memberRepository.save(m);
        } else {
            CargoOwner c = cargoOwnerRepository.findById(userId).orElse(null);
            if (c != null) {
                filename = c.getProfileImage();
                c.setProfileImage(null);
                cargoOwnerRepository.save(c);
            }
        }

        if (filename != null && !filename.isBlank()) {
            try {
                Files.deleteIfExists(USER_PROFILE_DIR.resolve(filename));
            } catch (Exception ignore) {}
        }

        return ResponseEntity.ok(Map.of("removed", true));
    }
}
