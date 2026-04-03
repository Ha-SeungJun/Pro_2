package com.giproject.controller.admin;

import com.giproject.dto.admin.AdminMemberSearchDTO;
import com.giproject.dto.admin.DeliveryDetailDTO; // Added import
import com.giproject.service.admin.AdminDeliveryService;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/g2i4/admin/delivery")
@RequiredArgsConstructor
public class AdminDeliveryController {

    private final AdminDeliveryService adminDeliveryService;

    @GetMapping("/user-search")
    public ResponseEntity<List<AdminMemberSearchDTO>> searchUser(@RequestParam("query") String query) {
        List<AdminMemberSearchDTO> users = adminDeliveryService.searchUserForDeliveryPage(query);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/all") // New endpoint
    public ResponseEntity<List<DeliveryDetailDTO>> getAllDeliveries(@RequestParam(value = "status", defaultValue = "ALL") String status,
                                                                    @RequestParam(value = "keyword", defaultValue = "") String keyword) {
        List<DeliveryDetailDTO> allDeliveries = adminDeliveryService.getAllDeliveries(status, keyword);
        return ResponseEntity.ok(allDeliveries);
    }
}

