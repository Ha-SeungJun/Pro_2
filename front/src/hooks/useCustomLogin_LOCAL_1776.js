//이 훅은 로그인이나 로그인 상태의 체크등, 다른 컴포넌트에서 공통으로 사용할 수 있는기능을 정의 한다
//로그인처리, 로그인 상태여부, 로그아웃 처리등을 정의함..

import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { loginPostAsync, logout } from "../slice/loginSlice";
import { loginPost } from "../api/memberApi";

const useCustomLogin = ()=>{
    //로그인 로그아웃 후 페이지 이동을 위한 함수 선언
    const navigate = useNavigate();

    //앱 상태관리를 위한 dispatch 선언
    const dispatch = useDispatch();

    //로그인 상태 변수 선언
    const loginState= useSelector(state=> state.login);

    const isLogin = loginState.email?true:false;//로그인 여부
    
    // 권한 확인 함수들
    const isAdmin = loginState.role === 'ADMIN'; // 관리자 권한 확인
    const isUser = loginState.role === 'USER'; // 일반 사용자 권한 확인
    const currentUserId = loginState.memberId; // 현재 로그인한 사용자 ID

    //로그인 처리 함수 정의
    const doLogin= async(loginParam)=>{
        const action = await dispatch(loginPostAsync(loginParam))
        return action.payload;
    } 

     const doLogout = ()=>{
        dispatch(logout())
     }

     const moveToPath = (path) => {
      navigate(path, { replace: true });
};

const moveToLogin = () => {
  navigate('/member/login', { replace: true });
};
     const moveToLoginReturn =()=>{//로그인 페이지로 이동하는 컴포넌트
        return <Navigate replace to={"/member/login"}/>
     }
     return{
        loginState,
        isLogin,
        doLogin,
        doLogout,
        moveToLogin,
        moveToPath,
        moveToLoginReturn,
        // 새로 추가된 권한 관련 함수들
        isAdmin,
        isUser,
        currentUserId
     }
}
export default useCustomLogin;