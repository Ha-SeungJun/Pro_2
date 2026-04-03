// src/components/auth/EmailVerifyDialog.jsx
import React from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Stack, Typography, LinearProgress
} from "@mui/material";

const API_BASE =
    import.meta?.env?.VITE_API_BASE ||
    process.env.REACT_APP_API_BASE ||
    "http://localhost:8080";

export default function EmailVerifyDialog({ open, email, onClose, onVerified }) {
    const [phase, setPhase] = React.useState("idle"); // idle | sending | code | verifying | verified | error
    const [code, setCode] = React.useState("");
    const [msg, setMsg] = React.useState("");
    const [expiresIn, setExpiresIn] = React.useState(600); // 10분(서버와 표시만 맞춤)
    const [cooldown, setCooldown] = React.useState(0);     // 60초 재전송 대기

    // 카운트다운
    React.useEffect(() => {
        if (!open) return;
        let t1, t2;
        if (phase === "code") {
            t1 = setInterval(() => setExpiresIn((s) => (s > 0 ? s - 1 : 0)), 1000);
            t2 = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
        }
        return () => { clearInterval(t1); clearInterval(t2); };
    }, [open, phase]);

    React.useEffect(() => {
        if (!open) {
            setPhase("idle");
            setCode("");
            setMsg("");
            setExpiresIn(600);
            setCooldown(0);
        }
    }, [open]);

    const sendCode = async () => {
        setPhase("sending");
        setMsg("인증코드 전송 중…");
        try {
            const r = await fetch(`${API_BASE}/api/email/send-code`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const ok = r.ok;
            const text = await r.text();
            if (!ok) throw new Error(text || "전송 실패");
            setPhase("code");
            setMsg("이메일로 인증코드를 보냈어요. 10분 안에 입력해 주세요.");
            setExpiresIn(600);
            setCooldown(60);
        } catch (e) {
            setPhase("error");
            setMsg(e.message || "전송 중 오류가 발생했습니다.");
        }
    };

    const verifyCode = async () => {
        if (!code || code.length < 4) {
            setMsg("코드를 정확히 입력해 주세요.");
            return;
        }
        setPhase("verifying");
        setMsg("인증 확인 중…");
        try {
            const r = await fetch(`${API_BASE}/api/email/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code }),
            });
            const data = await r.json().catch(() => ({}));
            if (!r.ok || !data.verified) throw new Error(data.message || "코드가 올바르지 않거나 만료되었습니다.");
            setPhase("verified");
            setMsg("이메일 인증이 완료되었습니다.");
            onVerified?.(true);
        } catch (e) {
            setPhase("code");
            setMsg(e.message || "인증 실패");
            onVerified?.(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>이메일 인증</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">{email}</Typography>

                    {(phase === "sending" || phase === "verifying") && <LinearProgress />}

                    {phase === "idle" && (
                        <Typography variant="body2">아래 버튼을 눌러 인증코드를 이메일로 받으세요.</Typography>
                    )}

                    {(phase === "code" || phase === "verifying" || phase === "error" || phase === "verified") && (
                        <>
                            <TextField
                                label="인증코드"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\s/g, ""))}
                                placeholder="6자리 코드"
                                inputProps={{ maxLength: 10, inputMode: "numeric" }}
                                disabled={phase === "verifying" || phase === "verified"}
                            />
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="caption" color="text.secondary">
                                    남은 시간: {Math.floor(expiresIn / 60)}:{String(expiresIn % 60).padStart(2, "0")}
                                </Typography>
                                <Button
                                    size="small"
                                    onClick={sendCode}
                                    disabled={cooldown > 0 || phase === "verifying" || phase === "sending"}
                                >
                                    재전송{cooldown > 0 ? ` (${cooldown}s)` : ""}
                                </Button>
                            </Stack>
                        </>
                    )}

                    {!!msg && (
                        <Typography variant="body2" color={phase === "verified" ? "success.main" : phase === "error" ? "error.main" : "text.primary"}>
                            {msg}
                        </Typography>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                {phase === "idle" && (
                    <Button variant="contained" onClick={sendCode}>코드 보내기</Button>
                )}
                {(phase === "code" || phase === "verifying") && (
                    <Button variant="contained" onClick={verifyCode} disabled={phase === "verifying" || expiresIn === 0}>
                        확인
                    </Button>
                )}
                <Button onClick={onClose}>닫기</Button>
            </DialogActions>
        </Dialog>
    );
}
