# 🚚 FIRST ROAD

<div align="center">
  <img src="front/src/assets/logo.png" width="450" alt="프로젝트 로고"/>

  <br/><br/>

  🔗 <a href="https://github.com/cjc0623/Real_Pro">GitHub Repository 바로가기</a>
</div>

<br/>

---

## 📌 프로젝트 정보

| 항목 | 내용 |
|------|------|
| 프로젝트명 | FIRST ROAD |
| 개발 기간 | 2026.04 ~ 2026.05 |
| 개발 인원 | 5명 |
| 기술 스택 | Spring Boot, React, MariaDB |
| 한 줄 소개 | 화물 운송 중개 플랫폼 (화주 ↔ 차주 매칭 서비스) |

---

## 👥 팀 소개

| 이름 | GitHub |
|------|--------|
| 김기현 | [GitHub](https://github.com/your-id) |
| 김우근 | [GitHub](https://github.com/your-id) |
| 서준원 | [GitHub](https://github.com/your-id) |
| 최현민 | [GitHub](https://github.com/your-id) |
| 하승준 | [GitHub](https://github.com/your-id) |

---

## 📖 프로젝트 소개

FIRST ROAD는 화주와 차주를 연결해주는  
**화물 운송 중개 플랫폼**입니다.

- 화주는 화물을 등록하고
- 차주는 등록된 화물을 확인한 뒤 운송을 수락하며
- 최종적으로 차주와 매칭을 통해 배송이 이루어집니다.

Spring Boot 기반 REST API 서버로 구현되었으며,  
React 프론트엔드와 연동됩니다.

---

## 🌐 배포 주소

- 🔗 Frontend: https://first-road.vercel.app 
- 🔗 Backend: API 서버 연동 완료  

---

## 🖥 화면 구성

### 🔹 메인 페이지

<table>
  <tr>
    <td><img src="front/src/assets/gitReadme/main1.png" width="350"/></td>
    <td><img src="front/src/assets/gitReadme/main2.png" width="350"/></td>
  </tr>
  <tr>
    <td><img src="front/src/assets/gitReadme/main3.png" width="350"/></td>
    <td><img src="front/src/assets/gitReadme/main4.png" width="350"/></td>
  </tr>
</table>

<img src="front/src/assets/gitReadme/main5.png" width="700"/>

### 🔹 로그인 / 회원가입

<table>
  <tr>
    <td><img src="front/src/assets/gitReadme/로그인.png" width="350"/></td>
    <td><img src="front/src/assets/gitReadme/회원가입.png" width="350"/></td>
  </tr>
</table>

### 🔹 이용가이드
<img src="front/src/assets/gitReadme/이용가이드.png" width="700"/>

### 🔹 간편조회
<img src="front/src/assets/gitReadme/간편조회.png" width="700"/>

### 🔹 화물 등록
<img src="front/src/assets/gitReadme/견적서.png" width="700"/>

### 🔹 운송 접수 목록
<img src="front/src/assets/gitReadme/운송접수목록.png" width="700"/>

### 🔹 공지사항
<img src="front/src/assets/gitReadme/공지사항.png" width="700"/>

### 🔹 문의사항
<img src="front/src/assets/gitReadme/문의사항.png" width="700"/>

### 🔹 마이페이지

<table>
  <tr>
    <td><img src="front/src/assets/gitReadme/화주마이페이지.png" width="350"/></td>
    <td><img src="front/src/assets/gitReadme/차주마이페이지.png" width="350"/></td>
  </tr>
  <tr>
    <td><img src="front/src/assets/gitReadme/관리자마이페이지.png" width="350"/></td>
    <td></td>
  </tr>
</table>

---

## ✨ 주요 기능

### 🔐 1. 회원 관리
- 회원가입 / 로그인 기능 제공
- SNS 계정을 통한 간편 로그인 지원
- 회원 프로필 사진 업로드 기능 제공
- 프로필 기반 사용자 신뢰도 향상
- JWT 기반 인증 처리
- 사용자 권한별 접근 제어

---

### 🚛 2. 화물 등록
- 화주가 화물 정보 등록 가능
- 출발지 / 도착지 / 무게 / 상세 정보 입력
- 지도 클릭을 통한 직관적인 출발지·도착지 주소 지정 기능
- 지도 기반 출발지·도착지 확인 가능
- 등록된 화물 위치를 한눈에 확인 가능
- 거리 기반 운송 가격 계산 기능 제공

---

### 💸 3. 결제 및 정산 시스템
- 운송 완료 후 결제 처리 기능 제공
- 화주 ↔ 차주 간 정산 자동 처리
- 거래 내역 및 결제 기록 조회 가능
- 안전한 거래를 위한 결제 프로세스 지원

---

### 💸 4. 할인 시스템
- 운송 거리별 할인 적용
  - 100km 이상 : 5% 할인
  - 200km 이상 : 10% 할인
  - 300km 이상 : 15% 할인
  - 400km 이상 : 20% 할인
- 할인 쿠폰 등록 및 적용 기능 제공
- 최종 운송 비용 자동 계산 지원

---

### 🤝 5. 운송 수락 시스템
- 등록된 화물을 차주가 직접 확인 후 수락
- 차주 본인 차량의 적재 톤 수와 화물 무게를 비교하여, 조건에 맞지 않는 화물은 수락 불가하도록 검증 로직 적용
- 화주와 차주를 연결하는 매칭 구조 제공
- 수락 완료 시 배송 프로세스 진행

---

### 📦 6. 배송 관리
- 배송 상태 조회 (대기 / 진행 / 완료)
- 배송 흐름 관리

---

### ⭐ 7. 리뷰 시스템
- 운송 완료 후 화주와 차주 간 리뷰 작성
- 평점 및 후기 기반 신뢰도 관리
- 서비스 품질 향상을 위한 사용자 평가 제공

---

### 🚨 8. 신고 기능
- 부적절한 사용자 또는 거래 신고 가능
- 신고 내역 기반 관리자 검토 가능
- 안전한 거래 환경 제공

---

### 📢 9. 공지사항 게시판
- 관리자 공지사항 등록 및 관리
- 서비스 업데이트 및 중요 안내 제공
- 사용자 전체 공지 확인 가능

---

### 📘 10. 이용 가이드 게시판
- 서비스 이용 방법 안내
- 화물 등록 및 운송 진행 절차 설명
- 사용자 도움말 및 FAQ 제공

---

### 📬 11. 문의 게시판
- 사용자 문의 등록
- 문의 내역 조회
- 관리자 응답 확장 가능

---

### 💬 12. 상담 서비스
- 사용자가 서비스 이용 중 궁금한 내용을 상담사에게 문의 가능
- 화물 등록, 운송 수락, 결제, 배송 관련 상담 지원
- 사용자 문의 응대 및 서비스 이용 편의성 향상

---

### 🤖 13. AI 상담사
- 자주 묻는 질문에 대한 AI 기반 자동 응답 제공
- 화물 등록 방법, 배송 절차, 결제 안내 등 기본 문의 처리
- 상담 대기 시간을 줄이고 빠른 고객 지원 제공

---

### 🛠 14. 관리자 페이지
- 회원, 화물, 신고, 게시판 통합 관리 기능 제공
- 차량 승인 관리 기능
  - 차주가 등록한 차량 정보(톤 수, 차종, 서류 등) 검토
  - 차주가 등록한 차량 정보 조회 및 서비스 이용 승인/반려 기능
- 신고 처리 및 사용자 제재 기능
- 공지사항 및 게시글 관리 기능
- 서비스 운영을 위한 관리자 전용 기능 제공

---

### 📊 15. 사용자별 대시보드
- 사용자 권한에 따라 화주, 차주, 관리자 전용 대시보드 제공
- 서비스 이용 현황을 그래프와 요약 카드로 시각화

#### 화주 대시보드
- 총 주문 건수 확인
- 배송중 / 배송완료 건수 확인
- 월별 요청 수 그래프 제공
- 내 문의내역 조회 가능

#### 차주 대시보드
- 내 차량 정보 등록 및 승인 상태 확인
- 총 배달 건수 확인
- 배송중 / 배송완료 건수 확인
- 월별 수익 그래프 제공
- 내 문의내역 조회 가능

#### 관리자 대시보드
- 전체 사용자 수 확인
- 신규 차량 승인 대기 현황
- 이번 달 매출 확인
- 신규 회원 수 확인
- 총 배송 건수 확인
- 신규 회원가입 수 그래프 제공
- 월별 배송내역 그래프 제공

---

## 🛠 기술 스택

### Backend
![Spring Boot](https://img.shields.io/badge/SpringBoot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Java](https://img.shields.io/badge/Java-007396?style=for-the-badge&logo=openjdk&logoColor=white)

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

### Database
![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white)

---

## 📌 향후 개선 사항

- [ ] Swagger를 활용한 API 문서 자동화
- [ ] 화물 수락, 배송 상태 변경, 문의 답변에 대한 알림 시스템 구현
- [ ] 위치 기반 실시간 운송 매칭 기능 고도화
- [ ] 운송 이력 기반 차주 추천 기능 추가
