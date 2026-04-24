import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Grid, Paper, Typography, Button, Modal, TextField,
  IconButton, Select, MenuItem, InputLabel, FormControl, Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useParams, useNavigate } from 'react-router-dom';

// ===== 공통 API 베이스/인스턴스 =====
const API_BASE =
  process.env.REACT_APP_API_BASE ||
  'http://localhost:8080';

const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token =
    sessionStorage.getItem('accessToken') ||
    sessionStorage.getItem('ACCESS_TOKEN');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 구/신 경로 모두 보정
const toPreviewUrl = (p) => {
  if (!p) return null;
  const s = String(p);
  if (s.startsWith('http')) return s;
  if (s.startsWith('/g2i4/uploads/')) return `${API_BASE}${s}`;
  if (s.startsWith('/uploads/')) return `${API_BASE}/g2i4${s}`;
  return `${API_BASE}/g2i4/uploads/cargo/${encodeURIComponent(s)}`;
};

const EditVehicleInform = () => {
  const { cargoId } = useParams();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [weightOptions, setWeightOptions] = useState(['0.5톤', '1톤', '2톤', '3톤', '4톤', '5톤이상']);

  const [formData, setFormData] = useState({
    no: null,
    name: '',
    weight: '',
    cargoNumber: '',
    image: null,
    preview: null
  });

  useEffect(() => {
    if (!cargoId) {
      alert('접근 권한이 없습니다. (cargoId 누락)');
      navigate('/login', { replace: true });
    }
  }, [cargoId, navigate]);

  // 🚨 [핵심 수정] 요금표(feesData)로 빈 카드를 만들던 로직을 지우고, 내가 등록한 차량(cargoList)만 보여줍니다.
  const fetchVehicles = async () => {
    if (!cargoId) return;
    try {
      // 1. 차주가 실제로 등록한 차량 목록만 가져옴
      const cargoRes = await api.get(`/g2i4/cargo/list/${cargoId}`);
      const cargoList = cargoRes.data || [];

      // 2. 화면에 보여줄 데이터로 맵핑
      const myVehicles = cargoList.map(c => ({
        no: c.cargoNo,
        name: c.cargoName || '',
        weight: c.cargoCapacity || '',
        imagePath: c.cargoImage,
        preview: toPreviewUrl(c.cargoImage),
        cargoNumber: c.cargoNumber || '',
        status: c.status || 'PENDING'
      }));

      setVehicles(myVehicles);
    } catch (err) {
      console.error('데이터 불러오기 실패:', err);
    }
  };

  const fetchWeightOptions = async () => {
    try {
      const res = await api.get(`/g2i4/admin/fees/basic/rows`);
      const uniq = Array.from(new Set(res.data || [])).filter(Boolean);
      if (uniq.length) setWeightOptions(uniq);
    } catch (err) {
      console.warn('weight 옵션 불러오기 실패:', err);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchWeightOptions();
  }, [cargoId]);

  const handleOpen = (index = null) => {
    setEditingIndex(index);
    if (index !== null) {
      const { no, name, weight, preview, cargoNumber } = vehicles[index];
      setFormData({ no, name, weight: String(weight ?? ''), cargoNumber: cargoNumber || '', image: null, preview });
    } else {
      setFormData({ no: null, name: '', weight: '', cargoNumber: '', image: null, preview: null });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingIndex(null);
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData(prev => ({
      ...prev,
      image: file,
      preview: URL.createObjectURL(file)
    }));
  };

  const handleSave = async () => {
    const { no, name, weight, cargoNumber, image } = formData;
    if (!cargoId) { alert('접근 권한이 없습니다.'); return; }
    if (!name || !weight || !cargoNumber) { alert('차량 이름, 적재 무게, 차량 번호를 모두 입력해주세요.'); return; }

    try {
      let cargoNo = no;
      const payload = { name, weight, cargoNumber };

      if (no != null) {
        const res = await api.put(`/g2i4/cargo/update/${no}`, payload);
        cargoNo = res.data.cargoNo;
      } else {
        const res = await api.post(`/g2i4/cargo/add/${cargoId}`, payload);
        cargoNo = res.data.cargoNo;
      }

      if (image) {
        const fd = new FormData();
        fd.append('image', image);
        await api.post(`/g2i4/cargo/upload/${String(cargoNo).trim()}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      await fetchVehicles();
      handleClose();
    } catch (err) {
      console.error('차량 저장 실패:', err);
      alert('차량 저장에 실패했습니다.');
    }
  };

  const handleDelete = async (index) => {
    const target = vehicles[index];
    if (!target?.no) return;
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/g2i4/cargo/delete/${target.no}`);
      await fetchVehicles();
    } catch (err) {
      console.error('차량 삭제 실패:', err);
      alert('삭제 실패');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4, md: 7 }, bgcolor: '#f3f4f6', minHeight: '100vh' }}>
      <Typography variant="h5" fontWeight="bold" mb={4}>내 차량 관리</Typography>

      <Grid container spacing={{ xs: 2, md: 4 }}>
        {vehicles.map((vehicle, idx) => (
          <Grid item key={idx} xs={12} sm={6} lg={4}>  {/* ← 반응형 그리드 */}
            <Paper sx={{
              width: '100%',   // ← 고정 400 제거
              height: 'auto',  // ← 고정 400 제거
              p: 2,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              border: vehicle.status !== 'APPROVED' ? '2px dashed #ff000033' : 'none'
            }}>
              <Box sx={{
                height: { xs: 160, sm: 200 },  // ← 반응형 높이
                bgcolor: '#e5e7eb', borderRadius: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <img
                  src={vehicle.preview || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="310"><rect width="100%" height="100%" fill="%23d1d5db"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-size="24" font-family="sans-serif">No Image</text></svg>'}
                  alt="preview"
                  style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </Box>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Box display="flex" justifyContent="center" alignItems="center" gap={1} mb={1} flexWrap="wrap">
                  <Typography fontWeight="bold" variant="h6">{vehicle.name}</Typography>
                  {vehicle.status === 'PENDING' && <Chip label="승인 대기중" color="warning" size="small" />}
                  {vehicle.status === 'APPROVED' && <Chip label="승인 완료" color="success" size="small" />}
                  {vehicle.status === 'REJECTED' && <Chip label="승인 거절" color="error" size="small" />}
                </Box>
                <Typography color="textSecondary">{vehicle.weight}</Typography>
                <Typography variant="body2" color="primary" mt={0.5}>차량번호: {vehicle.cargoNumber}</Typography>
              </Box>

              <Box mt={2} display="flex" gap={1}>
                {vehicle.status !== 'APPROVED' && (
                  <Button fullWidth variant="contained" onClick={() => handleOpen(idx)}>수정</Button>
                )}
                <Button fullWidth variant="contained" color="error" onClick={() => handleDelete(idx)}>삭제</Button>
              </Box>
            </Paper>
          </Grid>
        ))}

        {/* 신규 차량 추가 버튼 */}
        <Grid item xs={12} sm={6} lg={4}>
          <Paper onClick={() => handleOpen()} sx={{
            width: '100%',   // ← 고정 400 제거
            height: { xs: 200, sm: 300, md: 400 },  // ← 반응형 높이
            border: '2px dashed #ccc', borderRadius: 2,
            display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer'
          }}>
            <Typography variant="h6">＋ 신규 차량 추가</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* 모달은 그대로 유지 */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={{
          p: { xs: 2, md: 4 },
          bgcolor: '#fff', borderRadius: 2,
          width: '90%', maxWidth: 1000,
          mx: 'auto', mt: { xs: '2%', md: '5%' },  // ← 반응형 모달 위치
          position: 'relative',
          maxHeight: '90vh',   // ← 모바일에서 스크롤 가능하도록
          overflowY: 'auto'    // ← 추가
        }}>
          <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 12, right: 12 }}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" mb={3}>차량 정보 입력</Typography>
          <Box display="flex" gap={4} flexDirection={{ xs: 'column', md: 'row' }}>
            <Box sx={{ flex: 1, bgcolor: '#e5e7eb', aspectRatio: '5/3', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1 }}>
              <img
                src={formData.preview || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="300"><rect width="100%" height="100%" fill="%23d1d5db"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-size="24" font-family="sans-serif">No Image</text></svg>'}
                alt="preview"
                style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </Box>
            <Box flex={1} display="flex" flexDirection="column" gap={2}>
              <TextField label="차량 이름 (예: 다마스)" value={formData.name} onChange={handleChange('name')} fullWidth />
              <TextField label="차량 번호 (예: 12가 3456)" value={formData.cargoNumber} onChange={handleChange('cargoNumber')} fullWidth />
              <FormControl fullWidth>
                <InputLabel id="weight-label">적재 무게</InputLabel>
                <Select labelId="weight-label" label="적재 무게" value={formData.weight} onChange={handleChange('weight')}>
                  {weightOptions.map((w) => (
                    <MenuItem key={w} value={w}>{w}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="outlined" component="label">
                차량 이미지 업로드
                <input hidden accept="image/*" type="file" onChange={handleImageChange} />
              </Button>
            </Box>
          </Box>
          <Box mt={4} display="flex" gap={2}>
            <Button fullWidth variant="contained" onClick={handleSave}>저장 (관리자 승인 대기)</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default EditVehicleInform;