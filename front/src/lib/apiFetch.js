// src/lib/apiFetch.js
import { tokenStore } from './tokenStore';

const API_BASE = import.meta?.env?.VITE_API_BASE || process.env.REACT_APP_API_BASE || 'http://localhost:8080';

export async function apiFetch(input, init = {}) {
    const url = input.startsWith('http') ? input : `${API_BASE}${input}`;
    const headers = new Headers(init.headers || {});
    const token = tokenStore.access;
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const res = await fetch(url, { ...init, headers });

    if (res.status !== 401) return res;

    // 401 → 리프레시 시도
    const refresh = tokenStore.refresh;
    if (!refresh) return res;

    const r2 = await fetch(`${API_BASE}/api/auth/refresh?refreshToken=${encodeURIComponent(refresh)}`, {
        method: 'POST'
    });
    if (!r2.ok) return res;

    const data = await r2.json();
    tokenStore.save({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    const retryHeaders = new Headers(init.headers || {});
    retryHeaders.set('Authorization', `Bearer ${data.accessToken}`);
    return fetch(url, { ...init, headers: retryHeaders });
}
