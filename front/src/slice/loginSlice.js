import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// 백엔드 베이스 URL
const API_BASE =
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_API_BASE ||
    "http://https://pro-2-ayf7.onrender.com";

// 토큰 픽업 유틸
const pickToken = () =>
    sessionStorage.getItem('accessToken') || null;

// 프로필 URL 정규화 유틸
const normalizeProfileUrl = (v) => {
    if (!v) return null;
    if (v.startsWith('http')) return v;
    if (v.startsWith('/g2i4/uploads/')) return `${API_BASE}${v}`;
    return `${API_BASE}/g2i4/uploads/user_profile/${encodeURIComponent(v)}`;
};

const initState = {
    email: "",
    roles: [],
    profileImage: "",
    memberId: null,
    status: "idle",
    error: null,
    tokens: null,
    socialPrefill: null,
};

// ✅ 로그인 API 호출 (정규화해서 loginId/password 추출)
async function loginApi(param) {
    const loginId =
        param?.loginId ?? param?.id ?? param?.email ?? param?.memId ?? "";
    const password =
        param?.password ?? param?.pw ?? param?.password1 ?? "";

    const { data } = await axios.post(
        `${API_BASE}/api/auth/login`,
        { loginId, password },
        { headers: { "Content-Type": "application/json" } }
    );
    // data: { tokenType, accessToken, refreshToken, expiresIn }
    return data;
}

// ✅ 사용자 정보 API 호출
async function getUserInfoApi() {
    const token = pickToken();
    if (!token) throw new Error("No token found");

    const { data: raw } = await axios.get(`${API_BASE}/g2i4/user/info`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return raw;
}

// 비동기 thunk (이름은 기존 유지)
export const loginPostAsync = createAsyncThunk(
    "loginPostAsync",
    async (param, { rejectWithValue }) => {
        try {
            const data = await loginApi(param);
            return data;
        } catch (err) {
            const msg =
                err?.response?.data?.message ??
                err?.response?.data?.error ??
                err?.message ??
                "로그인 실패";
            return rejectWithValue(msg);
        }
    }
);

// ✅ 사용자 정보 가져오기 thunk
export const getUserInfoAsync = createAsyncThunk(
    "getUserInfoAsync",
    async (_, { rejectWithValue }) => {
        try {
            const data = await getUserInfoApi();
            return data;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// slice
const loginSlice = createSlice({
    name: "LoginSlice",
    initialState: initState,
    reducers: {
        // (선택) 수동 로그인 상태 세팅 - 기존 호환 유지
        login: (state, action) => {
            const d = action.payload || {};
            // roles가 배열인지 확인하고, 아니면 배열로 만듭니다.
            const newRoles = Array.isArray(d.roles) ? d.roles : (d.role ? [d.role] : state.roles);
            return {
                ...state,
                email: d.email ?? state.email ?? "",
                roles: newRoles,
                memberId: d.memberId ?? d.id ?? state.memberId ?? null,
            };
        },
        logout: () => {
            // 토큰은 훅(useCustomLogin)에서 지우고, 상태만 리셋
            return { ...initState };
        },
        updateProfileImage: (state, action) => {
            state.profileImage = action.payload;
        },

        // ✅ 소셜 프리필 세팅/초기화
        // 사용처:
        // - OAuth2 성공 후 프론트에서 /signup/social 진입 전에 setSocialPrefill({ email, name, ttlMs? })
        // - /signup/social 이탈/취소, 일반 /signup 진입 시 clearSocialPrefill()
        setSocialPrefill: (state, action) => {
            const { email, name, ttlMs = 5 * 60 * 1000 } = action.payload || {};
            if (!email && !name) {
                // 잘못된 호출 방어
                state.socialPrefill = null;
                return;
            }
            state.socialPrefill = {
                email: email ?? "",
                name: name ?? "",
                expiresAt: Date.now() + ttlMs,
            };
        },
        clearSocialPrefill: (state) => {
            state.socialPrefill = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginPostAsync.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(loginPostAsync.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.error = null;
                state.tokens = action.payload; // { tokenType, accessToken, refreshToken, expiresIn }
                // 이메일/역할 정보는 토큰 응답에 없으므로 유지
            })
            .addCase(loginPostAsync.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload || action.error?.message || "로그인 실패";
            })
            .addCase(getUserInfoAsync.fulfilled, (state, action) => {
                const raw = action.payload || {};
                const data = raw.data || {};

                const profilePath = data.webPath || data.profileImage || data.mem_profile_image || data.cargo_profile_image || data.profile || '';
                state.profileImage = normalizeProfileUrl(profilePath);

                state.email = data.mem_email || data.email || state.email;
                state.memberId = data.mem_id || data.cargo_id || state.memberId;

                // ✅ userType으로 roles 매핑
                const userType = raw.userType || "";
                if (userType === "MEMBER") {
                    state.roles = ["ROLE_SHIPPER"];
                } else if (userType === "CARGO_OWNER") {  
                    state.roles = ["ROLE_DRIVER"];
                } else if (userType === "ADMIN") {
                    state.roles = ["ROLE_ADMIN"];
                }
            });
    },
});

export const {
    login,
    logout,
    updateProfileImage,
    // ✅ 새로 추가된 액션
    setSocialPrefill,
    clearSocialPrefill,
} = loginSlice.actions;

export default loginSlice.reducer;

// (선택) 셀렉터들
export const selectSocialPrefill = (state) => state.login?.socialPrefill || null;
export const selectIsSocialPrefillValid = (state) => {
    const sp = state.login?.socialPrefill;
    return !!(sp && typeof sp.expiresAt === 'number' && Date.now() <= sp.expiresAt);
};
