import { Box, Tabs, Tab } from "@mui/material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const EstimatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 경로로 탭 값 결정
  const getTabValue = () => {
    if (location.pathname.endsWith("/basic")) return 1;
    if (location.pathname.endsWith("/list")) return 2;
    return 0; // 기본 = combined
  };

  const handleTabChange = (e, newValue) => {
    if (newValue === 0) navigate(""); // combined (index)
    if (newValue === 1) navigate("basic");
    if (newValue === 2) navigate("list");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#f9f9f9",
        pt: 4,
      }}
    >
      {/* 탭 버튼 */}
      <Box sx={{ width: "100%", maxWidth: 1200, px: 2, mb: 2 }}>
        <Tabs value={getTabValue()} onChange={handleTabChange}>
          <Tab label="견적서 작성 (통합)" />
          <Tab label="견적서 작성 (기본)" />
          <Tab label="운송 접수 사항" />
        </Tabs>
      </Box>

      <Box sx={{ width: "100%", maxWidth: 1200, px: 2 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default EstimatePage;