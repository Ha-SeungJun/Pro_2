import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

import mypageRouter from "./mypageRouter";
import adminRouter from "./adminRouter";
import SignUpPage from "../pages/SignUpPage";
import estimateRouter from "./estimateRouter";
import orderRouter from "./orderRouter";
import BulletinBoard from "../layout/component/noboard/NoBoard";
import PostView from "../layout/component/noboard/NoboardPostView";
import RequireAuth from "../layout/component/auth/RequireAuth";
import WritePost from "../layout/component/noboard/NoboardWritePost";



// ✅ lazy 에러를 막기 위해 간편조회와 가이드는 일반 import로 변경했습니다!
import GuidePage from "../pages/GuidePage";
import QuickSearchPage from "../pages/QuickSearchPage";

const Loading = <div>Loading 중....</div>;

// 레이아웃 & 페이지 lazy 로딩
const MainLayout = lazy(() => import("../layout/MainPageLayout"));
const Login = lazy(() => import("../pages/LoginPage"));
const Home = lazy(() => import("../pages/HomePage"));
const Admin = lazy(() => import("../pages/AdminPage"));
const Estimate = lazy(() => import("../pages/QuotationRequestPage"));
const MyPageLayout = lazy(() => import("../layout/MyPageLayout"));
const Order = lazy(() => import("../pages/OrderPage"));
const ServiceCenter = lazy(() => import("../pages/ServiceCenterPage"));
const QABoard = lazy(() => import("../pages/qaboard/qaboardPage"));
const LogoutPage = lazy(() => import("../pages/LogoutPage"));

const OAuthCallbackPage = lazy(() => import("../pages/OAuthCallbackPage"));
const FindIdPage = lazy(() => import("../pages/FindIdPage"));
const FindPasswordPage = lazy(() => import("../pages/FindPasswordPage"));

// 소셜 콜백 페이지
const NaverRedirectPage = lazy(() => import("../pages/NaverRedirectPage"));
const GoogleRedirectPage = lazy(() => import("../pages/GoogleRedirectPage"));
const KakaoRedirectPage = lazy(() => import("../pages/KakaoRedirectPage"));

const AdminCargoApproval = lazy(() => import("../layout/component/admin/AdminCargoApproval"));

// test 
const EstimateMain = lazy(() => import("../pages/EstimatePage"));

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
            {
                path: "logout",
                element: <Suspense fallback={Loading}><LogoutPage /></Suspense>
            },
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
                path: "auth/callback",
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
                element: <Suspense fallback={Loading}><EstimateMain /></Suspense>,
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
            },
            // ✅ 껍데기를 벗겨서 깔끔하게 배치했습니다.
            {
                path: "quick-search",
                element: <QuickSearchPage />
            },
            {
                path: "guide",
                element: <GuidePage />
            },
            {
                path: "signup",
                element: <SignUpPage />
            },
            

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
    }
]);

export default root;