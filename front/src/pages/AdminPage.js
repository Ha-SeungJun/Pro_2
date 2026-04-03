import { Outlet } from "react-router-dom";

import { Box } from "@mui/material";
import AdminSidebar from "../common/AdminSidebar";
import ResponsiveAppBar from "../common/ResponsiveAppBar";

const AdminPage = () => (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        <ResponsiveAppBar position="fixed" />
        <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
            <AdminSidebar />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    backgroundColor: "#f3f4f6",
                    overflow: "auto",
                }}
            >
                <Outlet />
            </Box>
        </Box>
    </Box>
);

export default AdminPage;
