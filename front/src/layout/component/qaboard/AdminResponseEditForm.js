import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  Stack
} from '@mui/material';
import { EditNote as EditNoteIcon, Cancel as CancelIcon } from '@mui/icons-material';

const AdminResponseEditForm = ({ item, onSubmit, onCancel, isVisible }) => {
  const [responseContent, setResponseContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item && item.adminResponse && isVisible) {
      setResponseContent(item.adminResponse.content || '');
    }
  }, [item, isVisible]);

  if (!isVisible) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!responseContent.trim()) {
      setError('답변 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const updatedResponse = {
        ...item.adminResponse,
        content: responseContent.trim(),
        lastModified: new Date().toISOString().split('T')[0]
      };

      await onSubmit(item.id, updatedResponse);
      setResponseContent('');
    } catch (err) {
      setError('답변 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setResponseContent(item?.adminResponse?.content || '');
    setError('');
    onCancel();
  };

  return (
    <Card sx={{ mt: 2, backgroundColor: '#fff3e0', border: '2px solid #ff9800' }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <EditNoteIcon color="warning" />
          <Typography variant="h6" color="warning.main">
            관리자 답변 수정
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={responseContent}
            onChange={(e) => setResponseContent(e.target.value)}
            placeholder="수정할 답변 내용을 입력해주세요..."
            variant="outlined"
            sx={{ mb: 2 }}
            disabled={isSubmitting}
            label="답변 내용"
          />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              disabled={isSubmitting}
              startIcon={<CancelIcon />}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="warning"
              disabled={isSubmitting || !responseContent.trim()}
              startIcon={<EditNoteIcon />}
            >
              {isSubmitting ? '수정 중...' : '답변 수정 완료'}
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminResponseEditForm;