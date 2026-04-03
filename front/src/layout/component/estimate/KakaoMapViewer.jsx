import React, { useEffect, useRef } from "react";

const KakaoMapViewer = ({ startAddress, endAddress }) => {
  const mapRef = useRef(null);
  const polylineRef = useRef(null);
  const markersRef = useRef([]);
  const REST_API_KEY = "d381d00137ba5677a3ee0355c4c95abf";

  // 1) 맵은 한 번만 생성
  useEffect(() => {
    const container = document.getElementById("kakao-map");
    if (!container) return;
    if (!mapRef.current) {
      mapRef.current = new window.kakao.maps.Map(container, {
        // 초기 위치는 아무 데나(서울시청 예시)
        center: new window.kakao.maps.LatLng(37.5665, 126.9780),
        level: 7,
      });
    }
    return () => {
      // 컴포넌트 제거 시 오버레이 정리
      markersRef.current.forEach((m) => m.setMap(null));
      polylineRef.current?.setMap(null);
    };
  }, []);

  // 2) 주소 바뀌면 오버레이만 갱신
  useEffect(() => {
    if (!startAddress || !endAddress || !mapRef.current) return;

    // 기존 오버레이 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    polylineRef.current?.setMap(null);
    polylineRef.current = null;

    const fetchCoords = async (address) => {
      const res = await fetch(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
        { headers: { Authorization: `KakaoAK ${REST_API_KEY}` } }
      );
      const data = await res.json();
      const loc = data.documents?.[0];
      if (!loc) throw new Error(`주소 좌표를 찾을 수 없음: ${address}`);
      return { lat: parseFloat(loc.y), lng: parseFloat(loc.x) };
    };

    const draw = async () => {
      const start = await fetchCoords(startAddress);
      const end = await fetchCoords(endAddress);
      const map = mapRef.current;

      // 출발/도착 마커
      const ms = new window.kakao.maps.Marker({
        map,
        position: new window.kakao.maps.LatLng(start.lat, start.lng),
        title: "출발지",
      });
      const me = new window.kakao.maps.Marker({
        map,
        position: new window.kakao.maps.LatLng(end.lat, end.lng),
        title: "도착지",
      });
      markersRef.current = [ms, me];

      // 경로 요청
      const res = await fetch(
        `https://apis-navi.kakaomobility.com/v1/directions?origin=${start.lng},${start.lat}&destination=${end.lng},${end.lat}`,
        { headers: { Authorization: `KakaoAK ${REST_API_KEY}` } }
      );
      const data = await res.json();
      const roads = data?.routes?.[0]?.sections?.[0]?.roads;
      if (!roads || roads.length === 0) {
        alert("경로 정보를 불러올 수 없습니다. 주소를 다시 확인해주세요.");
        return;
      }

      // [lng,lat] 쌍 -> [lat,lng] 변환
      const path = roads.flatMap((road) =>
        road.vertexes.reduce((acc, _, idx) => {
          if (idx % 2 === 0) acc.push([road.vertexes[idx + 1], road.vertexes[idx]]);
          return acc;
        }, [])
      );
      const linePath = path.map(
        ([lat, lng]) => new window.kakao.maps.LatLng(lat, lng)
      );

      // 폴리라인
      polylineRef.current = new window.kakao.maps.Polyline({
        map,
        path: linePath,
        strokeWeight: 5,
        strokeColor: "#299AF0",
        strokeOpacity: 0.8,
        strokeStyle: "solid",
      });

      // 경로 전체 보이도록
      const bounds = new window.kakao.maps.LatLngBounds();
      linePath.forEach((ll) => bounds.extend(ll));
      map.setBounds(bounds);
    };

    draw().catch((e) => {
      console.error(e);
      alert("지도를 준비하는 도중 오류가 발생했습니다.");
    });
  }, [startAddress, endAddress]);

  return (
    <div>
      <div id="kakao-map" style={{ width: "100%", height: "400px", borderRadius: "10px" }} />
    </div>
  );
};

export default KakaoMapViewer;
