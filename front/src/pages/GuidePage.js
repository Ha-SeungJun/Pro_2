import React, { useState } from 'react';
import { Box, Typography, Container } from '@mui/material';

const guideData = {
  '시작하기': [
    { title: '기본운송이란?', content: '고객님께서 직접 상/하차를 해주셔야 합니다.\n- 기사님께서는 차량에 싣고 내리는 것도 도와주십니다.' },
    { title: '상하차(지게차)이란?', content: '지게차를 이용하여 화물을 상/하차하는 방식입니다. 지게차 비용은 별도입니다.' },
    { title: '기사님 도움(A)이란?', content: '기사님과 고객님이 함께 화물을 운반하는 서비스입니다.' },
    { title: '기사님 도움(B)이란?', content: '기사님 외에 추가 인력이 투입되어 화물을 운반하는 서비스입니다.' },
  ],
  'FAQ': [
    { title: '회원가입을 해야되나요?', content: '네, 원활한 서비스 이용과 내역 관리를 위해 회원가입이 필요합니다.' },
    { title: '운송요금이 궁금합니다.', content: '거리, 차량 종류, 화물 옵션에 따라 요금이 다르게 책정됩니다. 메인 페이지의 견적 조회를 이용해 주세요.' },
    { title: '바로 배차 또는 예약이 가능한가요?', content: '네, 즉시 배차 및 원하시는 날짜/시간에 예약 배차가 가능합니다.' },
    { title: '기사님 배차는 언제 되나요?', content: '접수 완료 후 평균 10~30분 이내에 기사님 배차가 완료됩니다.' },
  ],
  '기본정보': [
    { title: '운송과 운반의 차이는 무엇인가요?', content: '운송은 차량으로 물건을 이동하는 것만 의미하며, 운반은 출발지/도착지에서 물건을 직접 나르는 것을 포함합니다.' },
    { title: '소형 이사란?', content: '원룸, 오피스텔 등 짐이 많지 않은 1인 가구에 적합한 이사 서비스입니다.' },
    { title: '월 거래 계약이란?', content: '정기적으로 화물 운송이 필요한 기업/개인을 위한 맞춤형 월단위 계약 서비스입니다.' },
  ]
};

const GuidePage = () => {
  const [activeTab, setActiveTab] = useState('시작하기');
  const [expandedItem, setExpandedItem] = useState(null);

  const handleToggle = (index) => {
    setExpandedItem(expandedItem === index ? null : index);
  };

  return (
    <Box className="bg-gray-50 min-h-screen py-16 font-sans text-gray-900">
      <Container maxWidth="lg">
        <Typography variant="h3" fontWeight="900" mb={6} className="text-gray-900">
          퍼스트로드 용달 이용가이드
        </Typography>

        {/* 탭 메뉴 */}
        <Box className="flex border-b-2 border-gray-200 mb-8">
          {Object.keys(guideData).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setExpandedItem(null); 
              }}
              className={`py-4 px-8 text-lg font-bold transition-colors duration-200 ${
                activeTab === tab
                  ? 'text-red-600 border-b-4 border-red-600 -mb-[2px]'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </Box>

        {/* 콘텐츠 영역 */}
        <Box className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-[400px]">
          <Typography variant="h5" fontWeight="bold" mb={4} className="text-gray-800">
            {activeTab}
          </Typography>

          <div className="flex flex-col gap-3">
            {guideData[activeTab].map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => handleToggle(index)}
                  className="w-full flex justify-between items-center p-5 bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-lg text-gray-800">{item.title}</span>
                  <span className={`transform transition-transform duration-300 ${expandedItem === index ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                
                {/* 확장되는 상세 내용 영역 */}
                {expandedItem === index && (
                  <div className="p-6 bg-gray-50 border-t border-gray-200 text-gray-700 leading-relaxed whitespace-pre-line">
                    {item.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Box>

      </Container>
    </Box>
  );
};

export default GuidePage;