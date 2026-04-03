package com.giproject.service.cargoowner;
import com.giproject.dto.common.UserResponseDTO;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.repository.cargo.CargoOwnerRepository;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CargoOwnerServiceImpl implements CargoOwnerService{
	   private final CargoOwnerRepository cargoOwnerRepository;

	    @Override
	    public UserResponseDTO getSessionUserInfo(HttpSession session) {
	        CargoOwner owner = (CargoOwner) session.getAttribute("cargoOwner");

	        return new UserResponseDTO(
	            owner.getCargoId(),
	            owner.getCargoName(),
	            owner.getCargoEmail(),
	            owner.getCargoPhone(),
	            owner.getCargoAddress(),
	            owner.getCargoCreatedDateTime()
	        );
	    }
}
