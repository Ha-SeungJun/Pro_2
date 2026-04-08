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

// axios 인스턴스 + 단일 인터셉터
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

  // 프로필 업로드 상태
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // ✅ [추가] 쿠폰 관련 상태
  const [coupons, setCoupons] = useState([]);
  const [couponLoading, setCouponLoading] = useState(false);

  // ✅ [추가] 내 쿠폰 목록 조회 API 호출
  const fetchMyCoupons = useCallback(async () => {
    if (!user.id) return;
    try {
      const res = await api.get(`/g2i4/coupons/my-list/${user.id}`);
      setCoupons(res.data);
    } catch (err) {
      console.error("쿠폰 목록 로드 실패:", err);
    }
  }, [user.id]);

  // ✅ [추가] 테스트 쿠폰 발급 요청
  const handleIssueCoupons = async () => {
    if (!user.id) return;
    setCouponLoading(true);
    try {
      await api.post('/g2i4/coupons/issue-test', { memId: user.id });
      alert("테스트 쿠폰 2종이 발급되었습니다! 🎁");
      fetchMyCoupons(); // 목록 새로고침
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
      const msg = err?.response?.data ?? err.message ?? '삭제 실패';
      alert(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // --- Daum postcode ---
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
      alert('주소 검색 로딩에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }, [loadDaumPostcode]);

  // --- 초기 로드: 사용자 정보 + 프로필 이미지 세팅 ---
  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const res = await api.get('/g2i4/user/info');
        const raw = res?.data ?? {};
        const type = raw.userType || raw.type || raw.role || raw.loginType || null;
        const data =
          raw.data || raw.user || raw.payload || raw.profile || raw.account || raw.result || {};

        if (!type || !data) throw new Error('Unexpected /g2i4/user/info shape');

        const normalized =
          type === 'MEMBER'
            ? {
              id: getFirst(data.mem_id, data.memberId, data.id, data.username),
              name: getFirst(data.mem_name, data.memberName, data.name),
              email: getFirst(data.mem_email, data.memberEmail, data.email),
              phone: getFirst(data.mem_phone, data.memberPhone, data.phone),
              address: getFirst(data.mem_address, data.memberAddress, data.address),
              createdDate: getFirst(
                data.mem_create_id_date_time,
                data.memCreatedDateTime,
                data.created_at,
                data.createdAt
              ),
            }
            : {
              id: getFirst(data.cargo_id, data.cargoId, data.id, data.username),
              name: getFirst(data.cargo_name, data.cargoName, data.name),
              email: getFirst(data.cargo_email, data.cargoEmail, data.email),
              phone: getFirst(data.cargo_phone, data.cargoPhone, data.phone),
              address: getFirst(data.cargo_address, data.cargoAddress, data.address),
              createdDate: getFirst(
                data.cargo_created_date_time,
                data.cargo_created_datetime,
                data.cargoCreateidDateTime,
                data.created_at,
                data.createdAt
              ),
            };

        const avatarName = getFirst(
          data.webPath,
          data.profileImage,
          data.mem_profile_image,
          data.cargo_profile_image,
          data.profile
        );
        const initialAvatar = normalizeProfileUrl(avatarName);

        if (!canceled) {
          setUserType(type);
          setUser(prev => ({ ...prev, ...normalized }));
          setAvatarUrl(initialAvatar || null);
        }
      } catch (err) {
        console.error('회원 정보 불러오기 실패:', err);
        alert('회원 정보를 불러오지 못했습니다.');
      } finally {
        if (!canceled) setLoading(false);
      }
    })();
    return () => {
      canceled = true;
    };
  }, []);

  // ✅ [추가] 유저 정보 로드 후 쿠폰 목록 자동 조회
  useEffect(() => {
    if (user.id) fetchMyCoupons();
  }, [user.id, fetchMyCoupons]);

  const handleSaveAddress = async () => {
    try {
      if (!userType) return;
      const url =
        userType === 'MEMBER'
          ? `/g2i4/member/${encodeURIComponent(user.id)}/address`
          : `/g2i4/cargo/${encodeURIComponent(user.id)}/address`;

      await api.put(url, {
        address: user.address,
        postcode: user.postcode || null,
      });
      alert('주소가 변경되었습니다.');
    } catch (e) {
      console.error(e);
      alert('주소 변경에 실패했습니다.');
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!userType) return;
      if (!pwd.current || !pwd.next || !pwd.confirm) {
        alert('비밀번호를 모두 입력하세요.');
        return;
      }
      if (pwd.next !== pwd.confirm) {
        alert('새 비밀번호가 일치하지 않습니다.');
        return;
      }
      if (pwd.current === pwd.next) {
        alert('현재 비밀번호와 다른 새 비밀번호를 입력해주세요.');
        return;
      }

      const url =
        userType === 'MEMBER'
          ? `/g2i4/member/${encodeURIComponent(user.id)}/password`
          : `/g2i4/cargo/${encodeURIComponent(user.id)}/password`;

      await api.put(url, {
        currentPassword: pwd.current,
        newPassword: pwd.next,
      });

      alert('비밀번호가 변경되었습니다.');
      setPwd({ current: '', next: '', confirm: '' });
    } catch (err) {
      const msg = err?.response?.data ?? err.message ?? '비밀번호 변경 실패';
      alert(msg);
    }
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB를 넘을 수 없습니다.');
      return;
    }

    const fd = new FormData();
    fd.append('image', file);
    fd.append('userType', userType);
    fd.append('id', user.id);

    try {
      setUploading(true);
      const { data } = await api.post('/g2i4/user/upload-image', fd);
      const url = normalizeProfileUrl(data?.webPath ?? data?.filename);
      if (url) {
        const cacheBustedUrl = `${url}?v=${Date.now()}`;
        setAvatarUrl(cacheBustedUrl);
        dispatch(updateProfileImage(cacheBustedUrl));
      }
      alert('프로필 이미지가 업로드되었습니다.');
    } catch (err) {
      const msg = err?.response?.data ?? err.message ?? '업로드 실패';
      alert(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerFilePick = () => fileInputRef.current?.click();

  if (loading) return <Box sx={{ p: 7 }}>불러오는 중…</Box>;

  return (
    <Box sx={{ p: 7, pl: 50, pr: 50, bgcolor: '#f3f4f6', minHeight: '100vh' }}>
      <Typography variant="h5" fontWeight="bold" mb={1}>회원 정보 수정</Typography>
      <Typography variant="body2" sx={{ color: 'gray', mb: 4 }}>
        로그인 유형: {userType === 'MEMBER' ? '일반 회원' : '화물(차량) 소유자'}
      </Typography>

      {/* Profile Section */}
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12} md={6}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{ width: 80, height: 80, bgcolor: 'grey.200' }}
              src={avatarUrl || DEFAULT_AVATAR}
              imgProps={{ referrerPolicy: 'no-referrer' }}
            />
            <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleUploadImage}
              />
              <Button
                variant="outlined"
                onClick={triggerFilePick}
                disabled={uploading || !userType || !user.id}
                sx={{ minWidth: 160 }}
              >
                {uploading ? '업로드 중...' : '사진 업로드'}
              </Button>
              <Button
                variant="text"
                color="error"
                onClick={handleDeleteImageServer}
                disabled={uploading}
                sx={{ minWidth: 160 }}
              >
                사진 삭제
              </Button>
            </Box>
          </Box>
        </Grid>

        <Grid item md={0.1} sx={{
          display: { xs: 'none', md: 'block' },
          height: '100%',
          borderLeft: '1px solid #666666'
        }} />

        <Grid item xs={12} md={5.9}>
          <Box sx={{ pl: { md: 4 } }}>
            <Typography fontWeight="bold" mb={2}>회원 정보</Typography>
            <Typography>이 름 : {user.name}</Typography><br />
            <Typography>아이디 : {user.id}</Typography><br />
            <Typography>이메일 : {user.email}</Typography>
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* 주소 변경 */}
      <Typography fontWeight="bold" mb={2}>주소 변경</Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <Box display="flex" gap={2}>
          <TextField
            label="주소"
            fullWidth
            value={user.address || ''}
            onClick={openPostcode}
            InputProps={{
              readOnly: true,
              sx: { bgcolor: '#f3f4f6', cursor: 'pointer' }
            }}
          />
          <Button
            variant="outlined"
            sx={{ width: 200, whiteSpace: 'nowrap' }}
            onClick={openPostcode}
          >
            주소 찾기
          </Button>
        </Box>

        <Box textAlign="right">
          <Button
            variant="contained"
            sx={{ width: 157, height: 50, bgcolor: '#6b46c1', '&:hover': { bgcolor: '#553c9a' } }}
            onClick={handleSaveAddress}
          >
            변경하기
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* ✅ [추가] 내 쿠폰 관리 섹션 */}
      <Typography fontWeight="bold" mb={2}>내 쿠폰 관리</Typography>
      <Box sx={{ p: 3, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #e0e0e0', mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="body1">사용 가능한 쿠폰: <b>{coupons.length}</b>장</Typography>
            <Typography variant="caption" color="text.secondary">테스트 기간 동안 무제한 발급이 가능합니다.</Typography>
          </Box>
          <Button 
            variant="contained" 
            onClick={handleIssueCoupons}
            disabled={couponLoading || !user.id}
            sx={{ height: 45, bgcolor: '#6b46c1', '&:hover': { bgcolor: '#553c9a' } }}
          >
            {couponLoading ? '발급 중...' : '쿠폰 2종 받기 🎁'}
          </Button>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ maxHeight: 250, overflowY: 'auto', pr: 1 }}>
          {coupons.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="body2" color="gray">보유 중인 쿠폰이 없습니다.</Typography>
            </Box>
          ) : (
            coupons.map((mc) => (
              <Box 
                key={mc.mcno} 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  p: 2, 
                  mb: 1.5, 
                  bgcolor: '#f9fafb', 
                  borderRadius: 2,
                  border: '1px dashed #d1d5db'
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight="bold" color="#374151">
                    {mc.coupon.couponName}
                  </Typography>
                  <Typography variant="caption" display="block" color="error">
                    만료일: {new Date(mc.expiryDate).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="h6" color="#6b46c1" fontWeight="bold">
                    {mc.coupon.discountType === 'FLAT' 
                      ? `${mc.coupon.discountValue.toLocaleString()}원` 
                      : `${mc.coupon.discountValue}%`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {mc.coupon.minOrderPrice > 0 ? `${mc.coupon.minOrderPrice.toLocaleString()}원 이상 결제 시` : '금액 제한 없음'}
                  </Typography>
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* 비밀번호 변경 */}
      <Typography fontWeight="bold" mb={2}>비밀번호 변경</Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="현재 비밀번호"
          fullWidth
          value={pwd.current}
          onChange={(e) => setPwd(p => ({ ...p, current: e.target.value }))}
          type={showPassword.current ? 'text' : 'password'}
          InputProps={{
            sx: { bgcolor: '#f3f4f6' },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => togglePasswordVisibility('current')} edge="end">
                  {showPassword.current ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <TextField
          label="새로운 비밀번호"
          fullWidth
          value={pwd.next}
          onChange={(e) => setPwd(p => ({ ...p, next: e.target.value }))}
          type={showPassword.new ? 'text' : 'password'}
          InputProps={{
            sx: { bgcolor: '#f3f4f6' },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => togglePasswordVisibility('new')} edge="end">
                  {showPassword.new ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <TextField
          label="새로운 비밀번호 확인"
          fullWidth
          value={pwd.confirm}
          onChange={(e) => setPwd(p => ({ ...p, confirm: e.target.value }))}
          type={showPassword.confirm ? 'text' : 'password'}
          InputProps={{
            sx: { bgcolor: '#f3f4f6' },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => togglePasswordVisibility('confirm')} edge="end">
                  {showPassword.confirm ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <Box textAlign="right">
          <Button
            variant="contained"
            sx={{ width: 157, height: 50, bgcolor: '#6b46c1', '&:hover': { bgcolor: '#553c9a' } }}
            onClick={handleChangePassword}
          >
            변경하기
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default EditMyInform;