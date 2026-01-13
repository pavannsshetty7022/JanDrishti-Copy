import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const useDocumentTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let title = "Jan Drishti";

    switch (path) {
      case "/":
        title = "Jan Drishti";
        break;
      case "/home":
        title = "Home | Jan Drishti";
        break;
      case "/register":
        title = "Register | Jan Drishti";
        break;
      case "/login":
        title = "Login | Jan Drishti";
        break;
      case "/profile-update":
        title = "Update Profile | Jan Drishti";
        break;
      case "/dashboard":
        title = "Dashboard | Jan Drishti";
        break;
      case "/report-issue":
        title = "Report Issue | Jan Drishti";
        break;
      default:
        if (path.startsWith("/edit-issue/")) {
          title = "Edit Issue | Jan Drishti";
        } else {
          title = "Jan Drishti";
        }
    }

    document.title = title;
  }, [location]);
};

export default useDocumentTitle;