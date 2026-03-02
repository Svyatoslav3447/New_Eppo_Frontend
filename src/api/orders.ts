import { api } from "./axios";

export interface OrderItem {
  id: number;
  product: {
    id: number;
    sku: string;
    price_usd: number;
    price_grn: number;
  };
  quantity: number;
  price_usd: number;
}

export interface Order {
  id: number;
  firstName: string;
  lastName?: string;
  phone: string;
  delivery?: string;
  city?: string;
  npBranch?: string;
  payment?: string;
  callConfirm?: string;
  comment?: string;
  status: "Нове" | "В обробці" | "Завершено" | "Відмінено";
  created_at: string;
  items: OrderItem[];
}

// Отримати всі замовлення користувача (для USER) або всі замовлення (для ADMIN)
export const getOrders = async (): Promise<Order[]> => {
  const res = await api.get("/orders");
  return res.data;
};

// Отримати конкретне замовлення
export const getOrder = async (orderId: number): Promise<Order> => {
  const res = await api.get(`/orders/${orderId}`);
  return res.data;
};

// Створити замовлення
export const createOrder = async (data: {
  items: { productId: number; quantity: number }[];
  firstName: string;
  lastName?: string;
  phone: string;
  delivery?: string;
  city?: string;
  npBranch?: string;
  payment?: string;
  callConfirm?: string;
  comment?: string;
}): Promise<Order> => {
  const res = await api.post("/orders", data);
  return res.data;
};

// (Адмін) оновити статус замовлення
export const updateOrderStatus = async (orderId: number, status: string): Promise<Order> => {
  const res = await api.patch(`/orders/${orderId}/status`, { status });
  return res.data;
};