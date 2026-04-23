import { useEffect } from 'react';
import './App.css';
import { RouterProvider } from 'react-router-dom';
import root from './router/root';
import AiChatBot from './layout/component/AiChatBot';
import CounselorChat from './layout/component/CounselorChat';
import FloatingButtons from './components/FloatingButtons';
import { useDispatch } from 'react-redux';
import { getUserInfoAsync } from './slice/loginSlice';

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

      {/* ✅ 하단 버튼 통합 컨테이너 (정렬 타워) */}
      <div
        className="no-print"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px', // 버튼 사이 간격
          zIndex: 9999
        }}
      >
        {/* 가이드 버튼 그룹 */}
        <FloatingButtons />

        {/* 상담사 연결 버튼 */}
        <div style={{ position: 'relative' }}>
          <CounselorChat />
        </div>

        {/* AI 챗봇 버튼 */}
        <div style={{ position: 'relative' }}>
          <AiChatBot />
        </div>
      </div>
    </>
  );
}

export default App;