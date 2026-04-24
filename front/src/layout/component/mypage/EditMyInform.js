import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { updateProfileImage } from '../../../slice/loginSlice';
import {
  Avatar, Box, Button, Divider, Grid, IconButton, InputAdornment,
  TextField, Typography
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// =================== 공통 상수/유틸 ===================
const API_BASE =
  process.env.REACT_APP_API_BASE ||
  'http://localhost:8080';

const DEFAULT_AVATAR = '/image/placeholders/avatar.svg';

const getFirst = (...candidates) =>
  candidates.find(v => v !== undefined && v !== null && v !== '') ?? '';

const normalizeProfileUrl = (v) => {
  if (!v) return null;
  if (v.startsWith('http')) return v;
  if (v.startsWith('/g2i4/uploads/')) return `${API_BASE}${v}`;
  return `${API_BASE}/g2i4/uploads/user_profile/${encodeURIComponent(v)}`;
};

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token =
    sessionStorage.getItem('accessToken') ||
    sessionStorage.getItem('ACCESS_TOKEN');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// =================== 컴포넌트 ===================
const EditMyInform = () => {
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const togglePasswordVisibility = (field) =>
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));

  const [userType, setUserType] = useState(null);

  const [user, setUser] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    createdDate: '',
    postcode: '',
  });

  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [loading, setLoading] = useState(true);

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [coupons, setCoupons] = useState([]);
  const [couponLoading, setCouponLoading] = useState(false);

  const fetchMyCoupons = useCallback(async () => {
    // 🚨 차주 계정 API 호출 차단
    if (!user.id || userType !== 'MEMBER') return;
    try {
      const res = await api.get(`/g2i4/coupons/my-list`);
      setCoupons(res.data);
    } catch (err) {
      console.error("쿠폰 목록 로드 실패:", err);
    }
  }, [user.id, userType]);

  const handleIssueCoupons = async () => {
    if (!user.id || userType !== 'MEMBER') return;
    setCouponLoading(true);
    try {
      await api.post('/g2i4/coupons/issue-test', { memId: user.id });
      alert("테스트 쿠폰이 발급되었습니다!");
      fetchMyCoupons(); 
    } catch (err) {
      alert("발급 실패: " + (err.response?.data?.result || err.message));
    } finally {
      setCouponLoading(false);
    }
  };

  const handleDeleteImageServer = async () => {
    if (!window.confirm('프로필 이미지를 삭제할까요?')) return;
    try {
      setUploading(true);
      await api.delete('/g2i4/user/profile-image');
      setAvatarUrl(null);
      alert('프로필 이미지가 삭제되었습니다.');
    } catch (err) {
      alert('삭제 실패');
    } finally {
      setUploading(false);
    }
  };

  const loadDaumPostcode = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (window.daum && window.daum.Postcode) return resolve();
      const script = document.createElement('script');
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Daum Postcode script load failed'));
      document.body.appendChild(script);
    });
  }, []);

  const openPostcode = useCallback(async () => {
    try {
      await loadDaumPostcode();
      new window.daum.Postcode({
        oncomplete: (data) => {
          const road = data.roadAddress || data.address;
          const zonecode = data.zonecode || '';
          setUser(prev => ({ ...prev, address: road, postcode: zonecode }));
        },
      }).open();
    } catch (e) {
      console.error(e);
    }
  }, [loadDaumPostcode]);

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const res = await api.get('/g2i4/user/info');
        const raw = res?.data ?? {};
        const type = raw.userType || raw.type || raw.role || raw.loginType || null;
        const data = raw.data || raw.user || raw.payload || raw.profile || raw.account || raw.result || {};

        const normalized = type === 'MEMBER'
          ? {
              id: getFirst(data.mem_id, data.memberId, data.id, data.username),
              name: getFirst(data.mem_name, data.memberName, data.name),
              email: getFirst(data.mem_email, data.memberEmail, data.email),
              phone: getFirst(data.mem_phone, data.memberPhone, data.phone),
              address: getFirst(data.mem_address, data.memberAddress, data.address),
              createdDate: getFirst(data.mem_create_id_date_time, data.memCreatedDateTime, data.created_at, data.createdAt),
            }
          : {
              id: getFirst(data.cargo_id, data.cargoId, data.id, data.username),
              name: getFirst(data.cargo_name, data.cargoName, data.name),
              email: getFirst(data.cargo_email, data.cargoEmail, data.email),
              phone: getFirst(data.cargo_phone, data.cargoPhone, data.phone),
              address: getFirst(data.cargo_address, data.cargoAddress, data.address),
              createdDate: getFirst(data.cargo_created_date_time, data.cargoCreateidDateTime, data.created_at, data.createdAt),
            };

        const avatarName = getFirst(data.webPath, data.profileImage, data.mem_profile_image, data.cargo_profile_image, data.profile);
        const initialAvatar = normalizeProfileUrl(avatarName);

        if (!canceled) {
          setUserType(type);
          setUser(prev => ({ ...prev, ...normalized }));
          setAvatarUrl(initialAvatar || null);
        }
      } catch (err) {
        console.error('회원 정보 불러오기 실패:', err);
      } finally {
        if (!canceled) setLoading(false);
      }
    })();
    return () => { canceled = true; };
  }, []);

  useEffect(() => {
    if (user.id && userType === 'MEMBER') fetchMyCoupons();
  }, [user.id, userType, fetchMyCoupons]);

  const handleSaveAddress = async () => {
    try {
      const url = userType === 'MEMBER'
        ? `/g2i4/member/${encodeURIComponent(user.id)}/address`
        : `/g2i4/cargo/${encodeURIComponent(user.id)}/address`;

      await api.put(url, { address: user.address, postcode: user.postcode || null });
      alert('주소가 변경되었습니다.');
    } catch (e) {
      alert('주소 변경 실패');
    }
  };

  const handleChangePassword = async () => {
    try {
      const url = userType === 'MEMBER'
        ? `/g2i4/member/${encodeURIComponent(user.id)}/password`
        : `/g2i4/cargo/${encodeURIComponent(user.id)}/password`;

      await api.put(url, { currentPassword: pwd.current, newPassword: pwd.next });
      alert('비밀번호가 변경되었습니다.');
      setPwd({ current: '', next: '', confirm: '' });
    } catch (err) {
      alert('비밀번호 변경 실패');
    }
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    fd.append('userType', userType);
    fd.append('id', user.id);

    try {
      setUploading(true);
      const { data } = await api.post('/g2i4/user/upload-image', fd);
      const url = normalizeProfileUrl(data?.webPath ?? data?.filename);
      if (url) {
        setAvatarUrl(`${url}?v=${Date.now()}`);
        dispatch(updateProfileImage(`${url}?v=${Date.now()}`));
      }
      alert('이미지 업로드 완료');
    } catch (err) {
      alert('업로드 실패');
    } finally {
      setUploading(false);
    }
  };

  const triggerFilePick = () => fileInputRef.current?.click();

  if (loading) return <Box sx={{ p: 7 }}>불러오는 중…</Box>;

return (
  <Box sx={{ 
    p: { xs: 2, sm: 4, md: 7 },        // ← 고정값 제거
    pl: { xs: 2, sm: 4, md: 10, lg: 20 }, // ← 반응형으로
    pr: { xs: 2, sm: 4, md: 10, lg: 20 }, // ← 반응형으로
    bgcolor: '#f3f4f6', 
    minHeight: '100vh' 
  }}>
    <Typography variant="h5" fontWeight="bold" mb={1}>회원 정보 수정</Typography>
    <Typography variant="body2" sx={{ color: 'gray', mb: 4 }}>
      로그인 유형: {userType === 'MEMBER' ? '일반 회원' : '화물(차량) 소유자'}
    </Typography>

    <Grid container spacing={4} alignItems="center">
      <Grid item xs={12} md={6}>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'grey.200' }} src={avatarUrl || DEFAULT_AVATAR} />
          <Box display="flex" flexDirection="column" gap={1}>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUploadImage} />
            <Button variant="outlined" onClick={triggerFilePick} disabled={uploading} sx={{ minWidth: 160 }}>사진 업로드</Button>
            <Button variant="text" color="error" onClick={handleDeleteImageServer} disabled={uploading}>사진 삭제</Button>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12} md={6}>
        <Box sx={{ 
          pl: { xs: 0, md: 4 },               // ← 모바일에서 왼쪽 패딩 제거
          borderLeft: { xs: 'none', md: '1px solid #ddd' },  // ← 모바일에서 선 제거
          mt: { xs: 2, md: 0 }                // ← 모바일에서 위 여백 추가
        }}>
          <Typography fontWeight="bold" mb={1}>회원 정보</Typography>
          <Typography>이 름 : {user.name}</Typography>
          <Typography>아이디 : {user.id}</Typography>
          <Typography>이메일 : {user.email}</Typography>
        </Box>
      </Grid>
    </Grid>

    <Divider sx={{ my: 4 }} />

    <Typography fontWeight="bold" mb={2}>주소 변경</Typography>
    <Box display="flex" gap={2} mb={4} flexDirection={{ xs: 'column', sm: 'row' }}>  {/* ← 모바일 세로 정렬 */}
      <TextField label="주소" fullWidth value={user.address || ''} InputProps={{ readOnly: true }} />
      <Button variant="outlined" onClick={openPostcode} sx={{ whiteSpace: 'nowrap' }}>주소 찾기</Button>
      <Button variant="contained" sx={{ bgcolor: '#6b46c1', whiteSpace: 'nowrap' }} onClick={handleSaveAddress}>변경하기</Button>
    </Box>

      {/* 🚨 핵심 수정: userType이 'MEMBER'일 때만 쿠폰 섹션 렌더링 */}
      {userType === 'MEMBER' && (
        <>
          <Divider sx={{ my: 4 }} />
          <Typography fontWeight="bold" mb={2}>내 쿠폰 관리</Typography>
          <Box sx={{ p: 3, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #e0e0e0', mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Typography variant="body1">사용 가능한 쿠폰: <b>{coupons.length}</b>장</Typography>
                <Typography variant="caption" color="text.secondary">테스트 기간 동안 무제한 발급이 가능합니다.</Typography>
              </Box>
              <Button variant="contained" onClick={handleIssueCoupons} disabled={couponLoading} sx={{ bgcolor: '#6b46c1' }}>
                {couponLoading ? '발급 중...' : '쿠폰 받기'}
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
              {coupons.length === 0 ? (
                <Typography variant="body2" color="gray" textAlign="center">보유 중인 쿠폰이 없습니다.</Typography>
              ) : (
                coupons.map((mc) => (
                  <Box key={mc.mcno} sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, mb: 1, bgcolor: '#f9fafb', borderRadius: 1 }}>
                    <Typography variant="body2">{mc.coupon.couponName}</Typography>
                    <Typography variant="body2" fontWeight="bold" color="#6b46c1">
                      {mc.coupon.discountType === 'FLAT' ? `${mc.coupon.discountValue}원` : `${mc.coupon.discountValue}%`} 할인
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          </Box>
        </>
      )}

      <Divider sx={{ my: 4 }} />

      <Typography fontWeight="bold" mb={2}>비밀번호 변경</Typography>
      <Box display="flex" flexDirection="column" gap={2} sx={{mb:10}}>
        <TextField label="현재 비밀번호" fullWidth type={showPassword.current ? 'text' : 'password'} value={pwd.current} onChange={(e) => setPwd(p => ({ ...p, current: e.target.value }))}
          InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => togglePasswordVisibility('current')}>{showPassword.current ? <Visibility /> : <VisibilityOff />}</IconButton></InputAdornment> }} />
        <TextField label="새로운 비밀번호" fullWidth type={showPassword.new ? 'text' : 'password'} value={pwd.next} onChange={(e) => setPwd(p => ({ ...p, next: e.target.value }))}
          InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => togglePasswordVisibility('new')}>{showPassword.new ? <Visibility /> : <VisibilityOff />}</IconButton></InputAdornment> }} />
        <Box textAlign="right"><Button variant="contained" sx={{ width: 157, height: 50, bgcolor: '#6b46c1' }} onClick={handleChangePassword}>변경하기</Button></Box>
      </Box>
    </Box>
  );
};

export default EditMyInform;