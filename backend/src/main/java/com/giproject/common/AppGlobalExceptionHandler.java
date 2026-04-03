package com.giproject.common;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestControllerAdvice
public class AppGlobalExceptionHandler {

  @Value("${spring.profiles.active:}")
  private String activeProfile;

  private boolean isDev() {
    return activeProfile.contains("dev") || activeProfile.contains("local");
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<?> handleBadRequest(IllegalArgumentException e) {
    log.warn("BadRequest: {}", e.getMessage(), e);
    return ResponseEntity.badRequest().body(Map.of("error","Bad Request","message",e.getMessage()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<?> handleValidation(MethodArgumentNotValidException e) {
    var msg = e.getBindingResult().getFieldErrors().stream()
        .map(fe -> fe.getField()+": "+fe.getDefaultMessage())
        .findFirst().orElse("Validation error");
    log.warn("Validation: {}", msg);
    return ResponseEntity.badRequest().body(Map.of("error","Bad Request","message",msg));
  }

  @ExceptionHandler(MailException.class)
  public ResponseEntity<?> handleMail(MailException e) {
    log.error("Mail error", e);
    String msg = isDev() ? e.getMessage() : "메일 전송 중 오류가 발생했습니다.";
    return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
        .body(Map.of("error","Mail Error","message",msg));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<?> handleEtc(Exception e) {
    log.error("Unexpected error", e);
    String msg = isDev() ? e.getMessage() : "서버 내부 오류가 발생했습니다.";
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(Map.of("error","Internal Server Error","message",msg));
  }
}
