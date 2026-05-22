package com.giproject.email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Arrays;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import sibApi.TransactionalEmailsApi;
import sibModel.SendSmtpEmail;
import sibModel.SendSmtpEmailSender;
import sibModel.SendSmtpEmailTo;
import sendinblue.ApiClient;
import sendinblue.Configuration;

@Service
public class EmailVerificationService {

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    private final SecureRandom random = new SecureRandom();
    private final Map<String, Entry> store = new ConcurrentHashMap<>();
    private record Entry(String hash, long expiresAt, long lastSentAt, int sentCount) {}

    public void sendCode(String email) {
        long now = Instant.now().toEpochMilli();
        Entry prev = store.get(email);

        if (prev != null) {
            if (now - prev.lastSentAt < 60_000) {
                throw new IllegalArgumentException("너무 자주 요청했습니다. 잠시 뒤 다시 시도하세요.");
            }
            if (prev.sentCount >= 5 && now - prev.lastSentAt < 3_600_000) {
                throw new IllegalArgumentException("요청 한도를 초과했습니다. 한 시간 뒤 다시 시도하세요.");
            }
        }

        String code = String.format("%06d", random.nextInt(1_000_000));
        String hash = BCrypt.hashpw(code, BCrypt.gensalt());
        long expiresAt = Instant.now().plusSeconds(10 * 60).toEpochMilli();

        try {
            ApiClient apiClient = Configuration.getDefaultApiClient();
            apiClient.setApiKey(brevoApiKey);

            TransactionalEmailsApi apiInstance = new TransactionalEmailsApi(apiClient);

            SendSmtpEmail sendSmtpEmail = new SendSmtpEmail();
            sendSmtpEmail.subject("[FirstRoad] 이메일 인증코드");
            sendSmtpEmail.htmlContent("<p>인증코드: <b>" + code + "</b></p><p>유효시간: 10분</p>");
            sendSmtpEmail.sender(new SendSmtpEmailSender()
                .name("퍼스트로드")
                .email("gktmdwns1037@gmail.com"));
            sendSmtpEmail.to(Arrays.asList(
                new SendSmtpEmailTo().email(email)
            ));

            apiInstance.sendTransacEmail(sendSmtpEmail);
        } catch (Exception e) {
            throw new RuntimeException("메일 발송 실패: " + e.getMessage(), e);
        }

        int newCount = prev == null ? 1 : Math.min(prev.sentCount + 1, 10);
        store.put(email, new Entry(hash, expiresAt, now, newCount));
    }

    public boolean verify(String email, String code) {
        Entry entry = store.get(email);
        if (entry == null) return false;
        if (Instant.now().toEpochMilli() > entry.expiresAt) {
            store.remove(email);
            return false;
        }
        boolean ok = BCrypt.checkpw(code, entry.hash);
        if (ok) store.remove(email);
        return ok;
    }
}