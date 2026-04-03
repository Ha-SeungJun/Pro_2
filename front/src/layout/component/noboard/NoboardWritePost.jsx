import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  Stack,
  Snackbar,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  ArrowBack as ArrowLeftIcon,
  Save as SaveIcon
} from '@mui/icons-material';

import { getNoticeDetail, createNotice, updateNotice, getNoticeCategories } from '../../../api/noticeApi';
import { getCurrentUserId } from '../../../utils/jwtUtils';


const WritePost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);


  // JWT에서 현재 사용자 ID를 가져와 디폴트로 설정
  const currentUserId = getCurrentUserId() || 'admin';


  const [formData, setFormData] = useState({
    title: '',
    author: currentUserId, // 디폴트로 authorID 설정
    content: '',
    category: 'GENERAL' // 기본 카테고리
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [categories, setCategories] = useState([]);


  // 수정 모드일 때 기존 데이터 로드
  const loadNoticeForEdit = async () => {
    try {
      setLoading(true);
      const response = await getNoticeDetail(id);
      setFormData({
        title: response.title,
        author: response.authorName,
        content: response.content,
        category: response.category || 'GENERAL'
      });
    } catch (err) {
      console.error('공지사항 로드 실패:', err);
      setSnackbar({ open: true, message: '공지사항을 불러오는데 실패했습니다.', severity: 'error' });
      navigate('/noboard');
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 목록 로드
  const loadCategories = async () => {
    try {
      const categoryData = await getNoticeCategories();
      setCategories(categoryData); // GENERAL 포함하여 모든 카테고리 표시
    } catch (err) {
      console.error('카테고리 로드 실패:', err);
      // 기본 카테고리 설정
      setCategories([
        { value: 'GENERAL', displayName: '사용안내' },
        { value: 'SYSTEM', displayName: '시스템' },
        { value: 'SERVICE', displayName: '서비스' },
        { value: 'UPDATE', displayName: '업데이트' }
      ]);
    }
  };

  useEffect(() => {
    loadCategories();
    if (isEditing && id) {
      loadNoticeForEdit();
    }
  }, [id, isEditing]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    }

    if (!formData.author.trim()) {
      newErrors.author = '작성자를 입력해주세요.';
    }

    if (!formData.content.trim()) {
      newErrors.content = '내용을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {

      // JWT 토큰 기반 인증 사용 (API에서 자동으로 JWT 토큰 처리)
      // formData.author 값은 백엔드에서 authorName으로 저장됨

      console.log('=== 제출 데이터 확인 ===');
      console.log('isEditing:', isEditing);
      console.log('formData:', formData);
      console.log('게시글 ID:', id);
      
      if (isEditing) {
        console.log('수정 API 호출 중...');
        await updateNotice(id, formData);
        setSnackbar({ open: true, message: '공지가 성공적으로 수정되었습니다.', severity: 'success' });
      } else {
        console.log('생성 API 호출 중...');
        await createNotice(formData);
        setSnackbar({ open: true, message: '새 공지가 성공적으로 작성되었습니다.', severity: 'success' });
      }
      
      // 성공 메시지 표시 후 1.5초 뒤 목록으로 이동
      setTimeout(() => {
        navigate('/noboard');
      }, 1500);
    } catch (error) {
      console.error('저장 실패:', error);
      setSnackbar({ open: true, message: `오류가 발생했습니다: ${error.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleCancel = () => {
    if (window.confirm('작성을 취소하시겠습니까? 입력한 내용이 사라집니다.')) {
      navigate('/noboard');
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main',
          py: 4,
          px: 3
        }}
      >
        <Container maxWidth="md">
          <Button
            variant="text"
            onClick={() => navigate('/noboard')}
            startIcon={<ArrowLeftIcon />}
            sx={{ 
              mb: 2,
              color: 'primary.contrastText',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            목록으로
          </Button>
          
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              color: 'primary.contrastText',
              fontWeight: 'bold'
            }}
          >
            {isEditing ? '공지 수정' : '새 공지 작성'}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card sx={{ boxShadow: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {/* Title */}
                <TextField
                  label="제목"
                  fullWidth
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  error={!!errors.title}
                  helperText={errors.title}
                  placeholder="공지 제목을 입력하세요"
                  required
                  disabled={loading}
                />


                {/* Category */}
                <FormControl fullWidth required disabled={loading}>
                  <InputLabel id="category-label">카테고리</InputLabel>
                  <Select
                    labelId="category-label"
                    value={formData.category}
                    label="카테고리"
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.value} value={category.value}>
                        {category.displayName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Author */}
                <TextField
                  label="작성자"
                  fullWidth
                  value={formData.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                  error={!!errors.author}
                  helperText={errors.author}
                  placeholder="작성자명을 입력하세요"
                  required
                  disabled={loading}
                />


                {/* Content */}
                <TextField
                  label="내용"
                  multiline
                  rows={12}
                  fullWidth
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  error={!!errors.content}
                  helperText={errors.content}
                  placeholder="공지 내용을 입력하세요"
                  required
                  disabled={loading}
                  sx={{
                    '& .MuiInputBase-root': {
                      alignItems: 'flex-start'
                    }
                  }}
                />

                {/* Action Buttons */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pt: 2
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    startIcon={<ArrowLeftIcon />}
                    disabled={loading}
                    size="large"
                  >
                    취소
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                    size="large"
                  >
                    {loading ? '저장 중...' : (isEditing ? '수정하기' : '작성하기')}
                  </Button>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WritePost;