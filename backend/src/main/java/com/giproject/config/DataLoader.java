package com.giproject.config;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.giproject.entity.noboard.Notice;
import com.giproject.entity.qaboard.AuthorType;
import com.giproject.entity.qaboard.QACategory;
import com.giproject.entity.qaboard.QAPost;
import com.giproject.repository.noboard.NoticeRepository;
import com.giproject.repository.qaboard.QAPostRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final QAPostRepository qaPostRepository;
    private final NoticeRepository noticeRepository;
    private final Random random = new Random();

    @Override
    public void run(String... args) throws Exception {
        // MySQL 운영 DB에서도 테스트 데이터가 필요한 경우 활성화
        // QAPost 더미 데이터 생성 (기존 데이터가 없을 때만)
        if (qaPostRepository.count() == 0) {
            createQAPostDummyData();
        }
        
        // Notice 더미 데이터 생성 (기존 데이터가 없을 때만)
        if (noticeRepository.count() == 0) {
            createNoticeDummyData();
        }
    }

    /**
     * QAPost 더미 데이터 30개 생성 (각 카테고리별로 6개씩)
     */
    private void createQAPostDummyData() {
        if (qaPostRepository.count() > 0) {
            System.out.println("QAPost 더미 데이터가 이미 존재합니다.");
            return;
        }

        QACategory[] categories = QACategory.values();
        AuthorType[] authorTypes = {AuthorType.MEMBER, AuthorType.CARGO, AuthorType.ADMIN};
        
        String[] userIds = {"user001", "user002", "user003", "cargo001", "cargo002", "admin001"};
        String[] userNames = {"김민수", "박철수", "이영희", "최동욱", "강지연", "윤태현"};
        String[] emails = {"minsu@example.com", "chulsu@example.com", "younghee@example.com", 
                          "dongwook@example.com", "jiyeon@example.com", "taehyun@example.com"};

        // 각 카테고리별로 6개씩 생성
        int postIndex = 0;
        for (QACategory category : categories) {
            for (int i = 0; i < 6; i++) {
                AuthorType authorType = authorTypes[postIndex % authorTypes.length];
                int userIndex = postIndex % userIds.length;
                
                QAPost qaPost = QAPost.builder()
                    .title(getDetailedQATitle(category, i))
                    .content(getDetailedQAContent(category, i))
                    .category(category)
                    .isPrivate(postIndex % 8 == 0) // 8번째마다 비공개
                    .authorId(userIds[userIndex])
                    .authorName(userNames[userIndex])
                    .authorType(authorType)
                    .viewCount(random.nextInt(100) + 1)
                    .build();

                qaPostRepository.save(qaPost);
                postIndex++;
            }
        }

        System.out.println("QAPost 더미 데이터 30개 생성 완료 (카테고리별 6개씩)");
    }

    /**
     * Notice 더미 데이터 24개 생성 (각 카테고리별로 6개씩)
     */
    private void createNoticeDummyData() {
        if (noticeRepository.count() > 0) {
            System.out.println("Notice 더미 데이터가 이미 존재합니다.");
            return;
        }

        com.giproject.enums.NoticeCategory[] categories = com.giproject.enums.NoticeCategory.values();
        String[] adminIds = {"admin001", "admin002", "admin003"};
        String[] adminNames = {"관리자", "시스템관리자", "운영관리자"};

        // 각 카테고리별로 6개씩 생성
        int noticeIndex = 0;
        for (com.giproject.enums.NoticeCategory category : categories) {
            for (int i = 0; i < 6; i++) {
                int adminIndex = noticeIndex % adminIds.length;
                
                Notice notice = Notice.builder()
                    .title(getDetailedNoticeTitle(category, i))
                    .content(getDetailedNoticeContent(category, i))
                    .category(category)
                    .authorId(adminIds[adminIndex])
                    .authorName(adminNames[adminIndex])
                    .viewCount(random.nextInt(300) + 50)
                    .build();

                noticeRepository.save(notice);
                noticeIndex++;
            }
        }

        System.out.println("Notice 더미 데이터 24개 생성 완료 (카테고리별 6개씩)");
    }

    /**
     * 상세한 QA 게시글 제목 생성
     */
    private String getDetailedQATitle(QACategory category, int index) {
        switch (category) {
            case GENERAL:
                return getDetailedGeneralTitles()[index];
            case TECHNICAL:
                return getDetailedTechnicalTitles()[index];
            case BILLING:
                return getDetailedBillingTitles()[index];
            case SERVICE:
                return getDetailedServiceTitles()[index];
            case ETC:
                return getDetailedEtcTitles()[index];
            default:
                return String.format("QA 문의 %d번", index);
        }
    }

    /**
     * 상세한 QA 게시글 내용 생성
     */
    private String getDetailedQAContent(QACategory category, int index) {
        switch (category) {
            case GENERAL:
                return getDetailedGeneralContents()[index];
            case TECHNICAL:
                return getDetailedTechnicalContents()[index];
            case BILLING:
                return getDetailedBillingContents()[index];
            case SERVICE:
                return getDetailedServiceContents()[index];
            case ETC:
                return getDetailedEtcContents()[index];
            default:
                return "문의 내용입니다.";
        }
    }

    /**
     * 상세한 공지사항 제목 생성
     */
    private String getDetailedNoticeTitle(com.giproject.enums.NoticeCategory category, int index) {
        switch (category) {
            case GENERAL:
                return getDetailedNoticeTitles_General()[index];
            case SYSTEM:
                return getDetailedNoticeTitles_System()[index];
            case SERVICE:
                return getDetailedNoticeTitles_Service()[index];
            case UPDATE:
                return getDetailedNoticeTitles_Update()[index];
            default:
                return String.format("공지사항 %d번", index);
        }
    }

    /**
     * 상세한 공지사항 내용 생성
     */
    private String getDetailedNoticeContent(com.giproject.enums.NoticeCategory category, int index) {
        switch (category) {
            case GENERAL:
                return getDetailedNoticeContents_General()[index];
            case SYSTEM:
                return getDetailedNoticeContents_System()[index];
            case SERVICE:
                return getDetailedNoticeContents_Service()[index];
            case UPDATE:
                return getDetailedNoticeContents_Update()[index];
            default:
                return "공지사항 내용입니다.";
        }
    }

    /**
     * 랜덤 설명 생성
     */
    private String generateRandomDescription() {
        String[] descriptions = {
            "브라우저에서 특정 기능이 동작하지 않습니다",
            "화면 로딩이 느려지는 현상이 발생합니다", 
            "결제 진행 중 오류가 발생했습니다",
            "로그인이 되지 않는 문제가 있습니다",
            "견적서 작성 시 오류 메시지가 나타납니다",
            "배송 상태가 업데이트되지 않습니다",
            "알림 메시지가 수신되지 않습니다",
            "프로필 정보 수정이 안됩니다",
            "검색 기능이 정상 작동하지 않습니다",
            "이미지 업로드가 실패합니다"
        };
        
        return descriptions[random.nextInt(descriptions.length)];
    }

    // QA 카테고리별 상세한 제목 및 내용 배열들
    
    // 일반문의 제목들
    private String[] getDetailedGeneralTitles() {
        return new String[]{
            "회원가입은 어떻게 하나요?",
            "차주 등록 방법을 알려주세요",
            "화물주와 차주의 차이점은 무엇인가요?",
            "서비스 이용료는 얼마인가요?",
            "탈퇴는 어떻게 하나요?",
            "비밀번호를 잊어버렸어요"
        };
    }
    
    // 일반문의 내용들
    private String[] getDetailedGeneralContents() {
        return new String[]{
            "회원가입 절차에 대해 자세히 알고 싶습니다. 어떤 정보가 필요한지 궁금합니다.",
            "차주로 등록하려면 어떤 서류가 필요한가요? 절차가 복잡한지도 궁금합니다.",
            "플랫폼에서 화물주와 차주 역할이 어떻게 다른지 설명해주세요.",
            "플랫폼 이용 시 발생하는 수수료나 이용료에 대해 알고 싶습니다.",
            "더 이상 서비스를 이용하지 않아서 탈퇴하고 싶습니다. 절차를 알려주세요.",
            "로그인 시 사용하는 비밀번호를 까먹었는데 어떻게 찾을 수 있나요?"
        };
    }

    // 기술지원 제목들
    private String[] getDetailedTechnicalTitles() {
        return new String[]{
            "앱이 계속 멈춰요",
            "로그인이 안 돼요",
            "GPS 위치가 정확하지 않아요",
            "푸시 알림이 오지 않아요",
            "브라우저가 지원되지 않는다고 나와요",
            "파일 업로드가 안 돼요"
        };
    }
    
    // 기술지원 내용들
    private String[] getDetailedTechnicalContents() {
        return new String[]{
            "모바일 앱을 사용하다가 자꾸 강제종료됩니다. 해결방법이 있을까요?",
            "아이디와 비밀번호를 정확히 입력했는데도 로그인이 되지 않습니다.",
            "현재 위치가 실제 위치와 다르게 표시됩니다. 정확도를 높이는 방법이 있나요?",
            "새로운 견적이나 메시지가 와도 알림이 오지 않습니다.",
            "Internet Explorer로 접속하면 지원하지 않는다고 나오는데 다른 브라우저를 써야 하나요?",
            "서류 파일을 업로드하려고 하는데 계속 실패합니다. 파일 크기 제한이 있나요?"
        };
    }

    // 결제/요금 제목들
    private String[] getDetailedBillingTitles() {
        return new String[]{
            "결제 수단은 어떤 것이 있나요?",
            "결제가 중복으로 되었어요",
            "세금계산서 발행이 가능한가요?",
            "수수료는 언제 정산되나요?",
            "카드 결제 실패했어요",
            "환불 정책이 궁금해요"
        };
    }
    
    // 결제/요금 내용들
    private String[] getDetailedBillingContents() {
        return new String[]{
            "신용카드, 계좌이체 외에 다른 결제 방법도 지원하나요?",
            "같은 주문에 대해 결제가 두 번 이루어진 것 같습니다. 환불 가능한가요?",
            "사업자등록증이 있는데 세금계산서로 발행받을 수 있나요?",
            "차주로서 운송 완료 후 수수료 정산은 언제 이루어지나요?",
            "결제 진행 중에 오류가 발생했는데 다시 시도해야 하나요?",
            "취소나 환불 시 수수료가 발생하나요? 환불 절차를 알려주세요."
        };
    }

    // 서비스이용 제목들
    private String[] getDetailedServiceTitles() {
        return new String[]{
            "견적 요청은 어떻게 하나요?",
            "차주를 직접 선택할 수 있나요?",
            "운송료는 어떻게 결정되나요?",
            "배송 진행 상황을 확인할 수 있나요?",
            "긴급 배송도 가능한가요?",
            "대형 화물도 운송 가능한가요?"
        };
    }
    
    // 서비스이용 내용들
    private String[] getDetailedServiceContents() {
        return new String[]{
            "화물 운송 견적을 요청하는 정확한 절차를 알고 싶습니다.",
            "특정 차주를 지정해서 운송을 맡길 수 있는지 궁금합니다.",
            "운송비 산정 기준이 거리인가요 아니면 화물 종류도 고려되나요?",
            "실시간으로 화물 위치나 배송 상태를 추적할 수 있는 기능이 있나요?",
            "당일 배송이나 응급 화물 운송도 플랫폼에서 처리 가능한가요?",
            "일반 트럭으로는 운송하기 어려운 대형 화물도 처리 가능한지 궁금합니다."
        };
    }

    // 기타 제목들
    private String[] getDetailedEtcTitles() {
        return new String[]{
            "고객센터 운영시간은 언제인가요?",
            "앱 업데이트는 언제 되나요?",
            "제휴 업체가 되고 싶어요",
            "개인정보는 어떻게 보호되나요?",
            "불만사항을 신고하고 싶어요",
            "이벤트나 할인 혜택이 있나요?"
        };
    }
    
    // 기타 내용들
    private String[] getDetailedEtcContents() {
        return new String[]{
            "문의사항이 있을 때 전화나 채팅으로 상담받을 수 있는 시간대를 알고 싶습니다.",
            "새로운 기능이 추가될 예정이 있나요? 업데이트 일정을 알려주세요.",
            "물류 회사를 운영하고 있는데 플랫폼과 제휴할 수 있나요?",
            "플랫폼에서 수집하는 개인정보의 보안은 어떻게 관리하고 계신가요?",
            "서비스 이용 중 문제가 있었는데 어디로 신고하면 되나요?",
            "신규 회원 대상 이벤트나 할인 프로모션이 있는지 궁금합니다."
        };
    }

    // 공지사항 카테고리별 상세한 제목 및 내용 배열들
    
    // 사용안내 (GENERAL) 제목들
    private String[] getDetailedNoticeTitles_General() {
        return new String[]{
            "플랫폼 이용 가이드",
            "회원가입 절차 안내", 
            "견적 요청 및 매칭 프로세스",
            "운송료 산정 기준 안내",
            "안전한 거래를 위한 주의사항",
            "FAQ 자주 묻는 질문"
        };
    }
    
    // 사용안내 (GENERAL) 내용들
    private String[] getDetailedNoticeContents_General() {
        return new String[]{
            "화물 운송 플랫폼 이용방법에 대한 상세한 안내입니다.\n\n1. 회원가입 및 로그인\n2. 프로필 설정\n3. 견적 요청 방법\n4. 결제 및 정산 안내\n\n자세한 내용은 각 메뉴를 참고해주세요.",
            "새로운 회원님들을 위한 회원가입 절차를 안내드립니다.\n\n■ 화물주 회원가입\n- 기본 정보 입력\n- 이메일 인증\n- 사업자등록증 업로드 (선택)\n\n■ 차주 회원가입\n- 기본 정보 입력\n- 이메일 인증\n- 차량등록증 및 운전면허증 업로드\n- 관리자 승인 대기",
            "효율적인 견적 요청을 위한 단계별 가이드입니다.\n\n1단계: 출발지/도착지 입력\n2단계: 화물 정보 입력 (종류, 무게, 부피)\n3단계: 희망 일시 선택\n4단계: 견적 요청 완료\n5단계: 차주 매칭 및 견적 확인\n6단계: 최종 계약 체결",
            "투명하고 합리적인 운송료 산정 기준을 안내드립니다.\n\n■ 기본 요금\n- 거리별 기본 요금\n- 화물 종류별 추가 요금\n- 차량 종류별 요금\n\n■ 추가 요금\n- 야간/휴일 할증료\n- 긴급 배송 추가료\n- 대기료 및 상하차료\n\n정확한 견적은 시스템에서 자동 계산됩니다.",
            "모든 이용자의 안전한 거래를 위한 중요 안내사항입니다.\n\n⚠️ 주의사항\n- 플랫폼 외부 직접 거래 금지\n- 선불 요구 사기 주의\n- 개인정보 보호\n- 분쟁 시 고객센터 신고\n\n✅ 권장사항\n- 계약서 작성 및 보관\n- 배송 전후 사진 촬영\n- 정확한 정보 입력",
            "고객님들이 자주 문의하시는 질문들을 정리했습니다.\n\nQ: 회원가입은 무료인가요?\nA: 네, 회원가입 및 기본 서비스 이용은 무료입니다.\n\nQ: 취소 수수료가 있나요?\nA: 매칭 완료 후 2시간 이내 무료 취소 가능합니다.\n\nQ: 보험은 어떻게 되나요?\nA: 모든 등록 차주는 운송보험에 가입되어 있습니다.\n\n더 많은 질문은 고객센터를 이용해주세요."
        };
    }

    // 시스템 (SYSTEM) 제목들  
    private String[] getDetailedNoticeTitles_System() {
        return new String[]{
            "[시스템] 정기 점검 안내 (1월)",
            "[시스템] 서버 이전 작업 완료",
            "[시스템] 보안 강화 조치 완료", 
            "[시스템] 데이터베이스 최적화 완료",
            "[시스템] API 버전 업데이트",
            "[시스템] 모니터링 시스템 도입"
        };
    }
    
    // 시스템 (SYSTEM) 내용들
    private String[] getDetailedNoticeContents_System() {
        return new String[]{
            "안정적인 서비스 제공을 위한 정기 시스템 점검을 실시합니다.\n\n■ 점검 일시\n- 2024년 1월 15일 (월) 02:00 ~ 06:00\n\n■ 점검 내용\n- 서버 성능 최적화\n- 데이터베이스 정리\n- 보안 업데이트\n- 백업 시스템 점검\n\n점검 시간 중에는 서비스 이용이 제한될 수 있습니다.\n고객님의 양해 부탁드립니다.",
            "서버 성능 향상을 위한 서버 이전 작업이 완료되었습니다.\n\n■ 주요 개선사항\n- 응답속도 30% 향상\n- 동시접속자 처리 용량 확대\n- 데이터 백업 시스템 강화\n- 모니터링 시스템 고도화\n\n■ 변경사항\n- 서버 IP 주소 변경 (자동 연결)\n- API 응답 속도 개선\n\n더욱 빠르고 안정적인 서비스를 경험해보세요!",
            "고객님의 개인정보 보호를 위한 보안 강화 조치를 완료했습니다.\n\n■ 강화된 보안 기능\n- SSL 인증서 업그레이드\n- 비밀번호 암호화 방식 개선\n- 2단계 인증 시스템 도입\n- 의심스러운 로그인 탐지\n\n■ 권장사항\n- 비밀번호 정기 변경 (3개월)\n- 복잡한 비밀번호 설정\n- 공용 PC에서 자동로그인 사용 금지\n\n안전한 서비스 이용을 위해 협조 부탁드립니다.",
            "시스템 성능 향상을 위한 데이터베이스 최적화 작업이 완료되었습니다.\n\n■ 최적화 내용\n- 인덱스 재구성\n- 불필요한 데이터 정리\n- 쿼리 성능 튜닝\n- 백업 프로세스 개선\n\n■ 성능 개선 결과\n- 페이지 로딩 속도 25% 단축\n- 검색 기능 응답 시간 단축\n- 대용량 데이터 처리 안정성 향상\n\n쾌적한 서비스 이용이 가능합니다.",
            "모바일 앱 및 연동 시스템의 안정성 향상을 위한 API 업데이트를 실시했습니다.\n\n■ 주요 변경사항\n- REST API v2.1 배포\n- 응답 속도 최적화\n- 에러 처리 개선\n- 문서화 업데이트\n\n■ 개발자 공지\n- 기존 v2.0 API는 6개월간 병행 지원\n- 새로운 API 문서 확인 필요\n- 마이그레이션 가이드 제공\n\n기술 문의는 개발자 문의 게시판을 이용해주세요.",
            "서비스 품질 향상을 위한 실시간 모니터링 시스템을 도입했습니다.\n\n■ 모니터링 대상\n- 서버 성능 및 가용성\n- 응답시간 및 처리량\n- 에러 발생률\n- 사용자 경험 지표\n\n■ 장애 대응 체계\n- 24/7 자동 모니터링\n- 즉시 알림 시스템\n- 신속한 장애 복구\n- 사전 예방 조치\n\n더욱 안정적인 서비스를 제공하겠습니다."
        };
    }

    // 서비스 (SERVICE) 제목들
    private String[] getDetailedNoticeTitles_Service() {
        return new String[]{
            "[서비스] 새로운 차량 유형 추가",
            "[서비스] 실시간 위치 추적 기능 오픈",
            "[서비스] 고객 평가 시스템 개선",
            "[서비스] 24시간 고객센터 운영 시작", 
            "[서비스] 포인트 적립 혜택 확대",
            "[서비스] 보험 보장 범위 확대"
        };
    }
    
    // 서비스 (SERVICE) 내용들
    private String[] getDetailedNoticeContents_Service() {
        return new String[]{
            "고객 요청에 따라 새로운 차량 유형을 추가했습니다.\n\n■ 추가된 차량 유형\n- 냉장/냉동 차량: 신선식품 운송\n- 윙바디 차량: 대형 화물 운송\n- 탑차: 귀중품 및 정밀기기 운송\n- 크레인 차량: 중장비 운송\n\n■ 특수 운송 서비스\n- 당일배송 서비스 확대\n- 새벽배송 서비스\n- 정시배송 보장 서비스\n\n더 다양한 운송 니즈에 부응하겠습니다.",
            "고객 요청이 많았던 실시간 위치 추적 기능을 정식 오픈합니다.\n\n■ 주요 기능\n- GPS 기반 실시간 위치 확인\n- 예상 도착시간 안내\n- 경로 최적화\n- 배송 완료 알림\n\n■ 이용 방법\n1. 운송 진행 중인 주문 선택\n2. \"위치 추적\" 버튼 클릭\n3. 실시간 위치 및 상태 확인\n\n■ 개인정보 보호\n- 운송 완료 후 위치정보 자동 삭제\n- 당사자만 위치 확인 가능",
            "더 공정하고 투명한 평가 시스템으로 개선했습니다.\n\n■ 개선사항\n- 5점 평점제에서 10점제로 변경\n- 세부 평가 항목 추가\n  * 시간 준수\n  * 화물 취급\n  * 서비스 친절도\n  * 소통 원활성\n\n■ 평가 보상 시스템\n- 성실한 평가 작성 시 포인트 적립\n- 우수 평가 받은 차주 혜택 제공\n- 평가 조작 방지 시스템 강화\n\n공정한 거래 환경 조성에 동참해주세요.",
            "고객 편의성 향상을 위해 24시간 고객센터 운영을 시작합니다.\n\n■ 운영 시간\n- 기존: 평일 09:00~18:00\n- 변경: 연중무휴 24시간\n\n■ 지원 채널\n- 전화상담: 1588-1234\n- 실시간 채팅\n- 이메일: support@example.com\n- 카카오톡 채널\n\n■ 긴급상황 대응\n- 운송 중 사고 신고\n- 분실/파손 신고\n- 시스템 장애 신고\n\n언제든지 편리하게 문의하세요!",
            "고객 감사 이벤트로 포인트 적립 혜택을 대폭 확대합니다.\n\n■ 적립 혜택 확대\n- 운송 완료 시: 기존 1% → 3%\n- 첫 이용 보너스: 5,000포인트\n- 추천인 보상: 추천인/피추천인 각 10,000포인트\n- 연속 이용 보너스: 월 3회 이상 추가 적립\n\n■ 포인트 사용처 확대\n- 운송료 결제\n- 편의점 상품권 교환\n- 주유권 교환\n- 기프티콘 교환\n\n더 많은 혜택을 누려보세요!",
            "고객의 재산 보호를 위해 운송보험 보장 범위를 확대합니다.\n\n■ 확대된 보장 내용\n- 화물 손해: 최대 1억원\n- 제3자 배상: 최대 5억원\n- 운송 지연 손해: 신설\n- 자연재해 손해: 신설\n\n■ 보상 절차 간소화\n- 온라인 신고 시스템\n- 신속한 현장 조사\n- 평균 처리기간 단축 (7일 → 3일)\n\n■ 예방 교육 강화\n- 차주 안전 교육 의무화\n- 화물 포장 가이드 제공\n\n안전하고 믿을 수 있는 운송 서비스를 제공합니다."
        };
    }

    // 업데이트 (UPDATE) 제목들
    private String[] getDetailedNoticeTitles_Update() {
        return new String[]{
            "[업데이트] 모바일 앱 v2.5.0 업데이트",
            "[업데이트] 웹사이트 디자인 리뉴얼",
            "[업데이트] 결제 시스템 업그레이드",
            "[업데이트] AI 기반 견적 시스템 도입",
            "[업데이트] 알림 시스템 개선",
            "[업데이트] 통계 및 분석 기능 추가"
        };
    }
    
    // 업데이트 (UPDATE) 내용들
    private String[] getDetailedNoticeContents_Update() {
        return new String[]{
            "새로운 기능이 추가된 모바일 앱 v2.5.0 업데이트를 배포했습니다.\n\n■ 새로운 기능\n- 다크 모드 지원\n- 음성 안내 기능\n- 오프라인 모드\n- 위젯 지원\n\n■ 개선사항\n- 배터리 사용량 20% 감소\n- 앱 실행 속도 향상\n- UI/UX 개선\n- 버그 수정 및 안정성 향상\n\n■ 업데이트 방법\n- 앱스토어/플레이스토어에서 업데이트\n- 자동 업데이트 설정 권장\n\n더 편리해진 앱을 경험해보세요!",
            "더 직관적이고 사용하기 편한 웹사이트로 새단장했습니다.\n\n■ 주요 변경사항\n- 모던하고 깔끔한 디자인\n- 반응형 웹 완전 지원\n- 접근성 개선 (웹 접근성 인증)\n- 다국어 지원 준비\n\n■ 메뉴 구조 개선\n- 직관적인 네비게이션\n- 빠른 검색 기능\n- 개인화된 대시보드\n- 즐겨찾기 기능\n\n■ 성능 최적화\n- 페이지 로딩 속도 40% 향상\n- 이미지 최적화\n- 캐싱 시스템 적용\n\n새로워진 웹사이트를 만나보세요!",
            "더 안전하고 편리한 결제를 위해 결제 시스템을 업그레이드했습니다.\n\n■ 새로운 결제 수단\n- 카카오페이\n- 네이버페이\n- 페이코\n- 토스페이\n- 삼성페이\n\n■ 보안 강화\n- PCI DSS 인증 완료\n- 토큰 결제 시스템 도입\n- 이상거래 탐지 시스템\n- 3D Secure 2.0 적용\n\n■ 편의 기능\n- 간편 결제 설정\n- 자동 결제 기능\n- 결제 내역 상세 조회\n- 영수증 자동 발송\n\n안전하고 편리한 결제를 경험하세요.",
            "인공지능 기술을 활용한 스마트 견적 시스템을 도입했습니다.\n\n■ AI 견적 시스템 특징\n- 실시간 교통정보 반영\n- 과거 운송 데이터 학습\n- 날씨, 계절 요인 고려\n- 개인화된 견적 제공\n\n■ 정확성 향상\n- 예상 비용 오차 50% 감소\n- 배송 시간 예측 정확도 90%\n- 맞춤형 차주 추천\n- 최적 경로 제안\n\n■ 사용 방법\n- 기존과 동일한 견적 요청 과정\n- AI 분석 결과 자동 표시\n- 상세 분석 리포트 제공\n\n더 정확하고 합리적인 견적을 받아보세요!",
            "중요한 정보를 놓치지 않도록 알림 시스템을 대폭 개선했습니다.\n\n■ 알림 유형 세분화\n- 즉시 알림: 긴급한 내용\n- 일반 알림: 일반적인 업데이트\n- 프로모션: 이벤트 및 할인 정보\n- 시스템: 점검 및 공지사항\n\n■ 맞춤 설정 기능\n- 알림 유형별 ON/OFF\n- 시간대별 수신 설정\n- 채널별 설정 (앱, SMS, 이메일)\n- 중요도별 필터링\n\n■ 스마트 알림\n- 사용 패턴 학습\n- 관련성 높은 알림 우선 발송\n- 중복 알림 방지\n\n개인화된 알림으로 더 편리하게 이용하세요.",
            "데이터 기반 의사결정을 위한 통계 및 분석 기능을 추가했습니다.\n\n■ 제공 통계\n- 월별/분기별 운송 현황\n- 비용 분석 및 절감 효과\n- 자주 이용하는 경로\n- 선호 차주 및 평가 분석\n\n■ 시각화 도구\n- 대시보드 차트\n- 지도 기반 경로 분석\n- 비교 분석 그래프\n- 트렌드 분석\n\n■ 리포트 기능\n- PDF 리포트 다운로드\n- 이메일 자동 발송\n- 정기 리포트 설정\n- 맞춤형 리포트 생성\n\n데이터로 더 스마트한 운송 관리를 시작하세요!"
        };
    }
}