import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Button, TextField, Card, CardContent, CardMedia, InputAdornment, IconButton, FormControl, InputLabel, Select, MenuItem, Dialog, DialogContent, DialogActions } from "@mui/material";
import Carousel from "react-material-ui-carousel";
import SearchIcon from "@mui/icons-material/Search";
import { postSearchFeesBasic } from "../api/estimateApi/estimateApi";
import { calculateDistanceBetweenAddresses } from "../layout/component/common/calculateDistanceBetweenAddresses";
import { basicList } from "../api/adminApi/adminApi";
import { useSelector } from "react-redux";
import MainFeesUtil from "../layout/component/common/MainFeesUtil";
import { API_SERVER_HOST } from "../api/serverConfig";
import { getNoticeList, getNotices } from "../api/noticeApi";
import { useNavigate } from "react-router-dom";

const initState = {
  startAddress: '',
  endAddress: '',
  cargoType: '',
  cargoWeight: '',
  totalCost: 0,
  distanceKm: ''

}

const HomePage = () => {
  const [estimate, setEstimate] = useState(initState);
  const [fees, setFees] = useState([]);
  const [baseCost, setBaseCost] = useState(0);
  const [distanceCost, setDistanceCost] = useState(0);
  const [exPrice, setExprice] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const visibleFees = showAll ? fees : fees.slice(0, 3);
  const [openFees, setOpenFees] = useState(false);
  const [openPrice, setOpenPrice] = useState(false);
  const { roles } = useSelector(state => state.login);
  const isAdmin = roles.includes("ROLE_ADMIN");
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const DEFAULT_TRUCK_IMG = "/image/placeholders/truck.svg";

  const loadNotices = async (page = 0) => {
    try {
      setLoading(true);
      const response = await getNotices();
      setNotices(response.content || []);
    } catch (err) {
      console.error('공지사항 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };//공지사항 업데이트

  const fetchFees = async () => {
    try {
      const data = await postSearchFeesBasic();
      setFees(data);
    } catch (error) {
      console.log("API 호출 실패", error);
    }
  };


const normalizeUrl = (p) => {
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p;

  const base = API_SERVER_HOST.replace(/\/+$/, ""); // 끝 슬래시 제거
  let path = String(p).trim().replace(/\\/g, "/");

  // DB에 가장 흔한 케이스: "/g2i4/uploads/파일"
  if (path.startsWith("/g2i4/uploads/")) return `${base}${path}`;
  if (path.startsWith("g2i4/uploads/"))  return `${base}/${path}`;

  // "/uploads/파일" 또는 "uploads/파일"로 온 경우 g2i4로 보정
  if (path.startsWith("/uploads/")) return `${base}/g2i4${path}`;
  if (path.startsWith("uploads/"))  return `${base}/g2i4/${path}`;

  // 파일명만 들어온 경우
  return `${base}/g2i4/uploads/${path.replace(/^\/+/, "")}`;
};



  useEffect(() => {
    loadNotices();
    fetchFees();
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
  const handleClickCancel = () => setOpenPrice(false);

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

  const handleRowClick = (noticeId) => {
    navigate(`/noboard/post/${noticeId}`);
  };

  //const price = baseCost+distanceCost;
  return (
    <Box>
      <Carousel animation="fade" indicators={false} >
        <Box sx={{
          height: 400,
          backgroundColor: "#90a8f0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundImage: 'url(/image/logo/CargoPhoto.jpg)',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}>
          <Typography variant="h3" color="white"></Typography>
        </Box>
        <Box sx={{
          height: 400,
          backgroundColor: "#b8a8ff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundImage: 'url(/image/logo/CargoPhoto2.jpg)',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}>
          <Typography variant="h3" color="white"></Typography>
        </Box>
             <Box sx={{
          height: 400,
          backgroundColor: "#b8a8ff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundImage: 'url(/image/logo/CargoPhoto.png)',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}>
          <Typography variant="h3" color="white"></Typography>
        </Box>
        
      </Carousel>

      {/* 🚚 차량 종류 */}
      <Box>


        {/* 🚚 차량 종류: 이미지만 표시 */}
        <Box sx={{ py: 5, textAlign: "center" }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>차량 종류</Typography>

          <Grid container spacing={2} justifyContent="center">
            {visibleFees.map((basic) => {
              const img = normalizeUrl(basic?.cargoImage) || DEFAULT_TRUCK_IMG;
              return (
                <Grid item key={basic?.tno}>
                  <Card sx={{ width: { xs: 160, sm: 220, md: 300 }, height: { xs: 110, sm: 150, md: 200 }, overflow: "hidden" }}>
                    <CardMedia
                      component="img"
                      src={img}
                      alt={basic.weight || "truck"}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        objectPosition: 'center',
                        display: 'block',
                      }}
                    />

                  </Card>
                  <Typography>{basic.weight}</Typography>
                </Grid>



              );
            })}
          </Grid>

          {/* 버튼 묶음 */}
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
            {fees.length > 3 && (
              <Button variant="contained" onClick={() => setShowAll((prev) => !prev)}>
                {showAll ? "접기" : "더보기"}
              </Button>
            )}
            {isAdmin && (<Button variant="contained" onClick={() => setOpenFees(true)}>
              등록하기
            </Button>)}
          </Box>
        </Box>

        {/* ... 간편조회/공지사항 섹션은 그대로 ... */}

        {/* 등록 모달 */}
        <MainFeesUtil
          open={openFees}
          onClose={() => setOpenFees(false)}
          onSuccess={() => {
            setOpenFees(false);
            fetchFees(); // 저장 후 이미지 목록 갱신
          }}
        />
      </Box>
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
                {/* <TextField label="화물특수" fullWidth sx={{ mt: 2 }} /> */}
                <Typography variant="caption" sx={{ mt: 1, mb: 2 }}>주소 및 화물 무게를 입력후 조회하기 버튼을 눌러주세요 </Typography>
                <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" onClick={calculateDistance} >
                    조회하기
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* 공지사항 */}
            <Box sx={{ width: { xs: '100%', md: '50%' } }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>공지사항</Typography>
                <Grid container spacing={0.5}>
                  {notices.slice(0, 4).map((notice) => (
                    <Grid item xs={12} key={notice.noticeId} sx={{ width: '100%' }}>
                      <Box
                        sx={{
                          border: '1px solid #eee',
                          borderRadius: 1,
                          px: 1.5,
                          py: 0.75,
                          height: 44,
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: '#f9f9f9' }
                        }}
                        onClick={() => handleRowClick(notice.noticeId)}
                      >
                        <Typography
                          sx={{
                            width: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: 'inherit'
                          }}
                        >
                          {notice.title}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>

          </Box>

        </Box >
      </Box >
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
      >

        <DialogContent >
          <Typography fontSize={20} fontWeight='bold' >예상금액은 {Number(exPrice)}원 입니다.</Typography>
          <Typography fontSize={15} fontWeight='bold'>본 금액은 예상 견적이며 물품에 따라 상세금액과 차이가 있을 수 있습니다.</Typography>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={() => handleClickCancel()} >
            확인
          </Button>


        </DialogActions>
      </Dialog>

    </Box >
  );
};

export default HomePage;