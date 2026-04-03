package com.giproject.service.mail;

public interface MailService {
	public void acceptedMail(Long mcno);
	void paymentAcceptedMail(Long payno);
	void deliveryCompleted(Long deliveryNo);
	
}
