import * as React from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SNSLoginComponent from './SNSLoginComponent';

const LoginComponent = ({
  onSubmit,
  onFindId,
  onFindPassword,
  loading = false,
  initialLoginId = '',
  resetSignal = 0, // 실패 시 비번 초기화 트리거
}) => {
  const theme = useTheme();
  const [form, setForm] = React.useState({
    loginId: initialLoginId,
    password: '',
    remember: true,
  });

  // ID 프리필 동기화
  React.useEffect(() => {
    setForm((prev) => ({ ...prev, loginId: initialLoginId || '' }));
  }, [initialLoginId]);

  // 실패 시 비밀번호 초기화 + 포커스 (처음 렌더링 시엔 포커스 안 줌)
  const pwRef = React.useRef(null);
  const firstRender = React.useRef(true);
  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return; // 첫 진입일 때는 포커스 주지 않음
    }
    setForm((prev) => ({ ...prev, password: '' }));
    pwRef.current?.focus();
  }, [resetSignal]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!onSubmit) return;
    await onSubmit(form); // { loginId, password, remember }
  };

  const canSubmit = form.loginId.trim() && form.password.trim() && !loading;

  return (
    <AppProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '90vh',
          backgroundColor: '#f5f5f5',
          px: 2,
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: '100%',
            maxWidth: 400,
            p: 4,
            border: '1px solid #ddd',
            borderRadius: 2,
            boxShadow: 3,
            backgroundColor: 'white',
            fontFamily: 'SUIT, sans-serif',
          }}
        >
          <Typography variant="h5" align="center" gutterBottom>
            Sign in
          </Typography>

          {/* 오류 문구는 alert만 사용 */}

          <TextField
            label="ID"
            name="loginId"
            value={form.loginId}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 1 }}
            disabled={loading}
            autoComplete="username"
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            disabled={loading}
            autoComplete="current-password"
            inputRef={pwRef} // 실패 시 포커스 이동
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            disabled={!canSubmit}
          >
            {loading ? '로그인 중…' : '로그인'}
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1.5 }}>
            <Button type="button" onClick={onFindId} disabled={loading}>
              아이디 찾기
            </Button>
            <Button
              type="button"
              onClick={() => onFindPassword?.(form.loginId)}
              disabled={loading}
            >
              비밀번호 찾기
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>OR</Divider>
          <SNSLoginComponent />
        </Box>
      </Box>
    </AppProvider>
  );
};

export default LoginComponent;
