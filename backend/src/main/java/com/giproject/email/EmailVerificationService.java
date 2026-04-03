package com.giproject.email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EmailVerificationService {

    private final JavaMailSender mailSender;
    private final SecureRandom random = new SecureRandom();

    // 메모리 저장소(운영은 Redis 권장)
    private final Map<String, Entry> store = new ConcurrentHashMap<>();
    private record Entry(String hash, long expiresAt, long lastSentAt, int sentCount) {}

    // ✅ 보낸사람: 기본은 spring.mail.username, 필요하면 app.mail.from 로 덮어쓰기
    @Value("${app.mail.from:${spring.mail.username}}")
    private String from;

    public EmailVerificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /** 인증코드 전송 */
    public void sendCode(String email) {
        long now = Instant.now().toEpochMilli();
        Entry prev = store.get(email);

        // 간단 레이트리밋: 60초 이내 재요청 차단, 시간당 5회 제한
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
        long expiresAt = Instant.now().plusSeconds(10 * 60).toEpochMilli(); // 10분

        // 메일 전송
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(from);             // ✅ 네이버는 보통 username과 동일해야 전송됨
            msg.setTo(email);
            msg.setSubject("[GiProject] 이메일 인증코드");
            msg.setText("인증코드: " + code + "\n유효시간: 10분");
            mailSender.send(msg);
        } catch (MailException e) {
            // 전역 예외 핸들러에서 메시지 내려가게 그대로 던짐
            throw e;
        }

        int newCount = prev == null ? 1 : Math.min(prev.sentCount + 1, 10);
        store.put(email, new Entry(hash, expiresAt, now, newCount));
    }

    /** 인증코드 검증(일회성) */
    public boolean verify(String email, String code) {
        Entry entry = store.get(email);
        if (entry == null) return false;
        if (Instant.now().toEpochMilli() > entry.expiresAt) {
            store.remove(email);
            return false;
        }
        boolean ok = BCrypt.checkpw(code, entry.hash);
        if (ok) store.remove(email); // 사용 후 제거
        return ok;
    }
}
