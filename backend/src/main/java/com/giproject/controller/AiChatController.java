package com.giproject.controller;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AiChatController {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    @Data
    static class ChatRequest {
        private String question;
    }

    @PostMapping("/ask")
    public ResponseEntity<Map<String, String>> askGemini(@RequestBody ChatRequest request) {
        if (request == null || request.getQuestion() == null || request.getQuestion().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("answer", "질문을 입력해 주세요."));
        }

        RestTemplate restTemplate = new RestTemplate();
        String systemPrompt = 
        	    "### Role: 너는 화물운송 매칭 플랫폼 'G2I4'의 10년차 베테랑 상담원이야.\n" +
        	    "### Knowledge Base:\n" +
        	    "- G2I4는 화물주와 차주를 직접 연결하여 수수료를 0원에 가깝게 낮춘 플랫폼이다.\n" +
        	    "- AI 기반 최적 경로 추천 알고리즘으로 공차율을 30% 이상 감소시킨다.\n" +
        	    "- 실시간 화물 추적과 전자 인수증 기능을 제공한다.\n" +
        	    "### Instruction:\n" +
        	    "1. 사용자가 '안녕'이라고 하면 G2I4의 핵심 장점을 섞어서 인사해.\n" +
        	    "2. 모르는 전문 용어가 나오면 아는 척 하지 말고 '화물 운송 전문 용어는 고객센터로 문의 부탁드립니다'라고 해.\n" +
        	    "3. 모든 답변은 논리적이고 친절해야 하며, 반드시 3문장 이내로 끊어서 가독성을 높여.\n" +
        	    "### User Question: ";

        // 구글 API 요청 본문 생성
        Map<String, Object> body = Map.of(
            "contents", List.of(Map.of(
                "parts", List.of(Map.of("text", systemPrompt + request.getQuestion()))
            ))
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            // URL 조립: 주소 + ?key= + 키
            String fullUrl = apiUrl + "?key=" + apiKey;
            System.out.println(">>> 호출 주소: " + fullUrl);

            ResponseEntity<Map> response = restTemplate.postForEntity(fullUrl, entity, Map.class);
            
            // 응답 데이터 파싱
            Map resBody = response.getBody();
            List candidates = (List) resBody.get("candidates");
            Map firstCandidate = (Map) candidates.get(0);
            Map content = (Map) firstCandidate.get("content");
            List parts = (List) content.get("parts");
            String aiResponse = (String) ((Map) parts.get(0)).get("text");

            return ResponseEntity.ok(Map.of("answer", aiResponse));

        } catch (Exception e) {
            System.err.println("=== AI API 호출 실패 ===");
            e.printStackTrace(); 
            return ResponseEntity.status(500).body(Map.of("answer", "구글 서버 응답 오류입니다. 로그를 확인하세요."));
        }
    }
}