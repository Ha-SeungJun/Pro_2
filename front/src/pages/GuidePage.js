import React, { useState } from 'react';
import { Box, Typography, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const guideData = {
  '시작하기': [
    // 🚨 명칭을 DB(DataLoader) 및 요금표와 100% 일치시켰습니다.
    { title: '기본 운송이란?', content: '차량만 대여하는 서비스로, 고객님께서 직접 화물의 상/하차를 해주셔야 합니다.' },
    { title: '상하차 도움이란?', content: '기사님이 차량 옆에서 화물을 싣고 내리는 작업을 함께 도와드리는 서비스입니다.' },
    { title: '상하차 + 인부 1명이란?', content: '기사님 외에 전문 인력이 추가 투입되어, 출발지부터 도착지까지 모든 운반 과정을 책임집니다.' },
  ],
  '요금안내': [
    { 
      title: '1. 차종별 기본 운임', 
      content: '차종(중량)에 따른 기본 요금 및 거리당 단가표입니다.',
      isTable: true,
      tableType: 'basic'
    },
    { 
      title: '2. 장거리 운송 자동 할인 혜택', 
      content: '주행 거리에 따라 적용되는 자동 할인율 안내입니다.',
      isTable: true,
      tableType: 'discount'
    },
    { 
      title: '3. 부가 서비스 요금', 
      content: '상하차 방식에 따른 추가 옵션 요금표입니다.',
      isTable: true,
      tableType: 'extra'
    }
  ],
  'FAQ': [
    { title: '회원가입을 해야되나요?', content: '네, 원활한 서비스 이용과 이용 내역 관리를 위해 회원가입이 필요합니다.' },
    { title: '운송요금이 궁금합니다.', content: '거리, 차량 종류, 상하차 옵션에 따라 요금이 책정됩니다. 메인 페이지의 견적 조회를 이용해 주세요.' },
    { title: '기사님 배차는 언제 되나요?', content: '접수 완료 후 평균 10~30분 이내에 근거리 기사님이 배정됩니다.' },
  ],
  '기본정보': [
    { title: '운송과 운반의 차이는 무엇인가요?', content: '운송은 차량으로 물건을 이동하는 것이며, 운반은 사람이 직접 물건을 나르는 행위를 포함합니다.' },
    { title: '월 거래 계약이란?', content: '정기적인 물류 배송이 필요한 기업 고객을 위한 맞춤형 월 단위 계약 서비스입니다.' },
  ]
};

const GuidePage = () => {
  const [activeTab, setActiveTab] = useState('시작하기');
  const [expandedItem, setExpandedItem] = useState(null);

  const handleToggle = (index) => {
    setExpandedItem(expandedItem === index ? null : index);
  };

  const renderTable = (type) => {
    if (type === 'basic') {
      return (
        <TableContainer component={Paper} elevation={0} variant="outlined">
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f3f4f6' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>적재 중량</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>기본 요금</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>km당 단가</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* 🚨 SQL 덤프 데이터와 토씨 하나 안 틀리고 일치시켰습니다. */}
              {[
                ['0.5톤 차량', '25,000원', '800원'], 
                ['1톤 차량', '45,000원', '1,000원'], 
                ['2톤 차량', '80,000원', '1,400원'], 
                ['3톤 차량', '110,000원', '1,800원'], 
                ['4톤 차량', '150,000원', '2,200원'],
                ['5톤 차량', '200,000원', '2,800원'],
                ['5톤 이상', '300,000원', '3,500원']
              ].map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row[0]}</TableCell>
                  <TableCell>{row[1]}</TableCell>
                  <TableCell>{row[2]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }
    if (type === 'discount') {
      return (
        <TableContainer component={Paper} elevation={0} variant="outlined">
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f3f4f6' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>주행 거리</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>할인율</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>비고</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[['100km 이상', '5%', '자동 차감'], ['200km 이상', '10%', '자동 차감'], ['300km 이상', '15%', '자동 차감'], ['400km 이상', '20%', '최대 할인']].map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row[0]}</TableCell>
                  <TableCell sx={{ color: '#d32f2f', fontWeight: 'bold' }}>{row[1]}</TableCell>
                  <TableCell>{row[2]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }
    if (type === 'extra') {
      return (
        <TableContainer component={Paper} elevation={0} variant="outlined">
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f3f4f6' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>서비스 항목</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>추가 요금</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>상세 내용</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* 🚨 용어를 '상하차 도움'으로 일원화했습니다. */}
              {[
                ['상하차 도움', '50,000원', '기사님 작업 지원'], 
                ['상하차 + 인부 1명', '85,000원', '전문 인력 추가 투입']
              ].map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row[0]}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{row[1]}</TableCell>
                  <TableCell>{row[2]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }
  };

  return (
    <Box sx={{ bgcolor: '#f9fafb', minHeight: '100vh', py: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="h3" fontWeight="900" mb={6} sx={{ color: '#111827' }}>
          퍼스트로드 용달 이용가이드
        </Typography>

        {/* 탭 네비게이션 */}
        <Box sx={{ display: 'flex', borderBottom: '2px solid #e5e7eb', mb: 8 }}>
          {Object.keys(guideData).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setExpandedItem(null); }}
              style={{
                padding: '16px 32px',
                fontSize: '1.125rem',
                fontWeight: '700',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: activeTab === tab ? '#dc2626' : '#6b7280',
                borderBottom: activeTab === tab ? '4px solid #dc2626' : 'none',
                marginBottom: '-2px'
              }}
            >
              {tab}
            </button>
          ))}
        </Box>

        {/* 컨텐츠 영역 */}
        <Box sx={{ bg: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', p: 4, minHeight: '400px', bgcolor: 'white' }}>
          <Typography variant="h5" fontWeight="bold" mb={4} sx={{ color: '#1f2937' }}>
            {activeTab}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {guideData[activeTab].map((item, index) => (
              <Box key={index} sx={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                <button
                  onClick={() => handleToggle(index)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px',
                    backgroundColor: '#fff',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Typography sx={{ fontWeight: '700', fontSize: '1.125rem', color: '#374151' }}>{item.title}</Typography>
                  <Typography sx={{ 
                    transform: expandedItem === index ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s'
                  }}>▼</Typography>
                </button>
                
                {expandedItem === index && (
                  <Box sx={{ p: 3, bgcolor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                    {item.isTable ? (
                      renderTable(item.tableType)
                    ) : (
                      <Typography sx={{ whiteSpace: 'pre-line', color: '#4b5563', lineHeight: 1.7 }}>
                        {item.content}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default GuidePage;