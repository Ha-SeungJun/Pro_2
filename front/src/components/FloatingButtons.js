import React from 'react';
// kakaoIcon 사용 안 하시면 빼셔도 됩니다.

const FloatingButtons = () => {
  return (
    <div className="flex flex-col items-center">
      {/* 가이드 버튼 */}
      <div 
        onClick={() => window.location.href = '/guide'} 
        className="bg-red-600 text-white w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-lg cursor-pointer hover:bg-red-700 transition-colors border-2 border-white"
      >
        <span className="text-2xl mb-0.5">📋</span>
        <span className="text-[10px] font-bold">가이드</span>
      </div>
    </div>
  );
};

export default FloatingButtons;