import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Stack,
  Chip,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  ArrowBack as ArrowLeftIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { getNoticeDetail, deleteNotice } from '../../../api/noticeApi';
import { isCurrentUserAdmin, getCurrentUserId } from '../../../utils/jwtUtils';

const PostView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [canEditDelete, setCanEditDelete] = useState(false);

  // 공지사항 상세 로드
  const loadNoticeDetail = async () => {
    try {
      setLoading(true);
      const response = await getNoticeDetail(id);
      setNotice(response);
      setError(null);
    } catch (err) {
      console.error('공지사항 상세 로드 실패:', err);
      if (err.response && err.response.status === 404) {
        setError('존재하지 않는 공지사항입니다.');
        // 3초 후 자동으로 목록으로 이동
        setTimeout(() => {
          navigate('/noboard');
        }, 3000);
      } else {
        setError('공지사항을 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadNoticeDetail();
    }
    // 사용자 정보 초기화
    const adminStatus = isCurrentUserAdmin();
    const userId = getCurrentUserId();
    
    setIsAdmin(adminStatus);
    setCurrentUserId(userId);
  }, [id]);

  // notice가 로드된 후 권한 확인
  useEffect(() => {
    if (notice && currentUserId !== null) {
      // 관리자이거나 작성자 본인이면 수정/삭제 가능
      const canModify = isAdmin || (notice.authorId === currentUserId);
      setCanEditDelete(canModify);
    }
  }, [notice, isAdmin, currentUserId]);

  const handleGoBack = () => {
    navigate('/noboard');
  };

  const handleEdit = () => {
    navigate(`/noboard/write/${notice.noticeId}`);
  };

  const handleDeleteClick = () => {
    setDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialog(false);
    try {
      // JWT 토큰 기반 인증 사용 (userInfo는 실제로 API에서 JWT 토큰을 사용함)
      await deleteNotice(notice.noticeId);
      setSnackbar({ open: true, message: '삭제가 완료되었습니다.', severity: 'success' });
      // 성공 메시지 표시 후 1.5초 뒤 목록으로 이동
      setTimeout(() => {
        navigate('/noboard');
      }, 1500);
    } catch (err) {
      console.error('삭제 실패:', err);
      setSnackbar({ open: true, message: '삭제에 실패했습니다.', severity: 'error' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog(false);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          게시글을 불러오는 중입니다...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button variant="outlined" onClick={handleGoBack}>
            목록으로 돌아가기
          </Button>
        </Box>
      </Container>
    );
  }

  if (!notice) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          게시글을 찾을 수 없습니다
        </Typography>
        <Button variant="contained" onClick={handleGoBack} sx={{ mt: 2 }}>
          목록으로 돌아가기
        </Button>
      </Container>
    );
  }

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
            onClick={handleGoBack}
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
              fontWeight: 'bold',
              mb: 2
            }}
          >
            {notice.title}
          </Typography>
          
          <Stack 
            direction="row" 
            spacing={3} 
            sx={{ 
              color: 'primary.contrastText',
              opacity: 0.8
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PersonIcon fontSize="small" />
              <Typography variant="body2">
                작성자: {notice.authorName}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarIcon fontSize="small" />
              <Typography variant="body2">
                작성일: {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Post Content */}
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 2 }}>
              <Chip 
                label="공지" 
                color="primary" 
                size="small" 
                sx={{ mb: 2 }}
              />
            </Box>
            
            <Box>
              {notice.content.split('\n').map((paragraph, index) => (
                <Typography
                  key={index}
                  variant="body1"
                  paragraph
                  sx={{
                    lineHeight: 1.8,
                    color: 'text.primary',
                    mb: paragraph.trim() === '' ? 1 : 2
                  }}
                >
                  {paragraph || '\u00A0'} {/* Non-breaking space for empty lines */}
                </Typography>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Button
            variant="outlined"
            onClick={handleGoBack}
            startIcon={<ArrowLeftIcon />}
            size="large"
          >
            목록으로
          </Button>
          
          {canEditDelete && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                onClick={handleEdit}
                startIcon={<EditIcon />}
              >
                수정
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleDeleteClick}
                startIcon={<DeleteIcon />}
              >
                삭제
              </Button>
            </Stack>
          )}
        </Box>
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          게시글 삭제
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            정말로 이 게시글을 삭제하시겠습니까? 삭제된 게시글은 복구할 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            취소
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            삭제
          </Button>
        </DialogActions>
      </Dialog>

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

export default PostView;