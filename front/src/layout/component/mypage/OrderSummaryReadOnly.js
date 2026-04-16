import React, { useEffect, useMemo, useState } from "react";
import { Box, Paper, Grid, Typography, Divider, Button } from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import { useLocation } from "react-router-dom";
import { postOrderPome } from "../../../api/orderAPI/orderApi";

const LABEL_WIDTH = 120;
const NAME_WIDTH = 110;

const serverInitState = {
  ordererName: "",
  ordererPhone: "",
  ordererEmail: "",
  startAddress: "",
  endAddress: "",
  startRestAddress: "",
  endRestAddress: "",
  addressee: "",
  addresseeEmail: "",
  receiverPhone: "",
  baseCost: "",
  distanceCost: "",
  specialOptionCost: "",
  totalCost: "",
  matchingNo: "",
};

// ===== 인쇄 핸들러 =====
const handlePrint = () => {
  window.print();
};

const splitPhone = (raw) => {
  const d = (raw ?? "").replace(/\D/g, "");
  if (!d) return ["", "", ""];
  if (d.startsWith("02") && (d.length === 9 || d.length === 10)) {
    return d.length === 9
      ? [d.slice(0, 2), d.slice(2, 5), d.slice(5)]
      : [d.slice(0, 2), d.slice(2, 6), d.slice(6)];
  }
  if (d.length === 11) return [d.slice(0, 3), d.slice(3, 7), d.slice(7)];
  if (d.length === 10) return [d.slice(0, 3), d.slice(3, 6), d.slice(6)];
  return [d.slice(0, 3), d.slice(3, d.length - 4), d.slice(-4)];
};

const joinPhone = (raw) => {
  const [a, b, c] = splitPhone(raw);
  return [a, b, c].filter(Boolean).join("-") || "";
};

const toCurrency = (v) => {
  if (v === null || v === undefined || v === "") return "";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return n.toLocaleString("ko-KR");
};

const FieldRow = ({ label, children, dense = false, className }) => (
  <Grid
    className={className}
    container
    alignItems="center"
    wrap="nowrap"
    sx={{
      py: dense ? 0.75 : 1.25,
      borderBottom: "1px dashed #e0e0e0",
    }}
  >
    <Grid item sx={{ width: LABEL_WIDTH, pr: 2 }}>
      <Typography sx={{ fontWeight: 600, textAlign: "right" }}>{label}</Typography>
    </Grid>
    <Grid item sx={{ flex: 1, minWidth: 0 }}>
      <Box
        sx={{
          px: 1,
          display: "flex",
          alignItems: "center",
          minHeight: 28,
          fontFamily:
            "'Pretendard', 'Inter', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
          color: "#222",
          wordBreak: "break-all",
        }}
      >
        {children}
      </Box>
    </Grid>
  </Grid>
);

const SectionTitle = ({ children }) => (
  <Box sx={{ borderRadius: 3, maxWidth: 800, mx: "auto", mt: 10 }}>
    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.25 }}>
      {children}
    </Typography>
  </Box>
);

const OrderSummaryReadOnly = () => {
  const { state } = useLocation();
  const matchingNo = state?.matchingNo;
  const passedOrderSheet = state?.orderSheet;

  const [serverData, setServerData] = useState(serverInitState);

  // ===== 인쇄 CSS 한 번만 삽입 =====
  useEffect(() => {
    const id = "order-print-style";
    if (document.getElementById(id)) return;

    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = `
  /* 화면에서는 숨김 - 먼저 선언 */
  .print-footer {
    display: none;
  }

  @media print {
    button,
    .no-print,
    header,
    nav,
    .MuiAppBar-root,
    .MuiDrawer-root {
      display: none !important;
    }
    body {
      background-color: white !important;
    }
    .MuiPaper-root {
      border: 1px solid #ccc !important;
      box-shadow: none !important;
    }
    .print-footer {
      display: flex !important;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
    .print-footer img {
      height: 60px;
      width: auto;
    }

  }
`;
    document.head.appendChild(style);
  }, []);

  useEffect(() => {
    if (!matchingNo) return;
    postOrderPome(matchingNo)
      .then((data) => {
        console.log(data);
        setServerData(data);
      })
      .catch(console.error);
  }, [matchingNo]);

  const ordererPhone = useMemo(
    () => joinPhone(serverData.ordererPhone),
    [serverData.ordererPhone]
  );

  const receiverPhone = useMemo(() => {
    const src = serverData.receiverPhone ?? passedOrderSheet?.phone;
    return joinPhone(src);
  }, [serverData.receiverPhone, passedOrderSheet?.phone]);

  return (
    <Box
      sx={{
        px: 4,
        pt: 10,
        pb: 10,
        bgcolor: "#fafafa",
        minHeight: "100vh",
      }}
    >
      <Typography variant="h5" align="center" sx={{ fontWeight: 800, mt: 4, mb: 2, pb: 3 }}>
        주문서 요약 (읽기 전용)
      </Typography>

      {/* ===== 출발지(주문자) 정보 ===== */}
      <SectionTitle>출발지 정보</SectionTitle>
      <Paper
        variant="outlined"
        sx={{ p: 0, mb: 5, borderRadius: 3, maxWidth: 800, mx: "auto", overflow: "hidden" }}
      >
        <Box sx={{ p: 2.5, "& .field-row:last-of-type": { borderBottom: "none", pb: 0 } }}>
          <FieldRow className="field-row" label="주문자">
            <Typography sx={{ width: NAME_WIDTH }}>{serverData.ordererName || ""}</Typography>
          </FieldRow>
          <FieldRow className="field-row" label="물품 출발 주소">
            <Typography>{serverData.startAddress || ""}</Typography>
          </FieldRow>
          <FieldRow className="field-row" label="상세 주소">
            <Typography>{serverData.startRestAddress ?? passedOrderSheet?.startRestAddress ?? ""}</Typography>
          </FieldRow>
          <FieldRow className="field-row" label="휴대전화" dense>
            <Typography>{ordererPhone}</Typography>
          </FieldRow>
          <FieldRow className="field-row" label="이메일" dense>
            <Typography>{serverData.ordererEmail ?? ""}</Typography>
          </FieldRow>
        </Box>
      </Paper>

      {/* ===== 도착지(받는분) 정보 ===== */}
      <SectionTitle>도착지 정보</SectionTitle>
      <Paper
        variant="outlined"
        sx={{ p: 0, mb: 5, borderRadius: 3, maxWidth: 800, mx: "auto", overflow: "hidden" }}
      >
        <Box sx={{ p: 2.5, "& .field-row:last-of-type": { borderBottom: "none", pb: 0 } }}>
          <FieldRow className="field-row" label="받는분">
            <Typography sx={{ width: NAME_WIDTH }}>
              {serverData.addressee ?? passedOrderSheet?.addressee ?? ""}
            </Typography>
          </FieldRow>
          <FieldRow className="field-row" label="물품 도착 주소">
            <Typography>{serverData.endAddress || ""}</Typography>
          </FieldRow>
          <FieldRow className="field-row" label="상세 주소">
            <Typography>{serverData.endRestAddress ?? passedOrderSheet?.endRestAddress ?? ""}</Typography>
          </FieldRow>
          <FieldRow className="field-row" label="휴대전화" dense>
            <Typography>{receiverPhone}</Typography>
          </FieldRow>
          <FieldRow className="field-row" label="이메일" dense>
            <Typography>{serverData.addresseeEmail ?? passedOrderSheet?.addresseeEmail ?? ""}</Typography>
          </FieldRow>
        </Box>
      </Paper>

      {/* ===== 결제/요금 요약 ===== */}
      <SectionTitle>결제 요약</SectionTitle>
      <Paper
        variant="outlined"
        sx={{ p: 0, mb: 5, borderRadius: 3, maxWidth: 800, mx: "auto", overflow: "hidden" }}
      >
        <Box sx={{ p: 2.5 }}>
          <FieldRow label="기본요금">
            <Typography>{toCurrency(serverData.baseCost)} 원</Typography>
          </FieldRow>
          <FieldRow label="거리요금">
            <Typography>{toCurrency(serverData.distanceCost)} 원</Typography>
          </FieldRow>
          <FieldRow label="옵션요금">
            <Typography>{toCurrency(serverData.specialOptionCost)} 원</Typography>
          </FieldRow>

          {serverData.finalPaymentAmount !== undefined &&
            serverData.totalCost > serverData.finalPaymentAmount && (
              <FieldRow label="쿠폰할인">
                <Typography sx={{ color: "error.main", fontWeight: 700 }}>
                  - {toCurrency(serverData.totalCost - serverData.finalPaymentAmount)} 원
                </Typography>
              </FieldRow>
            )}

          <Divider sx={{ my: 2 }} />

          <Grid container alignItems="center" wrap="nowrap" sx={{ py: 1.5 }}>
            <Grid item sx={{ width: LABEL_WIDTH, pr: 2 }}>
              <Typography sx={{ fontWeight: 800, textAlign: "right" }}>총 결제금액 :</Typography>
            </Grid>
            <Grid item sx={{ flex: 1, minWidth: 0 }}>
              <Box
                sx={{
                  px: 1,
                  display: "flex",
                  alignItems: "center",
                  minHeight: 32,
                  fontWeight: 800,
                  fontSize: 18,
                  color: "#d32f2f",
                }}
              >
                {toCurrency(serverData.finalPaymentAmount ?? serverData.totalCost)} 원
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      <Box className="print-footer">
        <img 
          src="/image/logo/main_logo.png" 
          alt="로고" 
          style={{ height: 60, width: "auto" }} 
        />
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          sx={{
            borderRadius: 3,
            px: 4,
            py: 1.5,
            fontWeight: 700,
            boxShadow: 3,
            "@media print": { display: "none" },
          }}
        >
          인쇄, PDF 저장
        </Button>
      </Box>
    </Box>
  );
};

export default OrderSummaryReadOnly;