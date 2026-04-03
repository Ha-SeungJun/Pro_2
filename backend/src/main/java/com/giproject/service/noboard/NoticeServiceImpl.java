package com.giproject.service.noboard;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.giproject.dto.noboard.NoticeDTO;
import com.giproject.dto.noboard.NoticePageResponseDTO;
import com.giproject.entity.noboard.Notice;
import com.giproject.enums.NoticeCategory;
import com.giproject.repository.noboard.NoticeRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

/**
 * NoticeService 구현체
 * 
 * 공지사항의 핵심 비즈니스 로직 처리
 * - 관리자 권한 기반 데이터 접근 제어
 * - Entity ↔ DTO 변환
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class NoticeServiceImpl implements NoticeService {

    private final NoticeRepository noticeRepository;

    @Transactional
    @Override
    public NoticeDTO createNotice(NoticeDTO.CreateRequest createRequest, String authorId, String authorName) {
        log.info("Creating new notice by admin: {}", authorId);
        
        // URL 인코딩된 관리자명 디코딩 처리
        try {
            authorName = java.net.URLDecoder.decode(authorName, "UTF-8");
        } catch (Exception e) {
            log.warn("Failed to decode author name: {}", authorName);
        }
        
        // 엔티티 생성
        Notice notice = Notice.builder()
                .title(createRequest.getTitle())
                .content(createRequest.getContent())
                .authorId(authorId)
                .authorName(authorName)
                .category(createRequest.getCategory() != null ? createRequest.getCategory() : NoticeCategory.GENERAL)
                .build();
        
        // 저장
        Notice savedNotice = noticeRepository.save(notice);
        log.info("Notice created successfully with ID: {}", savedNotice.getNoticeId());
        
        return convertToDTO(savedNotice);
    }

    @Transactional(readOnly = true)
    @Override
    public NoticePageResponseDTO<NoticeDTO.ListResponse> getNoticeList(String keyword, NoticeCategory category, Pageable pageable) {
        log.info("Getting notice list - keyword: {}, category: {}, pageable: {}", keyword, category, pageable);
        
        Page<Notice> noticePage;
        
        // 카테고리와 키워드 조건에 따른 조회
        if (category != null && keyword != null && !keyword.trim().isEmpty()) {
            // 카테고리 + 키워드 검색
            noticePage = noticeRepository.findByCategoryAndTitleContainingOrContentContainingOrderByCreatedAtDesc(
                    category, keyword.trim(), pageable);
        } else if (category != null) {
            // 카테고리별 조회
            noticePage = noticeRepository.findByCategoryOrderByCreatedAtDesc(category, pageable);
        } else if (keyword != null && !keyword.trim().isEmpty()) {
            // 키워드 검색
            noticePage = noticeRepository.findByTitleContainingOrContentContainingOrderByCreatedAtDesc(keyword.trim(), pageable);
        } else {
            // 전체 조회
            noticePage = noticeRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        
        // 전체 공지사항 수 (연속 번호 계산용)
        long totalNotices = noticeRepository.count();
        
        // DTO 변환 및 연속 번호 설정
        List<NoticeDTO.ListResponse> responseList = noticePage.getContent().stream()
                .map(notice -> {
                    NoticeDTO.ListResponse response = convertToListResponse(notice);
                    // 연속 번호 계산: 전체 공지사항 수 - (현재 페이지 * 페이지 크기 + 현재 인덱스)
                    int displayNumber = (int) (totalNotices - (noticePage.getNumber() * noticePage.getSize() + noticePage.getContent().indexOf(notice)));
                    response.setDisplayNumber(displayNumber);
                    return response;
                })
                .collect(Collectors.toList());
        
        return NoticePageResponseDTO.of(noticePage, responseList);
    }

    @Transactional
    @Override
    public NoticeDTO getNoticeDetail(Long noticeId) {
        log.info("Getting notice detail - noticeId: {}", noticeId);
        
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("공지사항을 찾을 수 없습니다: " + noticeId));
        
        // 조회수 증가
        notice.incrementViewCount();
        noticeRepository.save(notice); // 변경사항 저장
        
        return convertToDTO(notice);
    }

    @Transactional
    @Override
    public NoticeDTO updateNotice(Long noticeId, NoticeDTO.UpdateRequest updateRequest, String currentUserId, String authorName, boolean isAdmin) {
        log.info("=== NoticeService.updateNotice 시작 ===");
        log.info("파라미터 확인 - noticeId: {}, currentUserId: {}, authorName: '{}', isAdmin: {}", noticeId, currentUserId, authorName, isAdmin);
        log.info("updateRequest 내용 - title: '{}', content: '{}', category: {}", updateRequest.getTitle(), updateRequest.getContent(), updateRequest.getCategory());
        
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("공지사항을 찾을 수 없습니다: " + noticeId));
        
        // 권한 확인 (관리자 또는 작성자 본인)
        if (!isAdmin && !notice.getAuthorId().equals(currentUserId)) {
            throw new SecurityException("공지사항 수정 권한이 없습니다. 관리자이거나 작성자 본인이어야 합니다.");
        }
        
        log.info("수정 전 기존 데이터 - authorId: {}, authorName: '{}', category: {}", notice.getAuthorId(), notice.getAuthorName(), notice.getCategory());
        
        // 공지사항 업데이트 (제목, 내용, 작성자명, 카테고리 포함)
        log.info("updateNotice 메서드 호출 - title: '{}', content: '{}', authorName: '{}', category: {}", 
                updateRequest.getTitle(), updateRequest.getContent(), authorName, updateRequest.getCategory());
        notice.updateNotice(updateRequest.getTitle(), updateRequest.getContent(), authorName, 
                updateRequest.getCategory() != null ? updateRequest.getCategory() : notice.getCategory());
        
        log.info("수정 후 데이터 - authorId: {}, authorName: '{}', category: {}", notice.getAuthorId(), notice.getAuthorName(), notice.getCategory());
        
        Notice updatedNotice = noticeRepository.save(notice);
        log.info("Notice updated successfully: {}", noticeId);
        log.info("=== NoticeService.updateNotice 완료 ===");
        
        return convertToDTO(updatedNotice);
    }

    @Transactional
    @Override
    public void deleteNotice(Long noticeId, String currentUserId, boolean isAdmin) {
        log.info("Deleting notice - noticeId: {} by user: {}, isAdmin: {}", noticeId, currentUserId, isAdmin);
        
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("공지사항을 찾을 수 없습니다: " + noticeId));
        
        // 권한 확인 (관리자 또는 작성자 본인)
        if (!isAdmin && !notice.getAuthorId().equals(currentUserId)) {
            throw new SecurityException("공지사항 삭제 권한이 없습니다. 관리자이거나 작성자 본인이어야 합니다.");
        }
        
        try {
            noticeRepository.delete(notice);
            log.info("Notice deleted successfully: {}", noticeId);
        } catch (Exception e) {
            log.error("Error deleting notice {}: {}", noticeId, e.getMessage());
            throw new RuntimeException("공지사항 삭제 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    @Transactional
    @Override
    public void incrementViewCount(Long noticeId) {
        noticeRepository.findById(noticeId).ifPresent(notice -> {
            notice.incrementViewCount();
            noticeRepository.save(notice);
        });
    }
    
    /**
     * Entity → DTO 변환 (상세 정보)
     */
    private NoticeDTO convertToDTO(Notice notice) {
        return NoticeDTO.builder()
                .noticeId(notice.getNoticeId())
                .title(notice.getTitle())
                .content(notice.getContent())
                .authorId(notice.getAuthorId())
                .authorName(notice.getAuthorName())
                .createdAt(notice.getCreatedAt())
                .updatedAt(notice.getUpdatedAt())
                .viewCount(notice.getViewCount())
                .category(notice.getCategory())
                .build();
    }
    
    /**
     * Entity → ListResponse DTO 변환
     */
    private NoticeDTO.ListResponse convertToListResponse(Notice notice) {
        return NoticeDTO.ListResponse.builder()
                .noticeId(notice.getNoticeId())
                .title(notice.getTitle())
                .content(notice.getContent())
                .authorId(notice.getAuthorId())
                .authorName(notice.getAuthorName())
                .createdAt(notice.getCreatedAt())
                .viewCount(notice.getViewCount())
                .category(notice.getCategory())
                .build();
    }
}