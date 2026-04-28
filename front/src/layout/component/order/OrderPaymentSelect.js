import React, { useEffect, useState, useMemo } from "react";
import {
    Box,
    Paper,
    Grid,
    Typography,
    Button,
    Divider,
} from "@mui/material";
import { requestPayment } from "../../../api/paymentApi/paymentUtil";
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

const OrderPaymentSelect = ({ serverData, orderSheet, selectedMcno, discountAmount = 0 }) => {
    const navigate = useNavigate();
    const [paymentType, setPaymentType] = useState(null);
    const [orderType, setOrderType] = useState(iniState);

    // 💡 1. 진짜 원금 (할인 전 고정값)
    const originalTotalCost = useMemo(() => {
        return Number(serverData.totalCost ?? 0);
    }, [serverData.totalCost]);

    // 💡 2. 최종 결제 금액 (할인 후 계산값)
    const finalPaymentAmount = useMemo(() => {
        return Math.max(0, originalTotalCost - discountAmount);
    }, [originalTotalCost, discountAmount]);

    const handleCheck = () => {
        if (String(orderSheet.addressee ?? "").trim() === "") {
            alert("받는분 이름을 입력해주세요");
            return;
        }
        const phoneValue = String(orderSheet.phone ?? "").trim();
        if (phoneValue === "" || /[^0-9]/.test(phoneValue) || phoneValue.length < 10) {
            alert("전화번호 형식이 올바르지 않습니다.");
            return;
        }
        if (String(orderSheet.addresseeEmail ?? "").trim() === "") {
            alert("받는분 이메일을 입력해주세요");
            return;
        }
        handleClick();
    }

    const handleClick = async () => {
        try {
            if (!orderType.channelKey || !orderType.payMethod) return alert("결제 수단을 선택해주세요.");

            if (finalPaymentAmount === 0) {
                const payload = {
                    ...orderSheet,
                    matchingNo: Number(serverData.matchingNo),
                    mcno: selectedMcno || null,
                    totalPrice: finalPaymentAmount
                };
                const orderNo = await postOrderCreate(payload);
                const paymentDTO = {
                    orderSheetNo: orderNo,
                    paymentId: crypto.randomUUID(),
                    paymentMethod: "FREE",
                    currency: "KRW",
                    mcno: selectedMcno || null
                };
                const paymentNo = await acceptedPayment(paymentDTO);
                createDelivery(paymentNo);
                alert("주문이 완료되었습니다.");
                navigate(`/order/payment`, { state: { paymentNo } });
                return;
            }

            const paymentId = crypto.randomUUID();
            const orderData = {
                paymentId,
                orderName: serverData.ordererName,
                totalAmount: finalPaymentAmount,
                channelKey: orderType.channelKey,
                payMethod: orderType.payMethod,
                provider: orderType.provider,
                customerName: serverData.ordererName,
                customerPhone: serverData.ordererPhone,
                customerEmail: serverData.ordererEmail,
            };

            const res = await requestPayment(orderData);
            if (res?.code !== undefined) {
                alert(res.message || "결제에 실패했습니다.");
                return;
            }

            const payload = {
                ...orderSheet,
                matchingNo: Number(serverData.matchingNo),
                mcno: selectedMcno || null,
                totalPrice: finalPaymentAmount
            };

            const orderNo = await postOrderCreate(payload);
            const paymentDTO = {
                orderSheetNo: orderNo,
                paymentId: paymentId,
                paymentMethod: orderType.payMethod,
                easyPayProvider: orderType.payMethod === "EASY_PAY" ? orderType.provider : null,
                currency: "KRW",
                mcno: selectedMcno || null
            };
            const paymentNo = await acceptedPayment(paymentDTO);
            createDelivery(paymentNo);
            alert("주문이 완료되었습니다.");
            navigate(`/order/payment`, { state: { paymentNo } });

        } catch (err) {
            console.error("결제 실패:", err);
            alert("오류가 발생했습니다.");
        }
    };

    const handleSelectMethod = (e) => {
        const key = e.currentTarget.name;
        setPaymentType(key);
        if (key === "CARD") {
            setOrderType({ payMethod: "CARD", channelKey: CHANNELS.TOSSPAYMENTS });
        } else if (key === "TOSS") {
            setOrderType({ payMethod: "EASY_PAY", channelKey: CHANNELS.TOSS, provider: "TOSSPAY" });
        } else if (key === "KAKAO") {
            setOrderType({ payMethod: "EASY_PAY", channelKey: CHANNELS.KAKAO, provider: "KAKAOPAY" });
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: "auto", mt: 4, px: { xs: 0, sm: 0 } }}>

            {/* 결제 방법 */}
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>결제 방법</Typography>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Button
                        name="CARD"
                        variant={paymentType === 'CARD' ? "contained" : "outlined"}
                        onClick={handleSelectMethod}
                        sx={{ flex: { xs: '1 1 auto', sm: '0 0 auto' } }}
                    >
                        신용·체크카드
                    </Button>
                    <Button
                        name="TOSS"
                        variant={paymentType === 'TOSS' ? "contained" : "outlined"}
                        onClick={handleSelectMethod}
                        sx={{ flex: { xs: '1 1 auto', sm: '0 0 auto' }, p: 1 }}
                    >
                        <img src="../../image/logo/TossPay_Logo_Primary.png" style={{ width: 90, display: 'block' }} alt="toss" />
                    </Button>
                    <Button
                        name="KAKAO"
                        variant={paymentType === 'KAKAO' ? "contained" : "outlined"}
                        onClick={handleSelectMethod}
                        sx={{ flex: { xs: '1 1 auto', sm: '0 0 auto' }, p: 1 }}
                    >
                        <img src="../../image/logo/payment_icon_yellow_medium.png" style={{ width: 80, display: 'block' }} alt="kakao" />
                    </Button>
                </Box>
            </Box>

            {/* 총 결제금액 + 결제하기 */}
            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, mx: { xs: 0, md: 0 }, mt: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>총 결제금액</Typography>

                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography color="text.secondary">운송 요금 합계</Typography>
                    <Typography>{originalTotalCost.toLocaleString()}원</Typography>
                </Box>

                {discountAmount > 0 && (
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography color="error.main" sx={{ fontWeight: 700 }}>쿠폰 할인 적용됨</Typography>
                        <Typography color="error.main" sx={{ fontWeight: 700 }}>
                            - {discountAmount.toLocaleString()}원
                        </Typography>
                    </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: 0.5, mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        {finalPaymentAmount.toLocaleString()}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>원</Typography>
                </Box>

                <Button variant="contained" size="large" onClick={handleCheck} fullWidth>
                    결제하기
                </Button>
            </Paper>
        </Box>
    );
}

export default OrderPaymentSelect;