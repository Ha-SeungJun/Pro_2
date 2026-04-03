package com.giproject.controller.qaboard;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.giproject.dto.qaboard.AdminResponseDTO;
import com.giproject.dto.qaboard.PageResponseDTO;
import com.giproject.dto.qaboard.QAPostDTO;
import com.giproject.service.qaboard.AdminResponseService;
import com.giproject.service.qaboard.QABoardService;
import com.giproject.service.qaboard.QACategoryService;
import com.giproject.utils.JwtTokenUtils;
import com.giproject.annotation.RequirePermission;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

/**
 * QABoard REST API 컨트롤러
 * 
 * QA게시판의 모든 API 엔드포인트 제공
 * - 게시글 CRUD
 * - 관리자 답변 관리
 * - 카테고리 조회
 * - 페이지네이션 및 검색
 * 
 * JWT 토큰 기반 인증 적용 완료
 * - Authorization: Bearer {token} 헤더에서 사용자 정보 추출
 * - sub: authorId, roles: 권한 배열
 * - Admin 권한 또는 작성자 본인인지 검증
 */
@RestController
@RequestMapping("/api/qaboard")
@RequiredArgsConstructor
@Log4j2
public class QABoardController {

    private final QABoardService qaBoardService;
    private final AdminResponseService adminResponseService;
    private final QACategoryService qaCategoryService;
    private final JwtTokenUtils jwtTokenUtils;

    /**
     * 게시글 목록 조회
     * 
     * @param category 카테고리 필터 (선택)
     * @param keyword 검색어 (선택)
     * @param page 페이지 번호 (0부터 시작, 기본값: 0)
     * @param size 페이지 크기 (기본값: 10)
     * @param request HTTP 요청 객체 (JWT 토큰 추출용)
     * @return 페이지네이션된 게시글 목록
     */
    @GetMapping("/posts")
    public ResponseEntity<PageResponseDTO<QAPostDTO.ListResponse>> getPostList(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            HttpServletRequest request) {
        
        log.info("GET /api/qaboard/posts - category: {}, keyword: {}, page: {}, size: {}", 
                 category, keyword, page, size);
        
        // JWT 토큰에서 사용자 정보 추출
        JwtTokenUtils.UserInfo userInfo = jwtTokenUtils.getUserInfoFromRequest(request);
        String userId = userInfo != null ? userInfo.getAuthorId() : "anonymous";
        boolean isAdmin = userInfo != null && userInfo.isAdmin();
        
        log.info("JWT에서 추출된 사용자 정보 - userId: {}, isAdmin: {}", userId, isAdmin);
        
        Pageable pageable = PageRequest.of(page, size);
        PageResponseDTO<QAPostDTO.ListResponse> response = 
                qaBoardService.getPostList(category, keyword, pageable, isAdmin, userId);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 게시글 상세 조회
     * 
     * @param postId 게시글 ID
     * @param request HTTP 요청 객체 (JWT 토큰 추출용)
     * @return 게시글 상세 정보
     */
    @GetMapping("/posts/{postId}")
    public ResponseEntity<QAPostDTO> getPostDetail(@PathVariable("postId") Long postId,
                                                  HttpServletRequest request) {
        
        log.info("GET /api/qaboard/posts/{}", postId);
        
        // JWT 토큰에서 사용자 정보 추출
        JwtTokenUtils.UserInfo userInfo = jwtTokenUtils.getUserInfoFromRequest(request);
        String currentUserId = userInfo != null ? userInfo.getAuthorId() : "anonymous";
        boolean isAdmin = userInfo != null && userInfo.isAdmin();
        
        log.info("JWT에서 추출된 사용자 정보 - userId: {}, isAdmin: {}", currentUserId, isAdmin);
        
        // 조회수 증가
        qaBoardService.incrementViewCount(postId);
        
        QAPostDTO response = qaBoardService.getPostDetail(postId, currentUserId, isAdmin);
        return ResponseEntity.ok(response);
    }

    /**
     * 게시글 작성 (로그인 없이도 가능)
     * 
     * @param createRequest 게시글 작성 요청 데이터
     * @param request HTTP 요청 객체 (JWT 토큰 추출용, 선택적)
     * @return 생성된 게시글 정보
     */
    @PostMapping("/posts")
    public ResponseEntity<QAPostDTO> createPost(@Valid @RequestBody QAPostDTO.CreateRequest createRequest,
                                               HttpServletRequest request) {
        
        log.info("POST /api/qaboard/posts - title: {}", createRequest.getTitle());
        
        try {
            // Authorization 헤더 확인
            String authHeader = request.getHeader("Authorization");
            log.info("Authorization 헤더: {}", authHeader != null ? "Bearer " + authHeader.substring(0, Math.min(20, authHeader.length())) + "..." : "없음");
            
            // JWT 토큰에서 사용자 정보 추출 (로그인 선택적)
            JwtTokenUtils.UserInfo userInfo = jwtTokenUtils.getUserInfoFromRequest(request);
            
            String authorId;
            String authorName;
            
            if (userInfo == null || userInfo.getAuthorId() == null || userInfo.getAuthorId().trim().isEmpty()) {
                // 비로그인 사용자의 경우 익명으로 처리
                authorId = "anonymous";
                authorName = "익명";
                log.info("비로그인 사용자의 문의 작성 - 익명으로 처리");
            } else {
                // 로그인 사용자의 경우 JWT에서 정보 추출
                authorId = userInfo.getAuthorId();
                authorName = authorId; // 실제로는 사용자 서비스에서 조회해야 함
                log.info("로그인 사용자의 문의 작성 - authorId: {}, authorName: {}, isAdmin: {}", 
                         authorId, authorName, userInfo.isAdmin());
            }
            
            QAPostDTO response = qaBoardService.createPost(createRequest, authorId, authorName);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("QA 게시글 작성 중 오류 발생", e);
            throw new RuntimeException("게시글 작성에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * 게시글 수정
     * 
     * @param postId 게시글 ID
     * @param updateRequest 게시글 수정 요청 데이터
     * @param request HTTP 요청 객체 (JWT 토큰 추출용)
     * @return 수정된 게시글 정보
     */
    @PutMapping("/posts/{postId}")
    public ResponseEntity<QAPostDTO> updatePost(@PathVariable("postId") Long postId,
                                               @Valid @RequestBody QAPostDTO.UpdateRequest updateRequest,
                                               HttpServletRequest request) {
        
        // 상세한 요청 데이터 로깅 (디버깅용)
        log.info("PUT /api/qaboard/posts/{} - Request Details:", postId);
        log.info("  - Title: '{}' (length: {})", updateRequest.getTitle(), updateRequest.getTitle() != null ? updateRequest.getTitle().length() : "null");
        log.info("  - Content: '{}' (length: {})", updateRequest.getContent() != null ? updateRequest.getContent().substring(0, Math.min(50, updateRequest.getContent().length())) + "..." : "null", updateRequest.getContent() != null ? updateRequest.getContent().length() : "null");
        log.info("  - Category: '{}'", updateRequest.getCategory());
        log.info("  - IsPrivate: {}", updateRequest.getIsPrivate());
        
        // JWT 토큰에서 사용자 정보 추출
        JwtTokenUtils.UserInfo userInfo = jwtTokenUtils.getUserInfoFromRequest(request);
        if (userInfo == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }
        
        String userId = userInfo.getAuthorId();
        boolean isAdmin = userInfo.isAdmin();
        
        log.info("JWT에서 추출된 사용자 정보 - userId: {}, isAdmin: {}", userId, isAdmin);
        
        QAPostDTO response = qaBoardService.updatePost(postId, updateRequest, userId, isAdmin);
        return ResponseEntity.ok(response);
    }

    /**
     * 게시글 삭제
     * 
     * @param postId 게시글 ID
     * @param request HTTP 요청 객체 (JWT 토큰 추출용)
     * @return 성공 메시지
     */
    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Map<String, String>> deletePost(@PathVariable("postId") Long postId,
                                                         HttpServletRequest request) {
        
        log.info("DELETE /api/qaboard/posts/{}", postId);
        
        // JWT 토큰에서 사용자 정보 추출
        JwtTokenUtils.UserInfo userInfo = jwtTokenUtils.getUserInfoFromRequest(request);
        if (userInfo == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }
        
        String userId = userInfo.getAuthorId();
        boolean isAdmin = userInfo.isAdmin();
        
        log.info("JWT에서 추출된 사용자 정보 - userId: {}, isAdmin: {}", userId, isAdmin);
        
        qaBoardService.deletePost(postId, userId, isAdmin);
        
        return ResponseEntity.ok(Map.of("message", "게시글이 성공적으로 삭제되었습니다."));
    }

    /**
     * 내가 작성한 게시글 조회 (마이페이지용)
     * 
     * @param page 페이지 번호
     * @param size 페이지 크기
     * @param request HTTP 요청 객체 (JWT 토큰 추출용)
     * @return 내 게시글 목록
     */
    @GetMapping("/posts/my")
    public ResponseEntity<PageResponseDTO<QAPostDTO.ListResponse>> getMyPosts(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            HttpServletRequest request) {
        
        log.info("GET /api/qaboard/posts/my - page: {}, size: {}", page, size);
        
        // JWT 토큰에서 사용자 정보 추출
        JwtTokenUtils.UserInfo userInfo = jwtTokenUtils.getUserInfoFromRequest(request);
        if (userInfo == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }
        
        String userId = userInfo.getAuthorId();
        
        log.info("JWT에서 추출된 사용자 ID: {}", userId);
        
        Pageable pageable = PageRequest.of(page, size);
        PageResponseDTO<QAPostDTO.ListResponse> response = qaBoardService.getMyPosts(userId, pageable);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 관리자 답변 작성
     * 
     * @param postId 게시글 ID
     * @param createRequest 답변 작성 요청 데이터
     * @param request HTTP 요청 객체 (JWT 토큰 추출용)
     * @return 생성된 답변 정보
     */
    @RequirePermission(RequirePermission.PermissionType.ADMIN_ONLY)
    @PostMapping("/posts/{postId}/response")
    public ResponseEntity<AdminResponseDTO> createAdminResponse(@PathVariable("postId") Long postId,
                                                               @Valid @RequestBody AdminResponseDTO.CreateRequest createRequest,
                                                               HttpServletRequest request) {
        
        log.info("POST /api/qaboard/posts/{}/response", postId);
        
        // AOP에서 권한 검증 완료, 사용자 정보만 추출
        JwtTokenUtils.UserInfo userInfo = jwtTokenUtils.getUserInfoFromRequest(request);
        String userId = userInfo.getAuthorId();
        String userName = userId; // TODO: 사용자 서비스에서 실제 이름 조회
        
        log.info("관리자 답변 작성 - userId: {}, userName: {}", userId, userName);
        
        AdminResponseDTO response = adminResponseService.createResponse(postId, createRequest, userId, userName);
        return ResponseEntity.ok(response);
    }

    /**
     * 관리자 답변 조회
     * 
     * @param postId 게시글 ID
     * @return 답변 정보
     */
    @GetMapping("/posts/{postId}/response")
    public ResponseEntity<AdminResponseDTO> getAdminResponse(@PathVariable("postId") Long postId) {
        log.info("GET /api/qaboard/posts/{}/response", postId);
        
        AdminResponseDTO response = adminResponseService.getResponse(postId);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * 관리자 답변 수정
     * 
     * @param postId 게시글 ID
     * @param updateRequest 답변 수정 요청 데이터
     * @param request HTTP 요청 객체 (JWT 토큰 추출용)
     * @return 수정된 답변 정보
     */
    @PutMapping("/posts/{postId}/response")
    public ResponseEntity<AdminResponseDTO> updateAdminResponse(@PathVariable("postId") Long postId,
                                                               @Valid @RequestBody AdminResponseDTO.UpdateRequest updateRequest,
                                                               HttpServletRequest request) {
        
        log.info("PUT /api/qaboard/posts/{}/response", postId);
        
        // JWT 토큰에서 사용자 정보 추출 및 관리자 권한 확인
        JwtTokenUtils.UserInfo userInfo = jwtTokenUtils.getUserInfoFromRequest(request);
        if (userInfo == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }
        
        if (!userInfo.isAdmin()) {
            throw new RuntimeException("관리자 권한이 필요합니다.");
        }
        
        String userId = userInfo.getAuthorId();
        
        log.info("JWT에서 추출된 관리자 ID: {}", userId);
        
        AdminResponseDTO response = adminResponseService.updateResponse(postId, updateRequest, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 관리자 답변 삭제
     * 
     * @param postId 게시글 ID
     * @param request HTTP 요청 객체 (JWT 토큰 추출용)
     * @return 성공 메시지
     */
    @DeleteMapping("/posts/{postId}/response")
    public ResponseEntity<Map<String, String>> deleteAdminResponse(@PathVariable("postId") Long postId,
                                                                  HttpServletRequest request) {
        
        log.info("DELETE /api/qaboard/posts/{}/response", postId);
        
        // JWT 토큰에서 사용자 정보 추출 및 관리자 권한 확인
        JwtTokenUtils.UserInfo userInfo = jwtTokenUtils.getUserInfoFromRequest(request);
        if (userInfo == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }
        
        if (!userInfo.isAdmin()) {
            throw new RuntimeException("관리자 권한이 필요합니다.");
        }
        
        String userId = userInfo.getAuthorId();
        
        log.info("JWT에서 추출된 관리자 ID: {}", userId);
        
        adminResponseService.deleteResponse(postId, userId);
        
        return ResponseEntity.ok(Map.of("message", "답변이 성공적으로 삭제되었습니다."));
    }

    /**
     * 카테고리 목록 조회
     * 
     * @return 카테고리 목록
     */
    @GetMapping("/categories")
    public ResponseEntity<List<Map<String, String>>> getCategories() {
        log.info("GET /api/qaboard/categories");
        
        List<Map<String, String>> categories = qaCategoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    /**
     * 전역 예외 처리
     * TODO: 별도의 @ControllerAdvice 클래스로 분리 예정
     */
    // @ExceptionHandler 메서드들은 별도 클래스로 분리할 예정
}