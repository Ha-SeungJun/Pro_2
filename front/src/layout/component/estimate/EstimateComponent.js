import React, { useState, useEffect } from "react";
import {
  TextField, Button, Stack, Typography, Select, MenuItem,
  FormControl, InputLabel, OutlinedInput, Checkbox, ListItemText,
  Box, IconButton, InputAdornment, Grid, useMediaQuery, useTheme,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TmapViewer from "./KakaoMapViewer";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from "dayjs";
import KakaoMapViewer from "./KakaoMapViewer";
import { postAdd, postSaveEs, postSearchFeesBasic, postSearchFeesExtra } from "../../../api/estimateApi/estimateApi";
import useCustomMove from "../../../hooks/useCustomMove";
import { calculateDistanceBetweenAddresses } from "../common/calculateDistanceBetweenAddresses";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useRef } from "react";



const tomorrowStart = dayjs().add(1, "day").hour(9).minute(0).second(0).millisecond(0);

const SPECIAL_NOTE_OPTIONS = [
  { label: "냉동식품 및 유제품", cost: 300000 },
  { label: "위험물", cost: 500000 },
  { label: "파손주의", cost: 150000 },
];
const initState = {
  startAddress: '',
  endAddress: '',
  cargoType: '',
  cargoWeight: '',
  startTime: tomorrowStart,
  totalCost: 0,
  distanceKm: '',
  baseCost: 0,
  distanceCost: 0,
  specialOption: 0
}

const EstimateComponent = () => {
  const [fees, setFees] = useState([]);
  const [extra, setExtra] = useState([]);
  const [estimate, setEstimate] = useState(initState);
  const [specialNotes, setSpecialNotes] = useState([]);
  const [specialNoteCost, setSpecialNoteCost] = useState(0);
  const [baseCost, setBaseCost] = useState(0);
  const [distanceCost, setDistanceCost] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openEstimateSend, setOpenEstimateSend] = useState(false)
  const [specialMenuOpen, setSpecialMenuOpen] = useState(false);
  const { moveToHome } = useCustomMove();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDesktop = useMediaQuery('(min-width:1151px)');
  const navigate = useNavigate();
  const { roles, email } = useSelector(state => state.login);
  const authChecked = useRef(false);

  useEffect(() => {
    if (authChecked.current) {
      return;
    }

    const isShipper = roles.includes("ROLE_SHIPPER");
    const isAdmin = roles.includes("ROLE_ADMIN");

    if (!email || (!isShipper && !isAdmin)) {
      authChecked.current = true;
      alert("일반회원만 주문이 가능합니다.");
      navigate("/", { replace: true });
      return;
    }

    const fetchData = async () => {
      try {
        const data = await postSearchFeesBasic();
        setFees(data);
      } catch (error) {
        console.log("API 호출 실패", error)
      }
    };
    fetchData()

    const extraFetchData = async () => {
      try {
        const data = await postSearchFeesExtra()
        setExtra(data)
      } catch (error) {
        console.log("Extra API 호출 실패", error)
      }
    }
    extraFetchData();
  }, [roles, email, navigate]);
  useEffect(() => {
    const fee = fees.find(f => f.weight === estimate.cargoWeight) || null
    const base = fee ? Number(fee.initialCharge) : 0;
    const distCost = estimate.distanceKm * (fee ? Number(fee.ratePerKm) : 0);
    const extra = specialNotes.reduce((sum, n) => sum + n.extraCharge, 0);
    setBaseCost(base);
    setDistanceCost(distCost);
    setSpecialNoteCost(extra);
    setEstimate(prev => ({
      ...prev,
      totalCost: base + distCost + extra,
      baseCost: base,
      distanceCost: distCost,
      specialOption: extra
    }))



  }, [estimate.cargoWeight, estimate.distanceKm, specialNotes, fees]);

  const handleSpecialNoteChange = (e) => {
    const selectedLabels = e.target.value;
    const selected = extra.filter((n) =>
      selectedLabels.includes(n.extraChargeTitle)
    );
    setSpecialMenuOpen(false)
    setSpecialNotes(selected);
  };

  const handleAddressSearch = (setter) => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        setter(data.address);
      },
    }).open();
  };

  const calculateDistance = async () => {
    try {
      const km = await calculateDistanceBetweenAddresses(
        estimate.startAddress,
        estimate.endAddress
      );
      setEstimate(prev => ({ ...prev, distanceKm: km }));
    } catch (err) {
      alert("거리 계산 중 문제가 발생했습니다. 주소를 다시 확인해주세요.");
    }
  };

  const handleClickAdd = () => {
    if ((estimate.distanceKm !== '')) {
      if (estimate.cargoType !== '') {
        if (estimate.cargoWeight !== '') {
          const estimateToSend = {
            ...estimate,
            startTime: estimate.startTime.format('YYYY-MM-DDTHH:mm:ss')
          };
          postAdd(estimateToSend)
            .then(result => {
              alert('견적서 제출이 완료되었습니다.')
              moveToHome();
            })
        } else {
          alert('화물무게를 입력해주세요')
          setOpenEstimateSend(false)
        }
      } else {
        alert('화물종류를 입력해주세요')
        setOpenEstimateSend(false)
      }
    } else {
      alert('예상거리를 입력헤주세요')
      setOpenEstimateSend(false)
    }
  }
  const handleChangeEstimate = (e) => {
    estimate[e.target.name] = e.target.value
    setEstimate({ ...estimate })
  }
  const handleClickSave = () => {
    postSaveEs(estimate)
      .then(data => {
        console.log(data)
        alert('임시저장이 완료되었습니다')
        moveToHome();
      }).catch(error => {
        const msg = error.response?.data?.message || error.response?.data?.error || "임시저장 중 오류가 발생했습니다.";
        alert(msg);
      })
  }

  const handleClickCancel = () => {
    setOpenCancelDialog(true);
  };

  const handleCancelConfirm = () => {
    setOpenCancelDialog(false);
    moveToHome();  // 실제 이동 처리
  };
  const handleClickEstimateSend = () => {
    setOpenEstimateSend(true)
  }

  const handleCancelClose = () => {
    setOpenCancelDialog(false);  // 모달만 닫기
    setOpenEstimateSend(false)
  };

  const tomorrow = dayjs().add(24, 'hour')

  const isInvalidHour = (data) => data.hour() < 9 || data.hour() > 16;

  const isBeforeMinDateTime = (date) => {
    return date.isBefore(tomorrow.startOf('day'));
  };
  return (
    <Box sx={{ px: 2, py: 4 }}>
      <Typography variant="h5" fontWeight="bold" align="center" mb={5}>
        견적서 작성
      </Typography>



      <Grid
        container
        spacing={4}
        direction={isMobile ? "column" : "row"}
        justifyContent="center"
      >
        <Stack
          direction={isDesktop ? 'row' : 'column'}
          spacing={2}
          sx={{
            width: '100%',
            maxWidth: isDesktop ? 1064 : (isMobile ? '100%' : 520),
            alignItems: isMobile ? 'stretch' : 'center',
            mb: 4,
            mx: 'auto'
          }}
        >
          <TextField
            placeholder="출발지 주소"
            name="startAddress"
            value={estimate.startAddress}
            fullWidth
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => handleAddressSearch(addr => (
                    setEstimate(prev => ({ ...prev, startAddress: addr }))
                  ))}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            placeholder="도착지 주소"
            name="endAddress"
            value={estimate.endAddress}
            fullWidth
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => handleAddressSearch(addr => (
                    setEstimate(prev => ({ ...prev, endAddress: addr }))
                  ))}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        {/* 좌측 입력 영역 */}
        <Grid item xs={12} md={"auto"}>

          <Stack spacing={2} sx={{ width: isMobile ? "100%" : 520 }}>
            <TextField
              label="예상 거리(km)"
              value={estimate.distanceKm}
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextField
              label="화물 종류"
              name='cargoType'
              value={estimate.cargoType}
              onChange={handleChangeEstimate}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="cargo-fee-label">화물 무게</InputLabel>
              <Select
                labelId="cargo-fee-label"
                label="화물 무게"
                name="cargoWeight"
                value={estimate.cargoWeight || ''}
                onChange={(e) => {
                  const weightLabel = e.target.value;
                  setEstimate(prev => ({ ...prev, cargoWeight: weightLabel }));
                }}
              >
                {fees.map(fee => (
                  <MenuItem key={fee.tno} value={fee.weight}>
                    {fee.weight} {/* 예: 1톤, 2톤 */}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="예약 시간"
                name='startTime'
                value={estimate.startTime}
                minDateTime={tomorrowStart}
                shouldDisableDate={(data) => {
                  return isBeforeMinDateTime(data.hour(9))
                }}
                shouldDisableTime={(value, clockType) => {
                  if (clockType === 'hours') {
                    return isInvalidHour(value)
                  }
                  return false;
                }}
                onChange={newTime => {
                  setEstimate(prev => ({ ...prev, startTime: newTime }))
                }}
                format="YYYY년 MM월 DD일 A hh:mm"
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
                    <ListItemText
                      primary={`${opt.extraChargeTitle} +${opt.extraCharge.toLocaleString()}원`}
                    />
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
            <Button variant="contained" sx={{ maxWidth: 200 }} onClick={calculateDistance}>
              거리 계산
            </Button>
          </Stack>
        </Grid>

        {/* 우측 결과 영역 */}
        <Grid item xs={12} md={"auto"}>
          <Stack spacing={2} sx={{ width: isMobile ? "100%" : 520 }}>

            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                sx={{ minWidth: 100 }}
                variant={!showMap ? "contained" : "outlined"}
                onClick={() => setShowMap(false)}
              >
                금액 산정
              </Button>
              <Button
                size="small"
                sx={{ minWidth: 100 }}
                variant={showMap ? "contained" : "outlined"}
                onClick={() => setShowMap(true)}
              >
                지도
              </Button>
            </Stack>

            <Box
              sx={{
                minHeight: 300,
                border: "1px solid #ccc",
                borderRadius: 2,
                p: 2,
                bgcolor: "#ffffff",
              }}
            >
              {showMap ? (
                <KakaoMapViewer startAddress={estimate.startAddress} endAddress={estimate.endAddress} />
              ) : (
                <Stack spacing={2}>
                  <Typography>기본 요금: {baseCost.toLocaleString()}원</Typography>
                  <Typography>거리 요금: {distanceCost.toLocaleString()}원</Typography>
                  <Typography>추가 요금: {specialNoteCost.toLocaleString()}원</Typography>
                  <Typography fontWeight="bold" mt={2} sx={{ fontSize: 30 }}>
                    총 금액: {estimate.totalCost.toLocaleString()}원
                  </Typography>
                </Stack>
              )}
            </Box>
          </Stack>
        </Grid>
      </Grid>

      {/* 제출 버튼들 */}
      <Stack
        direction="row"
        spacing={2}
        mt={5}
        justifyContent="center"
        alignItems="center"
      >
        {/* <Button variant="contained" sx={{ minWidth: 100 }} onClick={handleClickSave}>
          임시 저장
        </Button> */}
        <Button variant="contained" sx={{ minWidth: 100 }} onClick={handleClickEstimateSend}>
          견적서 제출
        </Button>
        <Button variant="contained" sx={{ minWidth: 100 }} onClick={handleClickCancel}>
          취소
        </Button>
      </Stack>

      <Dialog
        open={openCancelDialog}
        onClose={handleCancelClose}
        PaperProps={{
          sx: {
            width: 400,
            height: 150,
            borderRadius: 2,
            p: 2,
          },
        }}
      >

        <DialogContent >
          <Typography fontSize={20} fontWeight='bold'>작성을 취소하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelConfirm} color="error">
            확인
          </Button>
          <Button onClick={handleCancelClose} color="inherit">
            아니요
          </Button>

        </DialogActions>
      </Dialog>

      <Dialog
        open={openEstimateSend}
        onClose={handleCancelClose}
        PaperProps={{
          sx: {
            width: 400,
            height: 150,
            borderRadius: 2,
            p: 2,
          },
        }}
      >

        <DialogContent >
          <Typography fontSize={20} fontWeight='bold'>견적을 제출하시겠습니까?</Typography>
          <Typography fontSize={15} fontWeight='bold'>견적 내용과 틀리면 배송이 거절될 수 있습니다.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClickAdd} color="error">
            확인
          </Button>
          <Button onClick={handleCancelClose} color="inherit">
            아니요
          </Button>

        </DialogActions>
      </Dialog>
    </Box>
  );
}
export default EstimateComponent;