import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Button, TextField, InputAdornment, IconButton, FormControl, InputLabel, Select, MenuItem, Dialog, DialogContent, DialogActions } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { postSearchFeesBasic } from "../api/estimateApi/estimateApi";
import { calculateDistanceBetweenAddresses } from "../layout/component/common/calculateDistanceBetweenAddresses";
import { useSelector } from "react-redux";
const initState = {
    startAddress: '',
    endAddress: '',
    cargoType: '',
    cargoWeight: '',
    totalCost: 0,
    distanceKm: ''
}

const QuickSearchPage = () => {
  const [estimate, setEstimate] = useState(initState);
  const [fees, setFees] = useState([]);
    const [baseCost, setBaseCost] = useState(0);
      const [distanceCost, setDistanceCost] = useState(0);
  const [exPrice, setExprice] = useState(0);
  const [openPrice, setOpenPrice] = useState(false);
  const { roles } = useSelector(state => state.login);
  const isAdmin = roles.includes("ROLE_ADMIN");

    useEffect(() => {
        postSearchFeesBasic()
            .then(data => {
                console.log("무게 목록 데이터:", data);
                setFees(data);
            })
            .catch(err => {
                console.error("데이터 로드 실패:", err);
            });
    }, []);
      useEffect(() => {
        const fee = fees.find(f => f.weight === estimate.cargoWeight) || null
        const dist = Number(estimate.distanceKm ?? 0);
        const base = Number(fee?.initialCharge ?? 0);
        const rate = Number(fee?.ratePerKm ?? 0);
        const distCost = dist * rate;
        const total = base + distCost;
        setBaseCost(base);
        setDistanceCost(distCost);
    
        setEstimate(prev => ({
          ...prev,
          totalCost: total,
          baseCost: base,
          distanceCost: distCost,
    
        }))
    
        setExprice(total);
    
      }, [estimate.cargoWeight, estimate.distanceKm, fees]);
    

    const handleAddressSearch = (setter) => {
        new window.daum.Postcode({
            oncomplete: function (data) {
                setter(data.address);
            },
        }).open();
    }

    const calculateDistance = async () => {
        try {
            const km = await calculateDistanceBetweenAddresses(
                estimate.startAddress,
                estimate.endAddress
            );
            setEstimate(prev => ({ ...prev, distanceKm: km }));

            setOpenPrice(true)
        } catch (err) {
            alert("거리 계산 중 문제가 발생했습니다. 주소를 다시 확인해주세요.");
        }
    };

      const handleClickCancel = () => setOpenPrice(false);
    return (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 6 }}>
            <Box sx={{ width: '100%', maxWidth: '1200px', px: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 5 }}>
                    {/* 간편조회 */}
                    <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>간편조회</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        placeholder="출발지 주소"
                                        name="startAddress"
                                        value={estimate.startAddress}

                                        InputProps={{
                                            readOnly: true,
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => handleAddressSearch(addr => (
                                                        setEstimate(prev => ({
                                                            ...prev, startAddress: addr
                                                        }))
                                                    ))}>
                                                        <SearchIcon />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}

                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        placeholder="도착지 주소"
                                        name="endAddress"
                                        value={estimate.endAddress}

                                        InputProps={{
                                            readOnly: true,
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => handleAddressSearch(addr => (
                                                        setEstimate(prev => ({
                                                            ...prev, endAddress: addr
                                                        }))
                                                    ))}>
                                                        <SearchIcon />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}

                                    />
                                </Grid>
                            </Grid>
                            <FormControl fullWidth sx={{ mt: 2 }}>
                                <InputLabel id="cargo-fee-label">화물 무게</InputLabel>
                                <Select
                                    labelId="cargo-fee-label"
                                    label="화물 무게"
                                    name="cargoWeight"
                                    // estimate.cargoWeight가 확실히 fees의 weight 중 하나와 일치해야 합니다.
                                    value={estimate.cargoWeight || ''}
                                    onChange={(e) => {
                                        const selectedWeight = e.target.value;
                                        // 단순히 값을 업데이트
                                        setEstimate(prev => ({ ...prev, cargoWeight: selectedWeight }));
                                    }}
                                >
                                    {fees && fees.length > 0 ? (
                                        fees.map((fee) => (
                                            <MenuItem key={fee.tno} value={fee.weight}>
                                                {fee.weight}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem disabled>데이터를 불러오는 중입니다...</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                            {/* <TextField label="화물특수" fullWidth sx={{ mt: 2 }} /> */}
                            <Typography variant="caption" sx={{ mt: 1, mb: 2 }}>주소 및 화물 무게를 입력후 조회하기 버튼을 눌러주세요 </Typography>
                            <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="contained" onClick={calculateDistance} >
                                    조회하기
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>


            <Dialog
                open={openPrice}
                onClose={handleClickCancel}
                PaperProps={{
                    sx: {
                        width: 400,
                        height: 150,
                        borderRadius: 2,
                        p: 2,
                    },
                }}
            >        <DialogContent >
                    <Typography fontSize={20} fontWeight='bold' >예상금액은 {Number(exPrice)}원 입니다.</Typography>
                    <Typography fontSize={15} fontWeight='bold'>본 금액은 예상 견적이며 물품에 따라 상세금액과 차이가 있을 수 있습니다.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button color="error" onClick={() => handleClickCancel()} >
                        확인
                    </Button>


                </DialogActions>
            </Dialog>
        </Box>
    )
}
export default QuickSearchPage