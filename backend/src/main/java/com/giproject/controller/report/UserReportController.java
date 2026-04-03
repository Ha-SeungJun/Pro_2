package com.giproject.controller.report;

import com.giproject.dto.report.UserReportDTO;
import com.giproject.service.report.UserReportService;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/g2i4/admin/reports")
public class UserReportController {

    private final UserReportService service;

    @GetMapping("/unread-count")//사이드바 뱃지 미확인 개수
    public ResponseEntity<Long> unreadCount() {
        return ResponseEntity.ok(service.countUnread());
    }

    //신고목록 조회
    @GetMapping
    public ResponseEntity<Page<UserReportDTO>> list(
            @RequestParam(name = "unreadOnly", required = false) Boolean unreadOnly,
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "searchType", required = false) String searchType,
            Pageable pageable
    ) {
        return ResponseEntity.ok(service.list(unreadOnly, keyword, searchType, pageable));
    }
    
    @PutMapping("/{id}/read")
    public ResponseEntity<UserReportDTO> markRead(
            @PathVariable(name = "id") Long id,
            @RequestParam("read") boolean read
    ) { System.out.println("--------------------------------읽음");
        return ResponseEntity.ok(service.markRead(id, read));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<UserReportDTO> markReadPost(
            @PathVariable Long id,
            @RequestParam("read") boolean read
    ) {
        return ResponseEntity.ok(service.markRead(id, read));
    }

    @Getter
    @Setter
    public static class MarkReadRequest {
        private Boolean read;
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Integer> markAllRead() {
        return ResponseEntity.ok(service.markAllRead());
    }
    
    // 새로우 신고
    @PostMapping("/reportcreate")
    public ResponseEntity<UserReportDTO> create(@RequestBody UserReportDTO dto) {
    	System.out.println(dto.getContent());
    	System.out.println(dto.getReporterId());
    	System.out.println(dto.getTargetId());
        return ResponseEntity.ok(service.create(dto));
    }
    
    @PostMapping("/userreport")
    public ResponseEntity<UserReportDTO> reportUser(@RequestBody Long deNo){
    	return ResponseEntity.ok(service.reportUser(deNo));
    }
}
