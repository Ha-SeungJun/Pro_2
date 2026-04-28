// src/common/AdminBottomNav.jsx
import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction, Badge } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
export default function AdminBottomNav({ tabs, unread = 0 }) {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const current = tabs.findIndex((t) =>
        t.path === '/admin' ? pathname === '/admin' : pathname.startsWith(t.path)
    );

    return (
        <Paper
            sx={{
                display: { xs: 'block', md: 'none' },
                position: 'fixed',
                bottom: 0, left: 0, right: 0,
                zIndex: 1200,
                borderTop: '1px solid',
                borderColor: 'divider',
            }}
            elevation={0}
        >
            <BottomNavigation
                value={current}
                onChange={(_, idx) => navigate(tabs[idx].path)}
                showLabels
                sx={{ height: 64, backgroundColor: '#f9fafb' }}
            >
                {tabs.map((tab) => (
                    <BottomNavigationAction
                        key={tab.path}
                        label={tab.label}
                        icon={tab.icon}
                        sx={{
                            '&.Mui-selected': { color: '#c0392b' },
                            minWidth: 0,
                            '& .MuiBottomNavigationAction-label': { fontSize: '0.65rem' },
                        }}
                    />
                ))}
            </BottomNavigation>
        </Paper>
    );
}