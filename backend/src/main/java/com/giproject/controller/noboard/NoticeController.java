package com.giproject.controller.noboard;

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
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.giproject.dto.noboard.NoticeDTO;
import com.giproject.dto.noboard.NoticePageResponseDTO;
import com.giproject.enums.NoticeCategory;
import com.giproject.service.noboard.NoticeService;
import com.giproject.utils.JwtTokenUtils;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

/**
 * Notice REST API 컨트롤러
 * 
 * 공지사항의 모든 API 엔드포인트 제공
 * - 게시글 CRUD
 * - 페이지네이션 및 검색
 * 
 * JWT 토큰 기반 인증 적용 완료
 * - Authorization: Bearer {token} 헤더에서 사용자 정보 추출
 * - sub: authorId, roles: 권한 배열
 * - Admin 권한 검증 (공지사항은 관리자만 작성/수정/삭제 가능)
 */
@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
@Log4j2
public class NoticeController {

    private final NoticeService noticeService;
    private final JwtTokenUtils jwtTokenUtils;

    /**
     * 공지사항 목록 조회
     * 
     * @param keyword 검색어 (선택)
     * @param category 카테고리 (선택)
     * @param page 페이지 번호 (0부터 시작, 기본값: 0)
     * @param size 페이지 크기 (기본값: 10)
     * @return 페이지네이션된 공지사항 목록
     */
    @GetMapping
    public ResponseEntity<NoticePageResponseDTO<NoticeDTO.ListResponse>> getNoticeList(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "category", required = false) NoticeCategory category,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        
        log.info("GET /api/notices - keyword: {}, category: {}, page: {}, size: {}", keyword, category, page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        NoticePageResponseDTO<NoticeDTO.ListResponse> response = 
                noticeService.getNoticeList(keyword, category, pageable);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 공지사항 카테고리 목록 조회
     * 
     * @return 모든 공지사항 카테고리 목록
     */
    @GetMapping("/categories")
    public ResponseEntity<List<Map<String, String>>> getNoticeCategories() {
        log.info("GET /api/notices/categories");
        
        List<Map<String, String>> categories = java.util.Arrays.stream(NoticeCategory.values())
                .map(category -> Map.of(
                    "value", category.name(),
                    "displayName", category.getDisplayName(),
                    "description", category.getDescription()
                ))
                .collect(java.util.stream.Collectors.toList());
        
        return ResponseEntity.ok(categories);
    }

    /**
     * 공지사항 상세 조회
     * 
     * @param noticeId 공지사항 ID
     * @return 공지사항 상세 정보
     */
    @GetMapping("/{noticeId}")
    public ResponseEntity<NoticeDTO> getNoticeDetail(@PathVariable("noticeId") Long noticeId) {
        log.info("GET /api/notices/{}", noticeId);
        
        NoticeDTO response = noticeService.getNoticeDetail(noticeId);
        return ResponseEntity.ok(response);
    }

    /**
     * 공지사항 작성 (관리자 전용)
     * 
     * @param createRequest 공지사항 작성 요청 데이터
     * @param request HTTP 요청 객체 (JWT 토큰 추출용)
     * @return 생성된 공지사항 정보
     */
    @PostMapping
    public ResponseEntity<NoticeDTO> createNotice(@Valid @RequestBody NoticeDTO.CreateRequest createRequest,
                                               HttpServletRequest request) {
        
        log.info("POST /api/notices - title: {}", createRequest.getTitle());
        
        // JWT 토큰에서 사용자 정보 추출 및 관리자 권한 확인
        JwtTokenUtils.UserInfo userInfo = jwtTokenUtils.getUserInfoFromRequest(request);
        if (userInfo == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }
        
        if (!userInfo.isAdmin()) {
            throw new SecurityException("공지사항 작성 권한이 없습니다. 관리자만 작성 가능합니다.");
        }
        
        String authorId = userInfo.getAuthorId();
        // 프론트엔드에서 입력한 작성자명을 사용 (기본값: authorId)
        String authorName = (createRequest.getAuthor() != null && !createRequest.getAuthor().trim().isEmpty()) 
                            ? createRequest.getAuthor().trim() : authorId;
        
        log.info("JWT에서 추출된 관리자 정보 - authorId: {}, authorName: {}", authorId, authorName);

        NoticeDTO response = noticeService.createNotice(createRequest, authorId, authorName);
        return ResponseEntity.ok(response);
    }

    /**
     * 공지사항 수정 (관리자 전용)
     * 
     * @param noticeId 공지사항 ID
     * @param updateRequest 공지사항 수정 요청 데이터
     * @param request HTTP 요청 객체 (JWT 토큰 추출용)
     * @return 수정된 공지사항 정보
     */
    @PutMapping("/{noticeId}")
    public ResponseEntity<NoticeDTO> updateNotice(@PathVariable("noticeId") Long noticeId,
                                               @Valid @RequestBody NoticeDTO.UpdateRequest updateRequest,
                                               HttpServletRequest request) {
        
        log.info("PUT /api/notices/{}", noticeId);
        
        // JWT 토큰에서 사용자 정보 추출 (권한 확인은 Service에서 수행)
        JwtTokenUtils.UserInfo userInfo = jwtTokenUtils.getUserInfoFromRequest(request);
        if (userInfo == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }
        
        String userId = userInfo.getAuthorId();
        boolean isAdmin = userInfo.isAdmin();
        // 프론트엔드에서 입력한 작성자명을 사용 (기본값: userId)
        String authorName = (updateRequest.getAuthor() != null && !updateRequest.getAuthor().trim().isEmpty()) 
                            ? updateRequest.getAuthor().trim() : userId;
        
        log.info("JWT에서 추출된 사용자 정보 - userId: {}, authorName: {}, isAdmin: {}", userId, authorName, isAdmin);

        NoticeDTO response = noticeService.updateNotice(noticeId, updateRequest, userId, authorName, isAdmin);
        return ResponseEntity.ok(response);
    }

    /**
     * 공지사항 삭제 (관리자 전용)
     * 
     * @param noticeId 공지사항 ID
     * @param request HTTP 요청 객체 (JWT 토큰 추출용)
     * @return 성공 메시지
     */
    @DeleteMapping("/{noticeId}")
    public ResponseEntity<Map<String, String>> deleteNotice(@PathVariable("noticeId") Long noticeId,
                                                         HttpServletRequest request) {
        
        log.info("DELETE /api/notices/{}", noticeId);
        
        // JWT 토큰에서 사용자 정보 추출 (권한 확인은 Service에서 수행)
        JwtTokenUtils.UserInfo userInfo = jwtTokenUtils.getUserInfoFromRequest(request);
        if (userInfo == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }
        
        String userId = userInfo.getAuthorId();
        boolean isAdmin = userInfo.isAdmin();
        
        log.info("JWT에서 추출된 사용자 정보 - userId: {}, isAdmin: {}", userId, isAdmin);

        noticeService.deleteNotice(noticeId, userId, isAdmin);
        
        return ResponseEntity.ok(Map.of("message", "공지사항이 성공적으로 삭제되었습니다."));
    }
}