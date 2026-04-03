package com.giproject.service.admin;

import java.util.List;

import com.giproject.dto.admin.AdminMemberSearchDTO;
import com.giproject.dto.admin.DeliveryDetailDTO; // Added import

public interface AdminDeliveryService {
    List<AdminMemberSearchDTO> searchUserForDeliveryPage(String query);
    List<DeliveryDetailDTO> getAllDeliveries(String status, String keyword); // Added
    AdminMemberSearchDTO getDeliveryDetailsForUser(String userId, String userType); // New method
}

