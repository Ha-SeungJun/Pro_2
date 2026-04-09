import React, { useEffect, useState, useMemo } from "react"; //   useMemo 추가
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
} from "@mui/material";
import { requestPayment } from "../../../api/paymentApi/paymentUtil";
import useCustomMove from "../../../hooks/useCustomMove";
import { postOrderCreate } from "../../../api/orderAPI/orderApi";
import { acceptedPayment } from "../../../api/paymentApi/paymentApi";
import { useNavigate } from "react-router-dom";
import { createDelivery } from "../../../api/deliveryApi/deliveryApi";

const CHANNELS = {
    TOSSPAYMENTS: "channel-key-3d19f1f1-7177-4ed0-addd-cf0e2f225912",
    TOSS: "channel-key-480547ae-0d47-46fb-bd42-b41a7c102111",
    KAKAO: "channel-key-aaecd5d1-a431-49b8-b800-930a6fdb89c1",
}

const iniState = {
    payMethod: "",
    channelKey: "",
    provider: ""
}

//   [수정] Props에 selectedMcno와 discountAmount 추가
const OrderPaymentSelect = ({ serverData, orderSheet, selectedMcno, discountAmount = 0 }) => {
    const navigate = useNavigate();
    const [paymentType, setPaymentType] = useState(null);
    const [orderType, setOrderType] = useState(iniState);

    //   [추가] 실제 결제할 최종 금액 계산 로직
    const finalPaymentAmount = useMemo(() => {
        const total = Number(serverData.totalCost ?? 0);
        return Math.max(0, total - discountAmount); // 0원 미만 방지
    }, [serverData.totalCost, discountAmount]);

    const handleCheck = () => {
        if (String(orderSheet.addressee ?? "").trim() === "") {
            alert("받는분 이름을 입력해주세요");
            return;
        }

        const phoneValue = String(orderSheet.phone ?? "").trim();
        const hasNonNumeric = /[^0-9]/.test(phoneValue);

        if(phoneValue ===""){
            alert("받는분 전화번호를 입력해주세요");
            return;
        }
        if(hasNonNumeric) {
            alert("전화번호는 숫자만 입력 가능합니다.");
            return;
        }

        if(phoneValue.length < 10){
            alert("전화번호 형식이 올바르지 않습니다. (최소 10자 이상)");
            return;
        }
        if (String(orderSheet.addresseeEmail ?? "").trim() === "") {
            alert("받는분 이메일을 입력해주세요");
            return;
        }
        handleClick()
    }

    const handleClick = async () => {
        try {
            if (!orderType.channelKey || !orderType.payMethod) return alert("결제 수단을 선택해주세요.");
            if (serverData?.totalCost == null) return alert("결제 금액이 유효하지 않습니다.");
            
            //   [수정] 할인으로 인해 0원이 되었거나 원금이 0원인 경우
            if (finalPaymentAmount === 0) {
                const payload = { ...orderSheet, matchingNo: Number(serverData.matchingNo) };
                const orderNo = await postOrderCreate(payload);
                if (!orderNo) { alert("주문서 번호를 받지 못했습니다."); return; }
                const paymentDTO = {
                    orderSheetNo: orderNo,
                    paymentId: crypto.randomUUID(),
                    paymentMethod: "FREE",
                    easyPayProvider: null,
                    currency: "KRW",
                    mcno: selectedMcno || null //   [추가] 쿠폰 번호 서버 전송
                };
                const paymentNo = await acceptedPayment(paymentDTO);
                createDelivery(paymentNo);
                alert("주문이 완료되었습니다.");
                navigate(`/order/payment`, { state: { paymentNo } });
                return;
            }

            const paymentId = crypto.randomUUID()
            const orderData = {
                paymentId,
                orderName: serverData.ordererName,
                totalAmount: finalPaymentAmount, //   [수정] 할인된 최종 금액으로 결제 요청
                channelKey: orderType.channelKey,
                payMethod: orderType.payMethod,
                provider: orderType.provider,
                customerName: serverData.ordererName,
                customerPhone: serverData.ordererPhone,
                customerEmail: serverData.ordererEmail,
            };
            const res = await requestPayment(orderData)
            if (res?.code !== undefined) {
                alert(res.message || "결제가 취소되었거나 실패했습니다.");
                return;
            }

            const payload = { ...orderSheet, matchingNo: Number(serverData.matchingNo) };
            const orderNo = await postOrderCreate(payload);
            if (!orderNo) {
                console.error("create response:", orderNo);
                alert("주문서 번호를 받지 못했습니다.");
                return;
            }
            const paymentDTO = {
                orderSheetNo: orderNo,
                paymentId: paymentId,
                paymentMethod: orderType.payMethod,
                easyPayProvider: orderType.payMethod === "EASY_PAY" ? orderType.provider : null,
                currency: "KRW",
                mcno: selectedMcno || null //   [추가] 백엔드 승인 API로 쿠폰 번호 전송
            }
            const paymentNo = await acceptedPayment(paymentDTO);

            createDelivery(paymentNo);
            alert("주문이 완료되었습니다.");
            navigate(`/order/payment`, { state: { paymentNo } })

        } catch (err) {
            if (err?.code === "USER_CANCEL" || /cancel/i.test(err?.message || "")) {
                alert("결제를 취소하셨습니다.");
                return;
            }
            console.error("결제 실패:", err);
            alert("결제에 실패했습니다. 다시 시도해주세요.");
        }
    };

    const handleSelectMethod = (e) => {
        const key = e.currentTarget.name;
        setPaymentType(key)
        if (key === "CARD") {
            setOrderType({ payMethod: "CARD", channelKey: CHANNELS.TOSSPAYMENTS, });
        } else if (key === "TOSS") {
            setOrderType({ payMethod: "EASY_PAY", channelKey: CHANNELS.TOSS, provider: "TOSSPAY" });
        } else if (key === "KAKAO") {
            setOrderType({ payMethod: "EASY_PAY", channelKey: CHANNELS.KAKAO, provider: "KAKAOPAY" });
        }
    };

    return (
        <Grid
            container
            spacing={3}
            sx={{ maxWidth: 850, mx: "auto", mt: 4 }}
            alignItems="stretch"
            justifyContent={"space-between"}
            wrap="nowrap"
        >
            <Grid item xs={12} md={7} sx={{ minWidth: 0 }}>
                <Box sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>결제 방법</Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                        <Button name="CARD" variant={paymentType === 'CARD' ? "contained" : "outlined"} sx={{ px: 1, py: 1.5, borderRadius: 2 }} onClick={handleSelectMethod}>신용·체크카드</Button>
                        <Button name="TOSS" variant={paymentType === 'TOSS' ? "contained" : "outlined"} sx={{ p: 0, borderRadius: 2 }} onClick={handleSelectMethod}>
                            <img src="../../image/logo/TossPay_Logo_Primary.png" style={{ width: 100, height: 40 }} alt="toss" />
                        </Button>
                        <Button name="KAKAO" variant={paymentType === 'KAKAO' ? "contained" : "outlined"} sx={{ width: 100, p: 0, borderRadius: 2, }} onClick={handleSelectMethod}>
                            <img src="../../image/logo/payment_icon_yellow_medium.png" style={{ width: 80, height: 30, borderRadius: 7 }} alt="kakao" />
                        </Button>
                    </Box>
                </Box>
            </Grid>

            <Grid item xs={12} md={5} sx={{ minWidth: 0 }}>
                <Paper variant="outlined" sx={{ minWidth: 300, p: 3, borderRadius: 3, height: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>총 결제금액</Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto auto", rowGap: 1, columnGap: 1 }}>
                        <Typography color="text.secondary">기본 운송 요금</Typography>
                        <Typography sx={{ textAlign: "right", minWidth: 80 }}>
                            {serverData.baseCost != null ? Number(serverData.baseCost).toLocaleString() : "\u00A0"}
                        </Typography>
                        <Typography>원</Typography>

                        <Typography color="text.secondary">거리별 요금</Typography>
                        <Typography sx={{ textAlign: "right", minWidth: 80 }}>
                            {serverData.distanceCost != null ? Number(serverData.distanceCost).toLocaleString() : "\u00A0"}
                        </Typography>
                        <Typography>원</Typography>

                        <Typography color="text.secondary">추가 요금</Typography>
                        <Typography sx={{ textAlign: "right", minWidth: 80 }}>
                            {serverData.specialOptionCost != null ? Number(serverData.specialOptionCost).toLocaleString() : "\u00A0"}
                        </Typography>
                        <Typography>원</Typography>
                        
                        {/*   [추가] 할인 내역 표시 섹션 */}
                        {discountAmount > 0 && (
                            <>
                                <Typography color="error.main" sx={{ fontWeight: 700 }}>쿠폰 할인</Typography>
                                <Typography color="error.main" sx={{ textAlign: "right", fontWeight: 700 }}>
                                    - {discountAmount.toLocaleString()}
                                </Typography>
                                <Typography color="error.main" sx={{ fontWeight: 700 }}>원</Typography>
                            </>
                        )}
                    </Box>

                    <Divider />

                    <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                            {/*  [수정] 할인된 최종 금액 표시 */}
                            {finalPaymentAmount.toLocaleString()}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>원</Typography>
                    </Box>

                    <Button variant="contained" size="large" sx={{ mt: "auto", borderRadius: 2 }} onClick={() => handleCheck()}>
                        결제하기
                    </Button>
                </Paper>
            </Grid>
        </Grid>
    )
}

export default OrderPaymentSelect;