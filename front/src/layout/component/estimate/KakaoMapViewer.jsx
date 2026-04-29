import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const KakaoMapViewer = forwardRef(({ startAddress, endAddress, onAddressSelect }, ref) => {
  const mapRef = useRef(null);
  const polylineRef = useRef(null);
  const markersRef = useRef([]);
  const REST_API_KEY = "d381d00137ba5677a3ee0355c4c95abf";

  // 💡 [핵심] 부모의 '함수'와 '출발지 상태'를 실시간으로 담아둘 보관함(Ref)
  // 리액트의 일반 Props는 클로저 때문에 지도의 이벤트 리스너 안에서 옛날 값으로 박제될 수 있습니다.
  const onSelectRef = useRef(onAddressSelect);
  const startAddrRef = useRef(startAddress);

  //초기화 추가 
  useImperativeHandle(ref, () => ({
    reset() {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      polylineRef.current?.setMap(null);
      polylineRef.current = null;
      if (mapRef.current) {
        mapRef.current.setCenter(new window.kakao.maps.LatLng(37.5665, 126.9780));
        mapRef.current.setLevel(7);
      }
    }
  }));


  // 부모로부터 새로운 데이터가 내려올 때마다 보관함 내용물을 최신화합니다.
  useEffect(() => {
    onSelectRef.current = onAddressSelect;
    startAddrRef.current = startAddress;
  }, [onAddressSelect, startAddress]);

  // 1) 맵 초기 생성 (지도는 딱 한 번만 만듭니다)
useEffect(() => {
    const container = document.getElementById("kakao-map");
    if (!container || mapRef.current) return;

    const initMap = () => {
      const map = new window.kakao.maps.Map(container, {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780),
        level: 7,
      });
      mapRef.current = map;

      const geocoder = new window.kakao.maps.services.Geocoder();

      window.kakao.maps.event.addListener(map, "click", (mouseEvent) => {
        const latlng = mouseEvent.latLng;

        geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result, status) => {
          if (status === "OK" || status === window.kakao.maps.services.Status.OK) {
            const addressData = result[0].address || result[0].road_address;
            const addressName = addressData ? addressData.address_name : "";

            if (onSelectRef.current && addressName) {
              const type = !startAddrRef.current ? "start" : "end";
              console.log(`4. 부모에게 전송: ${type}Address -> ${addressName}`);
              onSelectRef.current(type, addressName);
            } else {
              console.error("4-Error. 함수 보관함이 비어있거나 주소 이름이 없습니다.");
            }
          }
        });
      });
    };

    if (window.kakao && window.kakao.maps) {
      initMap();
    } else {
      window.kakao.maps.load(() => initMap());
    }

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      polylineRef.current?.setMap(null);
    };
}, []);

  // 2) 주소 변화 시 마커 및 경로 갱신 로직 (기존 유지)
  useEffect(() => {
    if (!startAddress || !endAddress || !mapRef.current) return;

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

      const path = roads.flatMap((road) =>
        road.vertexes.reduce((acc, _, idx) => {
          if (idx % 2 === 0) acc.push([road.vertexes[idx + 1], road.vertexes[idx]]);
          return acc;
        }, [])
      );
      const linePath = path.map(
        ([lat, lng]) => new window.kakao.maps.LatLng(lat, lng)
      );

      polylineRef.current = new window.kakao.maps.Polyline({
        map,
        path: linePath,
        strokeWeight: 5,
        strokeColor: "#299AF0",
        strokeOpacity: 0.8,
        strokeStyle: "solid",
      });

      const bounds = new window.kakao.maps.LatLngBounds();
      linePath.forEach((ll) => bounds.extend(ll));
      map.setBounds(bounds);
    };

    draw().catch((e) => console.error(e));
  }, [startAddress, endAddress]);

  return (
    <div>
      <div id="kakao-map" style={{ width: "100%", height: "400px", borderRadius: "10px" }} />
    </div>
  );
});

export default KakaoMapViewer;