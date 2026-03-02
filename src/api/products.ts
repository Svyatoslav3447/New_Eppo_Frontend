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
    values: string[]; // <- тепер масив значень
  }[]; // <-- додано
}

// Всі продукти
export const getProducts = async (): Promise<Product[]> => {
  const token = localStorage.getItem("token"); // JWT
  const res = await api.get<Product[]>("/products", {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
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
