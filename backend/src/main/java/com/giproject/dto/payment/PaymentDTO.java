package com.giproject.dto.payment;

import java.time.LocalDateTime;

import com.giproject.entity.payment.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

public class PaymentDTO {
	
	@Getter
	@Setter 
	@Builder 
	@NoArgsConstructor 
	@AllArgsConstructor
	  public static class CreateRequest {
	    private Long orderSheetNo;        // 프론트에서 같이 보냄
	    private String paymentId;         // PortOne paymentId
	    private String paymentMethod;     // "CARD" | "EASY_PAY"
	    private String easyPayProvider;   // EASY_PAY일 때 "TOSSPAY" | "KAKAOPAY" ...
	    private String currency;          // "KRW"
	  }

	  @Getter 
	  @Setter
	  @Builder
	  @NoArgsConstructor 
	  @AllArgsConstructor
	  public static class Response {
	    private Long paymentNo;
	    private Long orderSheetNo;
	    private String paymentId;
	    private String paymentMethod;
	    private String easyPayProvider;
	    private String currency;
	    private PaymentStatus paymentStatus;
	    private LocalDateTime paidAt;
	  };
}
