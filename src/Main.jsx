import { lazy, Suspense } from "react";
import AppLoader from "./Pages/AppLoader";

const App = lazy(() => import('./App'));

const Main = () => {
    return (
        <Suspense fallback={<AppLoader logo = {"/assets/images/appLoader.png"} />}>
            <App />
        </Suspense>

    )
};
export default Main;