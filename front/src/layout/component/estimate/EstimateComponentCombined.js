import React, { useState, useEffect, useRef } from "react";
import {
    TextField, Button, Stack, Typography, Select, MenuItem,
    FormControl, InputLabel, OutlinedInput, Checkbox, ListItemText,
    Box, IconButton, InputAdornment, Grid, useMediaQuery, useTheme,
    Dialog, DialogActions, DialogContent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import KakaoMapViewer from "./KakaoMapViewer";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { postAdd, postSearchFeesBasic, postSearchFeesExtra } from "../../../api/estimateApi/estimateApi";
import useCustomMove from "../../../hooks/useCustomMove";
import { calculateDistanceBetweenAddresses } from "../common/calculateDistanceBetweenAddresses";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { isCurrentUserAdmin } from "../../../utils/jwtUtils";

import { getCurrentUserInfo } from "../../../utils/jwtUtils";


const tomorrowStart = dayjs().add(1, "day").hour(9).minute(0).second(0).millisecond(0);



const initState = {
    startAddress: "",
    endAddress: "",
    cargoType: "",
    cargoWeight: "",
    startTime: tomorrowStart,
    totalCost: 0,
    distanceKm: "",
    baseCost: 0,
    distanceCost: 0,
    specialOption: 0,
};

const EstimateComponentCombined = () => {
    const [fees, setFees] = useState([]);
    const [extra, setExtra] = useState([]);
    const [estimate, setEstimate] = useState(initState);
    const [specialNotes, setSpecialNotes] = useState([]);
    const [specialNoteCost, setSpecialNoteCost] = useState(0);
    const [baseCost, setBaseCost] = useState(0);
    const [distanceCost, setDistanceCost] = useState(0);
    const [openCancelDialog, setOpenCancelDialog] = useState(false);
    const [openEstimateSend, setOpenEstimateSend] = useState(false);
    const [specialMenuOpen, setSpecialMenuOpen] = useState(false);
    const { moveToHome } = useCustomMove();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const navigate = useNavigate();
    const { roles, email } = useSelector((state) => state.login);
    const authChecked = useRef(false);
    const isAdmin = isCurrentUserAdmin();
    const mapRef = useRef(null);

    useEffect(() => {
        if (authChecked.current) return;

        const token = sessionStorage.getItem('accessToken');

        if (!token) {
            authChecked.current = true;
            alert("로그인이 필요합니다.");
            navigate("/", { replace: true });
            return;
        }

        // ✅ roles 로드 안 됐으면 무조건 대기 (email 조건 제거)
        if (roles.length === 0) return;

        authChecked.current = true;

        const isShipper = roles.includes("ROLE_SHIPPER");
        if (!isShipper && !isAdmin) {
            alert("일반회원만 주문이 가능합니다.");
            navigate("/", { replace: true });
            return;
        }

        postSearchFeesBasic().then(setFees).catch(() => { });
        postSearchFeesExtra().then(setExtra).catch(() => { });
    }, [roles, email, navigate]);

    useEffect(() => {
        const fee = fees.find((f) => f.weight === estimate.cargoWeight) || null;
        const base = fee ? Number(fee.initialCharge) : 0;
        const distCost = estimate.distanceKm * (fee ? Number(fee.ratePerKm) : 0);
        const extraCost = specialNotes.reduce((sum, n) => sum + n.extraCharge, 0);
        setBaseCost(base);
        setDistanceCost(distCost);
        setSpecialNoteCost(extraCost);
        setEstimate((prev) => ({
            ...prev,
            totalCost: base + distCost + extraCost,
            baseCost: base,
            distanceCost: distCost,
            specialOption: extraCost,
        }));
    }, [estimate.cargoWeight, estimate.distanceKm, specialNotes, fees]);

    const handleSpecialNoteChange = (e) => {
        const selected = extra.filter((n) => e.target.value.includes(n.extraChargeTitle));
        setSpecialMenuOpen(false);
        setSpecialNotes(selected);
    };

    const handleAddressSearch = (setter) => {
        new window.daum.Postcode({ oncomplete: (data) => setter(data.address) }).open();
    };

    const calculateDistance = async () => {
        try {
            const km = await calculateDistanceBetweenAddresses(estimate.startAddress, estimate.endAddress);
            setEstimate((prev) => ({ ...prev, distanceKm: km }));
        } catch {
            alert("거리 계산 중 문제가 발생했습니다. 주소를 다시 확인해주세요.");
        }
    };

    const handleClickAdd = () => {
        if (!estimate.distanceKm) { alert("예상거리를 입력해주세요"); setOpenEstimateSend(false); return; }
        if (!estimate.cargoType) { alert("화물종류를 입력해주세요"); setOpenEstimateSend(false); return; }
        if (!estimate.cargoWeight) { alert("화물무게를 입력해주세요"); setOpenEstimateSend(false); return; }
        const estimateToSend = { ...estimate, startTime: estimate.startTime.format("YYYY-MM-DDTHH:mm:ss") };
        postAdd(estimateToSend).then(() => { alert("견적서 제출이 완료되었습니다."); moveToHome(); });
    };

    const handleChangeEstimate = (e) => setEstimate((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    const isInvalidHour = (data) => data.hour() < 9 || data.hour() > 16;
    const isBeforeMinDateTime = (date) => date.isBefore(dayjs().add(24, "hour").startOf("day"));

    return (
        <Box sx={{ px: 2, py: 4 }}>



            {/* 본문: 좌측 입력 / 우측 금액+지도 */}
            <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 3, alignItems: "flex-start" }}>

                {/* 좌측 입력 — 고정 너비 */}
                <Box sx={{ width: isMobile ? "100%" : 480, flexShrink: 0, border: "1px solid #ccc", borderRadius: 2, p: 3, bgcolor: "#ffffff" }}>
                    <Typography variant="h5" fontWeight="bold" align="center" mb={2}>
                        견적서 작성
                    </Typography>
                    <Stack spacing={2}>
                        <TextField
                            placeholder="출발지 주소"
                            label="출발지 주소"
                            value={estimate.startAddress}
                            fullWidth
                            InputProps={{
                                readOnly: true,
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => handleAddressSearch((addr) => setEstimate((prev) => ({ ...prev, startAddress: addr })))}>
                                            <SearchIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            placeholder="도착지 주소"
                            label="도착지 주소"
                            value={estimate.endAddress}
                            fullWidth
                            InputProps={{
                                readOnly: true,
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => handleAddressSearch((addr) => setEstimate((prev) => ({ ...prev, endAddress: addr })))}>
                                            <SearchIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Stack direction="row" spacing={1} alignItems="flex-start">
                            <TextField
                                label="예상 거리(km)"
                                value={estimate.distanceKm}
                                InputProps={{ readOnly: true }}
                                fullWidth
                            />
                            <Button
                                variant="contained"
                                sx={{
                                    maxWidth: 180,
                                    height: '56px', // TextField 높이와 맞춤
                                    whiteSpace: 'nowrap' // 글자 줄바꿈 방지
                                }}
                                onClick={calculateDistance}
                            >
                                거리 계산
                            </Button>
                        </Stack>


                        <TextField
                            label="화물 종류"
                            name="cargoType"
                            value={estimate.cargoType}
                            onChange={handleChangeEstimate}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel id="cargo-fee-label">화물 무게</InputLabel>
                            <Select
                                labelId="cargo-fee-label"
                                label="화물 무게"
                                value={estimate.cargoWeight || ""}
                                onChange={(e) => setEstimate((prev) => ({ ...prev, cargoWeight: e.target.value }))}
                            >
                                {fees.map((fee) => (
                                    <MenuItem key={fee.tno} value={fee.weight}>{fee.weight}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker
                                label="예약 시간"
                                value={estimate.startTime}
                                minDateTime={tomorrowStart}
                                shouldDisableDate={(data) => isBeforeMinDateTime(data.hour(9))}
                                shouldDisableTime={(value, clockType) => clockType === "hours" && isInvalidHour(value)}
                                onChange={(newTime) => setEstimate((prev) => ({ ...prev, startTime: newTime }))}
                                format="YYYY년 MM월 DD일 A hh:mm"
                                closeOnSelect={false}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </LocalizationProvider>
                        <FormControl fullWidth>
                            <InputLabel>특이사항 선택</InputLabel>
                            <Select
                                multiple
                                input={<OutlinedInput label="특이사항 선택" />}
                                value={specialNotes.map((n) => n.extraChargeTitle)}
                                open={specialMenuOpen}
                                onOpen={() => setSpecialMenuOpen(true)}
                                onClose={() => setSpecialMenuOpen(false)}
                                onChange={handleSpecialNoteChange}
                                renderValue={(selected) => selected.join(", ")}
                            >
                                {extra.map((opt) => (
                                    <MenuItem key={opt.extraChargeTitle} value={opt.extraChargeTitle}>
                                        <Checkbox checked={specialNotes.some((n) => n.extraChargeTitle === opt.extraChargeTitle)} />
                                        <ListItemText primary={`${opt.extraChargeTitle} +${opt.extraCharge.toLocaleString()}원`} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {specialNotes.length > 0 && (
                            <Box bgcolor="#f1f1f1" borderRadius={2} p={2}>
                                {specialNotes.map((note) => (
                                    <Typography key={note.extraChargeTitle} fontSize={14}>
                                        {note.extraChargeTitle}: +{note.extraCharge.toLocaleString()}원
                                    </Typography>
                                ))}
                            </Box>
                        )}
                        <Stack direction="row" spacing={2} mt={5}>
                            <Button variant="contained" sx={{ maxWidth: 200 }} onClick={() => setOpenEstimateSend(true)}
                                disabled={isAdmin === true}
                            >
                                견적서 제출
                            </Button>
                            <Button variant="contained" sx={{ maxWidth: 200 }} onClick={() => setOpenCancelDialog(true)}>
                                취소
                            </Button>
                        </Stack>
                    </Stack>

                </Box>

                {/* 우측: 금액 + 지도 — 나머지 너비 전부 */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack spacing={2}>
                        {/* 금액 산정 */}
                        <Box sx={{ border: "1px solid #ccc", borderRadius: 2, p: 2, bgcolor: "#ffffff" }}>
                            <Typography variant="subtitle1" fontWeight="bold" mb={2}>금액 산정</Typography>
                            <Stack direction="row" spacing={4} alignItems="center" flexWrap="wrap">
                                <Typography>기본 요금: {baseCost.toLocaleString()}원</Typography>
                                <Typography>거리 요금: {distanceCost.toLocaleString()}원</Typography>
                                <Typography>추가 요금: {specialNoteCost.toLocaleString()}원</Typography>
                            </Stack>
                            <Typography fontWeight="bold" fontSize={22} mt={2}>
                                총 금액: {estimate.totalCost.toLocaleString()}원
                            </Typography>
                        </Box>

                        {/* 지도 */}
                        <Box sx={{ border: "1px solid #ccc", borderRadius: 2, p: 2, bgcolor: "#ffffff" }}>
                            <Typography variant="subtitle1" fontWeight="bold" mb={1} >경로 지도
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    sx={{ whiteSpace: "nowrap", minWidth: 100, ml: 1.5 }}
                                    onClick={() => {
                                        setEstimate(prev => ({ ...prev, startAddress: "", endAddress: "", distanceKm: "" }));
                                        mapRef.current?.reset();
                                    }}
                                >
                                    주소 초기화
                                </Button></Typography>
                            {/* ← 초기화 버튼 추가 */}

                            <KakaoMapViewer
                                ref={mapRef}
                                startAddress={estimate.startAddress}
                                endAddress={estimate.endAddress}
                                onAddressSelect={(type, addr) => {
                                    setEstimate(prev => ({
                                        ...prev,
                                        [`${type}Address`]: addr
                                    }));
                                }}
                            />

                        </Box>
                    </Stack>
                </Box>

            </Box>


            {/* 취소 다이얼로그 */}
            <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)}
                PaperProps={{ sx: { width: 400, borderRadius: 2, p: 2 } }}>
                <DialogContent>
                    <Typography fontSize={20} fontWeight="bold">작성을 취소하시겠습니까?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setOpenCancelDialog(false); moveToHome(); }} color="error">확인</Button>
                    <Button onClick={() => setOpenCancelDialog(false)} color="inherit">아니요</Button>
                </DialogActions>
            </Dialog>

            {/* 제출 다이얼로그 */}
            <Dialog open={openEstimateSend} onClose={() => setOpenEstimateSend(false)}
                PaperProps={{ sx: { width: 400, borderRadius: 2, p: 2 } }}>
                <DialogContent>
                    <Typography fontSize={20} fontWeight="bold">견적을 제출하시겠습니까?</Typography>
                    <Typography fontSize={15}>견적 내용과 틀리면 배송이 거절될 수 있습니다.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClickAdd} color="error">확인</Button>
                    <Button onClick={() => setOpenEstimateSend(false)} color="inherit">아니요</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};


export default EstimateComponentCombined;