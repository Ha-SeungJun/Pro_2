import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useSelector } from "react-redux";

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

// ✅ 특수 차량 5종 사진
import topTruckImg from '../assets/toptruck.png';
import wingImg from '../assets/wing.png';
import jangImg from '../assets/jangkkuktruck.png';
import liftImg from '../assets/lift.png';
import iceTruckImg from '../assets/icetruck.png';

import { Button } from "@mui/material";
import MainFeesUtil from "../layout/component/common/MainFeesUtil";

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

const specialVehicleList = [
  { 
    name: '탑차', 
    img: topTruckImg, 
    desc: '비 또는 눈과 같이 물품에 손상이 가면 안되는 적재물에 이용되며, 적재함 뒷문이 개방되는 차량입니다.' 
  },
  { 
    name: '윙바디', 
    img: wingImg, 
    desc: '차량 양 옆을 개방하여 화물을 적재할 수 있어 파레트를 지게차 등으로 상/하차 할 수 있는 차량입니다.' 
  },
  { 
    name: '장축', 
    img: jangImg, 
    desc: '기본 적재함보다 길며, 많은 양의 화물을 적재할 수 있는 차량입니다.' 
  },
  { 
    name: '리프트', 
    img: liftImg, 
    desc: '적재함 뒷부분에 파워게이트가 있어 오토바이나 무거운 화물을 들어올릴 수 있는 차량입니다.' 
  },
  { 
    name: '냉동차', 
    img: iceTruckImg, 
    desc: '냉동이 필요한 수산물 등을 배송할 때 이용하는 차량입니다.' 
  }
];

const HomePage = () => {
  const [selectedVehicleIndex, setSelectedVehicleIndex] = useState(0); 
  const [openFees, setOpenFees] = useState(false);

  const { roles } = useSelector(state => state.login);
  const isAdmin = roles?.includes("ROLE_ADMIN");

  return (
    <Box>
      {/* 🚀 간편조회 및 공지사항 영역(Box)을 메인에서 완전히 제거했습니다! */}
      
      {/* 기존 헤더(메인 배너) */}
      <HeroSection />

      <ProcessSection />
      <InfoSection />
      <QASection />

      {/* ==========================================
          차량 종류 소개 섹션 (01 ~ 06)
      ========================================== */}
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

      {/* ==========================================
          특수 차량 5종 소개 섹션 (탑차 ~ 냉동차)
      ========================================== */}
      <section className="py-24 bg-white w-full flex justify-center border-t border-gray-100">
        <div className="max-w-7xl w-full px-6 flex flex-col items-center">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
              탑차부터 냉동차까지 화물에 맞는 차종을 선택하실 수 있습니다.
            </h2>
            <p className="text-gray-500 text-lg">
              1톤 이상 트럭에 탑차 / 윙바디 / 장축 / 리프트 / 냉동차 등 차종을 선택하실 수 있으며, 차종에 따라 추가비용이 발생합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 w-full">
            {specialVehicleList.map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                
                <div className="w-48 h-48 flex items-center justify-center mb-6 overflow-hidden">
                   <img 
                     src={item.img} 
                     alt={item.name} 
                     className="w-full h-auto object-contain hover:scale-105 transition-transform duration-300" 
                   />
                </div>

                <h4 className="text-xl font-bold text-gray-800 mb-3">{item.name}</h4>
                <p className="text-sm text-gray-500 break-keep leading-relaxed px-2">
                  {item.desc}
                </p>

              </div>
            ))}
          </div>
          
        </div>
      </section>

      <MainFeesUtil open={openFees} onClose={() => setOpenFees(false)} onSuccess={() => setOpenFees(false)} />

      <FloatingButtons />
      
    </Box>
  );
};

export default HomePage;