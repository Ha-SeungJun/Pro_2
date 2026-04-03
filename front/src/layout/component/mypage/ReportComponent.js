import React, { useState, useEffect } from 'react';
import { reportUser, reportCreate } from '../../../api/userinfoApi/reportApi';
import {
  Box, Typography, CircularProgress, Alert,
  Button,
  TextField
} from '@mui/material';
const initState = {
  reporterId: '',
    targetId: '',
    content: '',
}
const ReportComponent = ({ matchingNo ,onClose}) => {
  const [formState, setFormState] = useState(initState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!matchingNo) {
      setIsLoading(false);
      setError('Delivery number is required.');
      return;
    }

    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        const data = await reportUser(matchingNo);
        setFormState(prevState => ({
          ...prevState,
          reporterId: data.reporterId, // Use the key from server response
          targetId: data.targetId,   // Use the key from server response
        }));
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch report details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [matchingNo]); 

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!formState.reporterId && !isLoading) {
    return <Alert severity="info">신고 대상 정보를 불러오지 못했습니다.</Alert>;
  }

  const handleContentChange = (e) => {
    setFormState(prevState => ({ ...prevState, content: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!formState.content) {
      alert('신고 내용을 입력해주세요.');
      return;
    }
    try {
      await reportCreate(formState);
      alert('신고가 성공적으로 접수되었습니다.');
      if (onClose) {
        onClose(); // Close the modal on success
      }
    } catch (error) {
      console.error("Failed to submit report:", error);
      alert('신고 접수 중 오류가 발생했습니다.');
    }
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: '4px' }}>
      <Typography variant="h6" gutterBottom>신고 양식</Typography>
      <TextField
        label="신고자 ID"
        value={formState.reporterId}
        fullWidth
        margin="normal"
        InputProps={{ readOnly: true }}
        variant="filled"
        readOnly
      />
      <TextField
        label="신고 대상 ID"
        value={formState.targetId}
        fullWidth
        margin="normal"
        InputProps={{ readOnly: true }}
        variant="filled"
        readOnly
      />
      <TextField
        label="신고 내용"
        value={formState.content}
        onChange={handleContentChange}
        fullWidth
        margin="normal"
        multiline
        rows={4}
        placeholder="신고 내용을 입력하세요..."
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={!formState.content || !formState.targetId} // content가 있어야 활성화
        sx={{ mt: 2 }}
      >
        신고 접수
      </Button>
    </Box>
  );
};

export default ReportComponent;
