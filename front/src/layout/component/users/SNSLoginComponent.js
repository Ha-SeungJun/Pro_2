import { Button } from "@mui/material";

/* eslint-disable no-undef */
const API_BASE =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
    process.env.REACT_APP_API_BASE ||
    "http://localhost:8080";

const ButtonStyle = {
    mb: 1,
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    fontFamily: "SUIT, sans-serif",
    fontSize: "13px",
    textTransform: "none",
};

/** @param {'naver'|'kakao'|'google'} provider */
function startOAuth(provider) {
    (window.top ?? window).location.href = `${API_BASE}/oauth2/authorization/${provider}`;
}

const SNSLoginComponent = () => {
    return (
        <>
            <Button
                fullWidth
                variant="outlined"
                type="button"                 // 폼 안에서 submit 방지
                sx={ButtonStyle}
                onClick={() => startOAuth("naver")}
            >
                <img src="/assets/naver-icon.png" alt="Naver" style={{ width: 20, height: 20 }} />
                <span>Sign in with Naver</span>
            </Button>

            <Button
                fullWidth
                variant="outlined"
                type="button"
                sx={ButtonStyle}
                onClick={() => startOAuth("kakao")}
            >
                <img src="/assets/kakao-icon.png" alt="Kakao" style={{ width: 20, height: 20 }} />
                <span>Sign in with Kakao</span>
            </Button>

            <Button
                fullWidth
                variant="outlined"
                type="button"
                sx={ButtonStyle}
                onClick={() => startOAuth("google")}
            >
                <img src="/assets/google-icon.png" alt="Google" style={{ width: 20, height: 20 }} />
                <span>Sign in with Google</span>
            </Button>
        </>
    );
};

export default SNSLoginComponent;
