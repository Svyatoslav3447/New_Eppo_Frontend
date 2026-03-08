import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api/axios";

export default function CartDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { items, removeFromCart, clearCart, updateQuantity, syncCart } = useCart();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const BASE_URL = import.meta.env.VITE_API_URL.replace(/\/api$/, ""); 
  const [minOrder, setMinOrder] = useState<{ amount: number; message: string }>({
    amount: 800,
    message: "Мінімальна сума замовлення — 800 ₴",
  });

  // 🔄 Синхронізація кошика при відкритті
  useEffect(() => {
    if (!isOpen) return;

    syncCart(); // отримуємо актуальні дані товарів

    axios
      .get("${API_URL}/min-order")
      .then((res) => setMinOrder(res.data))
      .catch(() => {}); // дефолтне значення
  }, [isOpen]);

  if (!isOpen) return null;

  // Розрахунок загальної суми тільки для доступних товарів
  const total = items
    .filter(i => !i.isUnavailable)
    .reduce((acc, i) => acc + i.price_grn * i.quantity, 0);

  const belowMin = total < minOrder.amount;

  const discounts = [
    { amount: 10000, percent: 12 },
    { amount: 5000, percent: 7 },
    { amount: 2000, percent: 3 },
  ];

  const currentDiscount = discounts.find(d => total >= d.amount)?.percent || 0;
  const nextDiscount = discounts
    .filter(d => d.amount > total)
    .sort((a, b) => a.amount - b.amount)[0];

  const discountedTotal = total * (1 - currentDiscount / 100);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 flex flex-col shadow-2xl transform transition-transform duration-300">
        {/* Header */}
        <div className="p-5 border-b flex justify-between items-center bg-purple-50">
          <h2 className="text-lg font-bold text-purple-700">Кошик</h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold text-gray-600 hover:text-red-500 transition"
          >
            ×
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 && (
            <p className="text-gray-400 text-center text-lg">Кошик порожній</p>
          )}

          {items.map((i) => (
            <div
              key={`${i.id}-${JSON.stringify(i.selectedParams)}`}
              className="flex gap-4 items-center p-3 rounded-lg shadow-sm hover:shadow-md transition bg-white border"
            >
              <img
                src={`${BASE_URL}/images/products/${i.sku}.webp`}
                alt={i.sku}
                className="w-16 h-16 object-cover rounded-lg border"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "${API_URL}/images/products/default.webp";
                }}
              />

              <div className="flex-1 flex flex-col justify-between h-full">
                <div className={`font-medium ${i.isUnavailable ? "text-red-500" : "text-purple-700"}`}>
                  {i.sku} {i.isUnavailable && "(товар відсутній)"}
                </div>

                {/* Показ параметрів */}
                {i.selectedParams && Object.keys(i.selectedParams).length > 0 && (
                  <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-1">
                    {Object.entries(i.selectedParams).map(([paramId, value]) => (
                      <span key={paramId} className="px-1 py-0.5 bg-gray-200 rounded">
                        Розмір: {value}
                      </span>
                    ))}
                  </div>
                )}

                <div className="text-sm text-gray-500">
                  {i.isUnavailable ? "-" : i.price_grn.toFixed(2) + " ₴"} / шт
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQuantity(i.id, i.quantity - 1, i.selectedParams)}
                    disabled={i.isUnavailable}
                    className="w-8 h-8 border rounded-lg flex items-center justify-center text-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-semibold">{i.quantity}</span>
                  <button
                    onClick={() => updateQuantity(i.id, i.quantity + 1, i.selectedParams)}
                    disabled={i.isUnavailable}
                    className="w-8 h-8 border rounded-lg flex items-center justify-center text-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-end justify-between h-full">
                <div className="font-bold text-purple-700">
                  {i.isUnavailable ? "-" : (i.price_grn * i.quantity).toFixed(2)} ₴
                </div>
                <button
                  onClick={() => removeFromCart(i.id, i.selectedParams)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Видалити
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-5 bg-purple-50 space-y-3">
            {/* Поточна знижка */}
            {currentDiscount > 0 && (
              <div className="text-green-600 text-sm font-semibold">
                Знижка {currentDiscount}% — економія {Math.round(total * currentDiscount / 100)} ₴
              </div>
            )}
            {/* Попередження про наступну знижку */}
            {nextDiscount && total < nextDiscount.amount && (
              <div className="text-purple-700 text-sm font-semibold">
                До знижки у {nextDiscount.percent}% — не вистачає {Math.round(nextDiscount.amount - total)} ₴
              </div>
            )}
            <div className="flex justify-between items-center font-bold text-lg text-purple-700">
              <span>Разом:</span>
              <span>{Math.round(discountedTotal)} ₴</span>
            </div>

            {belowMin && (
              <div className="text-red-500 text-sm font-semibold">{minOrder.message}</div>
            )}

            <button
              onClick={() => {
                if (!belowMin) {
                  onClose();
                  navigate("/checkout");
                }
              }}
              disabled={belowMin}
              className={`w-full py-3 rounded-lg text-white font-semibold transition ${
                belowMin ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
              }`}
            >
              Оформити замовлення
            </button>

            <button
              onClick={clearCart}
              className="w-full text-sm text-red-500 hover:underline transition"
            >
              Очистити кошик
            </button>
          </div>
        )}
      </div>
    </>
  );

}


