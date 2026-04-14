import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, TextField, FormControl, Select, MenuItem, Checkbox, FormControlLabel, Grid } from '@mui/material';
import axios from 'axios';
import MapComponent from '../layout/component/common/MapComponent2';

import bikeImg from '../assets/quote/scooter.png';
import damasImg from '../assets/quote/damassicon.png';

//  트럭 이미지 
import ton1Img from '../assets/quote/1tontruck.png'; 
import ton5Img from '../assets/quote/5tontruck.png'; 
import ton10Img from '../assets/quote/10tontruck.png'; 
import ton25Img from '../assets/quote/25tontrucck.png'; 

// 가전, 가구, 기타 아이콘 
import tvImg from '../assets/quote/tv.png';
import iceImg from '../assets/quote/ice.png';
import washImg from '../assets/quote/wash.png';
import stylerImg from '../assets/quote/styler.png';
import airImg from '../assets/quote/air.png';
import washcloseImg from '../assets/quote/washclose.png';
import sofaImg from '../assets/quote/sofa.png';
import bedImg from '../assets/quote/bed.png';      
import chairImg from '../assets/quote/chair.png';
import closeImg from '../assets/quote/close.png'; 
import boxImg from '../assets/quote/box.png';       
import bongtuImg from '../assets/quote/bongtu.png'; 
import paletImg from '../assets/quote/palet.png';   
import gitarImg from '../assets/quote/gitar.png';
import { calculateDistanceBetweenAddresses } from '../layout/component/common/calculateDistanceBetweenAddresses';

const itemCategories = {
  가전: [
    { id: 'tv', name: 'TV', img: tvImg },
    { id: 'fridge', name: '냉장고', img: iceImg },
    { id: 'washer', name: '세탁기', img:  washcloseImg},
    { id: 'styler', name: '스타일러', img: stylerImg },
    { id: 'aircon', name: '에어컨', img: airImg },
    { id: 'dishwasher', name: '식기세척기', img: washImg },
    { id: 'small_app', name: '작은가전제품', img: gitarImg },
  ],
  가구: [
    { id: 'sofa', name: '소파', img: sofaImg },
    { id: 'bed', name: '침대', img: bedImg },
    { id: 'chair', name: '의자', img: chairImg },
    { id: 'closet', name: '옷장/수납장', img: closeImg },
    { id: 'small_furn', name: '작은가구제품', img: gitarImg },
  ],
  기타: [
    { id: 'box', name: '박스', img: boxImg },
    { id: 'bongtu', name: '봉투', img: bongtuImg },
    { id: 'palet_hand', name: '빠레트(수작업)', img: paletImg },
    { id: 'palet_fork', name: '빠레트(지게차작업)', img: paletImg },
    { id: 'etc', name: '기타', img: gitarImg },
  ]
};

const truckSpecs = {
  '1ton': { name: '1톤 화물', img: ton1Img, weight: '1t', length: '2800mm', width: '1600mm' },
  '1.4ton': { name: '1.4톤 화물', img: ton1Img, weight: '1.4t', length: '3100mm', width: '1600mm' },
  '2.5ton': { name: '2.5톤 화물', img: ton1Img, weight: '2.5t', length: '4300mm', width: '1900mm' },
  '3.5ton': { name: '3.5톤 화물', img: ton10Img, weight: '3.5t', length: '4600mm', width: '2000mm' },
  '5ton': { name: '5톤 화물', img: ton10Img, weight: '5t', length: '6200mm', width: '2300mm' },
  '11ton': { name: '11톤 화물', img: ton5Img, weight: '11t', length: '9000mm', width: '2400mm' },
  '15ton': { name: '15톤 화물', img: ton5Img, weight: '15t', length: '9000mm', width: '2400mm' },
  '18ton': { name: '18톤 화물', img: ton25Img, weight: '18t', length: '10000mm', width: '2400mm' },
  '25ton': { name: '25톤 화물', img: ton25Img, weight: '25t', length: '10000mm', width: '2400mm' },
};

const freightTypes = [
  '차종무관', '카고', '윙바디', '탑', '리프트카고', 
  '리프트윙바디', '리프트자바라', '냉동탑', '냉장탑'
];

const steps = ['주소입력', '배송방법 선택', '배송품목/옵션', '접수'];

// Daum Postcode 스크립트 로드
const loadPostcodeScript = (callback) => {
  const script = document.createElement('script');
  script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
  script.async = true;
  script.onload = () => callback();
  document.head.appendChild(script);
};

const QuotationRequestPage = () => {
  const navigate = useNavigate();
  const { token } = useSelector(state => state.login);
  const [currentStep, setCurrentStep] = useState(1);
  const [serviceType, setServiceType] = useState('quick'); 
  const [exPrice, setExprice] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState('가전');

  const [formData, setFormData] = useState({
    clientName: '', clientPhone: '',
    startSameAsClient: false, startName: '', startPhone: '', startAddress: '', startDetail: '', 
    endSameAsClient: false, endName: '', endPhone: '', endAddress: '', endDetail: '', 
    // freightType 초기값을 선언하여 에러를 방지합니다.
    freightVehicle: '1ton', freightType: '차종무관', quickVehicle: '오토바이', 
    quickTripType: 'one-way', quickOption: '일반',
    deliveryItem: '', memo: '', paymentMethod: '신용카드', taxInvoice: '발행하겠습니다.',
  });

  const [postcodeLoaded, setPostcodeLoaded] = useState(false);

  useEffect(() => {
    loadPostcodeScript(() => { setPostcodeLoaded(true); });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSameAsClientToggle = (type) => (e) => {
    const isChecked = e.target.checked;
    setFormData(prev => ({
      ...prev,
      [`${type}SameAsClient`]: isChecked,
      [`${type}Name`]: isChecked ? prev.clientName : '',
      [`${type}Phone`]: isChecked ? prev.clientPhone : ''
    }));
  };

  const handleAddressSearch = (setterName) => {
    if (!postcodeLoaded) return;
    new window.daum.Postcode({
      oncomplete: function (data) { setFormData(prev => ({ ...prev, [setterName]: data.address })); },
    }).open();
  }

  const handleNextStep = async () => {
    if (currentStep === 3) {
      if (!formData.startAddress || !formData.endAddress) {
        alert("출발지와 도착지 주소를 모두 입력해주세요!");
        return;
      }

      setIsCalculating(true); 
      try {
        const distanceKm = await calculateDistanceBetweenAddresses(formData.startAddress, formData.endAddress);
        
        let calcPrice = 0;
        const dist = Math.floor(distanceKm); 

        if (serviceType === 'quick') {
          // 1. 퀵서비스 요금
          if (formData.quickVehicle === '오토바이') {
            calcPrice = 10000 + (dist * 1000); // 오토바이: 기본 1만 + km당 1천원
          } else {
            calcPrice = 20000 + (dist * 1200); // 다마스: 기본 2만 + km당 1.2천원
          }
        } else {
          // 2. 화물운송 요금
          let baseFreight = 40000; // 1톤, 1.4톤, 2.5톤, 3.5톤 기준 4만원
          
          if (formData.freightVehicle.includes('5ton')) {
            baseFreight = 80000;
          } else if (formData.freightVehicle.includes('10ton') || formData.freightVehicle.includes('11ton') || formData.freightVehicle.includes('15ton')) {
            baseFreight = 150000;
          } else if (formData.freightVehicle.includes('18ton') || formData.freightVehicle.includes('25ton')) {
            baseFreight = 250000;
          }

          calcPrice = baseFreight + (dist * 1500); 
        }
        
        setExprice(calcPrice); 
        setCurrentStep(prev => prev + 1); 
      } catch (error) {
        alert("거리 계산 중 문제가 발생했습니다. 주소를 다시 확인해주세요.");
      } finally {
        setIsCalculating(false); // 계산 중 깃발 내리기
      }
      return;
    }

    // 마지막 4단계: [접수완료] 버튼 눌렀을 때 진짜 DB로 전송!
    if (currentStep === steps.length) {
      try {
        // Redux 및 브라우저 저장소에서 토큰을 모두 탐색하여 가져옵니다.
        const activeToken = token || localStorage.getItem('accessToken') || localStorage.getItem('token');

        // 토큰이 존재하지 않을 경우에만 차단합니다.
        if (!activeToken) {
          alert("로그인 후 이용 가능한 서비스입니다!");
          navigate('/login');
          return;
        }

        // 백엔드 엔티티에 맞춰 전송할 데이터를 객체로 생성합니다.
        const submitData = {
          clientName: formData.clientName,
          clientPhone: formData.clientPhone,
          startName: formData.startName,
          startPhone: formData.startPhone,
          startAddress: formData.startAddress,
          startDetail: formData.startDetail,
          endName: formData.endName,
          endPhone: formData.endPhone,
          endAddress: formData.endAddress,
          endDetail: formData.endDetail,
          
          serviceType: serviceType,
          vehicleType: serviceType === 'quick' 
                       ? formData.quickVehicle 
                       : `${truckSpecs[formData.freightVehicle].name} (${formData.freightType})`,
                       
          deliveryItem: formData.deliveryItem,
          deliveryOption: formData.quickOption,
          paymentMethod: formData.paymentMethod,
          memo: formData.memo,
          totalPrice: exPrice
        };

        console.log("DB로 쏠 최종 데이터 포장 완료:", submitData);

        // Authorization 헤더에 찾은 토큰을 담아 전송합니다.
        const response = await axios.post(
          'http://localhost:8080/g2i4/estimate/', 
          submitData,
          {
            headers: {
              Authorization: `Bearer ${activeToken}`
            }
          }
        );

        if (response.status === 200 || response.status === 201) {
          alert("견적 접수가 완료되었습니다! 기사님이 곧 배정됩니다.");
          navigate('/');
        }
      } catch (error) {
        console.error("DB 전송 실패:", error);
        alert("접수 중 오류가 발생했습니다. 스프링부트(8080)가 켜져 있는지 확인해 주세요!");
      }
      return;
    }
    
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  return (
    <Box className="pb-24 bg-[#f8f9fb] font-sans antialiased text-gray-900 min-h-screen">
      
      {/* 상단 Step 인디케이터 */}
      <div className="bg-white px-8 py-4 border-b border-gray-200 flex items-center gap-4 mb-8">
        <span className="font-bold text-lg text-black">Step</span>
        {steps.map((label, index) => (
          <div key={label} className="flex items-center gap-2">
            <span className={`font-bold ${currentStep === index + 1 ? 'text-red-600' : 'text-gray-400'}`}>
              {index + 1}. {label}
            </span>
            {index < steps.length - 1 && <span className="text-gray-300 mx-2">〉</span>}
          </div>
        ))}
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          
          <div className="p-8 md:p-12">
            
            {/* ==========================================
                STEP 1: 주소입력
            ========================================== */}
            {currentStep === 1 && (
              <div className="flex flex-col gap-10 max-w-3xl mx-auto">
                {/* 의뢰인 정보 */}
                <div>
                  <h3 className="text-xl font-bold mb-4">의뢰인 정보</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <TextField label="이름" name="clientName" value={formData.clientName} onChange={handleInputChange} fullWidth />
                    <TextField label="연락처" name="clientPhone" value={formData.clientPhone} onChange={handleInputChange} fullWidth placeholder="010-0000-0000" />
                  </div>
                </div>

                {/* 출발지 주소 */}
                <div>
                  <h3 className="text-xl font-bold mb-4">출발지 주소</h3>
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col gap-4">
                    <FormControlLabel 
                      control={<Checkbox checked={formData.startSameAsClient} onChange={handleSameAsClientToggle('start')} sx={{ color: '#ef4444', '&.Mui-checked': { color: '#ef4444' } }} />} 
                      label={<span className="text-sm font-medium text-gray-700">의뢰인과 동일</span>} 
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <TextField label="이름" name="startName" value={formData.startName} onChange={handleInputChange} fullWidth size="small" sx={{ bgcolor: 'white' }}/>
                      <TextField label="연락처" name="startPhone" value={formData.startPhone} onChange={handleInputChange} fullWidth size="small" sx={{ bgcolor: 'white' }}/>
                    </div>
                    <div className="flex gap-2">
                      <TextField label="출발지 주소" name="startAddress" value={formData.startAddress} InputProps={{ readOnly: true }} fullWidth size="small" sx={{ bgcolor: 'white' }}/>
                      <Button variant="contained" onClick={() => handleAddressSearch('startAddress')} sx={{ bgcolor: '#ef4444', '&:hover': {bgcolor: '#dc2626'}, minWidth: '100px', fontWeight: 'bold' }}>주소검색</Button>
                    </div>
                    <TextField label="상세주소" name="startDetail" value={formData.startDetail} onChange={handleInputChange} fullWidth size="small" sx={{ bgcolor: 'white' }}/>
                  </div>
                </div>

                {/* 도착지 주소 */}
                <div>
                  <h3 className="text-xl font-bold mb-4">도착지 주소</h3>
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col gap-4">
                    <FormControlLabel 
                      control={<Checkbox checked={formData.endSameAsClient} onChange={handleSameAsClientToggle('end')} sx={{ color: '#ef4444', '&.Mui-checked': { color: '#ef4444' } }} />} 
                      label={<span className="text-sm font-medium text-gray-700">의뢰인과 동일</span>} 
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <TextField label="이름" name="endName" value={formData.endName} onChange={handleInputChange} fullWidth size="small" sx={{ bgcolor: 'white' }}/>
                      <TextField label="연락처" name="endPhone" value={formData.endPhone} onChange={handleInputChange} fullWidth size="small" sx={{ bgcolor: 'white' }}/>
                    </div>
                    <div className="flex gap-2">
                      <TextField label="도착지 주소" name="endAddress" value={formData.endAddress} InputProps={{ readOnly: true }} fullWidth size="small" sx={{ bgcolor: 'white' }}/>
                      <Button variant="contained" onClick={() => handleAddressSearch('endAddress')} sx={{ bgcolor: '#ef4444', '&:hover': {bgcolor: '#dc2626'}, minWidth: '100px', fontWeight: 'bold' }}>주소검색</Button>
                    </div>
                    <TextField label="상세주소" name="endDetail" value={formData.endDetail} onChange={handleInputChange} fullWidth size="small" sx={{ bgcolor: 'white' }}/>
                  </div>
                </div>
              </div>
            )}

            {/* ==========================================
                STEP 2 & 3 통합: 배송방법 & 품목/옵션
            ========================================== */}
            {(currentStep === 2 || currentStep === 3) && (
              <div className="flex flex-col gap-8">
                
                {/* 상단 퀵/화물 선택 (Step 2에서만 보임) */}
                {currentStep === 2 && (
                  <div className="flex gap-4 border-b border-gray-200 pb-8">
                     <button onClick={() => setServiceType('quick')} className={`py-3 px-8 rounded-full font-bold text-lg border-2 transition-all ${serviceType === 'quick' ? 'border-red-600 bg-red-600 text-white' : 'border-gray-200 text-gray-500 bg-white'}`}>퀵서비스</button>
                     <button onClick={() => setServiceType('freight')} className={`py-3 px-8 rounded-full font-bold text-lg border-2 transition-all ${serviceType === 'freight' ? 'border-red-600 bg-red-600 text-white' : 'border-gray-200 text-gray-500 bg-white'}`}>화물운송</button>
                  </div>
                )}

                {/* ✅ 퀵 서비스 선택 시 (오토바이 vs 다마스 고르기) */}
                {currentStep === 2 && serviceType === 'quick' && (
                  <div className="flex flex-col gap-4 mb-8">
                    <h4 className="font-bold text-red-600 text-xl">01 차량선택</h4>
                    <div className="flex gap-4 max-w-lg">
                      <button onClick={() => setFormData({...formData, quickVehicle: '오토바이'})} className={`flex-1 py-6 border-2 rounded-2xl flex flex-col items-center gap-4 transition-all ${formData.quickVehicle === '오토바이' ? 'border-red-600 bg-red-50' : 'border-gray-200 bg-white hover:border-red-300'}`}>
                        <img src={bikeImg} alt="오토바이" className="w-24 h-24 object-contain" />
                        <span className={`font-bold text-lg ${formData.quickVehicle === '오토바이' ? 'text-red-600' : 'text-gray-700'}`}>오토바이 퀵</span>
                      </button>
                      <button onClick={() => setFormData({...formData, quickVehicle: '다마스'})} className={`flex-1 py-6 border-2 rounded-2xl flex flex-col items-center gap-4 transition-all ${formData.quickVehicle === '다마스' ? 'border-red-600 bg-red-50' : 'border-gray-200 bg-white hover:border-red-300'}`}>
                        <img src={damasImg} alt="다마스" className="w-24 h-24 object-contain" />
                        <span className={`font-bold text-lg ${formData.quickVehicle === '다마스' ? 'text-red-600' : 'text-gray-700'}`}>다마스 용달</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* ✅ 화물 운송 선택 시 (톤수 엄청 많아짐 + 이미지 매칭) */}
                {currentStep === 2 && serviceType === 'freight' && (
                  <div className="flex gap-8 items-start mb-8">
                    <div className="w-1/3 flex flex-col gap-4">
                      <h4 className="font-bold text-red-600 text-xl">01 차량선택</h4>
                      <FormControl fullWidth>
                        <Select value={formData.freightVehicle} name="freightVehicle" onChange={handleInputChange} sx={{ borderRadius: '0.5rem', bgcolor: 'white' }}>
                          {Object.keys(truckSpecs).map(key => (
                            <MenuItem key={key} value={key}>{truckSpecs[key].name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth>
                        <Select value={formData.freightType} name="freightType" onChange={handleInputChange} sx={{ borderRadius: '0.5rem', bgcolor: 'white' }}>
                          {freightTypes.map(type => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>
                    <div className="w-2/3 border-2 border-[#1cc8c6] rounded-2xl p-6 bg-[#f0fbfb] flex items-center justify-between">
                       <img src={truckSpecs[formData.freightVehicle].img} alt="트럭" className="w-48 h-auto object-contain drop-shadow-md" />
                       <div className="flex flex-col gap-2 text-right">
                         <p className="text-gray-600"><span className="font-medium mr-4">적재중량</span><span className="font-bold text-xl text-black">{truckSpecs[formData.freightVehicle].weight}</span></p>
                         <p className="text-gray-600"><span className="font-medium mr-4">적재함 길이(L)</span><span className="font-bold text-xl text-black">{truckSpecs[formData.freightVehicle].length}</span></p>
                         <p className="text-gray-600"><span className="font-medium mr-4">적재함 폭(W)</span><span className="font-bold text-xl text-black">{truckSpecs[formData.freightVehicle].width}</span></p>
                       </div>
                    </div>
                  </div>
                )}

                {/* 품목 및 옵션 선택 */}
                {currentStep === 3 && (
                  <div>
                    <h3 className="text-2xl font-bold mb-6">배송 품목 / 옵션</h3>
                    <div className="flex flex-col lg:flex-row gap-8">
                      {/* 왼쪽: 가전/가구/기타 그리드 */}
                      <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden">
                        <div className="flex border-b border-gray-200">
                          {Object.keys(itemCategories).map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 text-center font-bold text-lg ${activeTab === tab ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                              {tab}
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-3 bg-white">
                          {itemCategories[activeTab].map(item => (
                            <button key={item.id} onClick={() => setFormData(prev => ({ ...prev, deliveryItem: item.name }))} className={`py-8 flex flex-col items-center gap-4 border-b border-r border-gray-100 transition-all ${formData.deliveryItem === item.name ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                              <img src={item.img} alt={item.name} className="w-16 h-16 object-contain" />
                              <span className={`text-sm font-bold ${formData.deliveryItem === item.name ? 'text-blue-600' : 'text-gray-700'}`}>{item.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 오른쪽: 배송옵션 / 결제 / 메모 / 주의사항 */}
                      <div className="flex-1 flex flex-col gap-6 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex flex-col gap-3">
                          <h4 className="font-bold text-gray-800">배송옵션 *</h4>
                          <div className="flex gap-2">
                            {['일반', '급송', '예약'].map(opt => (
                              <button key={opt} onClick={() => setFormData(p => ({...p, quickOption: opt}))} className={`flex-1 py-3 rounded-lg border font-bold ${formData.quickOption === opt ? 'border-red-600 text-red-600' : 'border-gray-200 text-gray-600'}`}>{opt}</button>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-3">
                          <h4 className="font-bold text-gray-800">결제방식 *</h4>
                          <div className="flex gap-2">
                            {['현금선불', '현금착불', '신용카드'].map(method => (
                              <button key={method} onClick={() => setFormData(p => ({...p, paymentMethod: method}))} className={`flex-1 py-3 rounded-lg border font-bold ${formData.paymentMethod === method ? 'border-red-600 text-red-600' : 'border-gray-200 text-gray-600'}`}>{method}</button>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-3">
                          <h4 className="font-bold text-gray-800">화물정보 * <span className="text-xs text-gray-400 font-normal">(물품 상세/기사님 요청사항을 입력해주세요)</span></h4>
                          <TextField multiline rows={3} name="memo" value={formData.memo} onChange={handleInputChange} fullWidth sx={{ bgcolor: 'white' }} />
                        </div>
                        <div className="mt-4 bg-[#f4f7fa] p-5 rounded-lg border border-blue-100">
                          <h4 className="font-bold text-red-600 mb-2 flex items-center gap-2"><span>!</span>알려드립니다.</h4>
                          <p className="text-sm text-gray-600 break-keep leading-relaxed">
                            주문 접수가 되면 바로 배차가 진행되므로<br/>
                            취소를 원하실 경우 <span className="text-black font-bold">1111-1111</span> 으로 취소 주셔야 하며, 기사님이 배정된 이후 또는 픽업지로 가셨을 경우, 취소비가 발생합니다.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ==========================================
                STEP 4: 접수 (지도 & 요약)
            ========================================== */}
            {currentStep === 4 && (
              <div className="flex flex-col md:flex-row gap-8 h-[600px]">
                
                {/* ✅ 가짜 지도 플레이스홀더 지우고 진짜 카카오 지도(MapComponent) 투입! */}
                <div className="flex-1 rounded-2xl border border-gray-200 relative overflow-hidden bg-white">
                   <MapComponent startAddress={formData.startAddress} endAddress={formData.endAddress} />
                </div>

                <div className="w-full md:w-[400px] flex flex-col gap-4">
                   <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm flex gap-4 items-start">
                     <span className="w-3 h-3 rounded-full border-2 border-gray-400 mt-1"></span>
                     <div>
                       <p className="font-bold text-gray-500 mb-2">출발</p>
                       <p className="font-bold text-lg text-black mb-1">{formData.startAddress || '출발지를 입력해주세요'}</p>
                       <p className="text-sm text-gray-500">{formData.startDetail}</p>
                     </div>
                   </div>
                   <div className="p-6 border border-red-200 rounded-xl bg-red-50 shadow-sm flex gap-4 items-start">
                     <span className="w-3 h-3 rounded-full bg-red-500 mt-1"></span>
                     <div>
                       <p className="font-bold text-red-500 mb-2">도착</p>
                       <p className="font-bold text-lg text-black mb-1">{formData.endAddress || '도착지를 입력해주세요'}</p>
                       <p className="text-sm text-gray-500">{formData.endDetail}</p>
                     </div>
                   </div>
                </div>
              </div>
            )}
          </div>
          
          {/* 하단 고정 스티키 바 (견적요약 & 버튼) */}
          <div className="bg-[#f3f4f6] px-8 py-6 border-t border-gray-200 flex justify-between items-center">
            <div className="flex gap-12">
               {/* 👇 이 부분 텍스트를 수정해 주세요! 👇 */}
               <p className="text-gray-600 font-medium">차량: <span className="font-bold text-black ml-2">
                 {currentStep === 1 
                   ? '선택 전' 
                   : (serviceType === 'quick' 
                       ? formData.quickVehicle 
                       : `${truckSpecs[formData.freightVehicle].name} (${formData.freightType})`)}
               </span></p>
               {/* 👆 수정 완료 👆 */}
               <p className="text-gray-600 font-medium">예상가격: <span className="font-black text-2xl text-black ml-2">
                 {currentStep === 1 ? '-' : `${Number(exPrice).toLocaleString()}원`}
               </span></p>
            </div>
            <div className="flex gap-4">
              <Button variant="contained" size="large" onClick={handlePrevStep} disabled={currentStep === 1} sx={{ bgcolor: '#d1d5db', color: 'black', '&:hover': {bgcolor: '#9ca3af'}, width: '120px', fontWeight: 'bold', boxShadow: 'none' }}>이전</Button>
              <Button variant="contained" size="large" onClick={handleNextStep} sx={{ bgcolor: '#ef4444', '&:hover': {bgcolor: '#dc2626'}, width: '150px', fontWeight: 'bold', boxShadow: 'none' }}>
                {currentStep === steps.length ? '접수완료' : '다음'}
              </Button>
            </div>
          </div>

        </div>
      </div>
    </Box>
  );
};

export default QuotationRequestPage;