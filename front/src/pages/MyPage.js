import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import {
  Box, Grid, Paper, Typography,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';

import Sidebar from '../common/Sidebar'; // 사이드바 추가
import ResponsiveAppBar from '../common/ResponsiveAppBar'; // 상단 앱바 추가

const MyPage = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
        datasets: [{
          label: '수익',
          data: [300, 500, 400, 600, 700, 550],
          borderColor: 'rgba(124, 58, 237, 1)',
          borderWidth: 2,
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `${value}`,
            },
          },
        },
      }
    });

    return () => {
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    };
  }, []);

  const ownerId = 1; // 예시: 차량 관리 노출 조건

  return (
    <Box sx={{ display: 'flex' }}>
        
      <Sidebar ownerId={ownerId} /> {/* 좌측 사이드바 */}
      <Box sx={{ flexGrow: 1 }}>

        <Box component="main" sx={{ p: 4, bgcolor: '#f3f4f6' }}>
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
                <Paper sx={{ p: 2, textAlign: 'center' }}>
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
                <Typography variant="body2" color="text.secondary" mb={2}>월별 수익률</Typography>
                <Box display="flex" alignItems="center" mb={1}>
                  <Box sx={{ width: 12, height: 12, bgcolor: 'purple', borderRadius: '50%', mr: 1 }} />
                  <Typography variant="caption" color="purple">수익</Typography>
                </Box>
                <canvas ref={chartRef} height="150" />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary" align="center" mb={2}>내 문의 내역</Typography>
                <TableContainer>
                  <Table size="small">
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