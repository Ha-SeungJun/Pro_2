import React, { useState } from 'react';

const QASection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "급한데 기사님이 배차가 안돼요.",
      a: "의뢰자 연락처로 발송되는 알림톡에 '배차현황'을 확인하셔서 배차가 되었는지 확인 하실 수 있고, 만약 배차가 잘 안되는 경우에는 가격 변경을 하셔서 배차 확률을 높일 수 있습니다.\n\n만약, 의뢰자 번호를 휴대폰으로 남기지 않으셨을 경우 배차 알림톡이 발송되지 않기 때문에 콜센터로 연락 후 확인 가능합니다."
    },
    {
      q: "물품이 파손되었어요, 어떻게 하나요?",
      a: "물품 파손 시 즉시 고객센터(1111-1111)로 접수해 주시면, 사고 조사 후 보상 절차를 안내해 드립니다. 사진 등 증빙 자료를 확보해 두시면 처리가 빠릅니다."
    },
    {
      q: "퀵서비스 이용시 물품의 크기나 무게에 제한이 있나요?",
      a: "오토바이 퀵의 경우 보통 20kg 이하, 라면 박스 1개 크기 정도가 권장됩니다. 다마스, 라보, 1톤 트럭 등 차량 종류에 따라 적재 가능 크기와 무게가 다르니 접수 시 상세히 확인해 주세요."
    },
    {
      q: "배차 취소는 어떻게 하나요?",
      a: "기사님이 배차되기 전이라면 홈페이지 '마이페이지 > 이용내역'에서 직접 취소가 가능합니다. 이미 기사님이 출발하신 후라면 고객센터를 통해서만 취소가 가능하며, 취소 수수료가 발생할 수 있습니다."
    },
    {
      q: "신용거래처 등록을 어떻게 하나요?",
      a: "월 이용 건수가 일정 기준 이상인 기업 고객님을 대상으로 신용거래처 등록이 가능합니다. 홈페이지 하단의 고객센터나 이메일로 사업자등록증 사본과 함께 문의를 남겨주시면 담당자가 연락드립니다."
    },
    {
      q: "급송과 일반 배송의 차이가 무엇인가요?",
      a: "일반 배송은 기사님의 동선에 맞춰 여러 물품을 함께 배송하는 방식이며, 급송은 고객님의 물품만을 단독으로 목적지까지 최단 시간 내에 배송하는 프리미엄 서비스입니다."
    }
  ];

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white py-24 font-sans text-black">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="mb-16">
          <p className="text-gray-600 text-lg mb-2">화물운송서비스에 대하여 궁금하신 점 많으시죠?</p>
          <h2 className="text-4xl font-extrabold text-black">
            <span className="text-red-600">퍼스트</span>로드 Q&A
          </h2>
        </div>
        
        <div className="space-y-4 max-w-5xl mx-auto text-left">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div 
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleToggle(index)}
              >
                <div className="flex items-center space-x-4">
                  <span className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold flex-shrink-0">Q</span>
                  <p className="text-xl font-bold text-black">{faq.q}</p>
                </div>
                <span className={`text-gray-500 transform transition-transform duration-300 ${openIndex === index ? 'rotate-90' : ''}`}>
                  〉
                </span>
              </div>
              
              <div 
                className={`transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                } overflow-hidden`}
              >
                <div className="p-6 bg-gray-50 border-t border-gray-200 text-gray-800 leading-relaxed whitespace-pre-wrap flex items-start space-x-4">
                  <span className="text-red-500 font-bold text-xl">A.</span>
                  <p>{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QASection;