import { api } from "./axios";

export const login = (phone: string, password: string) => {
  return api.post("/auth/login", { phone, password });
};

export const register = (phone: string, password: string, firstName?: string, lastName?: string) => {
  return api.post("/auth/register", { phone, password, firstName, lastName });
};