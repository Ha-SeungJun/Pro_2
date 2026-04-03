const REST_API_KEY = "d381d00137ba5677a3ee0355c4c95abf";

export const fetchCoordsByAddress = async (address) => {
  const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`;
  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${REST_API_KEY}` },
  });
  const data = await res.json();

  if (!data.documents || data.documents.length === 0) {
    throw new Error("주소로 좌표를 찾을 수 없습니다.");
  }

  const loc = data.documents[0];
  return { lat: parseFloat(loc.y), lng: parseFloat(loc.x) };
};

export const calculateDistanceBetweenAddresses = async (startAddress, endAddress) => {
  try {
    const start = await fetchCoordsByAddress(startAddress);
    const end = await fetchCoordsByAddress(endAddress);

    const routeUrl = `https://apis-navi.kakaomobility.com/v1/directions?origin=${start.lng},${start.lat}&destination=${end.lng},${end.lat}`;
    const res = await fetch(routeUrl, {
      headers: { Authorization: `KakaoAK ${REST_API_KEY}` },
    });
    const data = await res.json();

    if (!data.routes || data.routes.length === 0) {
      throw new Error("경로 데이터를 찾을 수 없습니다.");
    }

    const meters = data.routes[0].summary.distance;
    const km = (meters / 1000).toFixed(1);
    return km;
  } catch (error) {
    console.error("거리 계산 실패:", error.message);
    throw error;
  }
};
