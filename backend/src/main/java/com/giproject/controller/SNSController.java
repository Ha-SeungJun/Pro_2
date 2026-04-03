// src/main/java/com/giproject/controller/SNSController.java
package com.giproject.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 🔒 Deprecated Controller
 * 기존 SNSController 참조로 인한 Bean 생성 오류 방지용.
 * 모든 엔드포인트는 "410 Gone" 응답만 반환한다.
 */
@RestController
@RequestMapping("/api/member")
public class SNSController {

    @GetMapping({"/kakao", "/naver"})
    public ResponseEntity<?> deprecated() {
        return ResponseEntity.status(HttpStatus.GONE)
            .body(new ApiError("SNS_CONTROLLER_REMOVED", "이 API는 더 이상 지원되지 않습니다."));
    }

    record ApiError(String code, String message) {}
}
