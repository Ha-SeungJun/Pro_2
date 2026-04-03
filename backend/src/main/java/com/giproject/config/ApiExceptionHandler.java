package com.giproject.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestControllerAdvice
@Slf4j
public class ApiExceptionHandler {

    /** 스프링 시큐리티 인증 계열 예외는 전부 401 */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, String>> handleAuth(AuthenticationException ex) {
        return ResponseEntity.status(401).body(Map.of("message", "아이디 또는 비밀번호가 올바르지 않습니다."));
    }

    /** 요청 바인딩/검증 실패는 400 */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleBind(MethodArgumentNotValidException ex) {
        var msg = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .findFirst().orElse("요청 값이 올바르지 않습니다.");
        return ResponseEntity.badRequest().body(Map.of("message", msg));
    }

    /** 기타는 500 + 로그 */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleEtc(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.internalServerError().body(Map.of("message", "서버 내부 오류가 발생했습니다."));
    }
}