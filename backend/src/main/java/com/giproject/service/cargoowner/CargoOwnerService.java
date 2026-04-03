package com.giproject.service.cargoowner;
import com.giproject.dto.common.UserResponseDTO;

import jakarta.servlet.http.HttpSession;

public interface CargoOwnerService {
    UserResponseDTO getSessionUserInfo(HttpSession session);
}