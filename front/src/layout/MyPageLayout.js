//MyPageLayout.js
import { Outlet } from "react-router-dom";
import Box from '@mui/material/Box';
import { Toolbar } from "@mui/material";
import ResponsiveAppBar from "../common/ResponsiveAppBar";
import Sidebar from "../common/Sidebar";

const MyPageLayout = () => {
  const ownerId = 1;
  const DRAWER_WIDTH = 240;
  const APPBAR_HEIGHT = { xs: 56, md: 100 };
  return (
    <>
      {/* 상단 앱바 */}
      <ResponsiveAppBar />
      {/* 사이드바 + 메인 콘텐츠 */}
      <Box sx={{ display: 'flex' }}>
        <Sidebar ownerId={ownerId} />

        <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
          {/* 앱바 아래 내용 밀기 */}
          <Outlet />
        </Box>
      </Box>
    </>
  );
};
export default MyPageLayout;
