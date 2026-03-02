import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import axios from "axios";

export interface CartItem {
  id: number;
  sku: string;
  price_grn: number;
  quantity: number;
  selectedParams?: Record<number, string>; // додаємо
  isUnavailable?: boolean;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number, selectedParams?: Record<number, string>) => void;
  updateQuantity: (id: number, quantity: number, selectedParams?: Record<number, string>) => void;
  clearCart: () => void;
  syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });

  // Зберігаємо кошик у localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (item: CartItem) => {
    setItems(prev => {
      const existIndex = prev.findIndex(i => {
        if (!i.selectedParams && !item.selectedParams) return i.id === item.id;
        if (i.selectedParams && item.selectedParams)
          return i.id === item.id && JSON.stringify(i.selectedParams) === JSON.stringify(item.selectedParams);
        return false;
      });

      if (existIndex >= 0) {
        const updated = [...prev];
        updated[existIndex].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: number, selectedParams?: Record<number, string>) => {
    setItems(prev =>
      prev.filter(i => {
        if (!i.selectedParams && !selectedParams) return i.id !== id;
        if (i.selectedParams && selectedParams)
          return !(i.id === id && JSON.stringify(i.selectedParams) === JSON.stringify(selectedParams));
        return true;
      })
    );
  };

  const updateQuantity = (id: number, quantity: number, selectedParams?: Record<number, string>) => {
    setItems(prev =>
      prev
        .map(i => {
          if (!i.selectedParams && !selectedParams && i.id === id) return { ...i, quantity };
          if (i.selectedParams && selectedParams && i.id === id && JSON.stringify(i.selectedParams) === JSON.stringify(selectedParams))
            return { ...i, quantity };
          return i;
        })
        .filter(i => i.quantity > 0)
    );
  };

  const clearCart = () => setItems([]);

  // 🔄 Синхронізація кошика з сервером через SSE
  const syncCart = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      const products: any[] = res.data;

      setItems(prev =>
        prev.map(item => {
          const product = products.find(p => p.id === item.id);
          if (!product || product.is_hidden) {
            // Товар відсутній
            return { ...item, isUnavailable: true };
          }
          // Товар доступний
          return { ...item, price_grn: product.price_grn, sku: product.sku, isUnavailable: false };
        })
      );
    } catch (err) {
      console.error("Sync failed", err);
    }
  };

  // SSE для миттєвого оновлення
  useEffect(() => {
    const evtSource = new EventSource(`${API_URL}/products/updates/stream`);

    evtSource.onmessage = (event) => {
      const updatedProduct = JSON.parse(event.data);
      setItems(prev =>
        prev.map(i => {
          if (i.id === updatedProduct.id) {
            if (updatedProduct.is_hidden) return { ...i, isUnavailable: true };
            return { ...i, price_grn: updatedProduct.price_grn, sku: updatedProduct.sku, isUnavailable: false };
          }
          return i;
        })
      );
    };

    evtSource.onerror = (err) => {
      console.error("SSE error:", err);
      evtSource.close();
    };

    return () => evtSource.close();
  }, []);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, clearCart, updateQuantity, syncCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};