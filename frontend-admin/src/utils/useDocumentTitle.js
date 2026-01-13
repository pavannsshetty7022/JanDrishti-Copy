import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const useDocumentTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let title = "Jan Drishti Admin";

    switch (path) {
      case "/":
        title = "Jan Drishti Admin";
        break;
      case "/login":
        title = "Admin Login | Jan Drishti";
        break;
      case "/dashboard":
        title = "Admin Dashboard | Jan Drishti";
        break;
      default:
        title = "Jan Drishti Admin";
    }

    document.title = title;
  }, [location]);
};

export default useDocumentTitle;