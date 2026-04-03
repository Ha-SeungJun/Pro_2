package com.giproject.dto.noboard;

import java.util.List;

import org.springframework.data.domain.Page;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 페이지네이션 응답을 위한 공통 DTO (Notice 전용)
 * 
 * Spring Data의 Page 객체를 클라이언트 친화적인 형태로 변환
 * Frontend에서 필요한 페이지네이션 정보 모두 포함
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NoticePageResponseDTO<T> {
    
    private List<T> content; // 실제 데이터 목록
    private long totalElements; // 전체 데이터 개수
    private int totalPages; // 전체 페이지 수
    private int currentPage; // 현재 페이지 (0부터 시작)
    private int size; // 페이지 크기
    private boolean hasNext; // 다음 페이지 존재 여부
    private boolean hasPrevious; // 이전 페이지 존재 여부
    private boolean isFirst; // 첫 번째 페이지 여부
    private boolean isLast; // 마지막 페이지 여부
    
    /**
     * Spring Data Page 객체로부터 NoticePageResponseDTO 생성
     */
    public static <T> NoticePageResponseDTO<T> of(Page<T> page) {
        return NoticePageResponseDTO.<T>builder()
                .content(page.getContent())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .currentPage(page.getNumber())
                .size(page.getSize())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .isFirst(page.isFirst())
                .isLast(page.isLast())
                .build();
    }
    
    /**
     * 데이터 변환과 함께 NoticePageResponseDTO 생성
     * Entity -> DTO 변환 시 사용
     */
    public static <T, R> NoticePageResponseDTO<R> of(Page<T> page, List<R> convertedContent) {
        return NoticePageResponseDTO.<R>builder()
                .content(convertedContent)
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .currentPage(page.getNumber())
                .size(page.getSize())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .isFirst(page.isFirst())
                .isLast(page.isLast())
                .build();
    }
}