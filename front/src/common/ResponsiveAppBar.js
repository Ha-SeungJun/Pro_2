import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { login as loginAction, logout as logoutAction, getUserInfoAsync } from '../slice/loginSlice';
import logo from '../assets/logo.png'; // 기현님 로고 경로 확인!

// ✅ 백엔드 베이스 URL
const API_BASE =
  process.env.REACT_APP_API_BASE ||
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
  // { label: '주문내역 확인', path: '/mypage' },
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
  sessionStorage.getItem('accessToken') ||
  sessionStorage.getItem('accessToken') ||
  sessionStorage.getItem('ACCESS_TOKEN') ||
  sessionStorage.getItem('ACCESS_TOKEN') ||
  null;

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

  // 1. 상태 가져오기
  const loginState = useSelector((state) => state?.login);
  const hasReduxLogin = Boolean(loginState?.email || loginState?.memberId);
  const accessToken = (typeof window !== 'undefined') ? pickToken() : null;
  const isLogin = hasReduxLogin || Boolean(accessToken);

  // 2. ✅ roles 정의 (순서가 가장 먼저 와야 합니다!)
  const roles = Array.isArray(loginState?.roles) ? loginState.roles :
    (loginState?.roles ? [loginState.roles] : []);

  // 3. ✅ 정의된 roles를 사용하여 권한 판별
  const isAdmin = roles.includes('ROLE_ADMIN');
  const isDriver = roles.some(r => String(r).toUpperCase().includes('DRIVER'));

  // 4. 나머지 경로 및 이름 설정
  const myPagePath = isAdmin ? '/admin' : '/mypage';
  const myPageLabel = isAdmin ? '관리자페이지' : '마이페이지';
  const displayUserName = loginState?.memberId || loginState?.nickname || loginState?.email || '회원';



  // ✅ 1) 앱 로드 시: 토큰 리프레시 로직 (기존 엔진 유지)
  useEffect(() => {
    if (hasReduxLogin || accessToken) return;
    let aborted = false;
    const silentRefresh = async () => {
      try {
        const storedRefresh =
          sessionStorage.getItem('refreshToken') ||
          sessionStorage.getItem('refreshToken');

        if (!storedRefresh) return;
        const res = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ refreshToken: storedRefresh }),
        });
        if (!res.ok) return;
        const data = await res.json().catch(() => ({}));
        const newAccess = data.accessToken || data.access || data.token || null;
        if (!newAccess || aborted) return;

        sessionStorage.setItem('accessToken', newAccess);

        const payload = decodeJwt(newAccess) || {};
        dispatch(loginAction(payload));
        dispatch(getUserInfoAsync());
      } catch { /* ignore */ }
    };
    silentRefresh();
    return () => { aborted = true; };
  }, [hasReduxLogin, accessToken, dispatch]);

  // ✅ 2) 새로고침 시 정보 복원 (기존 엔진 유지)
  useEffect(() => {
    const t = pickToken();
    if (isLogin && t && !loginState.profileImage) {
      const payload = decodeJwt(t);
      if (payload) {
        dispatch(
          loginAction({
            email: payload.email || payload.memEmail || '',
            nickname: payload.name || '',
            pw: '',
            roles: payload.roles || payload.rolenames || ['USER'],
            memberId: payload.memId || payload.cargoId || payload.sub || null,
          })
        );
        dispatch(getUserInfoAsync());
      }
    }
  }, [isLogin, dispatch, loginState.profileImage]);

  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleOpenNavMenu = (e) => setAnchorElNav(e.currentTarget);
  const handleOpenUserMenu = (e) => setAnchorElUser(e.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  // ✅ 4) 로그아웃
  const handleLogout = async () => {
    try {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');

      try {
        await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST' });
      } catch { /* ignore */ }
      dispatch(logoutAction());
    } finally {
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="relative z-50 bg-white shadow-lg border-b border-gray-100 text-gray-800 font-sans w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-row justify-between items-center h-16 lg:h-20 relative">



          <Link to="/" className="flex-shrink-0">
            <img
              className="w-36 lg:w-56 h-auto object-contain"
              src={logo}
              alt="퍼스트로드 로고"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-x-8 absolute left-1/2 -translate-x-1/2">
            <Link to="/guide" className="text-base font-bold text-gray-700 hover:text-red-600 transition-colors whitespace-nowrap">이용가이드</Link>
            <Link to="/quick-search" className="text-base font-bold text-gray-700 hover:text-red-600 transition-colors whitespace-nowrap">간편조회</Link>
            <Link to="/estimatepage" className="text-base font-bold text-gray-700 hover:text-red-600 transition-colors whitespace-nowrap">온라인 퀵 접수</Link>
            <Link to="/estimatepage/list" className="text-base font-bold text-gray-700 hover:text-red-600 transition-colors whitespace-nowrap">운송 접수 목록</Link>
            <Link to="/noboard" className="text-base font-bold text-gray-700 hover:text-red-600 transition-colors whitespace-nowrap">공지사항</Link>
            <Link to="/qaboard" className="text-base font-bold text-gray-700 hover:text-red-600 transition-colors whitespace-nowrap">문의사항</Link>

          </nav>

          <div className="flex items-center gap-2 text-sm lg:text-base">
            {isLogin ? (
              <>
                <Link to={myPagePath} className="font-bold text-gray-700 hover:text-red-600">{displayUserName}</Link>
                <span className="text-gray-300">|</span>
                <button onClick={handleLogout} className="font-bold hover:text-red-600">로그아웃</button>
              </>
            ) : (
              <>
                <Link to="/login" className="font-bold hover:text-red-600">로그인</Link>
                <span className="text-gray-300">|</span>
                <Link to="/signup" className="font-bold hover:text-red-600">회원가입</Link>
              </>
            )}

            <button
              className="lg:hidden flex flex-col justify-center gap-[5px] ml-2 p-1"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="메뉴 열기"
            >
              <span className={`block w-[22px] h-[2px] bg-gray-700 rounded transition-all duration-300 ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
              <span className={`block w-[22px] h-[2px] bg-gray-700 rounded transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-[22px] h-[2px] bg-gray-700 rounded transition-all duration-300 ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <nav className="lg:hidden flex flex-col border-t border-gray-100 bg-white">
          {[
            { label: '이용가이드', path: '/guide' },
            { label: '간편조회', path: '/quick-search' },
            { label: '온라인 퀵 접수', path: '/estimatepage' },
            { label: '운송 접수 목록', path: '/estimatepage/list' },
            { label: '공지사항', path: '/noboard' },
            { label: '문의사항', path: '/qaboard' },
          ].map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMenuOpen(false)}
              className="px-6 py-4 text-base font-bold text-gray-700 hover:text-red-600 hover:bg-gray-50 border-b border-gray-100 transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}