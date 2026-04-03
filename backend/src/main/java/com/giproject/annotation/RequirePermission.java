package com.giproject.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 권한 검증을 위한 어노테이션
 * 
 * 메서드 레벨에서 사용하여 JWT 토큰 기반 권한 검증을 수행
 * - Admin 권한 필요 여부
 * - 작성자 본인 확인 필요 여부
 * - 로그인 필수 여부
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequirePermission {
    
    /**
     * 관리자 권한 필요 여부
     * true: 관리자만 접근 가능
     * false: 관리자가 아니어도 접근 가능 (기본값)
     */
    boolean requireAdmin() default false;
    
    /**
     * 작성자 본인 확인 필요 여부
     * true: 본인이거나 관리자만 접근 가능
     * false: 본인 확인 불필요 (기본값)
     */
    boolean requireAuthor() default false;
    
    /**
     * 로그인 필수 여부
     * true: 로그인 필수 (기본값)
     * false: 로그인 불필요
     */
    boolean requireLogin() default true;
    
    /**
     * 작성자 ID를 추출할 파라미터 이름
     * requireAuthor가 true일 때 사용
     * 해당 파라미터에서 authorId를 추출하여 권한 검증에 사용
     * 
     * 예: "postId" -> 해당 게시글의 작성자와 현재 사용자 비교
     */
    String authorParam() default "";
    
    /**
     * 권한 없을 때 반환할 에러 메시지
     */
    String message() default "권한이 없습니다.";
    
    /**
     * 권한 검증 타입
     * ADMIN_ONLY: 관리자만 가능
     * AUTHOR_OR_ADMIN: 작성자 본인이거나 관리자
     * LOGIN_REQUIRED: 로그인만 필요
     * PUBLIC: 권한 검증 없음
     */
    PermissionType value() default PermissionType.LOGIN_REQUIRED;
    
    public enum PermissionType {
        /**
         * 관리자만 접근 가능
         */
        ADMIN_ONLY,
        
        /**
         * 작성자 본인이거나 관리자만 접근 가능
         */
        AUTHOR_OR_ADMIN,
        
        /**
         * 로그인한 사용자만 접근 가능
         */
        LOGIN_REQUIRED,
        
        /**
         * 권한 검증 없음 (공개 접근)
         */
        PUBLIC
    }
}