// src/pages/mypage/EditVehicleInform.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Grid, Paper, Typography, Button, Modal, TextField,
  IconButton, Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useParams, useNavigate } from 'react-router-dom';

// ===== 공통 API 베이스/인스턴스 =====
const API_BASE =
  import.meta?.env?.VITE_API_BASE ||
  process.env.REACT_APP_API_BASE ||
  'http://localhost:8080';

const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('accessToken') ||
    localStorage.getItem('ACCESS_TOKEN') ||
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
  if (s.startsWith('/uploads/')) return `${API_BASE}/g2i4${s}`; // 구버전 보정
  return `${API_BASE}/g2i4/uploads/cargo/${encodeURIComponent(s)}`; // 파일명만 있는 경우
};

const EditVehicleInform = () => {
  const { cargoId } = useParams();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [weightOptions, setWeightOptions] = useState(['0.5톤','1톤','2톤','3톤','4톤','5톤이상']); // 폴백
  const [formData, setFormData] = useState({
    no: null,
    name: '',
    weight: '',
    image: null,
    preview: null
  });

  useEffect(() => {
    if (!cargoId) {
      alert('접근 권한이 없습니다. (cargoId 누락)');
      navigate('/login', { replace: true });
    }
  }, [cargoId, navigate]);

  const fetchVehicles = async () => {
    if (!cargoId) return;
    try {
      const res = await api.get(`/g2i4/cargo/list/${cargoId}`);
      const data = (res.data || []).map(cargo => ({
        no: cargo.cargoNo,
        name: cargo.cargoName,
        address: cargo.cargoType,
        weight: cargo.cargoCapacity,
        imagePath: cargo.cargoImage,
        preview: toPreviewUrl(cargo.cargoImage)
      }));
      setVehicles(data);
    } catch (err) {
      console.error('차량 목록 불러오기 실패:', err);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        alert('로그인 필요 또는 권한이 없습니다.');
        navigate('/login', { replace: true });
      }
    }
  };

  const fetchWeightOptions = async () => {
    try {
      const res = await api.get(`/g2i4/admin/fees/basic/rows`);
      const uniq = Array.from(new Set(res.data || [])).filter(Boolean);
      if (uniq.length) setWeightOptions(uniq);
    } catch (err) {
      console.warn('weight 옵션 불러오기 실패(폴백 사용):', err);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchWeightOptions();
  }, [cargoId]);

  const handleOpen = (index = null) => {
    setEditingIndex(index);
    if (index !== null) {
      const { no, name, weight, preview } = vehicles[index];
      setFormData({ no, name, weight: String(weight ?? ''), image: null, preview });
    } else {
      setFormData({ no: null, name: '', weight: '', image: null, preview: null });
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
    const { no, name, weight, image } = formData;
    if (!cargoId) { alert('접근 권한이 없습니다.'); return; }
    if (!name || !weight) { alert('이름과 적재 무게를 입력/선택해주세요.'); return; }

    try {
      let cargoNo = no;
      const payload = { name, weight };

      // 수정
      if (no != null) {
        const res = await api.put(`/g2i4/cargo/update/${no}`, payload);
        cargoNo = res.data.cargoNo;
      } else {
        // 등록
        const res = await api.post(`/g2i4/cargo/add/${cargoId}`, payload);
        cargoNo = res.data.cargoNo;
      }

      // 이미지 업로드
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
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        alert('로그인 필요 또는 권한이 없습니다.');
        navigate('/login', { replace: true });
        return;
      }
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
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        alert('로그인 필요 또는 권한이 없습니다.');
        navigate('/login', { replace: true });
        return;
      }
      alert('삭제 실패');
    }
  };

  return (
    <Box sx={{ p: 7, bgcolor: '#f3f4f6', minHeight: '100vh' }}>
      <Typography variant="h5" fontWeight="bold" mb={4}>내 차량 관리</Typography>

      <Grid container spacing={4}>
        {vehicles.map((vehicle, idx) => (
          <Grid item key={idx}>
            <Paper sx={{ width: 400, height: 400, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box sx={{ height: 250, bgcolor: '#e5e7eb', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={vehicle.preview || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="310"><rect width="100%" height="100%" fill="%23d1d5db"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-size="24" font-family="sans-serif">No Image</text></svg>'}
                  alt="preview"
                  style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography fontWeight="bold">{vehicle.name}</Typography>
                <Typography>{vehicle.weight}</Typography>
              </Box>
              <Box mt={2} display="flex" gap={1}>
                <Button fullWidth variant="contained" onClick={() => handleOpen(idx)}>수정</Button>
                <Button fullWidth variant="contained" color="error" onClick={() => handleDelete(idx)}>삭제</Button>
              </Box>
            </Paper>
          </Grid>
        ))}

        <Grid item>
          <Paper onClick={() => handleOpen()} sx={{ width: 400, height: 400, border: '2px dashed #ccc', borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
            <Typography variant="h4">＋</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Modal open={open} onClose={handleClose}>
        <Box sx={{ p: 4, bgcolor: '#fff', borderRadius: 2, width: '90%', maxWidth: 1000, mx: 'auto', mt: '5%', position: 'relative' }}>
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
              <TextField label="차량 이름" value={formData.name} onChange={handleChange('name')} fullWidth />
              <FormControl fullWidth>
                <InputLabel id="weight-label">적재 무게</InputLabel>
                <Select
                  labelId="weight-label"
                  label="적재 무게"
                  value={formData.weight}
                  onChange={handleChange('weight')}
                >
                  {weightOptions.map((w) => (
                    <MenuItem key={w} value={w}>{w}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="outlined" component="label">
                이미지 업로드
                <input hidden accept="image/*" type="file" onChange={handleImageChange} />
              </Button>
            </Box>
          </Box>
          <Box mt={4} display="flex" gap={2}>
            <Button fullWidth variant="contained" onClick={handleSave}>저장</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default EditVehicleInform;
