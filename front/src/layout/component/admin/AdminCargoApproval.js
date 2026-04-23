import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Card, CardContent, CardMedia, Button, Grid, Chip, Divider, Paper, Stack } from '@mui/material';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080';

const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken') || sessionStorage.getItem('ACCESS_TOKEN');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const toPreviewUrl = (p) => {
  if (!p) return '/image/placeholders/truck.svg';
  const s = String(p).replace(/\\/g, "/");
  if (s.startsWith('http')) return s;
  if (s.startsWith('/g2i4/uploads/')) return `${API_BASE}${s}`;
  if (s.startsWith('/uploads/')) return `${API_BASE}/g2i4${s}`;
  return `${API_BASE}/g2i4/uploads/cargo/${encodeURIComponent(s.replace(/^\/+/, ""))}`;
};

const AdminCargoApproval = () => {
  const [pendingList, setPendingList] = useState([]);

  const fetchPendingCargos = async () => {
    try {
      const res = await api.get('/g2i4/admin/cargo/pending');
      setPendingList(res.data || []);
    } catch (error) {
      console.error('대기 목록을 불러오는 데 실패했습니다.', error);
    }
  };

  useEffect(() => {
    fetchPendingCargos();
  }, []);

  const handleApprove = async (cargoNo) => {
    if (!window.confirm('이 차량을 승인하시겠습니까?')) return;
    try {
      await api.put(`/g2i4/admin/cargo/approve/${cargoNo}`);
      alert('승인 완료되었습니다.');
      fetchPendingCargos(); 
    } catch (error) {
      alert('승인 처리 중 오류가 발생했습니다.');
    }
  };

  const handleReject = async (cargoNo) => {
    if (!window.confirm('이 차량 등록을 거절하시겠습니까?')) return;
    try {
      await api.put(`/g2i4/admin/cargo/reject/${cargoNo}`);
      alert('거절 처리되었습니다.');
      fetchPendingCargos(); 
    } catch (error) {
      alert('거절 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    // 🚨 [수정] 사이드바와 겹치지 않도록 전체 여백을 조절했습니다.
    <Box sx={{ 
      p: { xs: 2, md: 4 }, 
      bgcolor: '#f8f9fb', 
      minHeight: '100vh',
      width: '100%' // 레이아웃 내부에서 꽉 차게 설정
    }}>
      <Typography variant="h4" fontWeight="800" mb={4} color="#333">
        차량 등록 승인 관리
      </Typography>

      <Divider sx={{ mb: 4 }} /> {/* 💡 시각적 분리선을 추가했습니다. */}

      {pendingList.length === 0 ? (
        // 데이터가 없을 때의 UI를 조금 더 깔끔하게 보정
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3, bgcolor: '#fff' }}>
          <Typography variant="h6" color="textSecondary">
            현재 승인 대기 중인 차량이 없습니다.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {pendingList.map((cargo) => (
            <Grid item xs={12} sm={12} md={6} lg={4} key={cargo.cargoNo}>
              <Card sx={{ 
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
                borderRadius: 4,
                overflow: 'hidden',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-5px)' }
              }}>
                <CardMedia
                  component="img"
                  height="220"
                  image={toPreviewUrl(cargo.cargoImage)}
                  alt={cargo.cargoName}
                  sx={{ objectFit: 'contain', bgcolor: '#f1f3f5', p: 1 }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight="700">
                      {cargo.cargoName}
                    </Typography>
                    <Chip label="승인 대기" color="warning" variant="filled" size="small" sx={{ fontWeight: 'bold' }} />
                  </Box>
                  
                  <Stack spacing={1} mb={3}> {/* MUI Stack으로 간격을 일정하게 정렬 */}
                    <Typography variant="body2" color="textSecondary">
                      <strong>차량 번호:</strong> {cargo.cargoNumber || '미기재'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <strong>적재 무게:</strong> {cargo.cargoCapacity}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <strong>차주 ID:</strong> {cargo.ownerId}
                    </Typography>
                  </Stack>

                  <Box display="flex" gap={1.5}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth 
                      sx={{ borderRadius: 2, fontWeight: 'bold' }}
                      onClick={() => handleApprove(cargo.cargoNo)}
                    >
                      승인
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      fullWidth 
                      sx={{ borderRadius: 2, fontWeight: 'bold' }}
                      onClick={() => handleReject(cargo.cargoNo)}
                    >
                      거절
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AdminCargoApproval;