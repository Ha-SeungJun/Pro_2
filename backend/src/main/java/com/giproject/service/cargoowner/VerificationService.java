package com.giproject.service.cargoowner;

import com.giproject.dto.cargo.VerificationConfirmRequestDTO;
import com.giproject.dto.cargo.VerificationStartResponseDTO;
import com.giproject.dto.cargo.VerificationStatusDTO;

public interface VerificationService {
    VerificationStatusDTO getMyVerificationStatus(String cargoId);
    
    VerificationStartResponseDTO startVerification(String cargoId);
    
    VerificationStatusDTO confirmVerification(String cargoId, VerificationConfirmRequestDTO request);
}