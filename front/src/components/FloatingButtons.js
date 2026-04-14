import React from 'react';
import kakaoIcon from '../assets/kakao.png'; 
import { useNavigate } from "react-router-dom";

const FloatingButtons = () => {
  const kakaoLink = "http://localhost:8080/oauth2/authorization/kakao";
  
  // 👇 1. 네비게이트 함수 선언
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-32 right-10 z-[9999] flex flex-col gap-4 font-sans antialiased">
      {/* 카톡 버튼 */}
      <a href={kakaoLink} className="hover:scale-110 transition-transform duration-300">
        <div className="w-20 h-20 rounded-full bg-[#FEE500] p-4 flex items-center justify-center shadow-2xl border-4 border-white aspect-square overflow-hidden">
          <img 
              src={kakaoIcon} 
              alt="카톡접수" 
              className="w-full h-full object-contain"
          />
        </div>
      </a>
  
      <div 
        onClick={() => navigate('/guide')} 
        className="bg-red-600 text-white w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-2xl cursor-pointer hover:bg-red-700 transition-colors border-4 border-white aspect-square"
      >
        <span className="text-3xl mb-1">📋</span>
        <span className="text-xs font-bold font-sans">가이드</span>
      </div>
    </div>
  );
};

export default FloatingButtons;