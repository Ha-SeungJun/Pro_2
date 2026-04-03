package com.giproject.common.error;

import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.log4j.Log4j2;

/**
 * 글로벌 예외 처리 핸들러
 * 
 * QABoard 관련 모든 예외를 일관된 형태로 처리
 * - 비즈니스 로직 예외
 * - 유효성 검증 예외
 * - 권한 관련 예외
 */
@RestControllerAdvice
@Log4j2
public class GlobalExceptionHandler {
	@ExceptionHandler(AuthenticationException.class)
	public ResponseEntity<Map<String, Object>> handleAuth(AuthenticationException e) {
	    Map<String, Object> body = new HashMap<>();
	    body.put("status", HttpStatus.UNAUTHORIZED.value());
	    body.put("error", "Unauthorized");
	    body.put("message", e.getMessage());
	    body.put("timestamp", System.currentTimeMillis());
	    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
	}

	// 401: JWT 만료/위조/오류
	@ExceptionHandler({ExpiredJwtException.class, MalformedJwtException.class, SignatureException.class})
	public ResponseEntity<Map<String, Object>> handleJwt(Exception e) {
	    Map<String, Object> body = new HashMap<>();
	    body.put("status", HttpStatus.UNAUTHORIZED.value());
	    body.put("error", "Unauthorized");
	    body.put("message", e.getMessage());
	    body.put("timestamp", System.currentTimeMillis());
	    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
	}

	// 403: 권한 없음 (Spring Security의 표준 예외)
	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException e) {
	    Map<String, Object> body = new HashMap<>();
	    body.put("status", HttpStatus.FORBIDDEN.value());
	    body.put("error", "Forbidden");
	    body.put("message", e.getMessage());
	    body.put("timestamp", System.currentTimeMillis());
	    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
	}

	// 404: 리소스 없음 (repo.findById(...).orElseThrow() 등)
	@ExceptionHandler(NoSuchElementException.class)
	public ResponseEntity<Map<String, Object>> handleNoSuchElement(NoSuchElementException e) {
	    Map<String, Object> body = new HashMap<>();
	    body.put("status", HttpStatus.NOT_FOUND.value());
	    body.put("error", "Not Found");
	    body.put("message", e.getMessage());
	    body.put("timestamp", System.currentTimeMillis());
	    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
	}

	// 컨트롤러/서비스에서 ResponseStatusException 던진 경우 상태코드 그대로 전달
	@ExceptionHandler(ResponseStatusException.class)
	public ResponseEntity<Map<String, Object>> handleRSE(ResponseStatusException e) {
	    Map<String, Object> body = new HashMap<>();
	    body.put("status", e.getStatusCode().value());
	    body.put("error", e.getStatusCode().toString()); 
	    body.put("message", e.getReason());
	    body.put("timestamp", System.currentTimeMillis());
	    return ResponseEntity.status(e.getStatusCode()).body(body);
	}

    /**
     * 잘못된 요청 인수 예외 처리
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException e) {
        log.warn("IllegalArgumentException: {}", e.getMessage());
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
        errorResponse.put("error", "Bad Request");
        errorResponse.put("message", e.getMessage());
        errorResponse.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * 권한 관련 예외 처리
     */
    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<Map<String, Object>> handleSecurityException(SecurityException e) {
        log.warn("SecurityException: {}", e.getMessage());
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("status", HttpStatus.FORBIDDEN.value());
        errorResponse.put("error", "Forbidden");
        errorResponse.put("message", e.getMessage());
        errorResponse.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
    }

    /**
     * 상태 관련 예외 처리
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalStateException(IllegalStateException e) {
        log.warn("IllegalStateException: {}", e.getMessage());
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("status", HttpStatus.CONFLICT.value());
        errorResponse.put("error", "Conflict");
        errorResponse.put("message", e.getMessage());
        errorResponse.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }

    /**
     * Bean Validation 예외 처리
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(MethodArgumentNotValidException e) {
        log.error("Validation error occurred: {}", e.getMessage());
        
        Map<String, Object> errorResponse = new HashMap<>();
        Map<String, String> fieldErrors = new HashMap<>();
        
        // 필드별 에러 메시지 수집 및 상세 로깅
        e.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            Object rejectedValue = ((FieldError) error).getRejectedValue();
            
            fieldErrors.put(fieldName, errorMessage);
            
            // 상세한 검증 실패 로깅
            log.error("Validation failed for field '{}': {} (rejected value: '{}')", 
                     fieldName, errorMessage, rejectedValue);
        });
        
        // 추가 컨텍스트 정보 로깅
        log.error("Total validation errors: {}", fieldErrors.size());
        log.error("Request object: {}", e.getBindingResult().getTarget());
        
        errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
        errorResponse.put("error", "Validation Failed");
        errorResponse.put("message", "입력값 검증에 실패했습니다. 입력 데이터를 확인해주세요.");
        errorResponse.put("fieldErrors", fieldErrors);
        errorResponse.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * 기타 모든 예외 처리
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception e) {
        log.error("Unexpected error occurred: {}", e.getMessage(), e);
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        errorResponse.put("error", "Internal Server Error");
        errorResponse.put("message", "서버 내부 오류가 발생했습니다.");
        errorResponse.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}