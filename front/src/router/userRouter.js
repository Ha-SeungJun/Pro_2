import { lazy, Suspense } from "react";

const Loding = <div>Loading</div>
const Login = lazy(() => import("../pages/LoginPage"))

const userRouter = () => {
    return[
        {
            path:"login",
            element: <Suspense fallback={Loding}><Login /></Suspense>
        }
    ]
}