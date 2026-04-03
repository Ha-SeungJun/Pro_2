package com.giproject.dto.qaboard;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AdminResponse 데이터 전송 객체 (DTO)
 * 
 * 관리자 답변 데이터 교환용
 * - 관리자만 작성/수정/삭제 가능
 * - 클라이언트-서버 간 답변 데이터 전송
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminResponseDTO {
    
    private Long responseId; // 답변 ID (응답 시에만 포함)
    
    @NotBlank(message = "답변 내용을 입력해주세요")
    private String content; // 답변 내용
    
    private String adminId; // 답변 작성 관리자 ID (응답 시에만 포함)
    private String adminName; // 답변 작성 관리자 이름 (응답 시에만 포함)
    private LocalDateTime createdAt; // 답변 작성일시 (응답 시에만 포함)
    private LocalDateTime updatedAt; // 답변 수정일시 (응답 시에만 포함)
    
    /**
     * 답변 작성 요청용 DTO
     */
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CreateRequest {
        
        @NotBlank(message = "답변 내용을 입력해주세요")
        private String content;
    }
    
    /**
     * 답변 수정 요청용 DTO
     */
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UpdateRequest {
        
        @NotBlank(message = "답변 내용을 입력해주세요")
        private String content;
    }
}