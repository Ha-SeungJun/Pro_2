package com.giproject.controller.payment;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.giproject.dto.payment.PaymentCompleteDTO;
import com.giproject.dto.payment.PaymentDTO;
import com.giproject.service.mail.MailService;
import com.giproject.service.payment.PaymentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/g2i4/payment")
public class PaymentController {
	private final PaymentService paymentService;
	private final MailService mailService;
	
	@PostMapping("/accepted")
	public ResponseEntity<Map<String , Long>> requestPayment(@RequestBody PaymentDTO.CreateRequest dto){
		Long response= paymentService.acceptedPayment(dto);
		mailService.paymentAcceptedMail(response);
		return ResponseEntity.ok(Map.of("paymentNo",response));
	}
	
	@PostMapping("/complete")
	public ResponseEntity<PaymentCompleteDTO> paymentComplete(@RequestBody  Map<String, Long> body){
		Long paymentNo = body.get("paymentNo");
		PaymentCompleteDTO dto = paymentService.complete(paymentNo);
		
		
		return ResponseEntity.ok(dto);
	}
}
