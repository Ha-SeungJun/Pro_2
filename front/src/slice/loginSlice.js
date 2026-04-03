import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// 백엔드 베이스 URL
const API_BASE =
    import.meta?.env?.VITE_API_BASE ||
    process.env.REACT_APP_API_BASE ||
    "http://localhost:8080";

// 토큰 픽업 유틸
const pickToken = () =>
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('accessToken') ||
    null;

// 프로필 URL 정규화 유틸
const normalizeProfileUrl = (v) => {
    if (!v) return null;
    if (v.startsWith('http')) return v;
    if (v.startsWith('/g2i4/uploads/')) return `${API_BASE}${v}`;
    return `${API_BASE}/g2i4/uploads/user_profile/${encodeURIComponent(v)}`;
};

// 초기 상태 (기존 필드 유지 + 상태/토큰 필드 + ✅socialPrefill 추가)
const initState = {
    email: "",
    roles: ["USER"],
    profileImage: "",
    memberId: null,

    status: "idle",      // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,         // 에러 메시지
    tokens: null,        // { tokenType, accessToken, refreshToken, expiresIn }

    // ✅ 소셜 프리필 (임시 데이터: 소셜→회원가입 페이지에서만 사용)
    //   - localStorage에 저장하지 말 것!
    //   - 필요 시 TTL(기본 5분) 만료 검사해서 자동 삭제
    socialPrefill: null, // { email: string, name: string, expiresAt: number } | null
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
            // ✅ getUserInfoAsync 리듀서
            .addCase(getUserInfoAsync.fulfilled, (state, action) => {
                const raw = action.payload || {};
                const data = raw.data || raw.user || raw.payload || raw.profile || raw.account || raw.result || {};
                
                const profilePath = data.webPath || data.profileImage || data.mem_profile_image || data.cargo_profile_image || data.profile || '';
                state.profileImage = normalizeProfileUrl(profilePath);

                // 필요 시 다른 정보도 업데이트
                state.email = data.email || data.mem_email || state.email;
                state.memberId = data.mem_id || data.cargo_id || state.memberId;
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
