import { Navigate } from "react-router-dom";
import React from "react";

const PROTECTED_PATHS = ["/"];
const PUBLIC_PATHS = ["/login", "/signup"];

type protectedProps = {
  path: string;
  children: React.ReactNode;
};

const ProtectedRoute = ({ path, children }: protectedProps) => {
  const ls_access = window.localStorage.getItem("access_token");
  const ls_refresh = window.localStorage.getItem("refresh_token");
  const access_token = ls_access ? JSON.parse(ls_access) : null;
  const refresh_token = ls_refresh ? JSON.parse(ls_refresh) : null;

  if (PROTECTED_PATHS.includes(path) && !access_token && !refresh_token) {
    // alert("Content reserved only for registered users!");
    return <Navigate to="/login" />;
  } else if (PUBLIC_PATHS.includes(path) && access_token && refresh_token)
    return <Navigate to="/" />;

  return children;
};

export default ProtectedRoute;
