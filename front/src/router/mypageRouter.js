import { lazy, Suspense } from "react";

const Loading = <div>Loading 중....</div>;

const MyInform = lazy(() => import("../layout/component/mypage/MyInform"));
const EditMyInform = lazy(() => import("../layout/component/mypage/EditMyInform"));
const EditVehicleInform = lazy(() => import("../layout/component/mypage/EditVehicleInform"));
const MyReviewInform = lazy(() => import("../layout/component/mypage/MyReviewInform"));/////리뷰
const ReceivedReviewInform = lazy(() => import("../layout/component/mypage/ReceivedReviewInform"));
const DeliveryInformCargo = lazy(() => import("../layout/component/mypage/DeliveryInformCargo"));
const DeliveryInform = lazy(() => import("../layout/component/mypage/DeliveryInform"));
const OrderSummaryReadOnly = lazy(() => import("../layout/component/mypage/OrderSummaryReadOnly"));
const mypageRouter = [
  {
    index: true,
    element: <Suspense fallback={Loading}><MyInform /></Suspense>
  },
  {
    path: "edit",
    element: <Suspense fallback={Loading}><EditMyInform /></Suspense>
  },
  {
    path: "vehicle/:cargoId", element: <Suspense fallback={Loading}><EditVehicleInform /></Suspense>
  },
  {
    path: "delivery",
    element: <Suspense fallback={Loading}><DeliveryInform /></Suspense>
  },
  {
    path: "deliverycargo",
    element: <Suspense fallback={Loading}><DeliveryInformCargo /></Suspense>
  },
  {
    path: "order-summary",
    element: <Suspense fallback={Loading}><OrderSummaryReadOnly /></Suspense>
  },
  {
    path: "review",
    element: <Suspense fallback={Loading}><MyReviewInform /></Suspense>
  },
  {
    path: "review/received",
    element: <Suspense fallback={Loading}><ReceivedReviewInform /></Suspense>
  },

];

export default mypageRouter;