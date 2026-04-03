-- QABoard 더미 데이터 삽입 (각 카테고리별로 6개씩)

-- 1. 일반문의 (GENERAL) 카테고리
INSERT INTO qa_post (title, content, category, author_type, author_name, author_email, created_at, status) VALUES
('회원가입은 어떻게 하나요?', '회원가입 절차에 대해 자세히 알고 싶습니다. 어떤 정보가 필요한지 궁금합니다.', 'GENERAL', 'USER', '김민수', 'minsu@example.com', NOW(), 'ANSWERED'),
('차주 등록 방법을 알려주세요', '차주로 등록하려면 어떤 서류가 필요한가요? 절차가 복잡한지도 궁금합니다.', 'GENERAL', 'USER', '박철수', 'chulsu@example.com', NOW(), 'PENDING'),
('화물주와 차주의 차이점은 무엇인가요?', '플랫폼에서 화물주와 차주 역할이 어떻게 다른지 설명해주세요.', 'GENERAL', 'USER', '이영희', 'younghee@example.com', NOW(), 'ANSWERED'),
('서비스 이용료는 얼마인가요?', '플랫폼 이용 시 발생하는 수수료나 이용료에 대해 알고 싶습니다.', 'GENERAL', 'USER', '최동욱', 'dongwook@example.com', NOW(), 'PENDING'),
('탈퇴는 어떻게 하나요?', '더 이상 서비스를 이용하지 않아서 탈퇴하고 싶습니다. 절차를 알려주세요.', 'GENERAL', 'USER', '강지연', 'jiyeon@example.com', NOW(), 'ANSWERED'),
('비밀번호를 잊어버렸어요', '로그인 시 사용하는 비밀번호를 까먹었는데 어떻게 찾을 수 있나요?', 'GENERAL', 'USER', '윤태현', 'taehyun@example.com', NOW(), 'PENDING'),

-- 2. 기술지원 (TECHNICAL) 카테고리
INSERT INTO qa_post (title, content, category, author_type, author_name, author_email, created_at, status) VALUES
('앱이 계속 멈춰요', '모바일 앱을 사용하다가 자꾸 강제종료됩니다. 해결방법이 있을까요?', 'TECHNICAL', 'USER', '신혜진', 'hyejin@example.com', NOW(), 'PENDING'),
('로그인이 안 돼요', '아이디와 비밀번호를 정확히 입력했는데도 로그인이 되지 않습니다.', 'TECHNICAL', 'USER', '임도현', 'dohyun@example.com', NOW(), 'ANSWERED'),
('GPS 위치가 정확하지 않아요', '현재 위치가 실제 위치와 다르게 표시됩니다. 정확도를 높이는 방법이 있나요?', 'TECHNICAL', 'USER', '홍길동', 'gildong@example.com', NOW(), 'PENDING'),
('푸시 알림이 오지 않아요', '새로운 견적이나 메시지가 와도 알림이 오지 않습니다.', 'TECHNICAL', 'USER', '김영수', 'youngsu@example.com', NOW(), 'ANSWERED'),
('브라우저가 지원되지 않는다고 나와요', 'Internet Explorer로 접속하면 지원하지 않는다고 나오는데 다른 브라우저를 써야 하나요?', 'TECHNICAL', 'USER', '조미영', 'miyoung@example.com', NOW(), 'PENDING'),
('파일 업로드가 안 돼요', '서류 파일을 업로드하려고 하는데 계속 실패합니다. 파일 크기 제한이 있나요?', 'TECHNICAL', 'USER', '배준호', 'junho@example.com', NOW(), 'ANSWERED'),

-- 3. 결제/요금 (BILLING) 카테고리
INSERT INTO qa_post (title, content, category, author_type, author_name, author_email, created_at, status) VALUES
('결제 수단은 어떤 것이 있나요?', '신용카드, 계좌이체 외에 다른 결제 방법도 지원하나요?', 'BILLING', 'USER', '서정훈', 'junghoon@example.com', NOW(), 'ANSWERED'),
('결제가 중복으로 되었어요', '같은 주문에 대해 결제가 두 번 이루어진 것 같습니다. 환불 가능한가요?', 'BILLING', 'USER', '노은지', 'eunji@example.com', NOW(), 'PENDING'),
('세금계산서 발행이 가능한가요?', '사업자등록증이 있는데 세금계산서로 발행받을 수 있나요?', 'BILLING', 'USER', '황민철', 'minchul@example.com', NOW(), 'ANSWERED'),
('수수료는 언제 정산되나요?', '차주로서 운송 완료 후 수수료 정산은 언제 이루어지나요?', 'BILLING', 'USER', '권상우', 'sangwoo@example.com', NOW(), 'PENDING'),
('카드 결제 실패했어요', '결제 진행 중에 오류가 발생했는데 다시 시도해야 하나요?', 'BILLING', 'USER', '이수진', 'sujin@example.com', NOW(), 'ANSWERED'),
('환불 정책이 궁금해요', '취소나 환불 시 수수료가 발생하나요? 환불 절차를 알려주세요.', 'BILLING', 'USER', '정현우', 'hyunwoo@example.com', NOW(), 'PENDING'),

-- 4. 서비스이용 (SERVICE) 카테고리
INSERT INTO qa_post (title, content, category, author_type, author_name, author_email, created_at, status) VALUES
('견적 요청은 어떻게 하나요?', '화물 운송 견적을 요청하는 정확한 절차를 알고 싶습니다.', 'SERVICE', 'USER', '안준영', 'junyoung@example.com', NOW(), 'ANSWERED'),
('차주를 직접 선택할 수 있나요?', '특정 차주를 지정해서 운송을 맡길 수 있는지 궁금합니다.', 'SERVICE', 'USER', '김하늘', 'haneul@example.com', NOW(), 'PENDING'),
('운송료는 어떻게 결정되나요?', '운송비 산정 기준이 거리인가요 아니면 화물 종류도 고려되나요?', 'SERVICE', 'USER', '박소연', 'soyeon@example.com', NOW(), 'ANSWERED'),
('배송 진행 상황을 확인할 수 있나요?', '실시간으로 화물 위치나 배송 상태를 추적할 수 있는 기능이 있나요?', 'SERVICE', 'USER', '최준석', 'junseok@example.com', NOW(), 'PENDING'),
('긴급 배송도 가능한가요?', '당일 배송이나 응급 화물 운송도 플랫폼에서 처리 가능한가요?', 'SERVICE', 'USER', '한지민', 'jimin@example.com', NOW(), 'ANSWERED'),
('대형 화물도 운송 가능한가요?', '일반 트럭으로는 운송하기 어려운 대형 화물도 처리 가능한지 궁금합니다.', 'SERVICE', 'USER', ' 양동현', 'donghyun@example.com', NOW(), 'PENDING'),

-- 5. 기타 (ETC) 카테고리
INSERT INTO qa_post (title, content, category, author_type, author_name, author_email, created_at, status) VALUES
('고객센터 운영시간은 언제인가요?', '문의사항이 있을 때 전화나 채팅으로 상담받을 수 있는 시간대를 알고 싶습니다.', 'ETC', 'USER', '송민호', 'minho@example.com', NOW(), 'ANSWERED'),
('앱 업데이트는 언제 되나요?', '새로운 기능이 추가될 예정이 있나요? 업데이트 일정을 알려주세요.', 'ETC', 'USER', '김태리', 'taeri@example.com', NOW(), 'PENDING'),
('제휴 업체가 되고 싶어요', '물류 회사를 운영하고 있는데 플랫폼과 제휴할 수 있나요?', 'ETC', 'USER', '이동건', 'donggun@example.com', NOW(), 'ANSWERED'),
('개인정보는 어떻게 보호되나요?', '플랫폼에서 수집하는 개인정보의 보안은 어떻게 관리하고 계신가요?', 'ETC', 'USER', '박예린', 'yerin@example.com', NOW(), 'PENDING'),
('불만사항을 신고하고 싶어요', '서비스 이용 중 문제가 있었는데 어디로 신고하면 되나요?', 'ETC', 'USER', '최우식', 'woosik@example.com', NOW(), 'ANSWERED'),
('이벤트나 할인 혜택이 있나요?', '신규 회원 대상 이벤트나 할인 프로모션이 있는지 궁금합니다.', 'ETC', 'USER', '신민아', 'mina@example.com', NOW(), 'PENDING');