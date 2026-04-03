import { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const API_BASE =
  import.meta?.env?.VITE_API_BASE ||
  process.env.REACT_APP_API_BASE ||
  'http://localhost:8080';

const pickToken = () =>
  localStorage.getItem('accessToken') ||
  sessionStorage.getItem('accessToken') ||
  localStorage.getItem('ACCESS_TOKEN') ||
  sessionStorage.getItem('ACCESS_TOKEN') ||
  null;

export default function RequireAuth() {
  const location = useLocation();
  const [ok, setOk] = useState(null);
  const token = pickToken();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) return setOk(false);
      try {
        await axios.get(`${API_BASE}/g2i4/user/info`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!cancelled) setOk(true);
      } catch {
        if (!cancelled) setOk(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  if (ok === null) return null;

  if (!ok) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          from: location,
          flash: { severity: 'warning', message: '로그인이 필요한 페이지입니다.' }
        }}
      />
    );
  }

  return <Outlet />;
}
