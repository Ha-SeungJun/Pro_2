import { useEffect } from 'react';
import './App.css';
import { RouterProvider } from 'react-router-dom';
import root from './router/root';
import AiChatBot from './layout/component/AiChatBot';
import CounselorChat from './layout/component/CounselorChat';
import { useDispatch } from 'react-redux'; // ✅ 추가
import { getUserInfoAsync } from './slice/loginSlice'; // ✅ 추가

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // ✅ 새로고침 시 토큰 있으면 Redux에 유저 정보 복원
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      dispatch(getUserInfoAsync());
    }
  }, []);

  return (
    <>
      <RouterProvider router={root} />
      <AiChatBot />
      <CounselorChat />
    </>
  );
}

export default App;