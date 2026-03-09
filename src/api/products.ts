import { api } from "./axios";
export { api };

export interface Product {
  id: number;
  sku: string;
  price_usd: number;
  price_grn: number;
  created_at?: string;

  category: { id: number; name: string };
  subcategory?: { id: number; name: string };
  type?: { id: number; name: string };

  totalSold?: number;
  is_hidden?: boolean;

  parameters?: {
    parameter: { id: number; name: string };
    values: string[];
  }[];
}

export interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  totalPages: number;
}

// --- Всі продукти з пагінацією ---
export const getProducts = async (
  page = 1,
  limit = 20
): Promise<ProductsResponse> => {
  const token = localStorage.getItem("token");

  const res = await api.get<ProductsResponse>(
    `/products?page=${page}&limit=${limit}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );

  return res.data;
};

// --- Один продукт ---
export const getProductById = async (id: number): Promise<Product> => {
  const token = localStorage.getItem("token");

  const res = await api.get<Product>(`/products/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  return res.data;
};

// --- Оновлення stock ---
export const updateProductStock = (id: number, quantity: number) => {
  return api.patch(
    `/products/${id}/stock`,
    { quantity },
    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
  );
};

// --- Видалення ---
export const deleteProduct = (id: number) => {
  return api.delete(`/products/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
};
