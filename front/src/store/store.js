import { configureStore } from '@reduxjs/toolkit';
import loginReducer from '../slice/loginSlice'; // ⬅️ 파일명만 바꾸면 됨

const store = configureStore({
  reducer: {
    login: loginReducer, // ⬅️ 이 key는 useSelector 할 때 사용됨
  },
});

export default store;