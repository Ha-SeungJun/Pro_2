package com.giproject.service.admin;

import com.giproject.dto.admin.UserSuspendDTO;

public interface AdminSanctionService {

    UserSuspendDTO.SuspendResponse suspendUser(String loginId, UserSuspendDTO.SuspendRequest request);

    UserSuspendDTO.SuspendResponse unsuspendUser(String loginId);
}