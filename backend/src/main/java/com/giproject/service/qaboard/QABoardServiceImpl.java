package com.giproject.service.qaboard;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.giproject.dto.qaboard.AdminResponseDTO;
import com.giproject.dto.qaboard.PageResponseDTO;
import com.giproject.dto.qaboard.QAPostDTO;
import com.giproject.entity.qaboard.AdminResponse;
import com.giproject.entity.qaboard.AuthorType;
import com.giproject.entity.qaboard.QACategory;
import com.giproject.entity.qaboard.QAPost;
import com.giproject.repository.account.UserIndexRepository;
import com.giproject.repository.qaboard.AdminResponseRepository;
import com.giproject.repository.qaboard.QAPostRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

/**
 * QABoardService 구현체
 * 
 * QA게시판의 핵심 비즈니스 로직 처리
 * - 권한 기반 데이터 접근 제어
 * - Entity ↔ DTO 변환
 * - 비공개 게시글 처리
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class QABoardServiceImpl implements QABoardService {

    private final QAPostRepository qaPostRepository;
    private final AdminResponseRepository adminResponseRepository;
    private final UserIndexRepository userIndexRepo;
    @Override
    @Transactional
    public QAPostDTO createPost(QAPostDTO.CreateRequest createRequest, String authorId, String authorName) {
        log.info("Creating new post by user: {}", authorId);
        
        // URL 인코딩된 사용자명 디코딩 처리
        try {
            authorName = java.net.URLDecoder.decode(authorName, "UTF-8");
        } catch (Exception e) {
            log.warn("Failed to decode author name: {}", authorName);
        }
        
        // 카테고리 검증
        QACategory category;
        try {
            category = QACategory.fromCode(createRequest.getCategory());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("유효하지 않은 카테고리입니다: " + createRequest.getCategory());
        }
        
        // 사용자 유형 결정 (현재는 임시로 MEMBER로 설정)
        // TODO: JWT 토큰에서 실제 사용자 정보(memId, cargoId, admin)를 가져와서 동적 설정
        AuthorType authorType = determineAuthorType(authorId);
        
        // 엔티티 생성
        QAPost qaPost = QAPost.builder()
                .title(createRequest.getTitle())
                .content(createRequest.getContent())
                .category(category)
                .isPrivate(createRequest.getIsPrivate())
                .authorId(authorId)
                .authorName(authorName)
                .authorType(authorType)
                .build();
        
        // 저장
        QAPost savedPost = qaPostRepository.save(qaPost);
        log.info("Post created successfully with ID: {}", savedPost.getPostId());
        
        return convertToDTO(savedPost, null);
    }
    @Transactional
    @Override
    public PageResponseDTO<QAPostDTO.ListResponse> getPostList(String category, String keyword, 
                                                              Pageable pageable, boolean isAdmin, String currentUserId) {
        log.info("Getting post list - category: {}, keyword: {}, isAdmin: {}, currentUserId: {}", 
                 category, keyword, isAdmin, currentUserId);
        
        QACategory qaCategory = this.convertCategory(category);
        Page<QAPost> postPage;
        
        // 검색어와 카테고리 조합에 따른 쿼리 선택
        if (keyword != null && !keyword.trim().isEmpty()) {
            // 검색어가 있는 경우
            if (qaCategory != null) {
                // 카테고리 + 검색
                if (isAdmin) {
                    // 관리자는 모든 글을 검색할 수 있음 (비공개 글 포함)
                    postPage = qaPostRepository.searchAllPostsByCategory(qaCategory, keyword.trim(), pageable);
                } else {
                    // 일반 사용자: 공개 글만 검색 (보안상 비공개 글 내용은 검색 대상에서 제외)
                    postPage = qaPostRepository.searchPublicPostsByCategory(qaCategory, keyword.trim(), pageable);
                }
            } else {
                // 전체 검색
                if (isAdmin) {
                    // 관리자는 모든 글을 검색할 수 있음 (비공개 글 포함)
                    postPage = qaPostRepository.searchAllPosts(keyword.trim(), pageable);
                } else {
                    // 일반 사용자: 공개 글만 검색 (보안상 비공개 글 내용은 검색 대상에서 제외)
                    postPage = qaPostRepository.searchPublicPosts(keyword.trim(), pageable);
                }
            }
        } else {
            // 검색어가 없는 경우
            if (qaCategory != null) {
                // 카테고리별 조회
                if (isAdmin) {
                    // 관리자는 모든 글을 볼 수 있음
                    postPage = qaPostRepository.findByCategoryOrderByCreatedAtDesc(qaCategory, pageable);
                } else {
                    // 일반 사용자: 모든 글을 반환하되, 프론트엔드에서 권한에 따라 마스킹 처리
                    postPage = qaPostRepository.findByCategoryOrderByCreatedAtDesc(qaCategory, pageable);
                }
            } else {
                // 전체 조회
                if (isAdmin) {
                    // 관리자는 모든 글을 볼 수 있음
                    postPage = qaPostRepository.findAllByOrderByCreatedAtDesc(pageable);
                } else {
                    // 일반 사용자: 모든 글을 반환하되, 프론트엔드에서 권한에 따라 마스킹 처리
                    postPage = qaPostRepository.findAllByOrderByCreatedAtDesc(pageable);
                }
            }
        }
        
        // DTO 변환
        List<QAPostDTO.ListResponse> responseList = postPage.getContent().stream()
                .map(this::convertToListResponse)
                .collect(Collectors.toList());
        
        return PageResponseDTO.of(postPage, responseList);
    }
    @Transactional
    @Override
    public QAPostDTO getPostDetail(Long postId, String currentUserId, boolean isAdmin) {
        log.info("Getting post detail - postId: {}, userId: {}, isAdmin: {}", postId, currentUserId, isAdmin);
        
        // 게시글 조회 (AdminResponse와 함께)
        QAPost qaPost = qaPostRepository.findByIdWithResponse(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + postId));
        
        // 접근 권한 확인
        if (!canViewPost(qaPost, currentUserId, isAdmin)) {
            throw new SecurityException("게시글 조회 권한이 없습니다.");
        }
        
        // 관리자 답변 조회
        AdminResponse adminResponse = adminResponseRepository.findByQaPostPostId(postId).orElse(null);
        
        return convertToDTO(qaPost, adminResponse);
    }
    @Override
    @Transactional
    public QAPostDTO updatePost(Long postId, QAPostDTO.UpdateRequest updateRequest, 
                               String currentUserId, boolean isAdmin) {
        log.info("Updating post - postId: {}, userId: {}, isAdmin: {}", postId, currentUserId, isAdmin);
        
        // 게시글 조회
        QAPost qaPost = qaPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + postId));
        
        // 권한 확인
        if (!hasPostPermission(qaPost, currentUserId, isAdmin)) {
            throw new SecurityException("게시글 수정 권한이 없습니다.");
        }
        
        // 카테고리 검증
        QACategory category;
        try {
            category = QACategory.fromCode(updateRequest.getCategory());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("유효하지 않은 카테고리입니다: " + updateRequest.getCategory());
        }
        
        // 게시글 업데이트
        qaPost.updatePost(updateRequest.getTitle(), updateRequest.getContent(), 
                         category, updateRequest.getIsPrivate());
        
        QAPost updatedPost = qaPostRepository.save(qaPost);
        log.info("Post updated successfully: {}", postId);
        
        // 관리자 답변 조회
        AdminResponse adminResponse = adminResponseRepository.findByQaPostPostId(postId).orElse(null);
        
        return convertToDTO(updatedPost, adminResponse);
    }

    @Override
    @Transactional
    public void deletePost(Long postId, String currentUserId, boolean isAdmin) {
        log.info("Deleting post - postId: {}, userId: {}, isAdmin: {}", postId, currentUserId, isAdmin);
        
        // 게시글 조회
        QAPost qaPost = qaPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + postId));
        
        // 권한 확인
        if (!hasPostPermission(qaPost, currentUserId, isAdmin)) {
            throw new SecurityException("게시글 삭제 권한이 없습니다.");
        }
        
        try {
            // 관련 답변 먼저 삭제
            adminResponseRepository.deleteByQaPostPostId(postId);
            log.info("Admin responses deleted for post: {}", postId);
            
            // 게시글 삭제
            qaPostRepository.delete(qaPost);
            log.info("Post deleted successfully: {}", postId);
            
        } catch (Exception e) {
            log.error("Error deleting post {}: {}", postId, e.getMessage());
            throw new RuntimeException("게시글 삭제 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }
    @Transactional
    @Override
    public PageResponseDTO<QAPostDTO.ListResponse> getMyPosts(String authorId, Pageable pageable) {
        log.info("Getting my posts for user: {}", authorId);
        
        Page<QAPost> postPage = qaPostRepository.findByAuthorIdOrderByCreatedAtDesc(authorId, pageable);
        
        List<QAPostDTO.ListResponse> responseList = postPage.getContent().stream()
                .map(this::convertToListResponse)
                .collect(Collectors.toList());
        
        return PageResponseDTO.of(postPage, responseList);
    }
    @Override
    @Transactional
    public void incrementViewCount(Long postId) {
        qaPostRepository.findById(postId).ifPresent(post -> {
            post.incrementViewCount();
            qaPostRepository.save(post);
        });
    }
    @Transactional
    @Override
    public boolean hasPostPermission(Long postId, String currentUserId, boolean isAdmin) {
        if (isAdmin) {
            return true; // 관리자는 모든 권한
        }
        
        return qaPostRepository.existsByPostIdAndAuthorId(postId, currentUserId);
    }
    @Transactional
    @Override
    public boolean canViewPost(Long postId, String currentUserId, boolean isAdmin) {
        if (isAdmin) {
            return true; // 관리자는 모든 게시글 조회 가능
        }
        
        QAPost qaPost = qaPostRepository.findById(postId).orElse(null);
        if (qaPost == null) {
            return false;
        }
        
        return canViewPost(qaPost, currentUserId, isAdmin);
    }

    /**
     * 게시글 조회 권한 확인 (내부 메서드)
     */
    private boolean canViewPost(QAPost qaPost, String currentUserId, boolean isAdmin) {
        if (isAdmin) {
            return true; // 관리자는 모든 게시글 조회 가능
        }
        
        if (qaPost.isPublic()) {
            return true; // 공개 게시글은 누구나 조회 가능
        }
        
        // 비공개 게시글은 작성자만 조회 가능
        return qaPost.isAuthor(currentUserId);
    }

    /**
     * 게시글 수정/삭제 권한 확인 (내부 메서드)
     */
    private boolean hasPostPermission(QAPost qaPost, String currentUserId, boolean isAdmin) {
        if (isAdmin) {
            return true; // 관리자는 모든 권한
        }
        
        return qaPost.isAuthor(currentUserId); // 작성자만 수정/삭제 가능
    }

    /**
     * QAPost 엔티티를 QAPostDTO로 변환
     */
    private QAPostDTO convertToDTO(QAPost qaPost, AdminResponse adminResponse) {
        AdminResponseDTO adminResponseDTO = null;
        if (adminResponse != null) {
            adminResponseDTO = AdminResponseDTO.builder()
                    .responseId(adminResponse.getResponseId())
                    .content(adminResponse.getContent())
                    .adminId(adminResponse.getAdminId())
                    .adminName(adminResponse.getAdminName())
                    .createdAt(adminResponse.getCreatedAt())
                    .updatedAt(adminResponse.getUpdatedAt())
                    .build();
        }
        
        return QAPostDTO.builder()
                .postId(qaPost.getPostId())
                .title(qaPost.getTitle())
                .content(qaPost.getContent())
                .category(qaPost.getCategory().getCode())
                .isPrivate(qaPost.getIsPrivate())
                .authorId(qaPost.getAuthorId())
                .authorName(qaPost.getAuthorName())
                .authorType(qaPost.getAuthorType())
                .createdAt(qaPost.getCreatedAt())
                .updatedAt(qaPost.getUpdatedAt())
                .viewCount(qaPost.getViewCount())
                .hasResponse(adminResponse != null)
                .adminResponse(adminResponseDTO)
                .build();
    }

    /**
     * QAPost 엔티티를 목록용 ListResponse로 변환
     */
    private QAPostDTO.ListResponse convertToListResponse(QAPost qaPost) {
        // N+1 문제를 방지하기 위해 adminResponse가 이미 fetch join되었는지 확인
        AdminResponse adminResponse = qaPost.getAdminResponse();
        boolean hasResponse = adminResponse != null;
        
        // 관리자 답변 DTO 변환
        AdminResponseDTO adminResponseDTO = null;
        if (adminResponse != null) {
            adminResponseDTO = AdminResponseDTO.builder()
                    .responseId(adminResponse.getResponseId())
                    .content(adminResponse.getContent())
                    .adminId(adminResponse.getAdminId())
                    .adminName(adminResponse.getAdminName())
                    .createdAt(adminResponse.getCreatedAt())
                    .updatedAt(adminResponse.getUpdatedAt())
                    .build();
        }
        
        return QAPostDTO.ListResponse.builder()
                .postId(qaPost.getPostId())
                .title(qaPost.getTitle())
                .content(qaPost.getContent())
                .category(qaPost.getCategory().getCode())
                .isPrivate(qaPost.getIsPrivate())
                .authorId(qaPost.getAuthorId())
                .authorName(qaPost.getAuthorName())
                .authorType(qaPost.getAuthorType())
                .createdAt(qaPost.getCreatedAt())
                .viewCount(qaPost.getViewCount())
                .hasResponse(hasResponse)
                .adminResponse(adminResponseDTO)
                .build();
    }
    
    
    /**
     * 사용자 ID를 기반으로 AuthorType 결정
     * 
     * TODO: 실제 Member/Cargo/Admin 테이블과 연동하여 동적 판별
     * 현재는 간단한 규칙으로 임시 구현
     * 
     * @param authorId 사용자 ID
     * @return 결정된 AuthorType
     */
    private AuthorType determineAuthorType(String authorId) {
        if (authorId == null || authorId.trim().isEmpty()) {
            return AuthorType.MEMBER;
        }
        
        // 임시 판별 로직 (실제 구현 시 데이터베이스 조회로 변경)
        String lowerCaseId = authorId.toLowerCase();
        
        if (lowerCaseId.contains("admin") || lowerCaseId.startsWith("admin")) {
            return AuthorType.ADMIN;
        }
        
        if (lowerCaseId.contains("cargo") || lowerCaseId.startsWith("cargo")) {
            return AuthorType.CARGO;
        }
        
        // 기본값은 MEMBER
        return AuthorType.MEMBER;
    }
}