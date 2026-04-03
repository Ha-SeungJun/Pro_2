import { lazy, Suspense } from "react";

const GetList = lazy(() => import("../layout/component/estimate/EstimateListComponent"));
const Estimate = lazy(() => import("../layout/component/estimate/EstimateComponent"));
const EstimateCombined = lazy(() => import("../layout/component/estimate/EstimateComponentCombined"));
const EstimateMain = lazy(() => import("../pages/EstimatePage"));
const Loading = <div>Loading 중....</div>

const estimateRouter = {
    path: "",
    element: <Suspense fallback={Loading}><EstimateMain /></Suspense>,
    children: [
        {
            index: true, // ← 기본 라우트를 combined로
            element: <Suspense fallback={Loading}><EstimateCombined /></Suspense>
        },
        {
            path: "basic", // 기존 견적서
            element: <Suspense fallback={Loading}><Estimate /></Suspense>
        },
        {
            path: "list",
            element: <Suspense fallback={Loading}><GetList /></Suspense>
        },
    ]
};

export default estimateRouter;