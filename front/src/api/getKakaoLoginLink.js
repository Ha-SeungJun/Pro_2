import axios from "axios"

export const API_SERVER_HOST = "http://localhost:8080";
const rest_api_key = `498202a9ce854810564a953136cf57b2`
const redirect_uri = `http://localhost:3000/member/kakao`   

const auth_code_path = `https://kauth.kakao.com/oauth/authorize`

const access_token_uri = 'https://kauth.kakao.com/oauth/token'

export const getKakaoLogin = () => {
    const kakaoURL = `${auth_code_path}?client_id=${rest_api_key}&redirect_uri=${redirect_uri}&response_type=code`

    return kakaoURL;
}
export const getMemberWithAccessToken = async(accessToken)=>{
    const res = await axios.get(`${API_SERVER_HOST}/api/member/kakao?accessToken=${accessToken}`)

    return res.data;
}

//Access Token 을 받기 위한 필수 key 정보들
// grant_type : 고정값임 client_id : API 키, redirect_uri: 인가 코드가 redirect 된 URI
// code: 인가 코드 (변수임), client_secret: 보안에 관련된 코드값(필수 아님)

export const getAccessToken = async (authCode) => {
    const header = {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        }
    };

    const params = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: rest_api_key,
        redirect_uri: redirect_uri,
        code: authCode
    });

    try {
        const res = await axios.post(access_token_uri, params, header);
        const access_token = res.data.access_token;
        return access_token;
    } catch (err) {
        console.error("❌ access_token 발급 실패:", err.response?.data || err.message);
        throw err;
    }
};