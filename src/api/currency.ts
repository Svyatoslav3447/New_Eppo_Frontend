import { api } from "./axios";

export const getCurrencyRate = () => api.get("/currency").then(res => res.data);