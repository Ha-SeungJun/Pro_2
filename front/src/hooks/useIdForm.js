import { useState } from 'react';

const useIdForm = () => {
  const [id, setId] = useState('');
  const [isDuplicate, setIsDuplicate] = useState(null);
  const [isIdValid, setIsIdValid] = useState(null); // 정규식 유효성

  const idRegex = /^[A-Za-z0-9]{8,15}$/;

  const handleChange = (e) => {
    const value = e.target.value;
    setId(value);

    if (value === '') {
      setIsDuplicate(null);
      setIsIdValid(null);
    } else {
      // 정규식 검사
      const valid = idRegex.test(value);
      setIsIdValid(valid);

      // 중복 검사 예시 (나중에 API 연결 가능)
      if (value === 'admin') {
        setIsDuplicate(true);
      } else {
        setIsDuplicate(false);
      }
    }
  };

  return { id, isDuplicate, isIdValid, handleChange };
};

export default useIdForm;