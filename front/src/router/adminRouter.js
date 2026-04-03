import { lazy, Suspense, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import MemberOwner from "../layout/component/admin/MemberOwner";
import MemberCowner from "../layout/component/admin/MemberCowner";
import MemberReport from "../layout/component/admin/MemberReport";
import MemberAdmin from "../layout/component/admin/MemberAdmin";
import Notice from "../layout/component/admin/Notice";
import Inquirie from "../layout/component/admin/Inquirie";
import FeesBasic from "../layout/component/admin/FeesBasic";
import FeesExtra from "../layout/component/admin/FeesExtra";

const AdminLayout = lazy(() => import("../layout/component/admin/AdminLayout"));
const AdminPage = lazy(() => import("../layout/component/admin/AdminPage"));
const DeliveryPage = lazy(() => import("../layout/component/admin/DeliveryPage"));
const MemberAll = lazy(() => import("../layout/component/admin/MemberAll"));

const loading = <div>로딩중입니다.....</div>

const AdminRouteWrapper = ({ children }) => {
    const { roles } = useSelector(state => state.login);
    const navigate = useNavigate();

    useEffect(() => {
        const isAdmin = roles.includes("ROLE_ADMIN");
        if (!isAdmin) {
            alert("접근이 불가능합니다.");
            navigate('/', { replace: true });
        }
    }, [roles, navigate]);
    return children;
};

const adminRouter = () => {
    return [
        {
            index: true,
            element: <AdminRouteWrapper><Suspense fallback={loading}><AdminPage /></Suspense></AdminRouteWrapper>,
        },
        {
            path: "delivery",
            element: <AdminRouteWrapper><Suspense fallback={loading}><DeliveryPage /></Suspense></AdminRouteWrapper>,
        },
        {
            //전체회원
            path: "memberAll",
            element: <AdminRouteWrapper><Suspense fallback={loading}><MemberAll /></Suspense></AdminRouteWrapper>,
        },
        {
            //화주
            path: "memberOwner",
            element: <AdminRouteWrapper><Suspense fallback={loading}><MemberOwner /></Suspense></AdminRouteWrapper>,
        },
        {
            //차주
            path: "memberCowner",
            element: <AdminRouteWrapper><Suspense fallback={loading}><MemberCowner /></Suspense></AdminRouteWrapper>,
        },
        {
            //신고내역
            path: "memberReport",
            element: <AdminRouteWrapper><Suspense fallback={loading}><MemberReport /></Suspense></AdminRouteWrapper>,
        },
        {
            //관리자관리
            path: "memberAdmin",
            element: <AdminRouteWrapper><Suspense fallback={loading}><MemberAdmin /></Suspense></AdminRouteWrapper>,
        },
        {
            path: "notice",
            element: <AdminRouteWrapper><Suspense fallback={loading}><Notice /></Suspense></AdminRouteWrapper>,
        },
        {
            path: "inquirie",
            element: <AdminRouteWrapper><Suspense fallback={loading}><Inquirie /></Suspense></AdminRouteWrapper>,
        },
        {
            path: "feesBasic",
            element: <AdminRouteWrapper><Suspense fallback={loading}><FeesBasic /></Suspense></AdminRouteWrapper>,
        },
        {
            path: "feesExtra",
            element: <AdminRouteWrapper><Suspense fallback={loading}><FeesExtra /></Suspense></AdminRouteWrapper>,
        },
        {
            path: "deliveryPage",
            element: <AdminRouteWrapper><Suspense fallback={loading}><DeliveryPage /></Suspense></AdminRouteWrapper>,
        },
    ]
};
export default adminRouter;

