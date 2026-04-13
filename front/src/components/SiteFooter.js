import React from 'react';
import logo from '../assets/logo.png';

const SiteFooter = () => {
  return (
    <footer className="bg-gray-900 py-16 border-t border-gray-800 text-gray-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <img src={logo} alt="로고" className="w-40 md:w-48 h-auto object-contain mb-6 grayscale brightness-200" />
            <p className="text-gray-500 text-sm italic">COPYRIGHT © 퍼스트로드. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-4 mt-2 text-sm text-gray-400">
                <a href="#" className="hover:text-red-500 font-bold">개인정보처리방침</a>
                <span>|</span>
                <a href="#" className="hover:text-red-500">이메일무단수집거부</a>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-10 md:mt-0">
            <div>
              <h4 className="font-bold mb-4 text-red-600">COMPANY.</h4>
              <p className="text-sm italic mb-1">회사명: 퍼스트로드</p>
              <p className="text-sm italic mb-1">사업자번호: 111-22-33333</p>
              <p className="text-sm italic mb-1">대표자: 1조</p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-red-600">INFO.</h4>
              <p className="text-sm italic mb-1">강원도 춘천시 한림대학길 1</p>
              <p className="text-sm italic mb-1">상담시간: am 09:00 ~ pm 18:00</p>
              <p className="text-sm italic mb-1">온라인접수: 24시간 가능</p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-red-600">CONTACT.</h4>
              <p className="text-sm italic font-bold text-red-500 mb-1">전화번호: 1111-1111</p>
              <p className="text-sm italic font-bold mb-1">팩스: 02-2222-3333</p>
              <p className="text-sm italic font-bold mb-1">이메일: firstroad@naver.com</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;