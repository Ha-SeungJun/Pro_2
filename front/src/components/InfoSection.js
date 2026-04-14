import React from 'react';
import pageImg from '../assets/pageimg.png';

const InfoSection = () => {
  return (
    // 사용자 요청으로 bg-gray-950에서 bg-white로 배경 변경
    // 그에 맞춰 text-white에서 text-gray-900(본문), text-gray-700(설명)으로 색상 변경
    <section className="py-24 bg-white font-sans antialiased text-gray-900">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1">
          {/* 브랜드명('퍼스트로드') 포인트 컬러 유지 */}
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-8 leading-tight break-keep">
            이메일 전송 or<br />
            <span className="text-red-500 font-black">PDF 문서 발급</span> 가능
          </h2>
          <ul className="space-y-6">
            <li className="flex items-center text-2xl md:text-3xl font-medium text-gray-700">
              <span className="mr-4 text-4xl">🖨️</span> 이용내역에서 영수증 바로 출력
            </li>
            <li className="flex items-center text-2xl md:text-3xl font-medium text-gray-700">
              <span className="mr-4 text-4xl">📂</span> 세금계산서 발행 가능
            </li>
          </ul>
        </div>
        
        <div className="flex-1 w-full mt-10 md:mt-0 flex justify-center">
            {/* 이미지 짤림 해결한 그 이미지 부품 사용 */}
            <img 
              src={pageImg} 
              alt="문서 발급 안내" 
              className="max-w-full h-auto object-contain rounded-2xl drop-shadow-2xl hover:scale-105 transition-transform duration-500" 
            />
        </div>
      </div>
    </section>
  );
};

export default InfoSection;