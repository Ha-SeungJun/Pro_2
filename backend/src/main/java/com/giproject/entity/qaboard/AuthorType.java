package com.giproject.entity.qaboard;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * QA게시판 작성자 유형 열거형
 * 
 * 사용자 유형별 권한 관리 및 접근 제어를 위한 enum
 * 
 * 권한 체계:
 * - MEMBER: 일반회원 (memId, cargoId 소유자) - 본인 글만 수정/삭제
 * - CARGO: 화물주 (향후 세분화 시 사용) - 본인 글만 수정/삭제  
 * - ADMIN: 관리자 - 모든 글 수정/삭제, 답변 작성 가능
 */
@Getter
@RequiredArgsConstructor
public enum AuthorType {
    
    MEMBER("MEMBER", "일반회원"),
    CARGO("CARGO", "화물주"), 
    ADMIN("ADMIN", "관리자");
    
    private final String code; // 코드값
    private final String displayName; // 표시명
    
    /**
     * 코드로 AuthorType 찾기
     */
    public static AuthorType fromCode(String code) {
        for (AuthorType type : values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid author type code: " + code);
    }
    
    /**
     * 유효한 코드인지 확인
     */
    public static boolean isValidCode(String code) {
        for (AuthorType type : values()) {
            if (type.code.equals(code)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * 관리자 권한 여부 확인
     */
    public boolean isAdmin() {
        return this == ADMIN;
    }
    
    /**
     * 일반 사용자 권한 여부 확인 (MEMBER, CARGO)
     */
    public boolean isRegularUser() {
        return this == MEMBER || this == CARGO;
    }
    
    /**
     * 게시글 수정 권한 확인
     * 
     * @param postAuthorId 게시글 작성자 ID
     * @param currentUserId 현재 사용자 ID
     * @return 수정 권한 여부
     */
    public boolean canModifyPost(String postAuthorId, String currentUserId) {
        // 관리자는 모든 글 수정 가능
        if (this.isAdmin()) {
            return true;
        }
        
        // 일반 사용자는 본인 글만 수정 가능
        return postAuthorId != null && postAuthorId.equals(currentUserId);
    }
    
    /**
     * 게시글 삭제 권한 확인
     * 
     * @param postAuthorId 게시글 작성자 ID
     * @param currentUserId 현재 사용자 ID
     * @return 삭제 권한 여부
     */
    public boolean canDeletePost(String postAuthorId, String currentUserId) {
        // 수정 권한과 동일한 로직
        return canModifyPost(postAuthorId, currentUserId);
    }
    
    /**
     * 관리자 답변 작성 권한 확인
     * 
     * @return 답변 작성 권한 여부
     */
    public boolean canCreateAdminResponse() {
        return this.isAdmin();
    }
    
    /**
     * 비공개 게시글 조회 권한 확인
     * 
     * @param postAuthorId 게시글 작성자 ID
     * @param currentUserId 현재 사용자 ID
     * @return 조회 권한 여부
     */
    public boolean canViewPrivatePost(String postAuthorId, String currentUserId) {
        // 관리자는 모든 비공개 글 조회 가능
        if (this.isAdmin()) {
            return true;
        }
        
        // 일반 사용자는 본인 비공개 글만 조회 가능
        return postAuthorId != null && postAuthorId.equals(currentUserId);
    }
    
    /**
     * 사용자 ID와 타입으로 AuthorType 판별
     * 
     * @param userId 사용자 ID
     * @param hasMemId memId 보유 여부
     * @param hasCargoId cargoId 보유 여부  
     * @param isAdmin 관리자 여부
     * @return 판별된 AuthorType
     */
    public static AuthorType determineAuthorType(String userId, boolean hasMemId, boolean hasCargoId, boolean isAdmin) {
        if (isAdmin) {
            return ADMIN;
        }
        
        // memId나 cargoId를 가지고 있으면 일반 회원으로 분류
        // 향후 필요시 CARGO와 MEMBER 구분 가능
        if (hasMemId || hasCargoId) {
            return MEMBER;
        }
        
        // 기본값은 MEMBER (안전장치)
        return MEMBER;
    }
}