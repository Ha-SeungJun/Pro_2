package com.giproject.service.payment;

import com.giproject.dto.payment.PaymentCompleteDTO;
import com.giproject.dto.payment.PaymentDTO;

public interface PaymentService {
    // 결제 승인 및 저장
    Long acceptedPayment(PaymentDTO.CreateRequest dto);
    
    // 결제 완료 정보 조회
    PaymentCompleteDTO complete(Long paymentNo);
}