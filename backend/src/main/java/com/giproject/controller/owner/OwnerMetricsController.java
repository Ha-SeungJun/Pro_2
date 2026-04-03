package com.giproject.controller.owner;

import com.giproject.dto.owner.MonthlyRevenueDTO;
import com.giproject.security.JwtService;
import com.giproject.service.owner.OwnerMetricsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/g2i4/owner")
@RequiredArgsConstructor
public class OwnerMetricsController {

    private final OwnerMetricsService service;
    private final JwtService jwtService;

    private String resolveToken(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authorization header is missing");
        }
        if (authHeader.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return authHeader.substring(7);
        }
        return authHeader; // 혹시 "Bearer " 없이 토큰만 올 때 대비
    }

    @GetMapping("/revenue/monthly")
    public List<MonthlyRevenueDTO> monthlyRevenue(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        String token = resolveToken(authHeader);
        if (!jwtService.validate(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
        }

        // ⚠️ JwtService.generateAccessToken 에서 subject = authentication.getName()
        // 차주 로그인 시 이 값이 cargoId 가 되도록 보장되어 있어야 함!
        String cargoId = jwtService.getUsername(token);

        return service.monthlyRevenue(cargoId);
    }

    // 선택: 디버그/수동 확인용 엔드포인트 (토큰 말고 쿼리스트링으로 cargoId 지정)
    @GetMapping("/revenue/monthly-debug")
    public List<MonthlyRevenueDTO> monthlyRevenueDebug(@RequestParam String cargoId) {
        return service.monthlyRevenue(cargoId);
    }
}