package com.giproject.dto.qaboard;

import java.time.LocalDateTime;

import com.giproject.entity.qaboard.AuthorType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * QAPost 데이터 전송 객체 (DTO)
 * 
 * 클라이언트와 서버 간 게시글 데이터 교환용
 * - 요청/응답 모두 사용
 * - 유효성 검증 포함
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class QAPostDTO {
    
    private Long postId; // 게시글 ID (응답 시에만 포함)
    
    @NotBlank(message = "제목을 입력해주세요")
    @Size(max = 200, message = "제목은 200자 이내로 입력해주세요")
    private String title; // 게시글 제목
    
    @NotBlank(message = "내용을 입력해주세요")
    private String content; // 게시글 내용
    
    @NotNull(message = "카테고리를 선택해주세요")
    private String category; // 카테고리 코드 (frontend와 호환)
    
    @Builder.Default
    private Boolean isPrivate = false; // 비공개 여부
    
    private String authorId; // 작성자 ID (응답 시에만 포함)
    private String authorName; // 작성자 이름 (응답 시에만 포함)
    private AuthorType authorType; // 작성자 유형 (MEMBER, CARGO, ADMIN)
    private LocalDateTime createdAt; // 작성일시 (응답 시에만 포함)
    private LocalDateTime updatedAt; // 수정일시 (응답 시에만 포함)
    private Integer viewCount; // 조회수 (응답 시에만 포함)

    // 관리자 답변 정보 (응답 시에만 포함)
    private Boolean hasResponse; // 답변 존재 여부
    private AdminResponseDTO adminResponse; // 관리자 답변 상세 정보
    
    /**
     * 게시글 작성 요청용 DTO
     */
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CreateRequest {
        
        @NotBlank(message = "제목을 입력해주세요")
        @Size(max = 200, message = "제목은 200자 이내로 입력해주세요")
        private String title;
        
        @NotBlank(message = "내용을 입력해주세요")
        private String content;
        
        @NotBlank(message = "카테고리를 선택해주세요")
        private String category;
        
        @Builder.Default
        private Boolean isPrivate = false;
    }
    
    /**
     * 게시글 수정 요청용 DTO
     */
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UpdateRequest {
        
        @NotBlank(message = "제목을 입력해주세요")
        @Size(max = 200, message = "제목은 200자 이내로 입력해주세요")
        private String title;
        
        @NotBlank(message = "내용을 입력해주세요")
        private String content;
        
        @NotBlank(message = "카테고리를 선택해주세요")
        private String category;
        
        @Builder.Default
        private Boolean isPrivate = false;
        
        // 세터 메서드에서 null 값 처리 추가
        public void setIsPrivate(Boolean isPrivate) {
            this.isPrivate = isPrivate != null ? isPrivate : false;
        }
        
        // 카테고리 trim 처리
        public void setCategory(String category) {
            this.category = category != null ? category.trim() : null;
        }
        
        // 제목과 내용 trim 처리
        public void setTitle(String title) {
            this.title = title != null ? title.trim() : null;
        }
        
        public void setContent(String content) {
            this.content = content != null ? content.trim() : null;
        }
    }
    
    /**
     * 게시글 목록 조회 응답용 간소화된 DTO
     */
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ListResponse {
        
        private Long postId;
        private String title;
        private String content; // 게시글 내용 추가 (프론트엔드 렌더링용)
        private String category;
        private Boolean isPrivate;
        private String authorId; // 작성자 ID 추가 (권한 체크용)
        private String authorName;
        private AuthorType authorType; // 작성자 유형 (UI 제어용)
        private LocalDateTime createdAt;
        private Integer viewCount;
        private Boolean hasResponse; // 답변 존재 여부만 표시
        private AdminResponseDTO adminResponse; // 관리자 답변 정보도 포함
    }
}