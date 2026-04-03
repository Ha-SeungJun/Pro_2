package com.giproject.enums;

/**
 * 공지사항 카테고리 열거형
 * 
 * 공지사항의 종류를 분류하기 위한 카테고리
 */
public enum NoticeCategory {
    GENERAL("사용안내", "일반 공지사항"),
    SYSTEM("시스템", "시스템 관련 공지사항"),
    SERVICE("서비스", "서비스 관련 공지사항"),
    UPDATE("업데이트", "업데이트 관련 공지사항");
    
    private final String displayName;
    private final String description;
    
    NoticeCategory(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
}