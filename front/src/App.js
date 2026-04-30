import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import root from './router/root';
import AiChatBot from './layout/component/AiChatBot';
import CounselorChat from './layout/component/CounselorChat';
import FloatingButtons from './components/FloatingButtons';
import { useDispatch } from 'react-redux';
import { getUserInfoAsync } from './slice/loginSlice';
import { Box, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

function App() {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false); // ← 열고 닫는 상태 관리

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
          bottom: { xs: '76px', md: '24px' },
          right: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          zIndex: 9999,
        }}
      >
        {/* open이 true일 때만 채팅창들이 보임 */}
        {open && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              mb: 1, // 버튼과의 간격
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
        )}

        <Fab
          color={open ? "default" : "primary"}
          aria-label="expand"
          onClick={() => setOpen(!open)}
          sx={{ boxShadow: 3 }}
        >
          {open ? <CloseIcon /> : <AddIcon />}
        </Fab>
      </Box>
    </>
  );
}

export default App;
