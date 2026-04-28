// src/common/BottomNav.jsx
import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import RateReviewIcon from '@mui/icons-material/RateReview';
import PersonIcon from '@mui/icons-material/Person';
import BuildIcon from '@mui/icons-material/Build';
import { useNavigate, useLocation } from 'react-router-dom';

const tabs = [
  { label: '내 정보',     icon: <HomeIcon />,        path: '/mypage' },
  { label: '배송관리',    icon: <DescriptionIcon />, path: '/mypage/delivery' },
  { label: '리뷰',        icon: <RateReviewIcon />,  path: '/mypage/review' },
  { label: '정보수정',    icon: <PersonIcon />,      path: '/mypage/edit' },
];

export default function BottomNav({ isOwner, cargoId }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const allTabs = isOwner && cargoId
    ? [...tabs, { label: '차량관리', icon: <BuildIcon />, path: `/mypage/vehicle/${cargoId}` }]
    : tabs;

  const current = allTabs.findIndex(t => pathname.startsWith(t.path) && (t.path !== '/mypage' || pathname === '/mypage'));

  return (
    <Paper
      sx={{
        display: { xs: 'block', md: 'none' }, // 모바일만 표시
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
      elevation={0}
    >
      <BottomNavigation
        value={current}
        onChange={(_, idx) => navigate(allTabs[idx].path)}
        showLabels
      >
        {allTabs.map(tab => (
          <BottomNavigationAction
            key={tab.path}
            label={tab.label}
            icon={tab.icon}
            sx={{
              '&.Mui-selected': { color: '#c0392b' },
              minWidth: 0,
              fontSize: '0.65rem',
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}