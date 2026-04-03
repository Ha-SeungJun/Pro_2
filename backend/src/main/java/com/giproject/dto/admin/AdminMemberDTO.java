package com.giproject.dto.admin;

import java.time.LocalDateTime;
import java.util.List; // Added
import com.giproject.dto.admin.DeliveryDetailDTO; // Added
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminMemberDTO {
    // OWNER(물주) | COWNER(차주) | ADMIN(관리자)
    private String type;

    private String memId;

    private String memName;
    private String memEmail;
    private String memPhone;
    private String memAdress;
    private LocalDateTime memCreateidDateTime;
    private int orders; // Added
    private String status; // Added
    private List<DeliveryDetailDTO> details; // Added
    private List<String> history; // Added
}