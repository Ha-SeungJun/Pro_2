package com.giproject.service.owner;

import com.giproject.dto.owner.MonthlyRevenueDTO;
import com.giproject.repository.delivery.DeliveryRepository;
import com.giproject.repository.owner.MonthlyRevenueRow;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OwnerMetricsService {
    private final DeliveryRepository deliveryRepo;

    public List<MonthlyRevenueDTO> monthlyRevenue(String cargoId) {
        return deliveryRepo.findMonthlyRevenueByCargoId(cargoId).stream()
                .map(r -> new MonthlyRevenueDTO(r.getY(), r.getM(), r.getRevenue()))
                .toList();
    }
}
