import React from 'react';
// ✅ 기현님이 assets 폴더에 넣은 비디오 파일을 직접 불러옵니다! (이름 맞춤)
import mainVideo from '../assets/mainpage.mp4';

const HeroSection = () => {
  return (
    <section className="relative w-full h-screen overflow-hidden">
      
      <video className="absolute top-0 left-0 w-full h-full object-cover z-0" autoPlay loop muted playsInline>
        <source src={mainVideo} type="video/mp4" />
      </video>
      
      <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10"></div>

      <div className="relative z-20 flex flex-col w-full h-full">
        <div className="flex-grow flex flex-col justify-center items-center text-center text-white px-4 font-sans">
          
          <h1 className="text-4xl md:text-6xl font-black mb-8 leading-tight drop-shadow-2xl">
            <br />
            여러분과 함께 달리는<br />
            <span className="text-red-500">퍼스트로드</span>입니다.
          </h1>
          
          <p className="text-xl md:text-3xl mb-16 drop-shadow-lg font-medium max-w-4xl break-keep">
            가장 빠르고 안전한 물류의 시작,<br />
            퍼스트로드가 고객님의 비즈니스 성공을 싣고 달립니다.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center w-full max-w-sm sm:max-w-none">
            <button className="flex items-center justify-center bg-white text-gray-900 font-bold py-5 px-12 rounded-full text-2xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
              📞 1111-1111
            </button>
            <button className="bg-red-600 text-white font-bold py-5 px-12 rounded-full text-2xl hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(220,38,38,0.5)] transition-all duration-300">
              온라인 접수하기
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;