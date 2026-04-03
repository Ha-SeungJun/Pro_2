package com.giproject.dto.noboard;

import java.time.LocalDateTime;

import com.giproject.enums.NoticeCategory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Notice 데이터 전송 객체 (DTO)
 * 
 * 클라이언트와 서버 간 공지사항 데이터 교환용
 * - 요청/응답 모두 사용
 * - 유효성 검증 포함
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NoticeDTO {
    
    private Long noticeId; // 공지사항 ID (응답 시에만 포함)
    
    @NotBlank(message = "제목을 입력해주세요")
    @Size(max = 200, message = "제목은 200자 이내로 입력해주세요")
    private String title; // 공지사항 제목
    
    @NotBlank(message = "내용을 입력해주세요")
    private String content; // 공지사항 내용
    
    private String authorId; // 작성자 ID (응답 시에만 포함)
    private String authorName; // 작성자 이름 (응답 시에만 포함)
    private LocalDateTime createdAt; // 작성일시 (응답 시에만 포함)
    private LocalDateTime updatedAt; // 수정일시 (응답 시에만 포함)
    private Integer viewCount; // 조회수 (응답 시에만 포함)
    private NoticeCategory category; // 카테고리 (응답 시에만 포함)
    
    /**
     * 공지사항 작성 요청용 DTO
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
        
        // 프론트엔드에서 사용자가 입력한 작성자명
        private String author;
        
        // 공지사항 카테고리
        private NoticeCategory category;
    }
    
    /**
     * 공지사항 수정 요청용 DTO
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
        
        // 프론트엔드에서 사용자가 입력한 작성자명
        private String author;
        
        // 공지사항 카테고리
        private NoticeCategory category;
        
        // 제목과 내용 trim 처리
        public void setTitle(String title) {
            this.title = title != null ? title.trim() : null;
        }
        
        public void setContent(String content) {
            this.content = content != null ? content.trim() : null;
        }
    }
    
    /**
     * 공지사항 목록 조회 응답용 간소화된 DTO
     */
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ListResponse {
        
        private Long noticeId;
        private String title;
        private String content; // 목록에서도 내용 일부 표시 가능
        private String authorId;
        private String authorName;
        private LocalDateTime createdAt;
        private Integer viewCount;
        private NoticeCategory category;
        private Integer displayNumber; // 연속적인 표시 번호
    }
}