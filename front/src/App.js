import { useEffect } from 'react';
import './App.css';
import { RouterProvider } from 'react-router-dom';
import root from './router/root';
import AiChatBot from './layout/component/AiChatBot';
import CounselorChat from './layout/component/CounselorChat';
import FloatingButtons from './components/FloatingButtons';
import { useDispatch } from 'react-redux';
import { getUserInfoAsync } from './slice/loginSlice';
import { Box } from '@mui/material';  // ← 추가

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      dispatch(getUserInfoAsync());
    }
  }, [dispatch]);

  return (
    <>
      <RouterProvider router={root} />

      <Box
        className="no-print"
        sx={{
          position: 'fixed',
          bottom: { xs: '76px', md: '24px' },  // ← 모바일: 탭바(60)+여백(16)
          right: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          zIndex: 9999,
        }}
      >
        <FloatingButtons />
        <Box sx={{ position: 'relative' }}>
          <CounselorChat />
        </Box>
        <Box sx={{ position: 'relative' }}>
          <AiChatBot />
        </Box>
      </Box>
    </>
  );
}

export default App;