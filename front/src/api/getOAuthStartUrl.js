const API_BASE =
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_API_BASE ||
    "http://https://pro-2-ayf7.onrender.com";

export const getOAuthStartUrl = (provider /* 'google' | 'naver' | 'kakao' */) =>
    `${API_BASE}/oauth2/authorization/${provider}`;