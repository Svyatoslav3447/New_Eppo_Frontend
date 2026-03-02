import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import type { JSX } from "react";

interface PublicRouteProps {
  children: JSX.Element;
}

interface DecodedToken {
  sub: string;
  role: string;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const token = localStorage.getItem("token");

  if (!token) return children; // немає токена → дозволяємо зайти

  try {
    const decoded: DecodedToken = jwtDecode(token);
    console.log("PublicRoute: user already logged in, role =", decoded.role);
    // будь-який залогінений → редірект на головну
    return <Navigate to="/" replace />;
  } catch (err) {
    console.error("Invalid token:", err);
    return children; // якщо токен невалідний → дозволяємо заходити
  }
}