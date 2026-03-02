import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // 🔥 токен невалідний
      localStorage.removeItem("token");

      // якщо маєш user у state — чистиш його
      // setUser(null)

      // редірект на логін
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);