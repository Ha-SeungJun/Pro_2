const API_BASE =
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_API_BASE ||
    "http://localhost:8080";

export const getOAuthStartUrl = (provider /* 'google' | 'naver' | 'kakao' */) =>
    `${API_BASE}/oauth2/authorization/${provider}`;