import React, { useEffect, useState } from "react";
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

const OrderPaymentSelect = ({ serverData, orderSheet }) => {
    const navigate = useNavigate();
    const [paymentType, setPaymentType] = useState(null);
    const [orderType, setOrderType] = useState(iniState);
    
    const handleCheck = () => {
        if (String(orderSheet.addressee ?? "").trim() === "") {
            alert("받는분 이름을 입력해주세요");
            return;
        }
        if (String(orderSheet.phone ?? "").trim() === "") {
            alert("받는분 전화번호을 입력해주세요");
            return;
        }
        if (String(orderSheet.addresseeEmail ?? "").trim() === "") {
            alert("받는분 이메일을 입력해주세요");
            return;
        }
        handleClick()//체크 다 되었을시 결제함수 호출
    }

    const handleClick = async () => {
        try {
            // 1) 선택 검증
            if (!orderType.channelKey || !orderType.payMethod) return alert("결제 수단을 선택해주세요.");
            if (!serverData?.totalCost) return alert("결제 금액이 유효하지 않습니다.");

            const paymentId = crypto.randomUUID()
            // 3) 결제 요청
            const orderData = {
                paymentId,
                orderName: serverData.ordererName,
                totalAmount: Number(serverData.totalCost ?? 0),
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
            {/*  결제 섹션 */}
            <Grid item xs={12} md={7} sx={{ minWidth: 0 }}>
                <Box sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                        결제 방법
                    </Typography>
                    <Divider sx={{ mb: 3 }} />

                    <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                        <Button name="CARD" variant={paymentType === 'CARD' ? "contained" : "outlined"} sx={{ px: 1, py: 1.5, borderRadius: 2 }} onClick={handleSelectMethod}>신용·체크카드</Button>
                        <Button name="TOSS" variant={paymentType === 'TOSS' ? "contained" : "outlined"} sx={{ p: 0, borderRadius: 2 }} onClick={handleSelectMethod}>
                            <img
                                src="../../image/logo/TossPay_Logo_Primary.png"
                                style={{ width: 100, height: 40 }}
                            />
                        </Button>
                        <Button name="KAKAO" variant={paymentType === 'KAKAO' ? "contained" : "outlined"} sx={{ width: 100, p: 0, borderRadius: 2, }} onClick={handleSelectMethod}>
                            <img
                                src="../../image/logo/payment_icon_yellow_medium.png"
                                style={{ width: 80, height: 30, borderRadius: 7 }}
                            />
                        </Button>
                    </Box>
                </Box>
            </Grid>
            {/* 요금 결제 창 */}
            <Grid item xs={12} md={5} sx={{ minWidth: 0 }}>
                <Paper
                    variant="outlined"
                    sx={{ minWidth: 300, p: 3, borderRadius: 3, height: "100%", display: "flex", flexDirection: "column", gap: 2 }}
                >
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
                    </Box>

                    <Divider />

                    <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                            {serverData.totalCost != null ? Number(serverData.totalCost).toLocaleString() : "\u00A0"}
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