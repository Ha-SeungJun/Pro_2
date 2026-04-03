import { Box } from "@mui/material"
import EstimateComponent from "../layout/component/estimate/EstimateComponent";
import { Outlet } from "react-router-dom";
 //<EstimateComponent />

const OrderPage = ()=>{
    return(
            <Box
      sx={{
        display: "flex",
        justifyContent: "center", // 가로 가운데 정렬
        width: "100%",
        minHeight: "100vh", // 높이 최소 확보
        backgroundColor: "#f9f9f9", // 배경 확인용 (선택)
        pt: 4,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 1200, px: 2 }}>
       <Outlet/>
      </Box>
    </Box>
  );
};
    

export default OrderPage