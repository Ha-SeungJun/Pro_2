import { useState } from 'react';

export default function usePasswordForm() {
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [isPwValid, setIsPwValid] = useState(null); // 비밀번호 유효성
  const [isPwMatch, setIsPwMatch] = useState(null); // 비밀번호 일치 여부
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const pwRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@*_\#\$%\^&\?])[A-Za-z\d!@*_\#\$%\^&\?]{8,20}$/;

  const handleChangePassword1 = (e) => {
    const value = e.target.value;
    setPassword1(value);

    setIsPwValid(value === '' ? null : pwRegex.test(value));

    if (password2 === '') {
      setIsPwMatch(null);
    } else {
      setIsPwMatch(value === password2);
    }
  };

  const handleChangePassword2 = (e) => {
    const value = e.target.value;
    setPassword2(value);

    if (value === '') {
      setIsPwMatch(null); // 공백일 땐 메시지 숨기기
    } else {
      setIsPwMatch(password1 === value);
    }
  };

  const toggleShowPassword1 = () => setShowPassword1((prev) => !prev);
  const toggleShowPassword2 = () => setShowPassword2((prev) => !prev);

  return {
    password1,
    password2,
    isPwValid,
    isPwMatch,
    showPassword1,
    showPassword2,
    handleChangePassword1,
    handleChangePassword2,
    toggleShowPassword1,
    toggleShowPassword2,
  };
}
