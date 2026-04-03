// EditMyInform.jsx
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
  import.meta?.env?.VITE_API_BASE ||
  process.env.REACT_APP_API_BASE ||
  'http://localhost:8080';

const DEFAULT_AVATAR = '/image/placeholders/avatar.svg';


const getFirst = (...candidates) =>
  candidates.find(v => v !== undefined && v !== null && v !== '') ?? '';

const normalizeProfileUrl = (v) => {
  if (!v) return null;
  if (v.startsWith('http')) return v;
  if (v.startsWith('/g2i4/uploads/')) return `${API_BASE}${v}`; // 이미 웹경로인 경우
  return `${API_BASE}/g2i4/uploads/user_profile/${encodeURIComponent(v)}`; // 파일명만 온 경우
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

  // 'MEMBER' | 'CARGO_OWNER'
  const [userType, setUserType] = useState(null);

  // 공통 스키마
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
  const handleDeleteImageServer = async () => {
    if (!window.confirm('프로필 이미지를 삭제할까요?')) return;
    try {
      setUploading(true);
      await api.delete('/g2i4/user/profile-image'); // ← 방금 만든 API
      setAvatarUrl(null); // UI 즉시 반영
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

        // 프로필 파일명 후보 읽어서 미리보기 세팅
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

  // --- 주소 변경 저장 ---
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

  // --- 비밀번호 변경 저장 ---
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

  // --- 프로필 이미지 업로드 ---
  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB
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
        setAvatarUrl(cacheBustedUrl); // 로컬 UI 즉시 업데이트
        dispatch(updateProfileImage(cacheBustedUrl)); // 전역 상태 업데이트
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
  const handleDeleteImageLocal = () => {
    setAvatarUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    // 서버 삭제 API가 있으면 여기서 호출 추가
  };

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

        {/* Divider */}
        <Grid item md={0.1} sx={{
          display: { xs: 'none', md: 'block' },
          height: '100%',
          borderLeft: '1px solid #666666'
        }} />

        {/* Info */}
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
