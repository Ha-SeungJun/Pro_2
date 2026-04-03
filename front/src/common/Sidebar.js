// src/common/Sidebar.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  Drawer, List, ListItemIcon, ListItemText, ListItemButton,
  Typography, Avatar, Divider, Box
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import BuildIcon from '@mui/icons-material/Build';
import { useSelector } from 'react-redux';
import axios from 'axios';

const drawerWidth = 240;
const APPBAR_HEIGHT_MOBILE = 56;
const APPBAR_HEIGHT_DESKTOP = 100;
const DEFAULT_AVATAR = '/image/placeholders/avatar.svg';
const pickCargoId = (obj) => {
  if (!obj || typeof obj !== 'object') return null;
  return (
    obj.cargoId ??
    obj.cargo_id ??
    obj.ownerId ??
    obj.cargoOwnerId ??
    obj.loginId ??             // ★ 콘솔 payload/응답에 loginId 있었음
    obj?.user?.cargoId ??
    null
  );
};
// ✅ API 베이스 (앱 전반과 동일 규칙)
const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE) ||
  'http://localhost:8080';

const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('accessToken') ||
    localStorage.getItem('ACCESS_TOKEN') ||
    sessionStorage.getItem('ACCESS_TOKEN');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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

function normalizeRoles(raw) {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr
    .flatMap((r) => {
      if (!r) return [];
      if (typeof r === 'string') return [r];
      if (r.authority) return [r.authority];
      if (r.role) return [r.role];
      if (r.roleName) return [r.roleName];
      if (r.name) return [r.name];
      return [String(r)];
    })
    .map((s) => s.toUpperCase());
}

const Sidebar = () => {
  const loginState = useSelector((state) => state?.login) || {};
  const token = typeof window !== 'undefined' ? pickToken() : null;
  const payload = token ? decodeJwt(token) : null;

  const [fetchedUserType, setFetchedUserType] = useState(null); // 'MEMBER' | 'CARGO_OWNER'
  const [fetchedCargoId, setFetchedCargoId] = useState(null);
  const [ready, setReady] = useState(false);
  // 🔎 백엔드에서 최종 확정(토큰에 권한 없을 수 있으니)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/g2i4/user/info');
        const t =
          data?.userType || data?.data?.userType || data?.type || data?.role || data?.loginType || null;

        // ★ 여기서 넓게 줍기: top-level → data → user 순
        let cid =
          pickCargoId(data) ||
          pickCargoId(data?.data) ||
          pickCargoId(data?.user) ||
          null;

        // ★ 추가 보정: 차주인데 아직 못 찾았으면 loginId/payload.loginId로 보정
        if (!cid && (t === 'CARGO_OWNER')) {
          // 토큰 payload도 이미 계산돼 있음
          cid = data?.loginId || data?.data?.loginId || payload?.loginId || null;
        }

        if (!cancelled) {
          if (t) setFetchedUserType(t);
          if (cid) setFetchedCargoId(cid);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  const avatarUrl = loginState?.profileImage || DEFAULT_AVATAR;

  // ✅ Redux/토큰 역할
  const roles = useMemo(() => {
    const fromRedux = normalizeRoles(loginState?.roles || loginState?.rolenames);
    const fromToken = normalizeRoles(payload?.roles || payload?.rolenames || payload?.authorities);
    return [...fromRedux, ...fromToken];
  }, [loginState, payload]);

  // ✅ 토큰/리덕스 기반 차주 판정
  const isOwnerFromTokenOrRedux = useMemo(
    () => roles.some((r) => r.endsWith('CARGO_OWNER')),
    [roles]
  );

  // ✅ 백엔드 기반 차주 판정
  const isOwnerFromAPI = fetchedUserType === 'CARGO_OWNER';

  // ✅ 최종 차주 판정: 둘 중 하나라도 true면 차주로 본다
  const isOwner = isOwnerFromTokenOrRedux || isOwnerFromAPI;

  // ✅ cargoId: Redux/토큰/백엔드 다 뒤져보기
  const cargoId =
    loginState?.cargoId ??
    loginState?.user?.cargoId ??
    payload?.cargoId ??
    payload?.user?.cargoId ??
    fetchedCargoId ??              // ← 위에서 세팅
    payload?.loginId ??            // ★ 마지막 보정
    null;
  // 버튼은 차주면 무조건 노출(UX 이득). 링크는 cargoId 있으면 개인 경로, 없으면 기본 경로
  const vehicleHref = `/mypage/vehicle/${cargoId}`;

  const navStyle = { textDecoration: 'none', color: 'inherit' };
  const activeStyle = { backgroundColor: '#e0e0e0' };

  // 👉 꼭 한 번 확인해보세요 (임시 디버깅 UI)
  // console.log('[Sidebar] isOwner?', { roles, isOwnerFromTokenOrRedux, fetchedUserType, isOwner, cargoId });

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          position: 'sticky',
          top: { xs: APPBAR_HEIGHT_MOBILE, md: APPBAR_HEIGHT_DESKTOP },
          alignSelf: 'flex-start',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          마이페이지
        </Typography>

        <Avatar
          sx={{ width: 56, height: 56, bgcolor: 'grey.200', color: 'grey.500' }}
          src={avatarUrl}
          imgProps={{
            referrerPolicy: 'no-referrer',
            crossOrigin: 'anonymous',
            loading: 'lazy',
            onError: (e) => { e.currentTarget.src = DEFAULT_AVATAR; },
          }}
          alt="프로필"
        >
          <PersonIcon />
        </Avatar>
      </Box>

      <Divider />

      <List>
        <NavLink to="/mypage" end style={navStyle}>
          {({ isActive }) => (
            <ListItemButton sx={isActive ? activeStyle : null}>
              <ListItemIcon><HomeIcon /></ListItemIcon>
              <ListItemText primary="내 정보" />
            </ListItemButton>
          )}
        </NavLink>

        <NavLink to="/mypage/delivery" style={navStyle}>
          {({ isActive }) => (
            <ListItemButton sx={isActive ? activeStyle : null}>
              <ListItemIcon><DescriptionIcon /></ListItemIcon>
              <ListItemText primary="배송 정보 관리" />
            </ListItemButton>
          )}
        </NavLink>


        <NavLink to="/mypage/edit" style={navStyle}>
          {({ isActive }) => (
            <ListItemButton sx={isActive ? activeStyle : null}>
              <ListItemIcon><PersonIcon /></ListItemIcon>
              <ListItemText primary="회원 정보 수정" />
            </ListItemButton>
          )}
        </NavLink>
        {isOwner && cargoId && (
          <NavLink to={`vehicle/${cargoId}`} style={navStyle}>
            {({ isActive }) => (
              <ListItemButton sx={isActive ? activeStyle : null}>
                <ListItemIcon><BuildIcon /></ListItemIcon>
                <ListItemText primary="내 차량 관리" />
              </ListItemButton>
            )}
          </NavLink>
        )}
      </List>



    </Drawer>
  );
};

export default Sidebar;
