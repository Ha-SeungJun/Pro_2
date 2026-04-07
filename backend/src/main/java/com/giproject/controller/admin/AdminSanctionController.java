package com.giproject.controller.admin;

import com.giproject.dto.admin.UserSuspendDTO;
import com.giproject.service.admin.AdminSanctionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/g2i4/admin/sanctions")
@RequiredArgsConstructor
public class AdminSanctionController {

    private final AdminSanctionService adminSanctionService;

    /**
     * 관리자 계정 정지
     * 예:
     * POST /g2i4/admin/sanctions/seojuwon19/suspend
     */
    @PostMapping("/{loginId}/suspend")
    public ResponseEntity<UserSuspendDTO.SuspendResponse> suspendUser(
            @PathVariable("loginId") String loginId,
            @RequestBody UserSuspendDTO.SuspendRequest request
    ) {
        return ResponseEntity.ok(adminSanctionService.suspendUser(loginId, request));
    }

    /**
     * 관리자 계정 정지 해제
     * 예:
     * POST /g2i4/admin/sanctions/seojuwon19/unsuspend
     */
    @PostMapping("/{loginId}/unsuspend")
    public ResponseEntity<UserSuspendDTO.SuspendResponse> unsuspendUser(
            @PathVariable("loginId") String loginId
    ) {
        return ResponseEntity.ok(adminSanctionService.unsuspendUser(loginId));
    }
}