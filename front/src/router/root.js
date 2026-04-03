// src/router/root.js
import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

import mypageRouter from "./mypageRouter";
import adminRouter from "./adminRouter";
import SignUpPage from "../pages/SignUpPage";
import estimateRouter from "./estimateRouter";
import orderRouter from "./orderRouter";
import BulletinBoard from "../layout/component/noboard/NoBoard"; // ✅ Import NoBoard Component
import PostView from "../layout/component/noboard/NoboardPostView";
import RequireAuth from "../layout/component/auth/RequireAuth";

import WritePost from "../layout/component/noboard/NoboardWritePost";
const Loading = <div>Loading 중....</div>;

// 레이아웃 & 페이지 lazy 로딩
const MainLayout = lazy(() => import("../layout/MainPageLayout"));
const Login = lazy(() => import("../pages/LoginPage"));
const Home = lazy(() => import("../pages/HomePage"));
const Admin = lazy(() => import("../pages/AdminPage"));
const Estimate = lazy(() => import("../pages/EstimatePage"));
const MyPageLayout = lazy(() => import("../layout/MyPageLayout"));
const Order = lazy(() => import("../pages/OrderPage"));
const ServiceCenter = lazy(() => import("../pages/ServiceCenterPage"));
const QABoard = lazy(() => import("../pages/qaboard/qaboardPage"));
const LogoutPage = lazy(() => import("../pages/LogoutPage"));

const OAuthCallbackPage = lazy(() => import("../pages/OAuthCallbackPage"));
const FindIdPage = lazy(() => import("../pages/FindIdPage"));
const FindPasswordPage = lazy(() => import("../pages/FindPasswordPage"));

// ✅ 소셜 콜백 페이지
const NaverRedirectPage = lazy(() => import("../pages/NaverRedirectPage"));   // /member/naver-callback
const GoogleRedirectPage = lazy(() => import("../pages/GoogleRedirectPage"));  // /member/google-callback
const KakaoRedirectPage = lazy(() => import("../pages/KakaoRedirectPage"));   // /member/kakao-callback

const root = createBrowserRouter([
    {
        path: "",
        element: <Suspense fallback={Loading}><MainLayout /></Suspense>,
        children: [
            {
                index: true,
                element: <Suspense fallback={Loading}><Home /></Suspense>
            },
            {
                path: "login",
                element: <Suspense fallback={Loading}><Login /></Suspense>
            },
            // ✅ 로그아웃 (진입 즉시 처리)
            {
                path: "logout",
                element: <Suspense fallback={Loading}><LogoutPage /></Suspense>
            },

            // ✅ 소셜 로그인 콜백 (프론트 → 백엔드 표준 콜백으로 포워딩)
            {
                path: "member/naver-callback",
                element: <Suspense fallback={Loading}><NaverRedirectPage /></Suspense>
            },
            {
                path: "member/google-callback",
                element: <Suspense fallback={Loading}><GoogleRedirectPage /></Suspense>
            },
            {
                path: "member/kakao-callback",
                element: <Suspense fallback={Loading}><KakaoRedirectPage /></Suspense>
            },
            {
                path: "auth/callback",   // ✅ 서버가 리다이렉트해주는 경로
                element: <Suspense fallback={Loading}><OAuthCallbackPage /></Suspense>
            },
            {
                path: "find-id",
                element: <Suspense fallback={Loading}><FindIdPage /></Suspense>
            },
            {
                path: "find-password",
                element: <Suspense fallback={Loading}><FindPasswordPage /></Suspense>
            },

            {
                path: "estimatepage",
                element: <Suspense fallback={Loading}><Estimate /></Suspense>,
                children: estimateRouter.children
            },
            {
                path: "servicecenterpage",
                element: <Suspense fallback={Loading}><ServiceCenter /></Suspense>
            },
            {
                path: "qaboard",
                element: <Suspense fallback={Loading}><QABoard /></Suspense>
            },
            {
                path: "noboard",
                element: <Suspense fallback={Loading}><BulletinBoard /></Suspense>
            },
            {
                path: "noboard/post/:id",
                element: <Suspense fallback={Loading}><PostView /></Suspense>
            },
            {
                path: "noboard/write",
                element: <Suspense fallback={Loading}><WritePost /></Suspense>
            },
            {
                path: "noboard/write/:id",
                element: <Suspense fallback={Loading}><WritePost /></Suspense>
            },
            {
                path: "order",
                element: <Suspense fallback={Loading}><Order /></Suspense>,
                children: orderRouter.children
            }
        ]
    },
    {
        path: "mypage",
        element: <RequireAuth />,                
        children: [{
                element: (
                    <Suspense fallback={Loading}>
                        <MyPageLayout />
                    </Suspense>
                ),
                children: mypageRouter  
            }]
    },
    {
        path: "admin",
        element: <Suspense fallback={Loading}><Admin /></Suspense>,
        children: adminRouter()
    },
    {
        path: "signup",
        element: <SignUpPage />
    }
]);

export default root;
