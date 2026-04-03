// src/common/ResponsiveAppBar.js
import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Modal from '@mui/material/Modal'; // For ReportComponent Test
import ReportComponent from '../layout/component/mypage/ReportComponent'; // For ReportComponent Test
import axios from 'axios';

import { login as loginAction, logout as logoutAction, getUserInfoAsync } from '../slice/loginSlice';

// ✅ 백엔드 베이스 URL (단일 정의)
const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) ||
  process.env.REACT_APP_API_BASE ||
  'http://localhost:8080';

const pages = [
  { label: '견적서 작성', path: '/estimatepage' },
  { label: '운송 접수 사항', path: '/estimatepage/list' },
  { label: '고객지원', path: '/qaboard' },
  { label: '공지사항', path: '/noboard' },
];

const settings = [
  { label: '마이페이지', path: '/mypage' },
  { label: '주문내역 확인', path: '/mypage' },
  { label: '배송상태', path: '/mypage' },
  { label: '로그아웃', path: '/logout' },
];

const settingsAdmin = [
  { label: '관리자페이지', path: '/admin' },
  { label: '회원조회', path: '/admin/memberAll' },
  { label: '배송상태', path: '/admin/deliveryPage' },
  { label: '로그아웃', path: '/logout' },
];

const DEFAULT_AVATAR = '/image/placeholders/avatar.svg';

const pickToken = () =>
  localStorage.getItem('accessToken') ||
  sessionStorage.getItem('accessToken') ||
  localStorage.getItem('ACCESS_TOKEN') ||
  sessionStorage.getItem('ACCESS_TOKEN') ||
  null;

const normalizeProfileUrl = (v) => {
  if (!v) return null;
  if (v.startsWith('http')) return v;
  if (v.startsWith('/g2i4/uploads/')) return `${API_BASE}${v}`;
  return `${API_BASE}/g2i4/uploads/user_profile/${encodeURIComponent(v)}`;
};

// 간단한 JWT 디코더
function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function ResponsiveAppBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux 상태
  const loginState = useSelector((state) => state?.login);
  const hasReduxLogin = Boolean(loginState?.email || loginState?.memberId);

  // 저장된 토큰
  const accessToken = (typeof window !== 'undefined') ? pickToken() : null;
  const hasToken = Boolean(accessToken);

  // 로그인 여부
  const isLogin = hasReduxLogin || hasToken;

  // 관리자 여부 계산 (Redux.roles 또는 토큰 payload에서)
  const calcIsAdmin = () => {
    const rolesFromRedux = loginState?.roles || loginState?.rolenames || [];
    const rolesArr = Array.isArray(rolesFromRedux) ? rolesFromRedux : [rolesFromRedux].filter(Boolean);

    if (rolesArr.some((r) => String(r).toUpperCase().endsWith('ADMIN'))) return true;

    const t = pickToken();
    if (!t) return false;

    const payload = decodeJwt(t) || {};
    const tokenRoles = payload.roles || payload.rolenames || payload.authorities || [];
    const trArr = Array.isArray(tokenRoles) ? tokenRoles : [tokenRoles].filter(Boolean);
    return trArr.some((r) => String(r).toUpperCase() === 'ADMIN');
  };
  const isAdmin = calcIsAdmin();

  // ✅ 1) 앱 로드 시: accessToken 없고 refreshToken(로컬 저장)만 있을 때 JSON POST 리프레시
  React.useEffect(() => {
    if (hasReduxLogin || accessToken) return;

    let aborted = false;

    const silentRefresh = async () => {
      try {
        const storedRefresh =
          localStorage.getItem('refreshToken') ||
          sessionStorage.getItem('refreshToken');

        if (!storedRefresh) return;

        const res = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ refreshToken: storedRefresh }),
        });

        if (!res.ok) return;

        const data = await res.json().catch(() => ({}));
        const newAccess = data.accessToken || data.access || data.token || null;

        if (!newAccess || aborted) return;

        localStorage.setItem('accessToken', newAccess);
        const payload = decodeJwt(newAccess) || {};
        dispatch(loginAction(payload));
        dispatch(getUserInfoAsync()); // Dispatch after silent refresh

      } catch {
        // ignore
      }
    };

    silentRefresh();
    return () => {
      aborted = true;
    };
  }, [hasReduxLogin, accessToken, dispatch]);

  // ✅ 2) 새로고침 시 accessToken으로 Redux 하이드레이트
  React.useEffect(() => {
    const t = pickToken();
    // 프로필 이미지가 없는 경우에만 정보 가져오기 실행
    if (isLogin && t && !loginState.profileImage) {
      const payload = decodeJwt(t);
      if (payload) {
        // 1. 토큰에서 기본 정보 복원
        dispatch(
          loginAction({
            email: payload.email || payload.memEmail || '',
            nickname: payload.name || '',
            pw: '',
            roles: payload.roles || payload.rolenames || ['USER'],
            memberId: payload.memId || payload.cargoId || payload.sub || null,
          })
        );
        // 2. 서버에서 프로필 이미지 등 추가 정보 가져오기
        dispatch(getUserInfoAsync());
      }
    }
  }, [isLogin, dispatch, loginState.profileImage]);

  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);


  const handleOpenNavMenu = (e) => setAnchorElNav(e.currentTarget);
  const handleOpenUserMenu = (e) => setAnchorElUser(e.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  // ✅ 4) 로그아웃
  const handleLogout = async () => {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      try {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: 'POST',
        });
      } catch {
        /* ignore */
      }

      dispatch(logoutAction());
    } finally {
      handleCloseUserMenu();
      navigate('/login', { replace: true });
    }
  };

  const currentSettings = isAdmin ? settingsAdmin : settings;

  return (
    <AppBar position="static" sx={{ zIndex: (t) => t.zIndex.drawer + 1, bgcolor: '#299AF0' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* 데스크톱 로고 */}
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'bold',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <img src="/image/logo/2b24f6f6-4fd6-4a5d-a19c-74b8feb9a7ab.png" alt="Logo" style={{ height: 100,width:130 ,transform: 'scaleX(-1)' }} />
          </Typography>

          {/* 모바일 메뉴 버튼 */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="open navigation"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {pages.map((page) => (
                <MenuItem key={page.label} to={page.path} component={Link} onClick={handleCloseNavMenu}>
                  <Typography sx={{ textAlign: 'center' }}>{page.label}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* 모바일 로고 */}
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <img src="/image/logo/2b24f6f6-4fd6-4a5d-a19c-74b8feb9a7ab.png" alt="Logo" style={{ height: 60, width:90 ,transform: 'scaleX(-1)' }} />
          </Typography>

          {/* 데스크톱 메뉴 */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.label}
                to={page.path}
                component={Link}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block', fontSize: 20, pr: 3 }}
              >
                {page.label}
              </Button>
            ))}
  
          </Box>
          {/* 우측 사용자 영역 */}
          {isLogin ? (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar
                    alt="User"
                    src={loginState?.profileImage || DEFAULT_AVATAR}
                    sx={{ width: 48, height: 48 }}
                    imgProps={{
                      referrerPolicy: 'no-referrer',
                      onError: (e) => {
                        e.currentTarget.src = DEFAULT_AVATAR;
                      },
                    }}
                  />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {currentSettings.map((s) => {
                  if (s.label === '로그아웃') {
                    return (
                      <MenuItem key={s.label} onClick={handleLogout}>
                        <Typography sx={{ textAlign: 'center' }}>{s.label}</Typography>
                      </MenuItem>
                    );
                  }
                  return (
                    <MenuItem key={s.label} onClick={handleCloseUserMenu} component={Link} to={s.path}>
                      <Typography sx={{ textAlign: 'center' }}>{s.label}</Typography>
                    </MenuItem>
                  );
                })}
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button to="/login" component={Link} sx={{ fontSize: 18, color: 'inherit' }}>
                로그인
              </Button>
              <Button to="/signup" component={Link} sx={{ fontSize: 18, color: 'inherit' }}>
                회원가입
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>

    

    </AppBar>
  );
}