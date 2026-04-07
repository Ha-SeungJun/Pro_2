package com.giproject.service.mail;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.giproject.entity.cargo.CargoOwner;
import com.giproject.entity.delivery.Delivery;
import com.giproject.entity.estimate.Estimate;
import com.giproject.entity.matching.Matching;
import com.giproject.entity.member.Member;
import com.giproject.entity.order.OrderSheet;
import com.giproject.entity.payment.Payment;
import com.giproject.repository.delivery.DeliveryRepository;
import com.giproject.repository.matching.MatchingRepository;
import com.giproject.repository.payment.PaymentRepository;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MailServiceImpl implements MailService {
	private final JavaMailSender javaMailSender;
	private final MatchingRepository matchingRepository;
	private final PaymentRepository paymentRepository;
	private final DeliveryRepository deliveryRepository;

	@Override
	public void acceptedMail(Long mcno) {
		Matching matching = matchingRepository.findById(mcno)
				.orElseThrow(() -> new RuntimeException("매칭번호가 존재하지 않습니다"));
		Estimate estimate = matching.getEstimate();
		Member member = estimate.getMember();
		String toEmail = member.getMemEmail();
		String subject = "매칭 수락 알림";
		String content = """
				<html>
				  <body style="font-family: Arial, sans-serif; line-height:1.6;">
				    <h2 style="color:#4CAF50;">매칭이 수락되었습니다 ✅</h2>
				    <p>안녕하세요,</p>
				    <p>매칭 번호 <b style="color:#ff6600;">%d</b>가 성공적으로 수락되었습니다.</p>
				    <p>서비스를 이용해주셔서 감사합니다.</p>
				    <hr>
				    <p style="font-size:12px;color:gray;">본 메일은 자동 발송 메일입니다.</p>
				  </body>
				</html>
				""".formatted(mcno);
		try {
			MimeMessage message = javaMailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

			helper.setTo(toEmail);
			helper.setSubject(subject);
			helper.setText(content, true); // true → HTML 모드
			helper.setFrom("rladnrms0907@naver.com");

			javaMailSender.send(message);

		} catch (MessagingException e) {
			throw new RuntimeException("메일 발송 실패", e);
		}

	}

	@Override
	public void paymentAcceptedMail(Long payno) {
		Payment payment = paymentRepository.findById(payno).orElseThrow(() -> new RuntimeException("결제번호가 존재하지 않습니다"));
		OrderSheet sheet = payment.getOrderSheet();
		Matching matching = sheet.getMatching();
		Estimate estimate = matching.getEstimate();
		CargoOwner owner = matching.getCargoOwner();
		String toEmail = owner.getCargoEmail();
		String subject = "매칭 결제가 완료되었습니다";
		int totalCost = estimate.getTotalCost();
		LocalDateTime paymentTime = payment.getPaidAt();
		String formattedTime = paymentTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
		String cargoName = owner.getCargoName();
		// HTML 본문 (간단한 결제 안내 템플릿)
		String content = """
				<html>
				  <body style="font-family: Arial, sans-serif; line-height:1.6; background-color:#f9f9f9; padding:20px;">
				    <div style="max-width:600px; margin:auto; background:white; border-radius:8px; padding:20px; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
				      <h2 style="color:#4CAF50; text-align:center;">💳 결제 완료 안내</h2>
				      <p>안녕하세요 %s 고객님,</p>
				      <p>매칭 번호 <b style="color:#ff6600;">%d</b> 건에 대한 <b>결제가 정상적으로 완료</b>되었습니다.</p>

				      <table style="width:100%%; border-collapse:collapse; margin-top:20px;">
				        <tr>
				          <td style="padding:10px; border:1px solid #ddd;">매칭 번호</td>
				          <td style="padding:10px; border:1px solid #ddd;">%d</td>
				        </tr>
				        <tr>
				          <td style="padding:10px; border:1px solid #ddd;">결제 금액</td>
				          <td style="padding:10px; border:1px solid #ddd; color:#4CAF50;">₩%s</td>
				        </tr>
				        <tr>
				          <td style="padding:10px; border:1px solid #ddd;">결제 일시</td>
				          <td style="padding:10px; border:1px solid #ddd;">%s</td>
				        </tr>
				      </table>

				      <p style="margin-top:20px;">서비스를 이용해 주셔서 감사합니다.<br>안전하고 편리한 서비스 제공을 위해 최선을 다하겠습니다.</p>
				      <hr>
				      <p style="font-size:12px; color:gray; text-align:center;">본 메일은 발신전용입니다.</p>
				    </div>
				  </body>
				</html>
				"""
				.formatted(cargoName, matching.getMatchingNo(), matching.getMatchingNo(), totalCost, formattedTime);

		try {
			MimeMessage message = javaMailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

			helper.setTo(toEmail);
			helper.setSubject(subject);
			helper.setText(content, true); // HTML 모드
			helper.setFrom("rladnrms0907@naver.com");

			javaMailSender.send(message);

		} catch (MessagingException e) {
			throw new RuntimeException("메일 발송 실패", e);
		}
	}

	@Override
	public void deliveryCompleted(Long deliveryNo) {
		Delivery delivery = deliveryRepository.findById(deliveryNo)
				.orElseThrow(() -> new RuntimeException("배송정보가 존재하지않습니다"));
		Payment payment = delivery.getPayment();
		OrderSheet orderSheet = payment.getOrderSheet();
		Matching matching = orderSheet.getMatching();
		Estimate estimate = matching.getEstimate();
		Member member = estimate.getMember();
		String toEmail = member.getMemEmail();// 유저 이메일
		LocalDateTime deDateTime = delivery.getCompletTime();
		String deliveryCompletedtime = deDateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
		String firstAddress = estimate.getEndAddress();
		String restAddress = orderSheet.getEndRestAddress();
		String endAddress = firstAddress + " " + restAddress;
		double distanceKm = estimate.getDistanceKm();
		String orderNo = orderSheet.getOrderUuid();
		String memberName = member.getMemName();

		String subject = "%s 배송이 완료되었습니다".formatted(orderNo);
		String content = """
				<html>
				  <body style="font-family: Arial, sans-serif; line-height:1.6; background-color:#f9f9f9; padding:20px;">
				    <div style="max-width:600px; margin:auto; background:white; border-radius:8px; padding:20px; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
				     <div style="text-align:center; margin-bottom:16px; font-size:42px;">📦✅</div>
                  <h2 style="text-align:center; margin:0 0 24px 0;">배송 완료 안내</h2>
				      <p>안녕하세요 %s 고객님,</p>
				      <p>주문 번호 <b style="color:#ff6600;">%s</b> 건에 대한 <b>배송이 완료</b>되었습니다.</p>

				      <table style="width:100%%; border-collapse:collapse; margin-top:20px;">
				        <tr>
				          <td style="padding:10px; border:1px solid #ddd;">배송지</td>
				          <td style="padding:10px; border:1px solid #ddd;">%s</td>
				        </tr>
				        <tr>
				          <td style="padding:10px; border:1px solid #ddd;">배송 이동 거리</td>
				          <td style="padding:10px; border:1px solid #ddd; color:#4CAF50;">%.2f km</td>
				        </tr>
				        <tr>
				          <td style="padding:10px; border:1px solid #ddd;">도착 시간</td>
				          <td style="padding:10px; border:1px solid #ddd;">%s</td>
				        </tr>
				      </table>

				      <p style="margin-top:20px;">서비스를 이용해 주셔서 감사합니다.<br>안전하고 편리한 서비스 제공을 위해 최선을 다하겠습니다.</p>
				      <hr>
				      <p style="font-size:12px; color:gray; text-align:center;">본 메일은 발신전용입니다.</p>
				    </div>
				  </body>
				</html>
				"""
				.formatted(memberName, orderNo, endAddress, distanceKm, deliveryCompletedtime);

		try {
			MimeMessage message = javaMailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

			helper.setTo(toEmail);
			helper.setSubject(subject);
			helper.setText(content, true); // HTML 모드
			helper.setFrom("rladnrms0907@naver.com");

			javaMailSender.send(message);

		} catch (MessagingException e) {
			throw new RuntimeException("메일 발송 실패", e);
		}

	}

}
