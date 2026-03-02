import { api } from "./axios";

export interface User {
  id: number;
  phone: string;
  role: "USER" | "ADMIN";
  firstName?: string;  // додано
  lastName?: string;   // додано
}

export const getCurrentUser = async (): Promise<User> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token");

  const res = await api.get("/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};