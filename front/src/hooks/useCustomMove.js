//넘겨지는 파라미터를 get

import { useState } from "react"
import { createSearchParams, useNavigate, useSearchParams } from "react-router-dom"

const getNum = (param, defaultValue) => {
    if (!param) {
        return defaultValue
    }
    return parseInt(param)
}




//특정 page 로 넘어가는 공통 모듈 작성..
const useCustomMove = () => {
    //특정 요소로 넘기기 위한 컴포넌트 선언 및 파라미터 정보 확인 
    const navigate = useNavigate();
    const [queryParams] = useSearchParams();
    const [refresh, setRefresh] = useState(false);

    const page = getNum(queryParams.get('page'), 1)
    const size = getNum(queryParams.get('size'), 10)

    //기본값 설정을 위한 쿼리스트링 콤포넌트 추가
    const queryDefault = createSearchParams({ page, size }).toString();

    //글 상세로 연결해주는 hook 작성
    const moveToRead = (num) => {
        console.log(queryDefault)

        navigate({pathname: `../read/${num}`, search: queryDefault})
    }

    //list 페이지로 보낼 파라피터 정리 되었으니, 리스트로 보낼 함수 정의
    const moveToList = (pageParam) => {
        //동일 페이지 클릭시 요청 변동이 없는 문제 해결.. 


        let queryStr = "";

        if (pageParam) {

            const pageNum = getNum(pageParam.page, 1);
            const sizeNum = getNum(pageParam.size, 10);

            queryStr = createSearchParams({ page: pageNum, size: sizeNum }).toString();

        } else {
            queryStr = queryDefault
        }
        navigate({ pathname: '../list', search: queryStr });
        //moveToList({page:1})
        setRefresh(!refresh)

    }
    const moveToModify = (num) => {
        console.log(queryDefault);
        navigate({ pathname: `../modify/${num}`, search: queryDefault }) //수정한다면 기존의 쿼리 스트링을 유지하기 위해서
    }

    const moveToLogin = () =>{
        console.log("로그인페이지")
        navigate({pathname:`../g2i4/login`})
    }
    const moveToHome = () =>{
        navigate({pathname:`../`})
    }
    return { moveToList, moveToModify, page, size, refresh, setRefresh, moveToRead ,moveToLogin ,moveToHome};
}
export default useCustomMove;