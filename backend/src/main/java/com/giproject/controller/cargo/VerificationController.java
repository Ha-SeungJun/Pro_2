package com.giproject.controller.cargo;

import com.giproject.dto.cargo.CargoOwnerDTO;
import com.giproject.dto.cargo.VerificationConfirmRequestDTO;
import com.giproject.dto.cargo.VerificationStartResponseDTO;
import com.giproject.dto.cargo.VerificationStatusDTO;
import com.giproject.service.cargoowner.VerificationService;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/g2i4/verification")
public class VerificationController {

    private final VerificationService verificationService;

    @GetMapping("/me")
    public VerificationStatusDTO getMyVerificationStatus(
            @AuthenticationPrincipal CargoOwnerDTO cargoOwnerDTO) {

        if (cargoOwnerDTO == null) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }

        return verificationService.getMyVerificationStatus(cargoOwnerDTO.getCargoId());
    }

    @PostMapping("/start")
    public VerificationStartResponseDTO startVerification(
            @AuthenticationPrincipal CargoOwnerDTO cargoOwnerDTO) {

        if (cargoOwnerDTO == null) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }

        return verificationService.startVerification(cargoOwnerDTO.getCargoId());
    }
    @PostMapping("/confirm")
    public VerificationStatusDTO confirmVerification(
            @AuthenticationPrincipal CargoOwnerDTO cargoOwnerDTO,
            @RequestBody VerificationConfirmRequestDTO request) {

        if (cargoOwnerDTO == null) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }

        return verificationService.confirmVerification(cargoOwnerDTO.getCargoId(), request);
    }
}