// com.giproject.dto.delivery.DeliveryRowDTO
package com.giproject.dto.delivery;

import java.time.LocalDateTime;

import com.giproject.entity.delivery.DeliveryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
public class DeliveryRowDTO {
    private Long eno;
    private String cargoType;
    private String cargoWeight;
    private String startAddress;
    private String endAddress;
    private LocalDateTime startTime;

    private String memId;      

	private String memName;// 🔹 의뢰자(ID)
    private String driverName;          // 차주명
    private DeliveryStatus deliveryStatus;
    private Long matchingNo;
    private Long paymentNo;

    private Long deliveryNo;
    private LocalDateTime deliveryCompletedAt;

    // unpaid (paymentNo 자리엔 null)
    public DeliveryRowDTO(
        Long eno, String cargoType, String cargoWeight,
        String startAddress, String endAddress, LocalDateTime startTime,
        String memId, String memName,                   // 🔹 추가
        String driverName, DeliveryStatus deliveryStatus,
        Long matchingNo, Long paymentNo
    ) {
        this.eno = eno;
        this.cargoType = cargoType;
        this.cargoWeight = cargoWeight;
        this.startAddress = startAddress;
        this.endAddress = endAddress;
        this.startTime = startTime;
        this.memId = memId;
        this.memName = memName;// 🔹 세팅
        this.driverName = driverName;
        this.deliveryStatus = deliveryStatus;
        this.matchingNo = matchingNo;
        this.paymentNo = paymentNo;
    }

    // paid/in-progress (마지막은 completedAt)
    public DeliveryRowDTO(
        Long eno, String cargoType, String cargoWeight,
        String startAddress, String endAddress, LocalDateTime startTime,
        String memId, String memName,
        String driverName, DeliveryStatus deliveryStatus,
        Long matchingNo, LocalDateTime deliveryCompletedAt
    ) {
        this(eno, cargoType, cargoWeight, startAddress, endAddress, startTime,
             memId, memName, driverName, deliveryStatus, matchingNo,  (Long) null);
        this.deliveryCompletedAt = deliveryCompletedAt;
    }

    // completed (paymentNo, deliveryNo, completedAt 포함)
    public DeliveryRowDTO(
        Long eno, String cargoType, String cargoWeight,
        String startAddress, String endAddress, LocalDateTime startTime,
        String memId, String memName,
        String driverName, DeliveryStatus deliveryStatus,
        Long matchingNo, Long paymentNo,
        Long deliveryNo, LocalDateTime deliveryCompletedAt
    ) {
        this(eno, cargoType, cargoWeight, startAddress, endAddress, startTime,
             memId, memName, driverName, deliveryStatus, matchingNo, paymentNo);
        this.deliveryNo = deliveryNo;
        this.deliveryCompletedAt = deliveryCompletedAt;
    }
}
