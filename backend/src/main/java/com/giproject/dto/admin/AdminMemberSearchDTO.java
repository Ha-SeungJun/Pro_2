package com.giproject.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminMemberSearchDTO {
    private String name;
    private String email;
    private String phone;
    private String userId; // Unique ID for Member or CargoOwner
    private String userType; // 'OWNER' or 'COWNER'
    private int orders;
    private String status;
    private List<DeliveryDetailDTO> details;
    private List<String> history;
}

