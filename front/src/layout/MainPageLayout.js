import Footer from "../common/Footer";
import ResponsiveAppBar from "../common/ResponsiveAppBar";
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';

const MainPageLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const flash = location.state?.flash; // { severity, message }
    const [open, setOpen] = useState(!!flash);

    useEffect(() => {
        if (!flash) return;
        setOpen(true);
        setTimeout(() => {
            navigate(location.pathname, { replace: true });
        }, 0);
    }, [flash, navigate, location.pathname]);
    return (
        <>
            <ResponsiveAppBar />

            <Outlet />
            <Footer />
            <Snackbar
                open={open}
                autoHideDuration={2500}
                onClose={() => setOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setOpen(false)}
                    severity={flash?.severity || 'warning'}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {flash?.message || '로그인이 필요한 페이지입니다.'}
                </Alert>
            </Snackbar>
        </>

    );
}
export default MainPageLayout;