import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import {
  Box, Grid, Paper, Typography,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';

import { getMonthlyRevenue } from '../../../api/adminApi/adminApi';
import { useSelector } from 'react-redux';
import { useState } from 'react';

const MyPage = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [revenueData, setRevenueData] = useState([]);
  const loginInfo = useSelector((state) => state.loginSlice); // Redux에서 로그인 정보 가져오기

  // 1. API를 통해 월별 수익 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMonthlyRevenue();
        // 현재 로그인한 사용자의 cargoId로 데이터 필터링 (loginInfo.id가 cargoId라고 가정)
        const filteredData = data.filter(item => item.cargoId === loginInfo.id);
        setRevenueData(filteredData);
      } catch (error) {
        console.error("월별 수익 데이터를 가져오는데 실패했습니다.", error);
      }
    };

    if (loginInfo.id) { // 로그인 정보가 있을 때만 데이터 요청
      fetchData();
    }
  }, [loginInfo.id]);

  // 2. 가져온 데이터로 차트 그리기
  useEffect(() => {
    if (!chartRef.current || revenueData.length === 0) return;

    const ctx = chartRef.current.getContext('2d');
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // 차트 데이터 포맷에 맞게 가공
    const labels = revenueData.map(item => `${item.year}-${String(item.month).padStart(2, '0')}`);
    const data = revenueData.map(item => item.totalRevenue);

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line', // 선 그래프로 변경
      data: {
        labels: labels,
        datasets: [{
          label: '월별 수익 (원)',
          data: data,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
            legend: {
                display: false // 범례는 외부에서 표시하므로 차트 내에서는 숨김
            }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [revenueData]); // revenueData가 변경될 때마다 차트를 다시 그림

  return (
    <Box sx={{ display: 'flex' }}>
        
      <Box sx={{ flexGrow: 1 , px : 7}}>

        <Box sx={{ p: 7, bgcolor: '#f3f4f6' }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            배송 정보 관리
          </Typography>

          {/* 상태 카드 */}
          <Grid container spacing={2} mb={4}>
            {[
              ['총 주문건수', '15건'],
              ['배송 중', '2건'],
              ['배송 완료', '13건'],
              ['취소/중단', '0건'],
            ].map(([label, value], idx) => (
              <Grid item xs={6} md={3} key={idx}>
                <Paper sx={{ p: 2, width: 300, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="h6" fontWeight="bold">{value}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* 그래프 & 문의 내역 */}
          <Grid container spacing={2} mb={4}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary" mb={2}>월별 수익 현황</Typography>
                <Box display="flex" width={648} alignItems="center" mb={1}>
                  <Box sx={{ width: 12, height: 12, bgcolor: 'rgba(75, 192, 192, 1)', borderRadius: '50%', mr: 1 }} />
                  <Typography variant="caption" sx={{ color: 'rgba(75, 192, 192, 1)' }}>월별 수익 (원)</Typography>
                </Box>
                <canvas ref={chartRef} height="150" />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, width:648, height:390}}>
                <Typography variant="body2" color="text.secondary" align="center" mb={2}>내 문의 내역</Typography>
                <TableContainer>
                  <Table size="small" >
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">문의내용</TableCell>
                        <TableCell align="center">작성일</TableCell>
                        <TableCell align="center">답변여부</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[
                        ['배송 지연 관련 문의', '2025-07-25', '답변 완료'],
                        ['결제 오류 문의', '2025-07-27', '미답변'],
                        ['운전자 위치 확인 요청', '2025-07-30', '답변 완료'],
                      ].map(([content, date, status], idx) => (
                        <TableRow key={idx}>
                          <TableCell align="center">{content}</TableCell>
                          <TableCell align="center">{date}</TableCell>
                          <TableCell align="center" sx={{ color: status === '답변 완료' ? 'green' : 'red' }}>
                            {status}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>

          {/* 지난 배송 내역 */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" mb={2}>지난 배송 내역</Typography>
            <Grid container spacing={2}>
              {[
                ['충주 → 부산', '4.5M'],
                ['서울', '2.3M'],
                ['대구', '2M'],
                ['Germany', '1.7M'],
                ['Romania', '1.6M'],
                ['Japan', '1.2M'],
                ['Netherlands', '1M'],
              ].map(([location, value], idx) => (
                <Grid item xs={6} sm={3} key={idx}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">{location}</Typography>
                    <Typography variant="body2" fontWeight="bold">{value}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default MyPage;