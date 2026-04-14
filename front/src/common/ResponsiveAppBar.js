import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { login as loginAction, logout as logoutAction, getUserInfoAsync } from '../slice/loginSlice';
import logo from '../assets/logo.png'; // 기현님 로고 경로 확인!

// ✅ 백엔드 베이스 URL
const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) ||
  process.env.REACT_APP_API_BASE ||
  'http://localhost:8080';

const pickToken = () =>
  localStorage.getItem('accessToken') ||
  sessionStorage.getItem('accessToken') ||
  localStorage.getItem('ACCESS_TOKEN') ||
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

  // Redux 상태 및 로그인 여부 확인 (기존 엔진)
  const loginState = useSelector((state) => state?.login);
  const hasReduxLogin = Boolean(loginState?.email || loginState?.memberId);
  const accessToken = (typeof window !== 'undefined') ? pickToken() : null;
  const isLogin = hasReduxLogin || Boolean(accessToken);

  // ✅ 1) 앱 로드 시: 토큰 리프레시 로직 (기존 엔진 유지)
  useEffect(() => {
    if (hasReduxLogin || accessToken) return;
    let aborted = false;
    const silentRefresh = async () => {
      try {
        const storedRefresh = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
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
        localStorage.setItem('accessToken', newAccess);
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

  // ✅ 3) 로그아웃 (기존 엔진 유지)
  const handleLogout = async () => {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      try {
        await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST' });
      } catch { /* ignore */ }
      dispatch(logoutAction());
    } finally {
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="relative z-50 bg-white shadow-md border-b border-gray-100 text-gray-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex justify-between items-center h-28">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/">
              <img className="w-56 md:w-72 h-auto object-contain" src={logo} alt="퍼스트로드 로고" />
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/quick-search" className="text-base font-bold text-gray-700 hover:text-red-600 transition-colors whitespace-nowrap">
              간편조회
            </Link>
            <Link to="/noboard" className="text-base font-bold text-gray-700 hover:text-red-600 transition-colors whitespace-nowrap">
              공지사항
            </Link>
            <Link to="/guide" className="text-base font-bold text-gray-700 hover:text-red-600 transition-colors whitespace-nowrap">
              이용가이드
            </Link>
            <Link to="/estimatepage" className="text-base font-bold text-gray-700 hover:text-red-600 transition-colors whitespace-nowrap">
                온라인 퀵 접수
            </Link>
            <Link to="/mypage" className="text-base font-bold text-gray-700 hover:text-red-600 transition-colors whitespace-nowrap">
              마이페이지
            </Link>
          </nav>
          <div className="flex items-center space-x-4 text-lg">
            {/* 로그인 상태에 따라 버튼이 자동으로 바뀝니다! */}
            {isLogin ? (
              <>
                <span className="font-bold text-gray-700">{loginState?.nickname || '회원'}님</span>
                <span className="text-gray-300">|</span>
                <button onClick={handleLogout} className="hover:text-red-600 font-bold cursor-pointer">로그아웃</button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-red-600 font-bold">로그인</Link>
                <span className="text-gray-300">|</span>
                <Link to="/signup" className="hover:text-red-600 font-bold">회원가입</Link>
              </>
            )}
            <span className="text-gray-300">|</span>
            <a href="#" className="text-red-500 font-bold hover:text-red-700">
              최대 <span className='text-xl'>10%</span> 적립
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}