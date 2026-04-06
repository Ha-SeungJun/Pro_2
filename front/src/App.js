import { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import ResponsiveAppBar from './common/ResponsiveAppBar';
import { RouterProvider } from 'react-router-dom';
import root from './router/root';
import AiChatBot from './layout/component/AiChatBot';
import CounselorChat from './layout/component/CounselorChat';

function App() {
  // useEffect(() => {
  //   fetch("http://localhost:8080/api/test", {
  //     method: "GET",
  //     credentials: "include"  // 쿠키나 인증정보 보내는 경우 필요
  //   })
  //     .then(response => response.text())
  //     .then(data => {
  //       console.log("백엔드 응답:", data);
  //     })
  //     .catch(error => {
  //       console.error("CORS 테스트 중 오류:", error);
  //     });
 // }, []); // 빈 배열이면 한 번만 실행됨 (컴포넌트 mount 시점)
   {/* <div className="App">
         
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            CORS 테스트 중입니다! 브라우저 콘솔을 확인하세요.
          </p>
        </header>
      </div> */}

  return (

    <>
     <RouterProvider router={root}></RouterProvider>
     <AiChatBot />
     <CounselorChat/>
     </>
  
   
  );
}

export default App;