import React from 'react';
import { Link } from 'react-router-dom'; // ✅ react-router-dom에서 Link 임포트
import logo from '../assets/logo.png';

const Header = () => {
  return (
    <header className="relative z-50 bg-white shadow-md border-b border-gray-100 text-gray-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex justify-between items-center h-28">
          <div className="flex-shrink-0 flex items-center">
            {/* 로고 클릭 시 메인('/')으로 이동하도록 Link 적용 */}
            <Link to="/">
              <img className="w-56 md:w-72 h-auto object-contain" src={logo} alt="퍼스트로드 로고" />
            </Link>
          </div>
          <nav className="hidden md:flex space-x-12">
            {/* 온라인 퀵 접수 버튼은 필요에 따라 라우팅 또는 특정 섹션 스크롤로 구현 */}
            <a href="#" className="text-2xl font-bold hover:text-red-600 transition-colors">
                온라인 퀵 접수
            </a>
            {/* ✅ 마이페이지 클릭 시 '/mypage' 라우트로 이동하도록 Link 적용 */}
            <Link to="/mypage" className="text-2xl font-bold hover:text-red-600 transition-colors">
              마이페이지
            </Link>
          </nav>
          <div className="flex items-center space-x-4 text-lg">
            <a href="#" className="hover:text-red-600 font-bold">로그인</a>
            <span className="text-gray-300">|</span>
            <a href="#" className="text-red-500 font-bold hover:text-red-700">
              최대 <span className='text-xl'>10%</span> 적립
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;