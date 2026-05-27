import { lazy, Suspense } from "react";
import AppLoader from "./Pages/AppLoader";
import NoInternetOverlay from "./Components/NoInternetOverlay";
import GlobalBackButtonPrevention from "./Components/GlobalBackButtonPrevention";

const App = lazy(() => import('./App'));

const Main = () => {
    return (
     
        <Suspense fallback={<AppLoader logo = {"/assets/images/appLoader.png"} />}>
            <GlobalBackButtonPrevention />
               <NoInternetOverlay>
            <App />
            </NoInternetOverlay>
        </Suspense>
     
    )
};
export default Main;