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
      } catch (e) {
      }
    };

    load(); // Initial load

    // Listen for custom event to refresh unread count
    const handleReportRead = () => {
      load();
    };
    window.addEventListener('reportRead', handleReportRead);

    const t = setInterval(load, 60000); // 60초마다 갱신

    return () => {
      mounted = false;
      clearInterval(t);
      window.removeEventListener('reportRead', handleReportRead); // Clean up event listener
    };
  }, []);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#f9fafb",
        },
      }}
    >
      <Box sx={{ paddingTop: "100px" }}>
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            관리자 페이지
          </Typography>
          <Avatar
            sx={{
              bgcolor: "#e5e7eb",
              width: 56,
              height: 56,
              margin: "0 auto",
              mb: 2,
            }}
          >
            <PersonIcon sx={{ color: "#9ca3af", fontSize: 32 }} />
          </Avatar>
        </Box>

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
                        <Box display="flex" alignItems="center" gap={18}>
                          <span>신고내역</span>
                          <Badge
                            color="error"
                            badgeContent={unread}
                            max={99}
                            overlap="circular"
                          />
                        </Box>
                      ) : (
                        item.label
                      );

                      return (
                        <ListItemButton
                          key={item.label}
                          component={Link}
                          to={item.path}
                          selected={active}
                          sx={{ pl: 4 }}
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
      </Box>
    </Drawer>
  );
};

export default AdminSidebar;
