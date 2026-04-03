import { lazy, Suspense } from "react";
const Loading = <div>Loading 중....</div>
const OrderComponent = lazy(() => import("../layout/component/order/OrderComponent"));
const Order = lazy(() => import("../pages/OrderPage"));
const PaymentComponent = lazy(() => import("../layout/component/payment/PaymentComponent"));
const orderRouter = {
    
    children: [
        {
            index: true,
            element: <Suspense fallback={Loading}><OrderComponent /></Suspense>
        },
        {
            path : "payment",
            element: <Suspense fallback={Loading}><PaymentComponent /></Suspense>
        }
   
    ]

}

export default orderRouter