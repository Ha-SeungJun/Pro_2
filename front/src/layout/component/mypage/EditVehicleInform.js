import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Grid, Paper, Typography, Button, Modal, TextField,
  IconButton, Select, MenuItem, InputLabel, FormControl, Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useParams, useNavigate } from 'react-router-dom';

// ===== 공통 API 베이스/인스턴스 =====
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080';

const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken') || sessionStorage.getItem('ACCESS_TOKEN');
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
  const [weightOptions, setWeightOptions] = useState(['0.5톤','1톤','2톤','3톤','4톤','5톤이상']); 
  const [loading, setLoading] = useState(false); 
  
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

  const fetchVehicles = async () => {
    if (!cargoId) return;
    try {
      const cargoRes = await api.get(`/g2i4/cargo/list/${cargoId}`);
      const cargoList = cargoRes.data || [];

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
    
    // 신규 등록 시 이미지 필수 체크
    if (no === null && !image) {
      alert('차량 등록을 위해 차량 사진 업로드는 필수입니다.');
      return;
    }
    
    if (!name || !weight || !cargoNumber) {
      alert('차량 이름, 적재 무게, 차량 번호를 모두 입력해주세요.');
      return;
    }

    try {
      setLoading(true);

      if (no != null) {
        // [수정] 기존 데이터 수정
        const payload = { name, address: weight, weight, cargoNumber };
        await api.put(`/g2i4/cargo/update/${no}`, payload);
        
        if (image) {
          const fd = new FormData();
          fd.append('image', image);
          await api.post(`/g2i4/cargo/upload/${no}`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
      } else {
        // [신규 등록] 통합 전송 (Multipart/Form-Data)
        const formDataPayload = new FormData();
        
        const dto = {
          name,
          address: weight,
          weight,
          cargoNumber
        };
        
        // 🚨 [에러 해결 핵심] Blob 생성 시 type을 명시적으로 'application/json'으로 지정
        const jsonBlob = new Blob([JSON.stringify(dto)], { type: "application/json" });
        formDataPayload.append('dto', jsonBlob);
        
        // 이미지 파일 추가
        formDataPayload.append('image', image);

        // 🚨 headers에 Content-Type을 명시적으로 적지 않아도 브라우저가 boundary를 자동으로 잡아줍니다.
        await api.post(`/g2i4/cargo/add/${cargoId}`, formDataPayload);
      }

      alert('차량 정보가 성공적으로 저장되었습니다. 관리자 승인을 기다려주세요.');
      await fetchVehicles();
      handleClose();
    } catch (err) {
      console.error('차량 저장 실패:', err.response?.data || err.message);
      alert(err.response?.data || '차량 저장에 실패했습니다.');
    } finally {
      setLoading(false);
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
    <Box sx={{ p: 7, bgcolor: '#f3f4f6', minHeight: '100vh' }}>
      <Typography variant="h5" fontWeight="bold" mb={4}>내 차량 관리</Typography>

      <Grid container spacing={4}>
        {vehicles.map((vehicle, idx) => (
          <Grid item key={idx}>
            <Paper sx={{ 
              width: 400, height: 400, p: 2, 
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              border: vehicle.status !== 'APPROVED' ? '2px dashed #ff000033' : 'none'
            }}>
              <Box sx={{ height: 200, bgcolor: '#e5e7eb', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={vehicle.preview || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="310"><rect width="100%" height="100%" fill="%23d1d5db"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-size="24" font-family="sans-serif">No Image</text></svg>'}
                  alt="preview"
                  style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </Box>
              
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Box display="flex" justifyContent="center" alignItems="center" gap={1} mb={1}>
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

        <Grid item>
          <Paper onClick={() => handleOpen()} sx={{ width: 400, height: 400, border: '2px dashed #ccc', borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
            <Typography variant="h4">＋ 신규 차량 추가</Typography>
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
              <TextField label="차량 이름 (예: 다마스)" value={formData.name} onChange={handleChange('name')} fullWidth />
              
              <TextField 
                label="차량 번호 (예: 12가 3456)" 
                value={formData.cargoNumber} 
                onChange={handleChange('cargoNumber')} 
                fullWidth 
              />

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
                차량 이미지 업로드
                <input hidden accept="image/*" type="file" onChange={handleImageChange} />
              </Button>
            </Box>
          </Box>
          <Box mt={4} display="flex" gap={2}>
            <Button fullWidth variant="contained" onClick={handleSave} disabled={loading}>
              {loading ? '저장 중...' : '저장 (관리자 승인 대기)'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default EditVehicleInform;