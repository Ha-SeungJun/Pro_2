import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Button, TextField, InputAdornment, IconButton, FormControl, InputLabel, Select, MenuItem, Dialog, DialogContent, DialogActions } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// API 로직
import { postSearchFeesBasic } from "../api/estimateApi/estimateApi";
import { calculateDistanceBetweenAddresses } from "../layout/component/common/calculateDistanceBetweenAddresses";
import MainFeesUtil from "../layout/component/common/MainFeesUtil";
import { getNotices } from "../api/noticeApi";

// 커스텀 섹션 컴포넌트
import HeroSection from '../components/HeroSection';
import ProcessSection from '../components/ProcessSection';
import InfoSection from '../components/InfoSection';
import QASection from '../components/QASection';
import FloatingButtons from '../components/FloatingButtons';

// ✅ 사진 이름 매칭 (기현님이 수정한 scooter.png 반영 완료!)
import damasImg from '../assets/damas.png'; 
import bikeImg from '../assets/bike.png'; 
import ton1Img from '../assets/1truck.png';
import ton11Img from '../assets/11truck.png';
import ton18Img from '../assets/18truck.png';
import ton25Img from '../assets/25truck.png';
import { API_SERVER_HOST } from "../api/serverConfig";

const initState = {
  startAddress: '', endAddress: '', cargoType: '', cargoWeight: '', totalCost: 0, distanceKm: ''
}

const vehicleStaticList = [
  {
    name: '오토바이 퀵',
    desc1: '서류나 작은 소화물을 가장 빠르게 전달해야 할 때 이용하는 서비스입니다.',
    desc2: '교통체증에 구애받지 않고 신속 정확하게 배송해 드립니다.',
    img: bikeImg
  },
  {
    name: '다마스 용달 & 퀵',
    desc1: '짐이 많지 않은 소형화물을 이동할때 적합한 용달 & 퀵으로 가장많이 이용되는 서비스입니다.',
    desc2: '소형이사나 1인이사 등 소량의 물품을 옮길때 적합한 차량으로 최소 2만원 부터 이용가능합니다.',
    img: damasImg
  },
  {
    name: '1톤 용달',
    desc1: '가장 대중적인 화물 운송 수단으로 원룸 이사나 중형 화물에 적합합니다.',
    desc2: '적재 공간이 넓어 다양한 형태의 짐을 안전하게 운송할 수 있습니다.',
    img: ton1Img
  },
  {
    name: '11톤 화물',
    desc1: '생활물품·가전·마트 납품 같은 중형급 물류 등의 화물배송에 적합합니다.',
    desc2: '(적재공간 : 1100mm*1100mm 팔레트 16~18개)',
    img: ton11Img
  },
  {
    name: '18톤 화물',
    desc1: '공산품·산업재 장거리 운송 등의 대형 화물배송에 적합합니다.',
    desc2: '(적재공간 : 1100mm*1100mm 팔레트 18개)',
    img: ton18Img
  },
  {
    name: '25톤 화물',
    desc1: '철강·원자재·특수 대형 장비 등의 초대형 화물배송에 적합합니다.',
    desc2: '(적재공간 : 1100mm*1100mm 팔레트 18개)',
    img: ton25Img
  }
];

const HomePage = () => {
  const [estimate, setEstimate] = useState(initState);
  const [fees, setFees] = useState([]);
  const [baseCost, setBaseCost] = useState(0);
  const [distanceCost, setDistanceCost] = useState(0);
  const [exPrice, setExprice] = useState(0);
  const [openFees, setOpenFees] = useState(false);
  const [openPrice, setOpenPrice] = useState(false);

  const [deleteMode, setDeleteMode] = useState(false); // ← 삭제 모드

  const [notices, setNotices] = useState([]);
  
  const [selectedVehicleIndex, setSelectedVehicleIndex] = useState(0); 

  const { roles } = useSelector(state => state.login);
  const isAdmin = roles.includes("ROLE_ADMIN");
  const navigate = useNavigate();

  const DEFAULT_TRUCK_IMG = "/image/placeholders/truck.svg";

  const loadNotices = async () => {
    try {
      const response = await getNotices();
      setNotices(response.content || []);
    } catch (err) {
      console.error('공지사항 로드 실패:', err);
    }
  };

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
    const base = API_SERVER_HOST.replace(/\/+$/, "");
    let path = String(p).trim().replace(/\\/g, "/");
    if (path.startsWith("/g2i4/uploads/")) return `${base}${path}`;
    if (path.startsWith("g2i4/uploads/")) return `${base}/${path}`;
    if (path.startsWith("/uploads/")) return `${base}/g2i4${path}`;
    if (path.startsWith("uploads/")) return `${base}/g2i4/${path}`;
    return `${base}/g2i4/uploads/${path.replace(/^\/+/, "")}`;
  };

  useEffect(() => {
    loadNotices();
    fetchFees();
  }, []);

  useEffect(() => {
    const fee = fees.find(f => f.weight === estimate.cargoWeight) || null;
    const dist = Number(estimate.distanceKm ?? 0);
    const base = Number(fee?.initialCharge ?? 0);
    const rate = Number(fee?.ratePerKm ?? 0);
    const distCost = dist * rate;
    const total = base + distCost;
    setBaseCost(base);
    setDistanceCost(distCost);
    setEstimate(prev => ({ ...prev, totalCost: total, baseCost: base, distanceCost: distCost }));

    setExprice(total);
  }, [estimate.cargoWeight, estimate.distanceKm, fees]);

  const handleAddressSearch = (setter) => {
    new window.daum.Postcode({
      oncomplete: function (data) { setter(data.address); },
    }).open();
  };

  const handleClickCancel = () => setOpenPrice(false);

  const calculateDistance = async () => {
    try {
      const km = await calculateDistanceBetweenAddresses(estimate.startAddress, estimate.endAddress);
      setEstimate(prev => ({ ...prev, distanceKm: km }));
      setOpenPrice(true);
    } catch (err) {
      alert("거리 계산 중 문제가 발생했습니다. 주소를 다시 확인해주세요.");
    }
  };

  const handleRowClick = (noticeId) => {
    navigate(`/noboard/post/${noticeId}`);
  };

  return (
    <Box>
      <HeroSection />

      <ProcessSection />
      <InfoSection />
      <QASection />

      {/* 차량 종류 소개 섹션 */}
      <section className="py-24 bg-[#f8f9fb] font-sans antialiased text-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16">
            
            <div className="w-full lg:w-1/3 flex flex-col">
              <div className="mb-12">
                <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 break-keep">용달화물 서비스 소개</h2>
                <p className="text-gray-600 text-lg break-keep">
                  퍼스트로드는 <span className="text-red-600 font-bold">빅데이터 기반</span>으로<br />
                  <span className="text-red-600 font-bold">최적의 거리별 요금</span>을 제공해드립니다.
                </p>
              </div>

              <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto p-4 -m-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {vehicleStaticList.map((vehicle, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedVehicleIndex(index)}
                    className={`py-5 px-8 rounded-[2rem] flex justify-between items-center transition-all duration-300 bg-white ${
                      selectedVehicleIndex === index 
                        ? 'shadow-lg border-2 border-transparent ring-2 ring-red-600 transform scale-105'
                        : 'shadow-sm border border-gray-100 hover:shadow-md'
                    }`}
                  >
                    <span className="flex items-center gap-6">
                      <span className="font-bold text-xl text-black">
                        {index < 9 ? `0${index + 1}` : index + 1}
                      </span>
                      <span className="text-xl font-bold text-black">{vehicle.name}</span>
                    </span>
                    <span className="text-gray-400 text-2xl">〉</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-2/3 flex flex-col justify-start gap-12 mt-12 lg:mt-0"> 
              
              <div className="flex items-center gap-6 mb-8 lg:mb-12">
                <span className="font-bold text-3xl text-red-600">
                  {selectedVehicleIndex < 9 ? `0${selectedVehicleIndex + 1}` : selectedVehicleIndex + 1}
                </span>
                <h3 className="text-4xl md:text-5xl font-black text-gray-900">{vehicleStaticList[selectedVehicleIndex].name}</h3>
              </div>

              <div className="flex-grow flex flex-col gap-8 mb-10">
                  <div className="text-gray-800 text-lg md:text-xl font-bold break-keep leading-relaxed">
                    {vehicleStaticList[selectedVehicleIndex].desc1}
                  </div>
                  <div className="text-gray-600 text-base break-keep leading-relaxed">
                    {vehicleStaticList[selectedVehicleIndex].desc2}
                  </div>
              </div>

              <div className="w-full flex justify-end">
                  <img
                    src={vehicleStaticList[selectedVehicleIndex].img}
                    alt={vehicleStaticList[selectedVehicleIndex].name}
                    className="w-full max-w-[600px] h-auto object-contain drop-shadow-2xl"
                  />
              </div>
            </div>
            
          </div>
          
          {isAdmin && (
            <div className="flex justify-center mt-12">
              <Button variant="contained" color="primary" size="large" onClick={() => setOpenFees(true)}>
                + 차량/요금 등록하기
              </Button>
            </div>
          )}
        </div>
      </section>

      <MainFeesUtil open={openFees} onClose={() => setOpenFees(false)} onSuccess={() => { setOpenFees(false); fetchFees(); }} />

      {/* 간편조회 및 공지사항 */}
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 10, bgcolor: 'white' }}>
        <Box sx={{ width: '100%', maxWidth: '1200px', px: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 8 }}>
            
            <Box sx={{ width: { xs: '100%', md: '50%' } }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom mb={4}>간편조회</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField

                      placeholder="출발지 주소" name="startAddress" value={estimate.startAddress} fullWidth
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => handleAddressSearch(addr => setEstimate(prev => ({ ...prev, startAddress: addr })))}>
                              <SearchIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField

                      placeholder="도착지 주소" name="endAddress" value={estimate.endAddress} fullWidth
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => handleAddressSearch(addr => setEstimate(prev => ({ ...prev, endAddress: addr })))}>
                              <SearchIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
                <FormControl fullWidth sx={{ mt: 3 }}>
                  <InputLabel id="cargo-fee-label">화물 무게</InputLabel>
                  <Select

                    labelId="cargo-fee-label" label="화물 무게" name="cargoWeight" value={estimate.cargoWeight || ''}
                    onChange={(e) => setEstimate(prev => ({ ...prev, cargoWeight: e.target.value }))}
                  >
                    {fees.map(fee => (
                      <MenuItem key={fee.tno} value={fee.weight}>{fee.weight}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, mb: 3 }}>주소 및 화물 무게를 입력후 조회하기 버튼을 눌러주세요</Typography>
                <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" size="large" onClick={calculateDistance} sx={{ bgcolor: '#299AF0' }}>
                    조회하기
                  </Button>

                </Box>
              </Box>
            </Box>

            <Box sx={{ width: { xs: '100%', md: '50%' } }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom mb={4}>공지사항</Typography>
                <Grid container spacing={1}>
                  {notices.slice(0, 4).map((notice) => (
                    <Grid item xs={12} key={notice.noticeId}>
                      <Box
                        sx={{

                          border: '1px solid #e0e0e0', borderRadius: 2, px: 2, py: 1.5,
                          display: 'flex', alignItems: 'center', cursor: 'pointer',
                          '&:hover': { backgroundColor: '#f8f9fa' }
                        }}
                        onClick={() => handleRowClick(notice.noticeId)}
                      >
                        <Typography sx={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {notice.title}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Dialog open={openPrice} onClose={handleClickCancel} PaperProps={{ sx: { width: 400, borderRadius: 3, p: 2 } }}>
        <DialogContent>
          <Typography fontSize={22} fontWeight='bold' mb={1} color="#299AF0">예상금액은 {Number(exPrice).toLocaleString()}원 입니다.</Typography>
          <Typography fontSize={14} color="text.secondary">본 금액은 예상 견적이며 물품에 따라 상세금액과 차이가 있을 수 있습니다.</Typography>
        </DialogContent>
        <DialogActions sx={{ pb: 2, pr: 3 }}>
          <Button variant="contained" color="primary" onClick={handleClickCancel} disableElevation>확인</Button>
        </DialogActions>
      </Dialog>

      <FloatingButtons />
      
    </Box>
  );
};

export default HomePage;