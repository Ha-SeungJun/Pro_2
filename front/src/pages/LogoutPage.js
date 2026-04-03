// src/pages/LogoutPage.jsx
import * as React from 'react';
import useLogout from '../hooks/useLogout';

export default function LogoutPage() {
    const logout = useLogout();
    React.useEffect(() => {
        logout('/login'); // 끝나면 로그인 페이지로
    }, [logout]);
    return null; // 스피너 등 원하면 넣기
}
