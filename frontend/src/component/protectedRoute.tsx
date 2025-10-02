import {  useContext } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/authcontext";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const auth = useContext(AuthContext);

  if (!auth?.token) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
