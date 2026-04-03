package com.giproject.repository.cargo;

import com.giproject.entity.cargo.Cargo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CargoRepository extends JpaRepository<Cargo, Integer> {

    // 특정 소유자의 차량 리스트 가져오기
    List<Cargo> findByCargoOwner_CargoId(String cargoId);
}