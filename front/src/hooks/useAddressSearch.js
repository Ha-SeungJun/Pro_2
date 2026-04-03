// hooks/useAddressSearch.js
import { useEffect, useState } from 'react';

export default function useAddressSearch(apiKey) {
  const [openDialog, setOpenDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [onSelectCallback, setOnSelectCallback] = useState(null);

  const handleOpenDialog = (onSelect) => {
    setOnSelectCallback(() => onSelect); // 주소 선택 시 실행할 콜백 설정
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSearchQuery('');
    setSearchResults([]);
    setOpenDialog(false);
    setOnSelectCallback(null);
  };

 function useDaumPostcodeLoader() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);
}

 function openDaumPostcode(setter) {
  if (!window.daum || !window.daum.Postcode) {
    alert('주소 검색 스크립트가 아직 로드되지 않았습니다.');
    return;
  }

  new window.daum.Postcode({
    oncomplete: function (data) {
      const address = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
      setter(address);
    },
  }).open();
}

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const res = await fetch(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(searchQuery)}&analyze_type=exact`,
        {
          headers: { Authorization: `KakaoAK ${apiKey}` },
        }
      );

      const data = await res.json();
      setSearchResults(data.documents || []);
    } catch (err) {
      console.error('주소 검색 실패:', err);
    }
  };

  const handleSelectAddress = (item) => {
    if (onSelectCallback) {
      onSelectCallback(item.address_name);
    }
    handleCloseDialog();
  };

  return {
    openDialog,
    searchQuery,
    setSearchQuery,
    searchResults,
    handleOpenDialog,
    handleCloseDialog,
    handleSearch,
    handleSelectAddress,
  };
}
