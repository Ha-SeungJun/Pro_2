import { Outlet } from "react-router-dom";
import AdminSidebar from "../../../common/AdminSidebar";
import { Box } from "@mui/material";
import ResponsiveAppBar from "../../../common/ResponsiveAppBar";

const AdminLayout = () => (
  <>
    <ResponsiveAppBar />
    <AdminSidebar />
    <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: "#f3f4f6", overflow: "auto" }}>
      <Outlet />
    </Box>
  </>
);

export default AdminLayout;
