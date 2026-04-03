import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, Divider, Button, Stack } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { completePayment } from "../../../api/paymentApi/paymentApi";




const Row = ({ label, value, dim }) => (
  <Stack direction="row" alignItems="center" spacing={2} sx={{ py: 1 }}>
    <Box sx={{ width: 160, textAlign: "right", color: "text.secondary" }}>{label}</Box>
    <Typography sx={{ whiteSpace: "pre-wrap", fontWeight: 600, color: dim ? "text.disabled" : "text.primary" }}>
      {value}
    </Typography>
  </Stack>
);

const formatAmount = (v) => {
  if (v == null) return "";
  return Number(v).toLocaleString('ko-KR');
};

const pad2 = (n) => String(n).padStart(2, "0");
const formatDateTime = (value) => {
  if (!value) return "";
  const d = typeof value === "string" || typeof value === "number" ? new Date(value) : value;
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mi = pad2(d.getMinutes());
  return `${yyyy}년 ${mm}월${dd}일 ${hh}시 ${mi}분`;
};

const digitsOnly = (s = "") => String(s).replace(/\D/g, "");

const formatPhone = (raw) => {
  const d = digitsOnly(raw);
  if (!d) return raw || "";
  if (d.startsWith("02")) {
    if (d.length === 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
    if (d.length >= 10) return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6, 10)}`;
  }
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return raw; 
};

const PaymentComponent = () => {
  const { state } = useLocation();
  const [viewData, setViewData] = useState();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const paymentNo = state?.paymentNo || sessionStorage.getItem("paymentNo")

  useEffect(() => {

    if (!paymentNo) {
      alert("잘못된 접근 방식 입니다.")
      navigate("/")
      return;
    }
    (async () => {
      try {
        const dto = await completePayment(paymentNo);
        setViewData({
          orderUuid: dto.orderUuid,
          cargoName: dto.cargoName,
          cargoPhone: dto.cargoPhone,
          addresseeName: dto.addressee,
          addresseePhone: dto.addresseePhone,
          endAddress: dto.endAddress,
          endRestAddress: dto.endRestAdreess,
          paymentMethod: dto.paymentMethod,
          paidAt: dto.paidAt,
          totalCost: dto.totalCost,
        })
      } catch (e) {
        console.error(e);
        alert("주문 완료 정보를 불러오지 못했습니다.");
        navigate("/");
      } finally {
        setLoading(false)
      }
    })();
  }, [paymentNo, navigate]);

  if (loading) return <Box sx={{ p: 4 }}>불러오는 중…</Box>;
  if (!viewData) return null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa", py: 6, px: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>주문 완료</Typography>
      <Typography sx={{ color: "primary.main", fontWeight: 700, mb: 4 }}>
        고객님의 주문이 정상적으로 완료되었습니다
      </Typography>

      <Paper elevation={0} sx={{ width: "100%", maxWidth: 760, borderRadius: 3, border: "1px solid #c8c8c8", p: { xs: 2.5, sm: 4 } }}>
        <Row label="주문번호 :" value={viewData.orderUuid} />
        <Row label="화물 운반자 이름 :" value={viewData.cargoName} />
        <Row label="화물 운반자 전화번호 :" value={formatPhone(viewData.cargoPhone)} />

        <Divider sx={{ my: 1.5 }} />

        <Row label="받으시는 분 :" value={viewData.addresseeName} />
        <Row label="전화번호 :" value={formatPhone(viewData.addresseePhone)} />
        <Row label="배송지 정보 :" value={viewData.endAddress} />
        <Row label={"\u00A0"} value={viewData.endRestAddress} />

        <Divider sx={{ my: 1.5 }} />

        <Row label="결제 정보 :" value={viewData.paymentMethod} />
        <Row label="승인일시 :" value={formatDateTime(viewData.paidAt)} />
        <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 1 }}>
          <Box sx={{ width: 160,fontWeight: 900, fontSize: 18,textAlign: "right", color: "error.main" }}>결제 금액 :</Box>
          <Typography sx={{ whiteSpace: "pre-wrap", fontSize: 24 ,fontWeight: 900 ,color: "error.main"}}>
          {formatAmount(viewData.totalCost)}
          </Typography>
          <Typography sx={{ color: "error.main", fontWeight: 900, fontSize: 18 }}>원</Typography>
        </Stack>

        <Divider sx={{ my: 1.5 }} />
        
{/* 
        <Stack direction="row" justifyContent="flex-start" alignItems="baseline" spacing={1} sx={{ mt: 0.5 }}>
          <Typography sx={{ color: "error.main", fontWeight: 900, fontSize: 18 }}>결제 금액 :</Typography>
          <Typography sx={{ color: "error.main", fontWeight: 900, fontSize: 24 }}>{viewData.totalCost}</Typography>
          <Typography sx={{ color: "error.main", fontWeight: 900, fontSize: 18 }}>원</Typography>
        </Stack> */}
      </Paper>

      <Button
        variant="contained"
        size="large"
        sx={{ mt: 4, minWidth: 260, borderRadius: 2 }}
        onClick={()=>(navigate("/"))}
      >
        홈으로 가기
      </Button>
    </Box>
  );
}


export default PaymentComponent