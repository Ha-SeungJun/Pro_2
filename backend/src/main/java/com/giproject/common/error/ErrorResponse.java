package com.giproject.common.error;

import java.time.LocalDateTime;
import java.util.List;

public class ErrorResponse {
    private LocalDateTime timestamp;
    private int status;
    private String error;     // "Bad Request"
    private String code;      // "VALIDATION_ERROR", "ACCESS_DENIED" 등
    private String message;   // 사용자에게 보여줄 메세지
    private String path;      // 요청 URL
    private List<String> errors; // 필드 에러 등 상세

    // 생성자
    public ErrorResponse(LocalDateTime timestamp, int status, String error, String code, String message, String path, List<String> errors) {
        this.timestamp = timestamp;
        this.status = status;
        this.error = error;
        this.code = code;
        this.message = message;
        this.path = path;
        this.errors = errors;
    }

    // 정적 팩토리 메서드
    public static ErrorResponse of(int status, String error, String code, String message, String path, List<String> errors) {
        return new ErrorResponse(LocalDateTime.now(), status, error, code, message, path, errors);
    }

    // Getter
    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public int getStatus() {
        return status;
    }

    public String getError() {
        return error;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public String getPath() {
        return path;
    }

    public List<String> getErrors() {
        return errors;
    }

    // toString (디버깅용)
    @Override
    public String toString() {
        return "ErrorResponse{" +
                "timestamp=" + timestamp +
                ", status=" + status +
                ", error='" + error + '\'' +
                ", code='" + code + '\'' +
                ", message='" + message + '\'' +
                ", path='" + path + '\'' +
                ", errors=" + errors +
                '}';
    }
}
