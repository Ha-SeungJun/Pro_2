// src/layout/component/users/SignUpComponent.jsx
import * as React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import {
    Container, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput,
    Paper, Typography, TextField, FormHelperText, Box, Autocomplete, Button
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate, useLocation } from 'react-router-dom';
import useIdForm from '../../../hooks/useIdForm';
import usePasswordForm from '../../../hooks/usePasswordForm';
import EmailVerifyDialog from '../auth/EmailVerifyDialog';

// ✅ 공통 에러 메시지 헬퍼: 객체/배열/Error 모두 문자열로 변환
function getErrorMessage(data) {
    if (data == null) return '요청에 실패했습니다.';
    if (typeof data === 'string') return data;
    if (data instanceof Error) return data.message || '오류가 발생했습니다.';
    if (typeof data === 'object') {
        if (typeof data.message === 'string') return data.message;
        if (Array.isArray(data)) return data.map(getErrorMessage).join('\n');
        try { return JSON.stringify(data); } catch { return '오류가 발생했습니다.'; }
    }
    return String(data);
}

// 백엔드 베이스 URL
const API_BASE =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) ||
    process.env.REACT_APP_API_BASE ||
    'http://localhost:8080';

// 해시에 signup_ticket이 실려 온 경우를 대비한 파서
function getTicketFromHash(hash) {
    const h = (hash || '').replace(/^#/, '');
    if (!h) return null;
    const map = new URLSearchParams(h);
    return map.get('signup_ticket') || map.get('signupTicket') || map.get('ticket');
}

/* ========= signup_ticket TTL 유틸 ========= */
const SIGNUP_TICKET_KEY = 'signup_ticket';
const SIGNUP_TICKET_TTL_MS = 5 * 60 * 1000; // 5분

function saveSignupTicketRaw(rawTicket) {
    if (!rawTicket) return;
    const payload = { value: String(rawTicket), exp: Date.now() + SIGNUP_TICKET_TTL_MS };
    try { sessionStorage.setItem(SIGNUP_TICKET_KEY, JSON.stringify(payload)); } catch { }
}
function loadSignupTicket() {
    try {
        const raw = sessionStorage.getItem(SIGNUP_TICKET_KEY);
        if (!raw) return null;
        const obj = JSON.parse(raw);
        if (!obj?.value || typeof obj.exp !== 'number') return null;
        if (Date.now() > obj.exp) {
            sessionStorage.removeItem(SIGNUP_TICKET_KEY);
            return null;
        }
        return obj.value;
    } catch { return null; }
}
function clearSignupTicket() {
    try { sessionStorage.removeItem(SIGNUP_TICKET_KEY); } catch { }
}
/* ======================================== */

const SignUpComponent = () => {
    const navigate = useNavigate();
    const { hash } = useLocation();

    // 사용자 유형 (화주/차주)
    const [alignment, setAlignment] = React.useState('user'); // user=화주, car=차주
    const handleAlignment = (_, v) => { if (v) setAlignment(v); };
    const roles = alignment === 'car' ? 'DRIVER' : 'SHIPPER';

    // ID 폼 상태
    const { id, handleChange, isIdValid } = useIdForm();
    const [idChecked, setIdChecked] = React.useState(false);
    const [idAvailable, setIdAvailable] = React.useState(null); // true | false | null
    const [idStatus, setIdStatus] = React.useState('idle');     // idle | checking | available | taken | error
    const [idTouched, setIdTouched] = React.useState(false);

    // 비밀번호 폼 상태
    const {
        password1, password2, isPwValid, isPwMatch,
        showPassword1, showPassword2,
        handleChangePassword1, handleChangePassword2,
        toggleShowPassword1, toggleShowPassword2
    } = usePasswordForm();
    const [pw1Touched, setPw1Touched] = React.useState(false);
    const [pw2Touched, setPw2Touched] = React.useState(false);

    // 기타 폼
    const domainOptions = ['gmail.com', 'naver.com', 'daum.net'];
    const [emailLocal, setEmailLocal] = React.useState('');
    const [emailDomain, setEmailDomain] = React.useState('');
    const [emailVerified, setEmailVerified] = React.useState(false);
    const [openEmailModal, setOpenEmailModal] = React.useState(false);
    const [emailLocked, setEmailLocked] = React.useState(false); // ✅ 소셜 첫가입이면 true

    const [name, setName] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [selectedAddress, setSelectedAddress] = React.useState('');
    const [detailAddress, setDetailAddress] = React.useState('');

    const [submitting, setSubmitting] = React.useState(false);
    const [submitError, setSubmitError] = React.useState(''); // ✅ 문자열만 저장

    const fullEmail = React.useMemo(() => {
        const l = emailLocal.trim(); const d = emailDomain.trim();
        return l && d ? `${l}@${d}` : '';
    }, [emailLocal, emailDomain]);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const canOpenVerify = !!fullEmail && emailRegex.test(fullEmail);

    const onClickVerifyEmail = () => {
        if (emailLocked) return; // ✅ 소셜 이메일 잠금 시 인증 모달 금지
        if (!canOpenVerify) return;
        setOpenEmailModal(true);
    };
    const handleEmailVerified = (ok) => {
        setEmailVerified(!!ok);
        if (ok) setOpenEmailModal(false);
    };

    /* ===============================
       소셜 첫가입 컨텍스트: 단일 가드 + 로더
       =============================== */
    React.useEffect(() => {
        const fromHash = getTicketFromHash(hash);

        // A) 일반 경로(해시에 티켓 없음)
        if (!fromHash) {
            clearSignupTicket();
            setEmailLocked(false);
            setEmailVerified(false);
            setEmailLocal('');
            setEmailDomain('');
            setName('');
            return;
        }

        // B) 소셜 리다이렉트(해시에 티켓 있음) → 세션 저장 후 해시 제거
        saveSignupTicketRaw(fromHash);
        try {
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        } catch { }

        const ticket = loadSignupTicket();
        if (!ticket) {
            clearSignupTicket();
            setEmailLocked(false);
            setEmailVerified(false);
            setEmailLocal('');
            setEmailDomain('');
            setName('');
            return;
        }

        // C) 소셜 컨텍스트 로드
        (async () => {
            try {
                const r = await fetch(
                    `${API_BASE}/api/auth/social/signup-context?ticket=${encodeURIComponent(ticket)}`,
                    { headers: { Accept: 'application/json' } }
                );
                if (!r.ok) {
                    clearSignupTicket();
                    setEmailLocked(false);
                    setEmailVerified(false);
                    setEmailLocal('');
                    setEmailDomain('');
                    setName('');
                    return;
                }
                const data = await r.json(); // { email, provider, name }

                if (data?.email) {
                    const [local, ...rest] = String(data.email).split('@');
                    setEmailLocal(local || '');
                    setEmailDomain(rest.join('@') || '');
                    setEmailVerified(true); // 서버 이메일이면 인증 완료 처리
                    setEmailLocked(true);   // 읽기 전용
                }
                if (data?.name) setName(data.name);
            } catch {
                clearSignupTicket();
                setEmailLocked(false);
                setEmailVerified(false);
                setEmailLocal('');
                setEmailDomain('');
                setName('');
            }
        })();
    }, [hash]);

    /* ===============================
       페이지 이탈(unmount) 시 티켓 정리 (추가 안전망)
       =============================== */
    React.useEffect(() => {
        return () => {
            clearSignupTicket();
        };
    }, []);

    // ===============================
    // ID 중복 확인 (고정 경로: /api/auth/check-id)
    // ===============================
    const handleCheckId = (() => {
        let reqToken = 0;
        return async () => {
            if (!id || !isIdValid) return;

            const myToken = ++reqToken;

            setIdStatus('checking');
            setIdChecked(false);
            setIdAvailable(null);

            try {
                const res = await fetch(
                    `${API_BASE}/api/auth/check-id?loginId=${encodeURIComponent(id)}`,
                    { method: 'GET', headers: { Accept: 'application/json' } }
                );

                if (myToken !== reqToken) return;

                if (!res.ok) {
                    let msg = '';
                    try { msg = await res.text(); } catch { }
                    console.warn('check-id failed', res.status, msg?.slice?.(0, 200));
                    setIdStatus('error');
                    setIdChecked(true);
                    setIdAvailable(null);
                    return;
                }

                const ct = res.headers.get('content-type') || '';
                let data = null;
                if (ct.includes('application/json')) {
                    data = await res.json();
                } else {
                    const txt = await res.text();
                    try { data = JSON.parse(txt); } catch {
                        console.warn('Non-JSON response for check-id:', txt?.slice?.(0, 200));
                        setIdStatus('error');
                        setIdChecked(true);
                        setIdAvailable(null);
                        return;
                    }
                }

                const toAvailable = (obj) => {
                    if (!obj || typeof obj !== 'object') return null;
                    if ('available' in obj) return !!obj.available;
                    if ('isDuplicate' in obj) return !obj.isDuplicate;
                    if ('duplicate' in obj) return !obj.duplicate;
                    if ('exists' in obj) return !obj.exists;
                    if ('inUse' in obj) return !obj.inUse;
                    if ('count' in obj) return !(Number(obj.count) > 0);
                    for (const v of Object.values(obj)) {
                        if (v && typeof v === 'object') {
                            const r = toAvailable(v);
                            if (r !== null) return r;
                        }
                    }
                    return null;
                };

                const available = toAvailable(data);
                if (available === true) {
                    setIdAvailable(true);
                    setIdChecked(true);
                    setIdStatus('available');
                } else if (available === false) {
                    setIdAvailable(false);
                    setIdChecked(true);
                    setIdStatus('taken');
                } else {
                    console.warn('Unrecognized check-id payload:', data);
                    setIdAvailable(null);
                    setIdChecked(true);
                    setIdStatus('error');
                }
            } catch (e) {
                console.error(e);
                setIdStatus('error');
                setIdChecked(true);
                setIdAvailable(null);
            }
        };
    })();

    // 주소 검색
    const handleAddressSearch = () => {
        new window.daum.Postcode({
            oncomplete: (data) => setSelectedAddress(data.address)
        }).open();
    };

    // 제출 가능 여부
    const canSubmit =
        isIdValid &&
        idChecked && idAvailable === true &&
        isPwValid && isPwMatch &&
        !!(emailLocked ? (emailLocal && emailDomain) : fullEmail) &&
        (emailLocked || emailVerified) &&
        name.trim().length > 0 &&
        password1.length >= 8;

    // 가입 요청
    const onSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit || submitting) return;

        setSubmitError('');
        setSubmitting(true);

        try {
            // 공통 페이로드
            const payloadBase = {
                role: roles, // "SHIPPER" | "DRIVER"
                loginId: id,
                password: password1,
                name,
                email: fullEmail, // (소셜의 경우 서버가 ticket의 email을 우선시)
                phone,
                address: `${selectedAddress} ${detailAddress}`.trim()
            };

            const signupTicket = loadSignupTicket();

            if (emailLocked && signupTicket) {
                // ✅ 소셜 첫가입: signup_ticket 포함해 complete-signup 호출
                const res = await fetch(`${API_BASE}/api/auth/social/complete-signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ signupTicket, ...payloadBase })
                });

                const text = await res.text();
                let data;
                try { data = JSON.parse(text); } catch { data = text; }

                if (!res.ok) {
                    const msg = getErrorMessage(data) || '가입 실패';
                    setSubmitError(msg);       // ✅ 문자열만 저장
                    setSubmitting(false);
                    return;
                }

                // 성공 → 토큰 저장 후 홈
                if (data?.accessToken) localStorage.setItem('accessToken', data.accessToken);
                if (data?.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
                clearSignupTicket();
                navigate('/', { replace: true });
                return;
            }

            // ✅ 일반 가입: 기존 signup API 사용
            const res = await fetch(`${API_BASE}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payloadBase)
            });

            const text = await res.text();
            let data;
            try { data = JSON.parse(text); } catch { data = text; }

            if (!res.ok) {
                const msg = getErrorMessage(data) || '가입 실패';
                setSubmitError(msg);         // ✅ 문자열만 저장
                setSubmitting(false);
                return;
            }

            // 일반 가입 성공 UX
            navigate('/login?joined=1', { replace: true });
        } catch (err) {
            console.error(err);
            setSubmitError('네트워크 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
            <Paper elevation={3} sx={{ p: 4, maxWidth: '80%', minWidth: '50%' }} component="form" onSubmit={onSubmit}>
                <Typography variant="h5" align="center" gutterBottom sx={{ mb: 2 }}>회원가입</Typography>

                <ToggleButtonGroup value={alignment} exclusive onChange={handleAlignment} fullWidth sx={{ mb: 2 }}>
                    <ToggleButton value="user" sx={{ width: '50%' }}>화주</ToggleButton>
                    <ToggleButton value="car" sx={{ width: '50%' }}>차주</ToggleButton>
                </ToggleButtonGroup>

                {/* ID */}
                <Box display="flex" alignItems="flex-start" gap={1} sx={{ mb: 1.5 }}>
                    <TextField
                        id="outlined-id"
                        label="ID"
                        value={id}
                        onChange={(e) => {
                            handleChange(e);
                            setIdChecked(false);
                            setIdAvailable(null);
                            setIdStatus('idle');
                        }}
                        onFocus={() => setIdTouched(true)}
                        onBlur={() => setIdTouched(false)}
                        error={(idTouched || idChecked) && id !== '' && (idStatus === 'error' || !isIdValid || idAvailable === false)}
                        helperText={
                            (idTouched || idChecked) && id !== ''
                                ? (!idChecked
                                    ? '8~15자, 영문 대소문자와 숫자만 허용됩니다.'
                                    : idStatus === 'checking'
                                        ? '확인 중...'
                                        : idStatus === 'error'
                                            ? '확인 중 오류가 발생했습니다. 잠시 후 다시 시도하세요.'
                                            : !isIdValid
                                                ? ''
                                                : idAvailable === false
                                                    ? '이미 사용 중인 ID입니다.'
                                                    : '사용 가능한 ID입니다.')
                                : ''
                        }
                        sx={{ width: '99%' }}
                    />
                    <Box sx={{ width: '30%', display: 'flex' }}>
                        <Button
                            variant="outlined"
                            size="large"
                            sx={{ height: '55px', flex: 1 }}
                            onClick={handleCheckId}
                            disabled={!id || !isIdValid || idStatus === 'checking'}
                        >
                            {idStatus === 'checking' ? '확인 중...' : '중복확인'}
                        </Button>
                    </Box>
                </Box>

                {/* 비밀번호 */}
                <FormControl sx={{ width: '100%', mb: 1.5 }} variant="outlined" error={pw1Touched && isPwValid === false}>
                    <InputLabel htmlFor="password1">Password</InputLabel>
                    <OutlinedInput
                        id="password1"
                        autoComplete="new-password"
                        type={showPassword1 ? 'text' : 'password'}
                        value={password1}
                        onChange={handleChangePassword1}
                        onFocus={() => setPw1Touched(true)}
                        onBlur={() => setPw1Touched(false)}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton onClick={toggleShowPassword1} onMouseDown={(e) => e.preventDefault()} edge="end">
                                    {showPassword1 ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        }
                        label="Password"
                    />
                    {pw1Touched && (
                        <FormHelperText>
                            {isPwValid === null ? '' : isPwValid ? '사용 가능한 비밀번호입니다.' : '영문, 숫자, 특수문자 포함 8~20자여야 합니다.'}
                        </FormHelperText>
                    )}
                </FormControl>

                {/* 비밀번호 재입력 */}
                <FormControl sx={{ width: '100%', mb: 1.5 }} variant="outlined" error={pw2Touched && isPwMatch === false}>
                    <InputLabel htmlFor="password2">Password 재입력</InputLabel>
                    <OutlinedInput
                        id="password2"
                        autoComplete="new-password"
                        type={showPassword2 ? 'text' : 'password'}
                        value={password2}
                        onChange={handleChangePassword2}
                        onFocus={() => setPw2Touched(true)}
                        onBlur={() => setPw2Touched(false)}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton onClick={toggleShowPassword2} onMouseDown={(e) => e.preventDefault()} edge="end">
                                    {showPassword2 ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        }
                        label="Password 재입력"
                    />
                    {pw2Touched && password2 !== '' && (
                        <Typography color={isPwMatch ? 'success.main' : 'error'} variant="caption">
                            {isPwMatch ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
                        </Typography>
                    )}
                </FormControl>

                {/* 이메일 */}
                <Box display="flex" gap={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <TextField
                        label="Email"
                        value={emailLocal}
                        onChange={(e) => { if (!emailLocked) { setEmailLocal(e.target.value); setEmailVerified(false); } }}
                        InputProps={{ readOnly: emailLocked }}
                        sx={{ flex: '1 1 0', mr: 1.3 }}
                    />
                    <Typography sx={{ width: 32, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>@</Typography>
                    <Autocomplete
                        freeSolo
                        options={['gmail.com', 'naver.com', 'daum.net']}
                        value={emailDomain}
                        onInputChange={(_, v) => { if (!emailLocked) { setEmailDomain(v); setEmailVerified(false); } }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="선택"
                                InputProps={{ ...params.InputProps, readOnly: emailLocked }}
                            />
                        )}
                        sx={{ flex: '1 1 0' }}
                    />
                    <Button
                        variant={emailVerified ? 'contained' : 'outlined'}
                        color={emailVerified ? 'success' : 'primary'}
                        size="large"
                        sx={{ height: 56, whiteSpace: 'nowrap' }}
                        onClick={onClickVerifyEmail}
                        disabled={emailLocked || !canOpenVerify}
                    >
                        {emailLocked ? '인증완료' : (emailVerified ? '인증완료' : '인증하기')}
                    </Button>
                </Box>

                <EmailVerifyDialog
                    open={openEmailModal}
                    email={fullEmail}
                    onClose={() => setOpenEmailModal(false)}
                    onVerified={handleEmailVerified}
                />

                {/* 이름, 전화번호, 주소 */}
                <TextField
                    label="이름"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    variant="outlined"
                    sx={{ width: '100%', mb: 1.5 }}
                />
                <TextField
                    label="전화번호"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    variant="outlined"
                    sx={{ width: '100%', mb: 1.5 }}
                />
                <TextField
                    disabled
                    label="주소"
                    value={selectedAddress}
                    fullWidth
                    InputProps={{
                        inputProps: { readOnly: true },
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={handleAddressSearch}><SearchIcon /></IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: '100%', mb: 1.5 }}
                />
                <TextField
                    label="상세 주소"
                    value={detailAddress}
                    onChange={(e) => setDetailAddress(e.target.value)}
                    variant="outlined"
                    sx={{ width: '100%', mb: 1.5 }}
                />

                {/* 차주 전용 추가 정보 (선택) */}
                {alignment === 'car' && (
                    <Box>
                        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                            <Typography sx={{ width: '20%', ml: 1 }}>화물차 무게</Typography>
                            <Autocomplete
                                disablePortal
                                options={['1톤', '1.4톤', '2.5톤', '5톤', '8톤', '11톤', '25톤', '25톤 이상']}
                                renderInput={(params) => <TextField {...params} label="톤수 선택" variant="outlined" />}
                                sx={{ width: '80%' }}
                            />
                        </Box>
                    </Box>
                )}

                {/* 서버 에러 */}
                {submitError && (
                    <Typography color="error" sx={{ mb: 1, whiteSpace: 'pre-line' }}>
                        {submitError}
                    </Typography>
                )}

                <Box sx={{ width: '100%', display: 'flex' }}>
                    <Button variant="outlined" size="large" sx={{ width: '100%', height: '55px' }}
                        type="submit" disabled={!canSubmit || submitting}>
                        {submitting ? '가입 중...' : '회원가입'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default SignUpComponent;
