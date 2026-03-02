import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import type { JSX } from "react";

interface PrivateRouteProps {
  children: JSX.Element;
  requiredRole?: string;
}

interface DecodedToken {
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
}

export default function PrivateRoute({ children, requiredRole }: PrivateRouteProps) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded: DecodedToken = jwtDecode(token);

    if (requiredRole) {
      // Додаємо регістрово-незалежне порівняння
      if (!decoded.role || decoded.role.toLowerCase() !== requiredRole.toLowerCase()) {
        console.warn(
          `Access denied: requiredRole="${requiredRole}", userRole="${decoded.role}"`
        );
        return <Navigate to="/" replace />;
      }
    }

    return children;
  } catch (err) {
    console.error("Invalid token", err);
    return <Navigate to="/login" replace />;
  }
}