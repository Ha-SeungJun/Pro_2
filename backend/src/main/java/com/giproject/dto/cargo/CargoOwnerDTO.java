package com.giproject.dto.cargo;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.giproject.entity.account.UserIndex;
import com.giproject.entity.cargo.CargoOwner;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString(exclude = "cargoPw") // 비밀번호 로그 노출 방지
public class CargoOwnerDTO extends User {

    private static final long serialVersionUID = 1L;

    private String cargoId;

    @JsonIgnore
    private String cargoPw;

    private String cargoEmail;
    private String cargoName;
    private String cargoPhone;
    private String cargoAddress;
    private LocalDateTime cargoCreatedDateTime;

    /** 원본 롤 이름(접두어 없음): DRIVER + USER/ADMIN */
    private List<String> roleNames = new ArrayList<>();

    public CargoOwnerDTO(String cargoId,
                         String cargoPw,
                         String cargoEmail,
                         String cargoName,
                         String cargoPhone,
                         String cargoAddress,
                         LocalDateTime cargoCreatedDateTime,
                         List<String> roleNames) {

        super(
            cargoId,
            (cargoPw == null ? "" : cargoPw),
            roleNames.stream()
                     .filter(Objects::nonNull)
                     .map(String::trim)
                     .filter(s -> !s.isEmpty())
                     .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                     .distinct()
                     .map(SimpleGrantedAuthority::new)
                     .collect(Collectors.toList())
        );

        this.cargoId = cargoId;
        this.cargoPw = cargoPw;
        this.cargoEmail = cargoEmail;
        this.cargoName = cargoName;
        this.cargoPhone = cargoPhone;
        this.cargoAddress = cargoAddress;
        this.cargoCreatedDateTime = cargoCreatedDateTime;
        this.roleNames = (roleNames != null) ? new ArrayList<>(roleNames) : new ArrayList<>();
    }

    /** 엔티티 -> DTO : 도메인=DRIVER, 플랫폼=(ADMIN|USER) */
    public static CargoOwnerDTO fromCargoOwner(CargoOwner c) {
        boolean isAdmin = false;
        try {
            UserIndex ui = c.getUserIndex();
            isAdmin = (ui != null && ui.getRole() == UserIndex.Role.ADMIN);
        } catch (Exception ignore) {}

        List<String> roles = new ArrayList<>(2);
        roles.add("DRIVER");                   // 도메인 축
        roles.add(isAdmin ? "ADMIN" : "USER"); // 플랫폼 축

        return new CargoOwnerDTO(
            c.getCargoId(),
            c.getCargoPw(), // ⚠️ BCrypt 해시 전제
            c.getCargoEmail(),
            c.getCargoName(),
            c.getCargoPhone(),
            c.getCargoAddress(),
            c.getCargoCreatedDateTime(),
            roles
        );
    }

    /** JWT 등에 넣을 안전한 클레임(비밀번호 제외) */
    public Map<String, Object> getClaims() {
        Map<String, Object> m = new HashMap<>();
        m.put("cargoId", cargoId);
        m.put("cargoEmail", cargoEmail);
        m.put("cargoName", cargoName);
        m.put("cargoPhone", cargoPhone);
        m.put("cargoAddress", cargoAddress);
        m.put("cargoCreatedDateTime", cargoCreatedDateTime);
        m.put("rolenames", roleNames);
        return m;
    }
}
