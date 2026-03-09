import { api } from "./axios";
export { api };

export interface ProductsResponse {
  data: Product[];
  pagination: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

export const getProducts = async (page = 1, limit = 8): Promise<ProductsResponse> => {
  const token = localStorage.getItem("token");
  const res = await api.get<ProductsResponse>("/products", {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    params: { page, limit },
  });
  return res.data;
};

export const getProductById = async (id: number): Promise<Product> => {
  const token = localStorage.getItem("token");
  const res = await api.get<Product>(`/products/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return res.data;
};

// Оновлення stock
export const updateProductStock = (id: number, quantity: number) => {
  return api.patch(
    `/products/${id}/stock`,
    { quantity },
    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
  );
};

// Видалення
export const deleteProduct = (id: number) => {
  return api.delete(`/products/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
};

