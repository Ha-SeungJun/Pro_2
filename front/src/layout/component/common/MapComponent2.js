import React, { useEffect, useRef } from 'react';

// 기현님이 만들어두신 좌표 변환 함수 불러오기
import { fetchCoordsByAddress } from './calculateDistanceBetweenAddresses'; 

// 기현님의 카카오 REST API 키 (길찾기 경로 받아올 때 필수!)
const REST_API_KEY = "d381d00137ba5677a3ee0355c4c95abf"; 

const MapComponent = ({ startAddress, endAddress }) => {
  const mapContainer = useRef(null);

  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) {
      console.error("카카오 맵 스크립트가 아직 로드되지 않았습니다!");
      return;
    }

    const loadMap = async () => {
      try {
        // 1. 출발지, 도착지 주소를 좌표로 변환
        const startCoords = await fetchCoordsByAddress(startAddress);
        const endCoords = await fetchCoordsByAddress(endAddress);

        // 2. 지도 기본 세팅 (일단 출발지 중심으로 띄움)
        const mapOption = {
          center: new window.kakao.maps.LatLng(startCoords.lat, startCoords.lng),
          level: 7 
        };
        const map = new window.kakao.maps.Map(mapContainer.current, mapOption);

        // 3. 출발지/도착지 마커(핀) 찍기
        const startPosition = new window.kakao.maps.LatLng(startCoords.lat, startCoords.lng);
        const endPosition = new window.kakao.maps.LatLng(endCoords.lat, endCoords.lng);

        new window.kakao.maps.Marker({ position: startPosition, map: map, title: "출발지" });
        new window.kakao.maps.Marker({ position: endPosition, map: map, title: "도착지" });

        // 💡 4. 대망의 실제 주행 경로(도로) 데이터 받아오기!
        const routeUrl = `https://apis-navi.kakaomobility.com/v1/directions?origin=${startCoords.lng},${startCoords.lat}&destination=${endCoords.lng},${endCoords.lat}`;
        const res = await fetch(routeUrl, {
          headers: { Authorization: `KakaoAK ${REST_API_KEY}` },
        });
        const data = await res.json();

        // 💡 5. 받아온 도로 데이터를 점(LatLng)으로 쪼개서 배열에 담기
        let linePath = [];
        if (data.routes && data.routes.length > 0) {
          const roads = data.routes[0].sections[0].roads;
          roads.forEach(road => {
            const vertexes = road.vertexes; // 도로를 구성하는 촘촘한 좌표들 [경도, 위도, 경도, 위도...]
            for (let i = 0; i < vertexes.length; i += 2) {
              linePath.push(new window.kakao.maps.LatLng(vertexes[i+1], vertexes[i]));
            }
          });
        } else {
          // 혹시나 길찾기 실패하면 꿩 대신 닭으로 직선 긋기
          linePath = [startPosition, endPosition];
        }

        // 6. 배열에 담긴 수백 개의 점을 빨간색 선으로 쫙 긋기
        const polyline = new window.kakao.maps.Polyline({
          path: linePath, 
          strokeWeight: 6,      // 선 두께 빵빵하게
          strokeColor: '#ef4444', // 빨간색
          strokeOpacity: 0.9, 
          strokeStyle: 'solid'
        });
        polyline.setMap(map);
        
        // 7. 이 구불구불한 선이 화면에 꽉 차게 카메라(줌) 조절!
        const bounds = new window.kakao.maps.LatLngBounds();
        // 경로상의 모든 점을 카메라 범위에 포함
        linePath.forEach(point => bounds.extend(point));
        map.setBounds(bounds);

      } catch (error) {
        console.error("지도 렌더링 에러:", error);
      }
    };

    if (startAddress && endAddress) {
      loadMap();
    }
  }, [startAddress, endAddress]);

  return (
    <div 
      ref={mapContainer} 
      style={{ width: '100%', height: '100%', minHeight: '500px', borderRadius: '1rem' }}
    />
  );
};

export default MapComponent;