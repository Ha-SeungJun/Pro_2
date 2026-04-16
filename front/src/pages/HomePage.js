import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Grid, TextField, InputAdornment, IconButton, FormControl, InputLabel, Select, MenuItem, Dialog, DialogContent, DialogActions } from "@mui/material"; 
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; 
import axios from 'axios';

// 커스텀 섹션 컴포넌트
import HeroSection from '../components/HeroSection';
import ProcessSection from '../components/ProcessSection';
import InfoSection from '../components/InfoSection';
import QASection from '../components/QASection';
import FloatingButtons from '../components/FloatingButtons';

// ✅ 기본 차량 사진
import damasImg from '../assets/damas.png'; 
import bikeImg from '../assets/bike.png'; 
import ton1Img from '../assets/1truck.png';
import ton11Img from '../assets/11truck.png';
import ton18Img from '../assets/18truck.png';
import ton25Img from '../assets/25truck.png';
import { API_SERVER_HOST } from "../api/serverConfig";

// ✅ 특수 차량 5종 사진
import topTruckImg from '../assets/toptruck.png';
import wingImg from '../assets/wing.png';
import jangImg from '../assets/jangkkuktruck.png';
import liftImg from '../assets/lift.png';
import iceTruckImg from '../assets/icetruck.png';

import MainFeesUtil from "../layout/component/common/MainFeesUtil";

// API 로직 임포트
import { postSearchFeesBasic } from "../api/estimateApi/estimateApi";
import { calculateDistanceBetweenAddresses } from "../layout/component/common/calculateDistanceBetweenAddresses";
import { getNotices } from "../api/noticeApi";

// ✅ 초기 상태 정의
const initState = {
  startAddress: '', 
  endAddress: '', 
  cargoType: '', 
  cargoWeight: '', 
  totalCost: 0, 
  distanceKm: ''
};

const specialVehicleList = [
  { name: '탑차', img: topTruckImg, desc: '비/눈 방지 폐쇄형 적재함' },
  { name: '윙바디', img: wingImg, desc: '측면 개방 팔레트 상하차 용이' },
  { name: '장축', img: jangImg, desc: '표준보다 긴 적재함 탑재' },
  { name: '리프트', img: liftImg, desc: '파워게이트 장착 차량' },
  { name: '냉동차', img : iceTruckImg, desc: '신선식품 콜드체인 운송' }
];

const vehicleStaticList = [
  { name: '오토바이 퀵', desc1: '신속한 서류 배송 서비스', desc2: '교통체증 없는 빠른 배송', img: bikeImg },
  { name: '다마스 용달', desc1: '소형 화물 맞춤 서비스', desc2: '1인 가구 이사 적합', img: damasImg }
];

const HomePage = () => {
  const [estimate, setEstimate] = useState(initState);
  const [fees, setFees] = useState([]);
  const [notices, setNotices] = useState([]);
  const [selectedVehicleIndex, setSelectedVehicleIndex] = useState(0); 
  const [openFees, setOpenFees] = useState(false);

  // ✅ 실제로 화면에 보여줄 통합 리스트
  const [displayVehicles, setDisplayVehicles] = useState([]);

  const { roles, memberId } = useSelector(state => state.login || { roles: [], memberId: null });
  const isDriver = roles.includes("ROLE_DRIVER");
  const navigate = useNavigate();

  const DEFAULT_TRUCK_IMG = "/image/placeholders/truck.svg";

  // ✅ 이미지 경로 보정 함수
  const normalizeUrl = (p) => {
    if (!p) return null;
    const s = String(p).trim().replace(/\\/g, "/");
    if (s.startsWith('http')) return s;
    const base = API_SERVER_HOST.replace(/\/+$/, "");
    if (s.startsWith('/g2i4/uploads/')) return `${base}${s}`;
    if (s.startsWith('/uploads/')) return `${base}/g2i4${s}`; 
    return `${base}/g2i4/uploads/cargo/${encodeURIComponent(s)}`;
  };

  // ✅ [수정] 모든 차주가 등록한 데이터를 중복 허용하여 10개까지 노출
  const fetchUnifiedVehicles = async () => {
    try {
      // 1. 차주들이 마이페이지에서 등록한 실제 차량 리스트 가져오기 (test2 기준 전역 공유)
      const res = await axios.get(`${API_SERVER_HOST}/g2i4/cargo/list/test2`); 
      let cargoList = Array.isArray(res.data) ? res.data : [];

      // 2. 공통 요금표 가져오기 (기본 설명 문구용)
      const feesRes = await postSearchFeesBasic();
      const feesData = Array.isArray(feesRes) ? feesRes : [];

      // 🚨 [핵심 로직] 10개 제한 및 중복 허용 데이터 구성
      // cargoList 자체가 중복(다마스 2개 등)을 포함하므로 이를 기반으로 맵핑합니다.
      if (cargoList.length > 0) {
        // 데이터 비대화 방지: 10개 이상이면 FIFO (앞에서부터 삭제)
        if (cargoList.length > 10) {
          cargoList = cargoList.slice(cargoList.length - 10);
        }

        const combined = cargoList.map(c => {
          // 요금표에서 해당 차량 무게의 기본 설명 찾기
          const feeMatch = feesData.find(f => 
            String(f.weight || "").replace(/[^0-9.]/g, "").trim() === String(c.cargoCapacity || "").replace(/[^0-9.]/g, "").trim()
          );

          return {
            name: c.cargoName || c.cargoCapacity, // 등록한 이름("다마스") 그대로 사용
            desc1: `${c.cargoCapacity}급 전문 운송 서비스입니다.`,
            desc2: feeMatch ? `기본: ${Number(feeMatch.initialCharge).toLocaleString()}원 / km당: ${Number(feeMatch.ratePerKm).toLocaleString()}원` : "실시간 요금을 확인하세요.",
            img: normalizeUrl(c.cargoImage) || DEFAULT_TRUCK_IMG
          };
        });
        setDisplayVehicles(combined);
      } else {
        // 등록된 차량이 하나도 없을 때만 정적 리스트 출력
        setDisplayVehicles(vehicleStaticList);
      }
    } catch (error) {
      console.error("데이터 로드 실패", error);
      setDisplayVehicles(vehicleStaticList);
    }
  };

  useEffect(() => {
    const loadNotices = async () => {
      try {
        const res = await getNotices();
        setNotices(res.content || []);
      } catch (err) { console.error('공지 로드 실패', err); }
    };
    loadNotices();
    fetchUnifiedVehicles(); 
  }, [memberId]);

  return (
    <Box>
      <HeroSection />
      <ProcessSection />
      <InfoSection />
      <QASection />

      <section className="py-24 bg-[#f8f9fb] font-sans text-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="w-full lg:w-1/3">
              <div className="mb-12">
                <h2 className="text-4xl md:text-5xl font-black mb-4">용달화물 서비스 소개</h2>
                <p className="text-gray-600 text-lg">마이페이지에서 등록한 모든 차량이 실시간으로 공유됩니다.</p>
              </div>

              {/* ✅ 스크롤바 숨김 클래스 유지 */}
              <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto p-4 -m-4 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]">
                {displayVehicles.map((vehicle, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedVehicleIndex(index)}
                    className={`py-5 px-8 rounded-[2rem] flex justify-between items-center transition-all bg-white ${
                      selectedVehicleIndex === index ? 'ring-2 ring-red-600 scale-105 shadow-lg' : 'border border-gray-100 shadow-sm'
                    }`}
                  >
                    <span className="flex items-center gap-6">
                      <span className="font-bold text-xl">{index < 9 ? `0${index + 1}` : index + 1}</span>
                      <span className="text-xl font-bold">{vehicle.name}</span>
                    </span>
                    <span className="text-gray-400 text-2xl">〉</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-2/3 flex flex-col justify-start gap-12 mt-12 lg:mt-0"> 
              {displayVehicles[selectedVehicleIndex] && (
                <>
                  <div className="flex items-center gap-6 mb-8">
                    <span className="font-bold text-3xl text-red-600">0{selectedVehicleIndex + 1}</span>
                    <h3 className="text-4xl md:text-5xl font-black">{displayVehicles[selectedVehicleIndex].name}</h3>
                  </div>
                  <div className="flex-grow flex flex-col gap-8 mb-10">
                      <div className="text-gray-800 text-lg md:text-xl font-bold">{displayVehicles[selectedVehicleIndex].desc1}</div>
                      <div className="text-gray-600 text-base">{displayVehicles[selectedVehicleIndex].desc2}</div>
                  </div>
                  <div className="w-full flex justify-end">
                      <img 
                        src={displayVehicles[selectedVehicleIndex].img} 
                        alt={displayVehicles[selectedVehicleIndex].name}
                        onError={(e) => { e.target.src = DEFAULT_TRUCK_IMG; }}
                        className="w-full max-w-[600px] h-auto object-contain drop-shadow-2xl" 
                      />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 w-full">
            {specialVehicleList.map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-48 h-48 flex items-center justify-center mb-6 overflow-hidden">
                   <img src={item.img} alt={item.name} className="w-full h-auto object-contain hover:scale-105 transition-all" />
                </div>
                <h4 className="text-xl font-bold mb-3">{item.name}</h4>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MainFeesUtil 
        open={openFees} 
        onClose={() => setOpenFees(false)} 
        onSuccess={() => { fetchUnifiedVehicles(); setOpenFees(false); }} 
      />
    </Box>
  );
};

export default HomePage;