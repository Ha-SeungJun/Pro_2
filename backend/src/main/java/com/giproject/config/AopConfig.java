package com.giproject.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

/**
 * AOP 설정 클래스
 * 
 * Spring AOP를 활성화하고 @Aspect 어노테이션이 있는 클래스들을 자동으로 등록
 * - @RequirePermission 어노테이션 기반 권한 검증 AOP 활성화
 */
@Configuration
@EnableAspectJAutoProxy
public class AopConfig {
    // AOP 활성화를 위한 설정 클래스
    // 추가 설정이 필요한 경우 여기에 Bean 정의
}