// src/api/products.ts
import { api } from "./axios";
export { api };

// ------------------ TYPES ------------------
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
  pagination: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

interface GetProductsParams {
  page?: number;
  limit?: number;
  categoryId?: number;
  subcategoryId?: number;
  typeId?: number;
  sort?: string;
  search?: string;
}

export const getProducts = async ({
  page = 1,
  limit = 8,
  categoryId,
  subcategoryId,
  typeId,
  sort,
  search
}: GetProductsParams): Promise<ProductsResponse> => {
  const token = localStorage.getItem("token");
  const res = await api.get<ProductsResponse>("/products", {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    params: { page, limit, categoryId, subcategoryId, typeId, sort, search },
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

export const updateProductStock = (id: number, quantity: number) => {
  return api.patch(
    `/products/${id}/stock`,
    { quantity },
    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
  );
};

export const deleteProduct = (id: number) => {
  return api.delete(`/products/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
};


