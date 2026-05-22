package com.giproject.service.mail;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
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

import lombok.RequiredArgsConstructor;
import sendinblue.ApiClient;
import sendinblue.Configuration;
import sibApi.TransactionalEmailsApi;
import sibModel.SendSmtpEmail;
import sibModel.SendSmtpEmailSender;
import sibModel.SendSmtpEmailTo;

@Service
@RequiredArgsConstructor
public class MailServiceImpl implements MailService {

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    private final MatchingRepository matchingRepository;
    private final PaymentRepository paymentRepository;
    private final DeliveryRepository deliveryRepository;

    private void sendEmail(String toEmail, String subject, String content) {
        try {
        	ApiClient apiClient = Configuration.getDefaultApiClient();
        	apiClient.setApiKey(brevoApiKey);

            TransactionalEmailsApi apiInstance = new TransactionalEmailsApi(apiClient);

            SendSmtpEmail sendSmtpEmail = new SendSmtpEmail();
            sendSmtpEmail.subject(subject);
            sendSmtpEmail.htmlContent(content);
            sendSmtpEmail.sender(new SendSmtpEmailSender()
                .name("퍼스트로드")
                .email("rladnrms0907@naver.com"));
            sendSmtpEmail.to(Arrays.asList(
                new SendSmtpEmailTo().email(toEmail)
            ));

            apiInstance.sendTransacEmail(sendSmtpEmail);
        } catch (Exception e) {
            throw new RuntimeException("메일 발송 실패", e);
        }
    }

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
        sendEmail(toEmail, subject, content);
    }

    @Override
    public void paymentAcceptedMail(Long payno) {
        Payment payment = paymentRepository.findById(payno)
                .orElseThrow(() -> new RuntimeException("결제번호가 존재하지 않습니다"));
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
        String content = """
                <html>
                  <body style="font-family: Arial, sans-serif; line-height:1.6; background-color:#f9f9f9; padding:20px;">
                    <div style="max-width:600px; margin:auto; background:white; border-radius:8px; padding:20px;">
                      <h2 style="color:#4CAF50; text-align:center;">💳 결제 완료 안내</h2>
                      <p>안녕하세요 %s 고객님,</p>
                      <p>매칭 번호 <b style="color:#ff6600;">%d</b> 건에 대한 <b>결제가 정상적으로 완료</b>되었습니다.</p>
                      <table style="width:100%%; border-collapse:collapse; margin-top:20px;">
                        <tr><td style="padding:10px; border:1px solid #ddd;">매칭 번호</td><td style="padding:10px; border:1px solid #ddd;">%d</td></tr>
                        <tr><td style="padding:10px; border:1px solid #ddd;">결제 금액</td><td style="padding:10px; border:1px solid #ddd; color:#4CAF50;">₩%s</td></tr>
                        <tr><td style="padding:10px; border:1px solid #ddd;">결제 일시</td><td style="padding:10px; border:1px solid #ddd;">%s</td></tr>
                      </table>
                      <hr>
                      <p style="font-size:12px; color:gray; text-align:center;">본 메일은 발신전용입니다.</p>
                    </div>
                  </body>
                </html>
                """.formatted(cargoName, matching.getMatchingNo(), matching.getMatchingNo(), totalCost, formattedTime);
        sendEmail(toEmail, subject, content);
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
        String toEmail = member.getMemEmail();
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
                    <div style="max-width:600px; margin:auto; background:white; border-radius:8px; padding:20px;">
                      <div style="text-align:center; margin-bottom:16px; font-size:42px;">📦✅</div>
                      <h2 style="text-align:center; margin:0 0 24px 0;">배송 완료 안내</h2>
                      <p>안녕하세요 %s 고객님,</p>
                      <p>주문 번호 <b style="color:#ff6600;">%s</b> 건에 대한 <b>배송이 완료</b>되었습니다.</p>
                      <table style="width:100%%; border-collapse:collapse; margin-top:20px;">
                        <tr><td style="padding:10px; border:1px solid #ddd;">배송지</td><td style="padding:10px; border:1px solid #ddd;">%s</td></tr>
                        <tr><td style="padding:10px; border:1px solid #ddd;">배송 이동 거리</td><td style="padding:10px; border:1px solid #ddd; color:#4CAF50;">%.2f km</td></tr>
                        <tr><td style="padding:10px; border:1px solid #ddd;">도착 시간</td><td style="padding:10px; border:1px solid #ddd;">%s</td></tr>
                      </table>
                      <hr>
                      <p style="font-size:12px; color:gray; text-align:center;">본 메일은 발신전용입니다.</p>
                    </div>
                  </body>
                </html>
                """.formatted(memberName, orderNo, endAddress, distanceKm, deliveryCompletedtime);
        sendEmail(toEmail, subject, content);
    }
}