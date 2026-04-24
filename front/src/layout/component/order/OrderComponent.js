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
import { getMyCouponList } from "../../../api/couponApi/couponApi";

// ===== 시안 맞춤 고정 폭 =====
const LABEL_WIDTH = 120; // 라벨 박스 고정폭 (콜론 맞춤, 우측정렬)
const NAME_WIDTH = 150; // 주문자/받는분 입력 상자 폭
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
  matchingNo: '',
  distanceDiscount: 0 // [추가] 거리 할인 필드 초기값
}

const OrderComponent = () => {
  //  [추가] 쿠폰 관련 상태
  const [coupons, setCoupons] = useState([]); // 내 쿠폰 목록
  const [selectedMcno, setSelectedMcno] = useState(""); // 선택된 쿠폰 번호

  //  [추가] 화면에 즉시 보여줄 할인 금액 상태
  const [discountAmount, setDiscountAmount] = useState(0);

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

  //  [추가] 쿠폰 선택 시 할인액을 실시간으로 계산하는 핸들러
  const handleCouponChange = (e) => {
    const mcno = e.target.value;
    setSelectedMcno(mcno);

    if (!mcno) {
      setDiscountAmount(0);
      return;
    }

    const selectedCoupon = coupons.find(c => String(c.mcno) === String(mcno));
    if (selectedCoupon && selectedCoupon.coupon) {
      const { discountType, discountValue } = selectedCoupon.coupon;
      const basePrice = Number(serverData.totalCost) || 0;

      let calculated = 0;
      if (discountType === "FLAT") {
        calculated = discountValue;
      } else {
        //  [수정] Math.floor()를 사용하여 소수점을 완전히 버립니다.
        // 정률 할인(예: 10.5%) 계산 시 발생할 수 있는 소수점 방어
        calculated = Math.floor((basePrice * discountValue) / 100);
      }
      setDiscountAmount(calculated);
    }
  };

  // [추가] 쿠폰 목록 불러오기 (사용자 ID 'test1' 기준)
  useEffect(() => {
    getMyCouponList() // 👈 빈 괄호로 수정 (test1 삭제)
      .then(data => {
        setCoupons(data);
      })
      .catch(console.error);
  }, []);

  // ===== [테스트 자동화 함수] ===== 나중에 주석하기
  const fillTestData = () => {
    setOrderSheet(prev => ({
      ...prev,
      addressee: "홍길동(테스트)",
      startRestAddress: "공학관 101호",
      endRestAddress: "비전관 202호"
    }));
    SetstartPNum("010");
    SetMddlePNum("1234");
    SetEndPNum("5678");
    setEmailLocal("testuser");
    setEmailDomain("naver.com");
    console.log(" 테스트 데이터가 입력되었습니다!");
  };

  const splitPhone = (raw) => {
    const d = (raw ?? "").replace(/\D/g, "");
    if (!d) return ["", "", ""]
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
      setOrderSheet(prev => ({
        ...prev,
        addresseeEmail: fullEmail,
        phone: fullPhone
      }));
      postOrderPome(matchingNo)
        .then((data) => setServerdata(data))
        .catch(console.error)
    }
  }, [matchingNo, setOrderSheet, fullEmail, fullPhone]);

  const LabelBox = (props) => (
    <Box sx={{ mb: 0.5 }}>
      <Typography sx={{ fontWeight: 600 }}>{props.text} :</Typography>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: "#fafafa", minHeight: "100vh", pb: 10 }}>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          주문서 작성
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={fillTestData}
          sx={{ fontWeight: 700, borderRadius: 2, boxShadow: 2, "&:hover": { bgcolor: "#ab47bc" } }}
        >
          데이터 자동 채우기 (TEST)
        </Button>
      </Box>

      {/* 공통 필드 래퍼 컴포넌트 인라인 스타일 */}
      {/* 출발지 정보 */}
      <Box display="flex" justifyContent="flex-start" sx={{ borderRadius: 3, maxWidth: 800, mx: "auto" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>출발지 정보 입력</Typography>
      </Box>
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 3, maxWidth: 800, mx: "auto" }}>

        {/* 주문자 */}
        <Box sx={{ mb: 2 }}>
          <LabelBox text="주문자" />
          <TextField
            size="small"
            fullWidth
            sx={{ mt: { xs: 0.5, sm: 0 }, width: { xs: '100%', sm: NAME_WIDTH } }}
            value={serverData.ordererName}
            inputProps={{ readOnly: true }}
          />
        </Box>

        {/* 출발 주소 */}
        <Box sx={{ mb: 1.5 }}>
          <LabelBox text="물품 출발 주소" />
          <TextField
            size="small"
            placeholder="도로명/지번 전체 주소"
            fullWidth
            sx={{ mt: 0.5 }}
            value={serverData.startAddress}
            inputProps={{ readOnly: true }}
          />
        </Box>

        {/* 상세 주소 */}
        <Box sx={{ mb: 2 }}>
          <LabelBox text="상세 주소 입력" />
          <TextField
            size="small"
            name="startRestAddress"
            placeholder="상세 주소"
            fullWidth
            sx={{ mt: 0.5 }}
            value={orderSheet.startRestAddress}
            onChange={(e) => {
              const val = e.target.value.replace(/[<>{}]/g, "");
              setOrderSheet(prev => ({ ...prev, startRestAddress: val }));
            }}
          />
        </Box>

        {/* 휴대전화 */}
        <Box sx={{ mb: 2 }}>
          <LabelBox text="휴대전화" />
          <Box sx={{ display: "flex", gap: 1, alignItems: 'center', mt: 0.5 }}>
            <TextField size="small" sx={{ flex: 1 }} value={p1} inputProps={{ readOnly: true }} />
            <Typography>-</Typography>
            <TextField size="small" sx={{ flex: 1 }} value={p2} inputProps={{ readOnly: true }} />
            <Typography>-</Typography>
            <TextField size="small" sx={{ flex: 1 }} value={p3} inputProps={{ readOnly: true }} />
          </Box>
        </Box>

        {/* 이메일 */}
        <Box>
          <LabelBox text="이메일" />
          <Box sx={{ display: "flex", gap: 1, alignItems: 'center', mt: 0.5 }}>
            <TextField
              size="small"
              sx={{ flex: 1 }}
              inputProps={{ readOnly: true }}
              value={(serverData?.ordererEmail ?? '').split('@')[0] ?? ''}
            />
            <Typography>@</Typography>
            <TextField
              size="small"
              sx={{ flex: 1 }}
              value={(serverData?.ordererEmail ?? '').split('@')[1] ?? ''}
              inputProps={{ readOnly: true }}
            />
          </Box>
        </Box>
      </Paper>

      {/* 도착지 정보 */}
      <Box display="flex" justifyContent="flex-start" sx={{ borderRadius: 3, maxWidth: 800, mx: "auto" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>도착지 정보 입력</Typography>
      </Box>
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 3, maxWidth: 800, mx: "auto" }}>

        {/* 받는분 */}
        <Box sx={{ mb: 2 }}>
          <LabelBox text="받는분" />
          <TextField
            size="small"
            name="addressee"
            fullWidth
            sx={{ mt: 0.5, width: { xs: '100%', sm: NAME_WIDTH } }}
            onChange={(e) => {
              const val = e.target.value.replace(/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g, "").slice(0, 20);
              setOrderSheet(prev => ({ ...prev, addressee: val }));
            }}
            value={orderSheet.addressee}
          />
        </Box>

        {/* 도착 주소 */}
        <Box sx={{ mb: 1.5 }}>
          <LabelBox text="물품 도착 주소" />
          <TextField
            size="small"
            placeholder="도로명/지번 전체 주소"
            fullWidth
            sx={{ mt: 0.5 }}
            value={serverData.endAddress}
            inputProps={{ readOnly: true }}
          />
        </Box>

        {/* 상세 주소 */}
        <Box sx={{ mb: 2 }}>
          <LabelBox text="상세 주소 입력" />
          <TextField
            size="small"
            name="endRestAddress"
            placeholder="상세 주소"
            fullWidth
            sx={{ mt: 0.5 }}
            value={orderSheet.endRestAddress}
            onChange={(e) => {
              const val = e.target.value.replace(/[<>{}]/g, "");
              setOrderSheet(prev => ({ ...prev, endRestAddress: val }));
            }}
          />
        </Box>

        {/* 휴대전화 */}
        <Box sx={{ mb: 2 }}>
          <LabelBox text="휴대전화" />
          <Box sx={{ display: "flex", gap: 1, alignItems: 'center', mt: 0.5 }}>
            <TextField
              size="small"
              sx={{ flex: 1 }}
              onChange={(e) => SetstartPNum(e.target.value.replace(/\D/g, "").slice(0, 3))}
              value={startPNum}
            />
            <TextField
              size="small"
              sx={{ flex: 1 }}
              onChange={(e) => SetMddlePNum(e.target.value.replace(/\D/g, "").slice(0, 4))}
              value={middlePNum}
            />
            <TextField
              size="small"
              sx={{ flex: 1 }}
              onChange={(e) => SetEndPNum(e.target.value.replace(/\D/g, "").slice(0, 4))}
              value={endPNum}
            />
          </Box>
        </Box>

        {/* 이메일 */}
        <Box>
          <LabelBox text="이메일" />
          <Box sx={{ display: "flex", gap: 1, alignItems: 'center', mt: 0.5, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: { xs: '1 1 100%', sm: 1 } }}>
              <TextField
                size="small"
                sx={{ flex: 1 }}
                value={emailLocal}
                onChange={(e) => setEmailLocal(e.target.value.replace(/[^a-zA-Z0-9._-]/g, ""))}
              />
              <Typography>@</Typography>
              <TextField
                size="small"
                sx={{ flex: 1 }}
                value={emailDomain === "custom" ? customDomain : emailDomain}
                onChange={(e) => setCustomDomain(e.target.value.replace(/[^a-zA-Z0-9.-]/g, ""))}
                placeholder="이메일 도메인"
                disabled={emailDomain !== "custom"}
              />
            </Box>
            <Select
              size="small"
              value={emailDomain}
              onChange={(e) => setEmailDomain(e.target.value)}
              sx={{ flex: { xs: '1 1 100%', sm: '0 0 130px' } }}
            >
              <MenuItem value="naver.com">naver.com</MenuItem>
              <MenuItem value="gmail.com">gmail.com</MenuItem>
              <MenuItem value="daum.net">daum.net</MenuItem>
              <MenuItem value="custom">직접입력</MenuItem>
            </Select>
          </Box>
        </Box>
      </Paper>

      {/* 운임 상세 내역 */}
      <Box display="flex" justifyContent="flex-start" sx={{ borderRadius: 3, maxWidth: 800, mx: "auto" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>운임 상세 내역</Typography>
      </Box>
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 3, maxWidth: 800, mx: "auto", bgcolor: "#fff" }}>
        <Grid container spacing={1.5}>
          <Grid item xs={12} display="flex" justifyContent="space-between">
            <Typography color="textSecondary">기본 운임 (거리 비례)</Typography>
            <Typography fontWeight="500">
              {(Number(serverData.baseCost) + Number(serverData.distanceCost)).toLocaleString()}원
            </Typography>
          </Grid>
          {Number(serverData.distanceDiscount) > 0 && (
            <Grid item xs={12} display="flex" justifyContent="space-between" sx={{ color: "#d32f2f" }}>
              <Typography variant="body2">ㄴ 🚛 장거리 우대 자동 할인</Typography>
              <Typography variant="body2">-{Number(serverData.distanceDiscount).toLocaleString()}원</Typography>
            </Grid>
          )}
          {Number(serverData.specialOptionCost) > 0 && (
            <Grid item xs={12} display="flex" justifyContent="space-between" color="textSecondary">
              <Typography variant="body2">ㄴ ➕ 특이사항 추가 비용</Typography>
              <Typography variant="body2">+{Number(serverData.specialOptionCost).toLocaleString()}원</Typography>
            </Grid>
          )}
          <Grid item xs={12} sx={{ my: 0.5 }}>
            <Divider sx={{ borderStyle: 'dashed' }} />
          </Grid>
          {discountAmount > 0 && (
            <Grid item xs={12} display="flex" justifyContent="space-between" sx={{ color: "#1976d2" }}>
              <Typography variant="body2" fontWeight="bold">ㄴ 🎫 추가 쿠폰 할인 적용</Typography>
              <Typography variant="body2" fontWeight="bold">-{discountAmount.toLocaleString()}원</Typography>
            </Grid>
          )}
          <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>최종 결제 예정 금액</Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: "primary.main" }}>
              {(Number(serverData.totalCost) - discountAmount).toLocaleString()}원
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* 쿠폰 선택 */}
      <Box display="flex" justifyContent="flex-start" sx={{ borderRadius: 3, maxWidth: 800, mx: "auto" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>쿠폰 할인 적용</Typography>
      </Box>
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 3, maxWidth: 800, mx: "auto" }}>
        <Box>
          <LabelBox text="쿠폰 선택" />
          <Select
            fullWidth
            size="small"
            value={selectedMcno}
            onChange={handleCouponChange}
            displayEmpty
            sx={{ mt: 0.5 }}
          >
            <MenuItem value="">사용 안 함</MenuItem>
            {coupons.map((c) => (
              <MenuItem key={c.mcno} value={c.mcno}>
                [{c.coupon.couponName}] {c.coupon.discountValue}
                {c.coupon.discountType === "FLAT" ? "원 할인" : "% 할인"}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Paper>

      <OrderPaymentSelect
        serverData={serverData}
        orderSheet={orderSheet}
        selectedMcno={selectedMcno}
        discountAmount={discountAmount}
      />
    </Box>
  );
}
export default OrderComponent;