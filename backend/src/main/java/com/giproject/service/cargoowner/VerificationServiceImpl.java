package com.giproject.service.cargoowner;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.giproject.dto.cargo.VerificationConfirmRequestDTO;
import com.giproject.dto.cargo.VerificationStartResponseDTO;
import com.giproject.dto.cargo.VerificationStatusDTO;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.repository.cargo.CargoOwnerRepository;

import lombok.RequiredArgsConstructor;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class VerificationServiceImpl implements VerificationService {

    private final CargoOwnerRepository cargoOwnerRepository;

    @Value("${portone.store-id}")
    private String portoneStoreId;

    @Value("${portone.channel-key}")
    private String portoneChannelKey;

    @Value("${app.verification.redirect-url}")
    private String redirectUrl;

    @Override
    public VerificationStatusDTO getMyVerificationStatus(String cargoId) {
        CargoOwner cargoOwner = cargoOwnerRepository.findById(cargoId)
                .orElseThrow(() -> new IllegalArgumentException("차주를 찾을 수 없습니다."));

        return VerificationStatusDTO.builder()
                .isVerified(cargoOwner.getIsVerified())
                .verifiedAt(cargoOwner.getVerifiedAt())
                .verifiedPhone(cargoOwner.getVerifiedPhone())
                .build();
    }

    @Override
    public VerificationStartResponseDTO startVerification(String cargoId) {
        CargoOwner cargoOwner = cargoOwnerRepository.findById(cargoId)
                .orElseThrow(() -> new IllegalArgumentException("차주를 찾을 수 없습니다."));

        String identityVerificationId =  "iv-" + cargoOwner.getCargoId() + "-" + UUID.randomUUID().toString().substring(0, 8);
        		//"identity-verification-" + cargoOwner.getCargoId() + "-" + UUID.randomUUID();

        return VerificationStartResponseDTO.builder()
                .storeId(portoneStoreId)
                .channelKey(portoneChannelKey)
                .identityVerificationId(identityVerificationId)
                .redirectUrl(redirectUrl)
                .build();
    }
    
    @Override
    public VerificationStatusDTO confirmVerification(String cargoId, VerificationConfirmRequestDTO request) {
        CargoOwner cargoOwner = cargoOwnerRepository.findById(cargoId)
                .orElseThrow(() -> new IllegalArgumentException("차주를 찾을 수 없습니다."));

        cargoOwner.setIsVerified(true);
        cargoOwner.setVerifiedAt(java.time.LocalDateTime.now());
        cargoOwner.setVerifiedPhone(cargoOwner.getCargoPhone()); // 임시
        cargoOwnerRepository.save(cargoOwner);

        return VerificationStatusDTO.builder()
                .isVerified(cargoOwner.getIsVerified())
                .verifiedAt(cargoOwner.getVerifiedAt())
                .verifiedPhone(cargoOwner.getVerifiedPhone())
                .build();
    }
}