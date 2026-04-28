package com.giproject.controller;

import com.giproject.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/ask")
    public Map<String, String> askQuestion(@RequestBody Map<String, String> request) {
        // 1. 리액트가 보낸 질문 꺼내기
        String question = request.get("question");

        // 2. 심부름꾼(Service) 시켜서 답변 받아오기
        String answer = aiService.askGemini(question);

        // 3. 리액트가 읽기 편하게 JSON(Map)으로 포장해서 돌려주기
        Map<String, String> response = new HashMap<>();
        response.put("answer", answer);
        
        return response;
    }
}