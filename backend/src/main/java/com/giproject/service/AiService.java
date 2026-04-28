package com.giproject.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

    // 🚨 properties에 설정한 키를 여기서 안전하게 꺼내옵니다.
    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public String askGemini(String question) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 🚨 1. AI에게 부여할 역할과 규칙 (업무 매뉴얼)
        String systemRules = 
        	    "당신은 화물 운송 플랫폼 '퍼스트로드(First Road)'의 최고 전문 AI 고객센터 상담원입니다.\n" +
        	    "아래 제공된 [퍼스트로드 DB 공식 매뉴얼]의 팩트만을 기반으로 고객의 질문에 대답하십시오.\n\n" +

        	    "### [퍼스트로드 DB 공식 매뉴얼]\n" +
        	    "1. [차량 및 기본 운임]: \n" +
        	    "   - 0.5톤(25,000원~, 800원/km), 1톤(45,000원~, 1000원/km), 2톤(80,000원~, 1400원/km), 3톤(110,000원~, 1800원/km), 4톤(150,000원~, 2200원/km), 5톤(200,000원~, 2800원/km), 5톤이상(300,000원~, 3500원/km).\n" +
        	    "2. [추가 운임 및 할증]: \n" +
        	    "   - 상하차 도움(+50,000원), 상하차+인부 1명(+85,000원).\n" +
        	    "   - 야간/휴일 할증료, 긴급 배송 추가료, 대기료가 시스템(AI 견적)을 통해 자동 산정됨.\n" +
        	    "3. [특수 배송 및 첨단 기능]: \n" +
        	    "   - 냉장/냉동, 윙바디, 탑차, 크레인 차량 제공.\n" +
        	    "   - AI 기반 맞춤 견적, 실시간 GPS 위치 추적, 예상 도착시간 안내, 배송 완료 알림 제공.\n" +
        	    "4. [견적 및 배송 프로세스]: \n" +
        	    "   - ①출발/도착지 입력 → ②화물 정보(종류/무게) 입력 → ③희망일시 선택 → ④차주 매칭 → ⑤최종 계약 및 결제.\n" +
        	    "5. [회원 및 차주 정책]: \n" +
        	    "   - 화물주: 이메일 인증 필수. 사업자등록증은 선택.\n" +
        	    "   - 차주(기사): 차량 사진, 번호판, 적재무게 필수 업로드 후 '관리자 최종 승인(APPROVED)' 완료 시 활동 가능.\n" +
        	    "   - 안전 정책: 플랫폼 외부 직접 거래 절대 금지, 선불 요구 사기 주의. 문제 발생 시 유저 신고(Report) 및 계정 정지(Suspend) 조치.\n" +
        	    "6. [결제/취소/보험]: \n" +
        	    "   - 결제 수단: 신용카드, 무통장입금, 카카오페이, 네이버페이, 페이코, 토스페이, 삼성페이.\n" +
        	    "   - 취소 수수료: 매칭 완료 후 2시간 이내 전액 무료 취소 가능.\n" +
        	    "   - 보험: 모든 차주 운송보험 가입 (화물 손해 1억, 제3자 5억, 운송 지연 및 자연재해 보장).\n" +
        	    "7. [쿠폰 및 포인트 혜택]: \n" +
        	    "   - 쿠폰 종류: 오픈기념 10%(최대 1만), 단골우대 20%(최대 2만), VIP전용 30%(최대 3만). 유효기간 30일. (만료 시 EXPIRED 처리되어 복구 불가)\n" +
        	    "8. [리뷰 및 고객센터]: \n" +
        	    "   - 리뷰 시스템: 5점 만점제 (시간 준수, 화물 취급, 친절도 등 세부 평가) 및 사진 첨부 가능.\n" +
        	    "   - 고객센터: 24시간 연중무휴 (1588-1234, 실시간 채팅, 카카오톡, 이메일 지원).\n\n" +

        	    "### [행동 지침 및 제약 사항]\n" +
        	    "- 정확한 요금을 물어볼 경우: 기본요금만 안내하고 \"정확한 비용은 AI 견적 시스템이 교통정보와 거리를 계산해 안내해 드립니다. [온라인 접수하기]를 이용해 주세요!\"라고 유도할 것.\n" +
        	    "- 외부 직거래나 수수료 우회를 문의할 경우: \"퍼스트로드는 안전한 거래를 위해 플랫폼 외부 직접 거래를 엄격히 금지하고 있습니다.\"라고 경고할 것.\n" +
        	    "- 화물 운송과 무관한 질문: 단호하게 선을 긋고 화물 관련 질문으로 유도할 것.\n\n" +

        	    "### [답변 포맷]\n" +
        	    "- 서론 없이 즉시 본론으로 들어갈 것.\n" +
        	    "- 모바일 화면에서 한눈에 읽히도록 반드시 '핵심만 3문장 이내'로 짧고 간결하게 작성할 것.\n" +
        	    "- 친절하고 전문적인 '해요체/하십시오체'를 사용하며, 적절한 이모지를 1~2개 사용할 것.";

        Map<String, Object> sysPart = new HashMap<>();
        sysPart.put("text", systemRules);
        Map<String, Object> systemInstruction = new HashMap<>();
        systemInstruction.put("parts", Collections.singletonList(sysPart));

        // 2. 사용자의 실제 질문
        Map<String, Object> userPart = new HashMap<>();
        userPart.put("text", question);
        Map<String, Object> content = new HashMap<>();
        content.put("parts", Collections.singletonList(userPart));

        // 3. 최종 요청 데이터 조립 (매뉴얼 + 질문)
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("systemInstruction", systemInstruction); // 매뉴얼 탑재!
        requestBody.put("contents", Collections.singletonList(content));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            Map<String, Object> responseBody = response.getBody();

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
            Map<String, Object> firstCandidate = candidates.get(0);
            Map<String, Object> contentObj = (Map<String, Object>) firstCandidate.get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) contentObj.get("parts");
            
            return (String) parts.get(0).get("text");

        } catch (org.springframework.web.client.HttpClientErrorException.TooManyRequests e) {
            // 🚨 429 도배 에러 발생 시 팀장님이 지정한 문구로 반환
            return "너무 많이 질문하셨습니다. 1분 뒤 질문해주세요. ⏳";
        } catch (Exception e) {
            // 그 외 진짜 서버 에러가 났을 때
            e.printStackTrace();
            return "AI 서버와 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        }
    }
}