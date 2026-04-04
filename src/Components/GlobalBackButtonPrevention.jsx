import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function GlobalBackButtonPrevention() {
  const location = useLocation();

  useEffect(() => {
    const preventBackButton = () => {
      window.history.pushState("", "","","", window.location.pathname);
      window.history.pushState("", "","","", window.location.pathname);
      window.history.pushState("", "","","", window.location.pathname);

      window.onpopstate = function (e) {
        e.preventDefault();

        window.history.pushState("", "","","", window.location.pathname);
      };
    };

    preventBackButton();

    // Cleanup function
    return () => {
      window.onpopstate = null;
    };
  }, [location.pathname]);

  return null;
}

export default GlobalBackButtonPrevention;
