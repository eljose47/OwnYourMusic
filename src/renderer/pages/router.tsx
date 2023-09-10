import * as React from "react";
import { createHashRouter, useNavigate } from "react-router-dom";
import LocalFiles from "../localFiles";
import { Navigate } from "react-router-dom";
import { WelcomeRoute as welcomeRoute } from "./welcome";

const Root = () => {
  const navigate = useNavigate();

  window.navigate = navigate;

  return <Navigate to={"/welcome"} />;
};

export const router = createHashRouter([
  {
    path: "/",
    // do not need to explicitly set this, since Outlet is the default
    // element: <Outlet />,
    children: [
      {
        path: "",
        element: <Root />,
      },
      welcomeRoute,
    ],
  },
]);
