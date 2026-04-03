package com.giproject.aop;

import com.giproject.annotation.RequirePermission;
import com.giproject.utils.JwtTokenUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;

/**
 * JWT 기반 권한 검증 AOP
 * 
 * @RequirePermission 어노테이션이 있는 메서드의 권한을 검증
 * - JWT 토큰에서 사용자 정보 추출
 * - Admin 권한 검증
 * - 작성자 본인 검증
 * - 로그인 상태 검증
 */
@Aspect
@Component
@RequiredArgsConstructor
@Log4j2
public class PermissionAspect {

    private final JwtTokenUtils jwtTokenUtils;

    /**
     * @RequirePermission 어노테이션이 있는 메서드 실행 전 권한 검증
     */
    @Before("@annotation(requirePermission)")
    public void checkPermission(JoinPoint joinPoint, RequirePermission requirePermission) {
        log.debug("권한 검증 시작 - 메서드: {}", joinPoint.getSignature().getName());

        // HTTP 요청 객체 가져오기
        HttpServletRequest request = getCurrentRequest();
        if (request == null) {
            log.warn("HTTP 요청 객체를 찾을 수 없습니다.");
            throw new AccessDeniedException("요청 정보를 찾을 수 없습니다.");
        }

        // JWT 토큰에서 사용자 정보 추출
        JwtTokenUtils.UserInfo userInfo = jwtTokenUtils.getUserInfoFromRequest(request);
        
        // 권한 타입에 따른 검증
        switch (requirePermission.value()) {
            case PUBLIC:
                // 공개 접근 - 검증 불필요
                log.debug("공개 접근 - 권한 검증 통과");
                return;
                
            case LOGIN_REQUIRED:
                // 로그인 필수
                if (userInfo == null) {
                    log.warn("로그인이 필요한 요청 - 토큰 없음");
                    throw new AccessDeniedException("로그인이 필요합니다.");
                }
                log.debug("로그인 검증 통과 - userId: {}", userInfo.getAuthorId());
                break;
                
            case ADMIN_ONLY:
                // 관리자 전용
                if (userInfo == null) {
                    log.warn("관리자 전용 요청 - 토큰 없음");
                    throw new AccessDeniedException("로그인이 필요합니다.");
                }
                if (!userInfo.isAdmin()) {
                    log.warn("관리자 전용 요청 - 권한 없음, userId: {}", userInfo.getAuthorId());
                    throw new AccessDeniedException(requirePermission.message().isEmpty() ? 
                            "관리자 권한이 필요합니다." : requirePermission.message());
                }
                log.debug("관리자 권한 검증 통과 - userId: {}", userInfo.getAuthorId());
                break;
                
            case AUTHOR_OR_ADMIN:
                // 작성자 본인이거나 관리자
                if (userInfo == null) {
                    log.warn("작성자/관리자 전용 요청 - 토큰 없음");
                    throw new AccessDeniedException("로그인이 필요합니다.");
                }
                
                // 관리자면 통과
                if (userInfo.isAdmin()) {
                    log.debug("관리자 권한으로 검증 통과 - userId: {}", userInfo.getAuthorId());
                    break;
                }
                
                // 작성자 본인 확인
                String targetAuthorId = extractAuthorId(joinPoint, requirePermission);
                if (targetAuthorId == null) {
                    log.warn("작성자 ID를 추출할 수 없습니다.");
                    throw new AccessDeniedException("권한 검증에 실패했습니다.");
                }
                
                if (!userInfo.getAuthorId().equals(targetAuthorId)) {
                    log.warn("작성자 본인 확인 실패 - 현재 사용자: {}, 대상 작성자: {}", 
                            userInfo.getAuthorId(), targetAuthorId);
                    throw new AccessDeniedException(requirePermission.message().isEmpty() ? 
                            "작성자 본인이거나 관리자만 접근할 수 있습니다." : requirePermission.message());
                }
                log.debug("작성자 본인 확인 통과 - userId: {}", userInfo.getAuthorId());
                break;
                
            default:
                log.warn("알 수 없는 권한 타입: {}", requirePermission.value());
                throw new AccessDeniedException("권한 검증에 실패했습니다.");
        }
        
        log.debug("권한 검증 완료 - 메서드: {}", joinPoint.getSignature().getName());
    }

    /**
     * 현재 HTTP 요청 객체 가져오기
     */
    private HttpServletRequest getCurrentRequest() {
        ServletRequestAttributes attributes = 
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }

    /**
     * 메서드 파라미터에서 작성자 ID 추출
     * TODO: 실제 구현에서는 Repository를 통해 데이터에서 작성자 ID를 조회해야 함
     */
    private String extractAuthorId(JoinPoint joinPoint, RequirePermission requirePermission) {
        String authorParam = requirePermission.authorParam();
        if (authorParam.isEmpty()) {
            log.warn("authorParam이 지정되지 않았습니다.");
            return null;
        }

        // 메서드 정보 가져오기
        Method method = getMethod(joinPoint);
        if (method == null) {
            log.warn("메서드 정보를 가져올 수 없습니다.");
            return null;
        }

        // 파라미터에서 해당 값 찾기
        Parameter[] parameters = method.getParameters();
        Object[] args = joinPoint.getArgs();

        for (int i = 0; i < parameters.length; i++) {
            if (parameters[i].getName().equals(authorParam)) {
                Object value = args[i];
                if (value != null) {
                    // TODO: 실제로는 이 ID를 사용해서 DB에서 작성자 정보를 조회해야 함
                    // 현재는 임시로 파라미터 값을 그대로 반환
                    log.debug("작성자 파라미터 추출: {} = {}", authorParam, value);
                    return value.toString();
                }
            }
        }

        log.warn("작성자 파라미터를 찾을 수 없습니다: {}", authorParam);
        return null;
    }

    /**
     * JoinPoint에서 Method 객체 추출
     */
    private Method getMethod(JoinPoint joinPoint) {
        try {
            String methodName = joinPoint.getSignature().getName();
            Class<?> targetClass = joinPoint.getTarget().getClass();
            Object[] args = joinPoint.getArgs();
            
            // 파라미터 타입 배열 생성
            Class<?>[] paramTypes = new Class[args.length];
            for (int i = 0; i < args.length; i++) {
                if (args[i] != null) {
                    paramTypes[i] = args[i].getClass();
                } else {
                    // null인 경우 처리 - 실제 메서드에서 파라미터 타입 정보를 가져와야 함
                    return null;
                }
            }
            
            return targetClass.getMethod(methodName, paramTypes);
        } catch (Exception e) {
            log.warn("메서드 정보 추출 실패", e);
            return null;
        }
    }
}