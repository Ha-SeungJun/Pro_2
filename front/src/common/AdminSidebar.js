import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  Typography,
  Box,
  ListItemIcon,
  Avatar,
  Badge,
  Divider,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Notifications as NotificationsIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";
import PersonIcon from '@mui/icons-material/Person';
import { fetchUnreadCount } from "../api/adminApi/adminReportsApi";

const drawerWidth = 260;
// ✅ 마이페이지와 동일한 헤더 높이 설정
const APPBAR_HEIGHT_MOBILE = 56;
const APPBAR_HEIGHT_DESKTOP = 100;

const AdminSidebar = () => {
  const location = useLocation();

  const groups = useMemo(() => ([
    {
      title: "이용 통계",
      icon: <DashboardIcon />,
      path: "/admin",
    },
    { title: "배송 조회", icon: <DashboardIcon />, path: "/admin/deliveryPage" },
    {
      title: "회원 관리",
      icon: <PeopleIcon />,
      id: "members",
      items: [
        { label: "차량 승인 관리", path: "/admin/AdminCargoApproval" },
        { label: "전체 회원", path: "/admin/memberAll" },
        { label: "물주", path: "/admin/memberOwner" },
        { label: "차주", path: "/admin/memberCowner" },
        { label: "신고내역", path: "/admin/memberReport", id: "reports" },
        { label: "관리자", path: "/admin/memberAdmin" },
      ],
    },
    {
      title: "공지/문의",
      icon: <NotificationsIcon />,
      id: "notice",
      items: [
        { label: "공지사항", path: "/admin/notice" },
        { label: "문의사항", path: "/admin/inquirie" },
      ],
    },
    {
      title: "운송료",
      icon: <MoneyIcon />,
      id: "fees",
      items: [
        { label: "기본요금", path: "/admin/feesBasic" },
        { label: "추가요금", path: "/admin/feesExtra" },
      ],
    },
  ]), []);

  const initialOpen = useMemo(() => {
    const map = {};
    groups.forEach(g => {
      if (g.items && g.items.some(it => it.path === location.pathname)) {
        map[g.title] = true;
      }
    });
    return map;
  }, [groups, location.pathname]);

  const [openGroups, setOpenGroups] = useState(initialOpen);

  const handleToggle = (groupTitle) => {
    setOpenGroups((prev) => ({ ...prev, [groupTitle]: !prev[groupTitle] }));
  };

  const [unread, setUnread] = useState(0);
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const n = await fetchUnreadCount();
        if (mounted) setUnread(n || 0);
      } catch (e) {}
    };
    load();
    const handleReportRead = () => { load(); };
    window.addEventListener('reportRead', handleReportRead);
    const t = setInterval(load, 60000);
    return () => {
      mounted = false;
      clearInterval(t);
      window.removeEventListener('reportRead', handleReportRead);
    };
  }, []);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        // ✅ [핵심] 마이페이지 Sidebar.js와 100% 동일한 레이아웃 로직 적용
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          position: 'sticky', // Fixed가 아닌 Sticky로 헤더와 나란히 배치
          top: { xs: APPBAR_HEIGHT_MOBILE, md: APPBAR_HEIGHT_DESKTOP },
          alignSelf: 'flex-start',
          backgroundColor: "#f9fafb",
          height: `calc(100vh - ${APPBAR_HEIGHT_DESKTOP}px)`, // 화면 높이에 맞게 조절
        },
      }}
    >
      {/* 상단 프로필 영역 (마이페이지 스타일) */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          관리자 페이지
        </Typography>

        <Avatar
          sx={{ 
            width: 56, 
            height: 56, 
            bgcolor: '#e5e7eb', 
            mb: 2 
          }}
        >
          <PersonIcon sx={{ color: "#9ca3af", fontSize: 32 }} />
        </Avatar>
      </Box>

      <Divider />

      <List disablePadding>
        {groups.map((group) =>
          group.items ? (
            <Box key={group.title}>
              <ListItemButton onClick={() => handleToggle(group.title)}>
                {group.icon && <ListItemIcon>{group.icon}</ListItemIcon>}
                <ListItemText primary={group.title} />
                {openGroups[group.title] ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>

              <Collapse in={openGroups[group.title]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {group.items.map((item) => {
                    const active = location.pathname === item.path;
                    const isReports = item.id === "reports";
                    const primaryNode = isReports ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <span>신고내역</span>
                        <Badge color="error" badgeContent={unread} max={99} />
                      </Box>
                    ) : ( item.label );

                    return (
                      <ListItemButton
                        key={item.label}
                        component={Link}
                        to={item.path}
                        selected={active}
                        sx={{ 
                          pl: 4,
                          // 활성화 시 마이페이지와 비슷한 회색 배경색 적용
                          "&.Mui-selected": { backgroundColor: "#e0e0e0" },
                          "&.Mui-selected:hover": { backgroundColor: "#d5d5d5" }
                        }}
                      >
                        <ListItemText
                          primary={primaryNode}
                          primaryTypographyProps={{
                            fontWeight: active ? 700 : 400,
                            color: active ? "primary.main" : "text.primary",
                          }}
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          ) : (
            <ListItemButton
              key={group.title}
              component={Link}
              to={group.path}
              selected={location.pathname === group.path}
              sx={{
                "&.Mui-selected": { backgroundColor: "#e0e0e0" },
                "&.Mui-selected:hover": { backgroundColor: "#d5d5d5" }
              }}
            >
              {group.icon && <ListItemIcon>{group.icon}</ListItemIcon>}
              <ListItemText
                primary={group.title}
                primaryTypographyProps={{
                  fontWeight: location.pathname === group.path ? 700 : 400,
                  color: location.pathname === group.path ? "primary.main" : "text.primary",
                }}
              />
            </ListItemButton>
          )
        )}
      </List>
    </Drawer>
  );
};

export default AdminSidebar;