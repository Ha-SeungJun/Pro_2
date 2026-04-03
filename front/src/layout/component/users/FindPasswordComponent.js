import * as React from 'react';
import {
    Box, Button, Container, TextField, Typography, Divider,
} from '@mui/material';
import { AppProvider } from '@toolpad/core/AppProvider';
import { useTheme } from '@mui/material/styles';
import usePasswordForm from '../../../hooks/usePasswordForm';
import { useSearchParams } from 'react-router-dom';

const API_BASE =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) ||
    process.env.REACT_APP_API_BASE ||
    'http://localhost:8080';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 흐름:
 * 1) (아이디+이메일) 입력 → "인증코드 보내기"
 *    → POST /api/auth/password-reset/request { loginId, email }
 * 2) 코드 입력 → "코드 확인"
 *    → POST /api/auth/password-reset/verify { challengeId, code }
 * 3) 새 비밀번호 입력 → "비밀번호 변경"
 *    → POST /api/auth/password-reset/complete { resetToken, newPassword }
 */
const FindPasswordComponent = () => {
    const theme = useTheme();
    const [params] = useSearchParams();

    const [step, setStep] = React.useState('request'); // 'request' | 'verify' | 'reset'
    const [loading, setLoading] = React.useState(false);

    const [pw1Focused, setPw1Focused] = React.useState(false);
    const [pw2Focused, setPw2Focused] = React.useState(false);

    // 입력값
    const [loginId, setLoginId] = React.useState(params.get('loginId') || '');
    const [email, setEmail] = React.useState('');

    // 서버 반환 상태
    const [maskedEmail, setMaskedEmail] = React.useState('');
    const [challengeId, setChallengeId] = React.useState('');
    const [ttl, setTtl] = React.useState(0);
    const [code, setCode] = React.useState('');
    const [resetToken, setResetToken] = React.useState('');

    // 재전송 쿨다운(예: 60초)
    const [cooldown, setCooldown] = React.useState(0);
    React.useEffect(() => {
        if (cooldown <= 0) return;
        const t = setInterval(() => setCooldown((s) => s - 1), 1000);
        return () => clearInterval(t);
    }, [cooldown]);

    // 비밀번호 폼 (기존 훅 재사용)
    const {
        password1, password2, isPwValid, isPwMatch,
        showPassword1, showPassword2,
        handleChangePassword1, handleChangePassword2,
    } = usePasswordForm();

    const canRequest = loginId.trim().length > 0 && emailRegex.test(email);

    // 1) 인증코드 보내기 (아이디+이메일)
    const handleSendCode = async () => {
        if (!canRequest) {
            alert('아이디와 이메일을 정확히 입력해 주세요.');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/password-reset/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ loginId: loginId.trim(), email: email.trim() }),
            });
            const text = await res.text();
            let data; try { data = JSON.parse(text); } catch { data = {}; }

            if (!res.ok) {
                alert(data?.message || text || '인증코드 요청에 실패했습니다.');
                return;
            }

            setChallengeId(data.challengeId || '');
            setMaskedEmail(data.maskedEmail || '(이메일 마스킹 실패)');
            setTtl(Number(data.ttlSeconds || 180));
            setCooldown(60);
            setStep('verify');
            alert('가입한 이메일로 인증코드를 보냈습니다.');
        } catch (e) {
            console.error(e);
            alert('네트워크 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 2) 코드 확인
    const handleVerify = async () => {
        if (!challengeId || !code.trim()) {
            alert('인증코드를 입력해 주세요.');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/password-reset/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ challengeId, code: code.trim() }),
            });
            const text = await res.text();
            let data; try { data = JSON.parse(text); } catch { data = {}; }

            if (!res.ok) {
                alert(data?.message || text || '인증코드 확인에 실패했습니다.');
                return;
            }
            setResetToken(data.resetToken || '');
            setStep('reset');
            alert('인증 완료! 새 비밀번호를 설정하세요.');
        } catch (e) {
            console.error(e);
            alert('네트워크 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 2-1) 재전송
    const handleResend = async () => {
        if (cooldown > 0) return;
        await handleSendCode();
    };

    // 3) 비밀번호 변경
    const handleChangePassword = async () => {
        if (!resetToken) {
            alert('인증을 먼저 완료해주세요.');
            return;
        }
        if (!isPwValid || !isPwMatch) {
            alert('비밀번호 조건을 확인해 주세요.');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/password-reset/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resetToken, newPassword: password1 }),
            });
            const text = await res.text();
            let data; try { data = JSON.parse(text); } catch { data = {}; }

            if (!res.ok) {
                alert(data?.message || text || '비밀번호 변경에 실패했습니다.');
                return;
            }

            alert('비밀번호가 변경되었습니다. 로그인해 주세요.');
            window.location.assign('/login');
        } catch (e) {
            console.error(e);
            alert('네트워크 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppProvider theme={theme}>
            <Container maxWidth="sm" sx={{ mt: 6, mb: 8 }}>
                {/* STEP 1: 아이디 + 이메일 */}
                {step === 'request' && (
                    <Box sx={{ p: 3, border: '1px solid #ddd', borderRadius: 2, bgcolor: 'white' }}>
                        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                            비밀번호 찾기
                        </Typography>

                        <TextField
                            label="아이디(ID)"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            fullWidth
                            sx={{ mb: 2 }}
                            disabled={loading}
                            autoComplete="username"
                        />

                        <TextField
                            label="이메일"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            fullWidth
                            sx={{ mb: 0.5 }}
                            disabled={loading}
                            placeholder="your@email.com"
                            autoComplete="email"
                            error={email.length > 0 && !emailRegex.test(email)}
                            helperText={
                                email.length > 0 && !emailRegex.test(email)
                                    ? '이메일 형식을 확인해 주세요.'
                                    : '가입한 이메일만 유효합니다.'
                            }
                        />

                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleSendCode}
                            disabled={loading || !canRequest}
                            sx={{ mt: 2 }}
                        >
                            {loading ? '요청 중…' : '인증코드 보내기'}
                        </Button>
                    </Box>
                )}

                {/* STEP 2: 코드 확인 */}
                {step === 'verify' && (
                    <Box sx={{ p: 3, border: '1px solid #ddd', borderRadius: 2, bgcolor: 'white' }}>
                        <Typography sx={{ mb: 0.5 }}>
                            인증 메일이 발송되었습니다.
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            수신 주소: <b>{maskedEmail}</b>
                        </Typography>

                        <TextField
                            label="인증코드 (6자리)"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
                            fullWidth
                            sx={{ mb: 2 }}
                            disabled={loading}
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                            autoComplete="one-time-code"
                        />

                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="contained"
                                onClick={handleVerify}
                                disabled={loading || code.length < 6}
                                sx={{ flex: 1 }}
                            >
                                {loading ? '확인 중…' : '코드 확인'}
                            </Button>

                            <Button
                                variant="outlined"
                                onClick={handleResend}
                                disabled={loading || cooldown > 0}
                                sx={{ width: 160, whiteSpace: 'nowrap' }}
                            >
                                {cooldown > 0 ? `재전송(${cooldown}s)` : '재전송'}
                            </Button>
                        </Box>

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="caption" color="text.secondary">
                            코드 유효 시간: 약 {ttl || 180}초
                        </Typography>
                    </Box>
                )}

                {/* STEP 3: 새 비밀번호 설정 */}
                {step === 'reset' && (
                    <Box sx={{ p: 3, border: '1px solid #ddd', borderRadius: 2, bgcolor: 'white' }}>
                        <Typography sx={{ mb: 2 }}>
                            새 비밀번호를 설정해 주세요.
                        </Typography>

                        {/* 새 비밀번호 */}
                        <TextField
                            label="새 비밀번호"
                            type={showPassword1 ? 'text' : 'password'}
                            value={password1}
                            onChange={handleChangePassword1}
                            onFocus={() => setPw1Focused(true)}
                            onBlur={() => setPw1Focused(false)}
                            fullWidth
                            autoComplete="new-password"
                        />
                        {pw1Focused && (
                            <Typography variant="caption" color={isPwValid ? 'success.main' : 'error'} sx={{ mb: 1 }}>
                                {isPwValid === null
                                    ? ''
                                    : isPwValid
                                        ? '사용 가능한 비밀번호입니다.'
                                        : '영문, 숫자, 특수문자 포함 8~20자여야 합니다.'}
                            </Typography>
                        )}

                        {/* 새 비밀번호 확인 */}
                        <TextField
                            label="새 비밀번호 확인"
                            type={showPassword2 ? 'text' : 'password'}
                            value={password2}
                            onChange={handleChangePassword2}
                            onFocus={() => setPw2Focused(true)}
                            onBlur={() => setPw2Focused(false)}
                            fullWidth
                            sx={{mt: 2}}
                            autoComplete="new-password"
                        />
                        {pw2Focused && (
                            <Typography variant="caption" color={isPwMatch ? 'success.main' : 'error'} sx={{ mb: 2 }}>
                                {password2
                                    ? (isPwMatch ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.')
                                    : ''}
                            </Typography>
                        )}
                        <Button
                            fullWidth
                            variant="contained"
                            sx={{ mt: 2 }}
                            onClick={handleChangePassword}
                            disabled={loading || !isPwValid || !isPwMatch}
                        >
                            {loading ? '변경 중…' : '비밀번호 변경'}
                        </Button>
                    </Box>
                )}
            </Container>
        </AppProvider>
    );
};

export default FindPasswordComponent;
