import React, { useState } from 'react';
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
import { Reply as ReplyIcon } from '@mui/icons-material';

const AdminResponseForm = ({ questionId, onSubmit, onCancel, isVisible }) => {
  const [responseContent, setResponseContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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
      const responseData = {
        questionId,
        content: responseContent.trim(),
        author: '고객지원팀',
        date: new Date().toISOString().split('T')[0]
      };

      await onSubmit(responseData);
      setResponseContent('');
    } catch (err) {
      setError('답변 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setResponseContent('');
    setError('');
    onCancel();
  };

  return (
    <Card sx={{ mt: 2, backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <ReplyIcon color="primary" />
          <Typography variant="h6" color="primary">
            관리자 답변 작성
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
            placeholder="고객에게 도움이 되는 답변을 작성해주세요..."
            variant="outlined"
            sx={{ mb: 2 }}
            disabled={isSubmitting}
          />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || !responseContent.trim()}
              startIcon={<ReplyIcon />}
            >
              {isSubmitting ? '답변 등록 중...' : '답변 등록'}
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminResponseForm;