// src/layout/component/users/FindIdComponent.jsx
import * as React from 'react';
import {
    Box,
    Button,
    Container,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import EmailVerifyDialog from '../auth/EmailVerifyDialog';
import { useNavigate } from 'react-router-dom';

// 환경별 API 베이스
const API_BASE =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) ||
    process.env.REACT_APP_API_BASE ||
    'http://localhost:8080';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FindIdComponent = ({ onComplete }) => {
    const [email, setEmail] = React.useState('');
    const [openEmailModal, setOpenEmailModal] = React.useState(false);
    const [name, setName] = React.useState('');

    const navigate = useNavigate();

    const canOpenVerify = !!email && emailRegex.test(email) && !!name.trim();

    // 1) 인증 다이얼로그 열기
    const onClickVerifyEmail = () => {
        if (!name.trim()) {
            alert('이름을 입력해 주세요.');
            return;
        }
        if (canOpenVerify) setOpenEmailModal(true);
    };

    // 2) 다이얼로그 인증 성공 → 아이디 조회
    const handleEmailVerified = async (ok) => {
        setOpenEmailModal(false);
        if (!ok || !email) return;

        try {
            const qs = new URLSearchParams({ email });
            if (name.trim()) qs.set('name', name.trim());

            const res = await fetch(`${API_BASE}/api/auth/find-id?${qs.toString()}`, {
                headers: { Accept: 'application/json' },
            });

            if (!res.ok) {
                alert('해당 정보로 가입된 아이디가 없습니다.');
                return;
            }

            const data = await res.json();
            const foundId = data?.loginId || '';

            if (!foundId) {
                alert('해당 정보로 가입된 아이디가 없습니다.');
                return;
            }

            alert(`가입된 아이디는 [ ${foundId} ] 입니다.`);

            const goLogin = window.confirm('로그인 하시겠습니까?');
            if (goLogin) {
                navigate(`/login?loginId=${encodeURIComponent(foundId)}`, { replace: true });
            }

            if (typeof onComplete === 'function') onComplete(foundId);
        } catch (err) {
            console.error(err);
            alert('아이디 찾기 중 오류가 발생했습니다.');
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 700 }}>
                    아이디 찾기
                </Typography>

                {/* 이름 입력 */}
                <TextField
                    label="이름"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    variant="outlined"
                    sx={{ width: '100%', mb: 1.5 }}
                />

                {/* 이메일 입력 */}
                <TextField
                    label="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    variant="outlined"
                    sx={{ width: '100%', mb: 1.5 }}
                    placeholder="example@gmail.com"
                    helperText={
                        email.length > 0 && !emailRegex.test(email)
                            ? '이메일 형식을 확인해 주세요.'
                            : '가입한 이메일만 유효합니다.'
                    }
                    error={email.length > 0 && !emailRegex.test(email)}
                />

                <Button
                    variant="contained"
                    fullWidth
                    sx={{ mt: 1 }}
                    onClick={onClickVerifyEmail}
                    disabled={!canOpenVerify}
                >
                    인증하기
                </Button>
            </Paper>

            {/* 이메일 인증 다이얼로그 */}
            <EmailVerifyDialog
                open={openEmailModal}
                email={email}
                onClose={() => setOpenEmailModal(false)}
                onVerified={handleEmailVerified}
            />
        </Container>
    );
};

export default FindIdComponent;
