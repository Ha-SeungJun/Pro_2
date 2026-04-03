import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Grid,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  OutlinedInput,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { postOrderPome } from "../../../api/orderAPI/orderApi";
import OrderPaymentSelect from "./OrderPaymentSelect";

// ===== 시안 맞춤 고정 폭 =====
const LABEL_WIDTH = 120; // 라벨 박스 고정폭 (콜론 맞춤, 우측정렬)
const NAME_WIDTH = 110; // 주문자/받는분 입력 상자 폭
const LONG_INPUT_WIDTH = 620; // 긴 주소/상세주소 폭 (시안 기준 넓은 입력)

const iniState = {
  addressee: '',
  phone: '',
  addresseeEmail: '',
  startRestAddress: '',
  endRestAddress: ''
}


const serverInitState = {
  ordererName: '',
  ordererPhone: '',
  ordererEmail: '',
  startAddress: '',
  endAddress: '',
  baseCost: '',
  distanceCost: '',
  specialOptionCost: '',
  totalCost: '',
  matchingNo: ''

}
const OrderComponent = () => {
  const [serverData, setServerdata] = useState(serverInitState);
  const [orderSheet, setOrderSheet] = useState(iniState);
  const [customDomain, setCustomDomain] = useState("");
  const [emailLocal, setEmailLocal] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [startPNum, SetstartPNum] = useState("")
  const [middlePNum, SetMddlePNum] = useState("")
  const [endPNum, SetEndPNum] = useState("")
  const { state } = useLocation();
  const matchingNo = state?.matchingNo;

  const splitPhone = (raw) => {
    const d = (raw ?? "").replace(/\D/g, "");
    if (!d) return ["", "", ""] //우선 3개의 배열 리턴

    if (d.startsWith("02") && (d.length === 9 || d.length === 10)) {
      return d.length === 9 ? [d.slice(0, 2), d.slice(2, 5), d.slice(5)]
        : [d.slice(0, 2), d.slice(2, 6), d.slice(6)]

    }
    if (d.length === 11) return [d.slice(0, 3), d.slice(3, 7), d.slice(7)];
    if (d.length === 10) return [d.slice(0, 3), d.slice(3, 6), d.slice(6)];

    return [d.slice(0, 3), d.slice(3, d.length - 4), d.slice(-4)];
  }

  const [p1, p2, p3] = useMemo(() => splitPhone(serverData?.ordererPhone),
    [serverData?.ordererPhone])

  const domainToUse = emailDomain === "custom" ? customDomain : emailDomain;

  const fullEmail = useMemo(() => {
    if (!emailLocal || !domainToUse) return "";
    return `${emailLocal}@${domainToUse}`;
  }, [emailLocal, domainToUse]);

  const isValidEmail = useMemo(
  () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fullEmail),
  [fullEmail]
);

  const fullPhone = `${startPNum}${middlePNum}${endPNum}`

  const handleChangeOrderSheet = (e) => {
    orderSheet[e.target.name] = e.target.value;
    setOrderSheet({ ...orderSheet })
  }
  useEffect(() => {
    if (matchingNo) {
      setOrderSheet(prev =>({
        ...prev,
        addresseeEmail:fullEmail,
        phone:fullPhone
      }));
      postOrderPome(matchingNo)
        .then((data) => setServerdata(data))
        .catch(console.error)
    }
  }, [matchingNo,setOrderSheet,fullEmail,fullPhone]);

  // 금액 상태 (실제 로직 연결 예정)




  const LabelBox = (props) => (
    <Box sx={{ width: LABEL_WIDTH, pr: 2, display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
      <Typography sx={{ fontWeight: 600 }}>{props.text} :</Typography>
    </Box>
  );


  return (
    <Box sx={{ p: 4, bgcolor: "#fafafa", minHeight: "100vh", pb: 10 }}>
      <Typography variant="h5" align="center" sx={{ fontWeight: 800, mb: 3 }}>
        주문서 작성
      </Typography>
      <Box display="flex" justifyContent="flex-start" sx={{ borderRadius: 3, maxWidth: 800, mx: "auto" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          출발지 정보 입력
        </Typography>
      </Box>
      {/* ===== 출발지 정보 입력 ===== */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3, maxWidth: 800, mx: "auto" }}>


        {/* 주문자 */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap" sx={{ mb: 2 }}>
          <Grid item sx={{ flex: "0 0 auto" }}>
            <LabelBox text="주문자" />
          </Grid>
          <Grid item sx={{ flex: "0 0 auto" }}>
            <TextField size="small" sx={{ width: NAME_WIDTH }} value={serverData.ordererName} inputProps={{ readOnly: true }} />
          </Grid>
        </Grid>

        {/* 물품 출발 주소 */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap" sx={{ mb: 1.5 }}>
          <Grid item sx={{ flex: "0 0 auto" }}>
            <LabelBox text="물품 출발 주소" />
          </Grid>
          <Grid item sx={{ flex: 1, minWidth: 0 }}>
            <TextField size="small" placeholder="도로명/지번 전체 주소" fullWidth value={serverData.startAddress} inputProps={{ readOnly: true }} />
          </Grid>
        </Grid>

        {/* 상세 주소 입력 */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap" sx={{ mb: 2 }}>
          <Grid item sx={{ flex: "0 0 auto" }}>
            <LabelBox text="상세 주소 입력" />
          </Grid>
          <Grid item sx={{ flex: 1, minWidth: 0 }}>
            <TextField size="small" name="startRestAddress" placeholder="상세 주소" fullWidth onChange={handleChangeOrderSheet} />
          </Grid>
        </Grid>

        {/* 휴대전화 */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap" sx={{ mb: 2 }}>
          <Grid item sx={{ flex: "0 0 auto" }}>
            <LabelBox text="휴대전화" />
          </Grid>
          <Grid item sx={{ flex: 1, minWidth: 0, display: "flex", gap: 1 }}>
            <TextField size="small" sx={{ width: "15%" }} value={p1} inputProps={{ readOnly: true }} />
            <Typography variant="h6">-</Typography>
            <TextField size="small" sx={{ width: "20%" }} value={p2} inputProps={{ readOnly: true }} />
            <Typography variant="h6">-</Typography>
            <TextField size="small" sx={{ width: "20%" }} value={p3} inputProps={{ readOnly: true }} />
          </Grid>
        </Grid>

        {/* 이메일 */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap">
          <Grid item sx={{ flex: "0 0 auto" }}>
            <LabelBox text="이메일" />
          </Grid>
          <Grid item sx={{ flex: 1, minWidth: 0, display: "flex", gap: 1 }}>
            <TextField size="small" sx={{ flex: 1, maxWidth:150}} inputProps={{ readOnly: true }}
              value={(serverData?.ordererEmail??'').split('@')[0]??''}/>
            <Typography variant="h6">@</Typography>
            <TextField size="small" sx={{ flex: 1 , maxWidth:300}} placeholder="도메인"  value={(serverData?.ordererEmail??'').split('@')[1]??''}
           inputProps={{ readOnly: true }} />
        

          </Grid>
        </Grid>
      </Paper>
      {/* ===== 도착지 정보 입력 ===== */}
      <Box display="flex" justifyContent="flex-start" sx={{ borderRadius: 3, maxWidth: 800, mx: "auto" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          도착지 정보 입력
        </Typography>
      </Box>
      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3, maxWidth: 800, mx: "auto" }}>


        {/* 받는분 */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap" sx={{ mb: 2 }}>
          <Grid item sx={{ flex: "0 0 auto" }}>
            <LabelBox text="받는분" />
          </Grid>
          <Grid item sx={{ flex: "0 0 auto" }}>
            <TextField size="small" name="addressee" sx={{ width: NAME_WIDTH }} onChange={handleChangeOrderSheet} />
          </Grid>
        </Grid>

        {/* 물품 도착 주소 */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap" sx={{ mb: 1.5 }}>
          <Grid item sx={{ flex: "0 0 auto" }}>
            <LabelBox text="물품 도착 주소" />
          </Grid>
          <Grid item sx={{ flex: 1, minWidth: 0 }}>
            <TextField size="small" placeholder="도로명/지번 전체 주소" fullWidth value={serverData.endAddress} inputProps={{ readOnly: true }} />
          </Grid>
        </Grid>

        {/* 상세 주소 입력 */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap" sx={{ mb: 2 }}>
          <Grid item sx={{ flex: "0 0 auto" }}>
            <LabelBox text="상세 주소 입력" />
          </Grid>
          <Grid item sx={{ flex: 1, minWidth: 0 }}>
            <TextField size="small" name="endRestAddress" placeholder="상세 주소" fullWidth onChange={handleChangeOrderSheet} />
          </Grid>
        </Grid>

        {/* 휴대전화 */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap" sx={{ mb: 2 }}>
          <Grid item sx={{ flex: "0 0 auto" }}>
            <LabelBox text="휴대전화" />
          </Grid>
          <Grid item sx={{ flex: 1, minWidth: 0, display: "flex", gap: 1 }}>
            <TextField size="small" sx={{ width: "15%" }} onChange={(e)=>{
              SetstartPNum(e.target.value);
            }} />
            <Typography variant="h6">-</Typography>
            <TextField size="small" sx={{ width: "20%" }} onChange={(e)=>{
              SetMddlePNum(e.target.value)
            }}/>
            <Typography variant="h6">-</Typography>
            <TextField size="small" sx={{ width: "20%" }} onChange={(e)=>{
              SetEndPNum(e.target.value)
            }}/>
          </Grid>
        </Grid>

        {/* 받는분 이메일 */}
        <Grid container alignItems="center" columnSpacing={1} wrap="nowrap">
          <Grid item sx={{ flex: "0 0 auto" }}>
            <LabelBox text="이메일" />
          </Grid>
          <Grid item sx={{ flex: 1, minWidth: 0, display: "flex", gap: 1 }}>
            <TextField size="small" value={emailLocal} sx={{ flex: 1 }}
            onChange={(e) => setEmailLocal(e.target.value.replace(/\s/g, ""))} />
            <Typography variant="h6">@</Typography>
            <TextField size="small" 
              sx={{ flex: 1 }} value={emailDomain === "custom" ? customDomain : emailDomain}
              onChange={(e) => setCustomDomain(e.target.value.replace(/\s/g, ""))}
              placeholder="이메일을 입력해주세요"
              disabled={emailDomain !== "custom"} />
            <Select
              size="small"
              value={emailDomain}
              onChange={(e) => setEmailDomain(e.target.value)}
              sx={{ flex: 1, minWidth: 0 }}
            >
              <MenuItem value="naver.com">naver.com</MenuItem>
              <MenuItem value="gmail.com">gmail.com</MenuItem>
              <MenuItem value="daum.net">daum.net</MenuItem>
              <MenuItem value="custom">직접입력</MenuItem>
            </Select>

          </Grid>
        </Grid>
      </Paper>

      {/* ===== 결제 섹션 ===== */}


      <OrderPaymentSelect serverData={serverData} orderSheet={orderSheet} />
    </Box>
  );
}
export default OrderComponent;