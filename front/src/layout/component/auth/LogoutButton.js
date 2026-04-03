// src/components/auth/LogoutButton.jsx
import * as React from 'react';
import Button from '@mui/material/Button';
import useLogout from '../../hooks/useLogout';

export default function LogoutButton({ to = '/login', children = '로그아웃' }) {
    const logout = useLogout();
    return (
        <Button variant="text" color="inherit" onClick={() => logout(to)}>
            {children}
        </Button>
    );
}
