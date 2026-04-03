package com.giproject.controller.delivery;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.giproject.dto.delivery.DeliveryRowDTO;
import com.giproject.service.delivery.OwnerDeliveryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/g2i4/owner/deliveries")
@RequiredArgsConstructor
public class OwnerDeliveryController {

    private final OwnerDeliveryService service;

    // 미결제
    @GetMapping("/unpaid")
    public ResponseEntity<List<DeliveryRowDTO>> unpaid(Principal principal) {
        String cargoId = principal.getName(); // JWT에서 login_id가 들어오도록 매핑되어 있어야 함
        return ResponseEntity.ok(service.getUnpaid(cargoId));
    }

    // 결제됨(진행/대기)
    @GetMapping("/paid")
    public ResponseEntity<List<DeliveryRowDTO>> paid(Principal principal) {
        String cargoId = principal.getName();
        return ResponseEntity.ok(service.getPaidInProgress(cargoId));
    }

    // 완료
    @GetMapping("/completed")
    public ResponseEntity<List<DeliveryRowDTO>> completed(Principal principal) {
        String cargoId = principal.getName();
        return ResponseEntity.ok(service.getCompleted(cargoId));
    }

    // 배송 완료 처리
    @PostMapping("/{matchingNo}/complete")
    public ResponseEntity<Void> complete(@PathVariable("matchingNo") Long matchingNo, Principal principal) {
        String cargoId = principal.getName();
        service.completeByMatchingNo(matchingNo, cargoId);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{matchingNo}/in_transit")
    public ResponseEntity<Void> startTransit(@PathVariable("matchingNo") Long matchingNo,
                                             Principal principal) {
        String cargoId = principal.getName();
        service.markInTransit(matchingNo, cargoId);
        return ResponseEntity.noContent().build();
    }
    
}
