package com.giproject.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CorsTestController {

    // CORS 테스트용 API
    @GetMapping("/api/test")
    public String corsTest() {
        return "🎉 CORS 요청 성공!";
    }
}