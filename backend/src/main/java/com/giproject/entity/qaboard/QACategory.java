package com.giproject.entity.qaboard;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * QA게시판 카테고리 열거형
 * 
 * 각 카테고리의 코드와 표시명을 매핑
 * 새로운 카테고리 추가 시 이 enum에 추가하면 됨
 * 
 * Frontend와 매핑:
 * - all: 전체 (필터링 전용)
 * - general: 일반문의
 * - technical: 기술지원
 * - billing: 결제/요금  
 * - service: 서비스이용
 * - etc: 기타
 */
@Getter
@RequiredArgsConstructor
public enum QACategory {
    
    GENERAL("general", "일반문의"),
    TECHNICAL("technical", "기술지원"), 
    BILLING("billing", "결제/요금"),
    SERVICE("service", "서비스이용"),
    ETC("etc", "기타");
    
    private final String code; // Frontend에서 사용하는 코드
    private final String displayName; // 화면에 표시될 이름
    
    /**
     * 코드로 카테고리 찾기
     */
    public static QACategory fromCode(String code) {
        for (QACategory category : values()) {
            if (category.code.equals(code)) {
                return category;
            }
        }
        throw new IllegalArgumentException("Invalid category code: " + code);
    }
    
    /**
     * 유효한 카테고리 코드인지 확인
     */
    public static boolean isValidCode(String code) {
        for (QACategory category : values()) {
            if (category.code.equals(code)) {
                return true;
            }
        }
        return false;
    }
}