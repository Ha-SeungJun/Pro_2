package com.giproject.email;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/email")
public class EmailVerificationController {

    private final EmailVerificationService svc;

    public EmailVerificationController(EmailVerificationService svc) {
        this.svc = svc;
    }

    // 요청 DTO (컨트롤러 내부 record라 파일 분리 불필요)
    public record SendReq(@Email @NotBlank String email) {}
    public record VerifyReq(@Email @NotBlank String email, @NotBlank String code) {}

    /** 인증코드 전송 */
    @PostMapping("/send-code")
    public ResponseEntity<?> send(@Valid @RequestBody SendReq req) {
        svc.sendCode(req.email());
        return ResponseEntity.ok(Map.of("ok", true));
    }

    /** 인증코드 검증 */
    @PostMapping("/verify")
    public ResponseEntity<?> verify(@Valid @RequestBody VerifyReq req) {
        boolean ok = svc.verify(req.email(), req.code());
        return ok
                ? ResponseEntity.ok(Map.of("verified", true))
                : ResponseEntity.badRequest().body(
                    Map.of("verified", false, "message", "코드가 올바르지 않거나 만료되었습니다.")
                  );
    }
}
