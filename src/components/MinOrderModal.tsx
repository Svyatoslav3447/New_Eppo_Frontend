import { useEffect, useState } from "react";
import { api } from "../api/axios"; // правильно підключаємо свій axios

interface MinOrder {
  amount: number;
  message: string;
}

export default function MinOrderModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState(500);
  const [message, setMessage] = useState("Мінімальна сума замовлення — 500 ₴");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.get<MinOrder>("/min-order")
        .then((res) => {
          setAmount(res.data.amount);
          setMessage(res.data.message);
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const save = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await api.patch(
        "/min-order",
        { amount, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg space-y-4">
        <h2 className="text-xl font-bold">Мінімальна сума замовлення</h2>

        <div className="space-y-2">
          <label className="block font-medium">Сума</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <label className="block font-medium">Повідомлення</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100 transition"
          >
            Скасувати
          </button>
          <button
            onClick={save}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:opacity-50"
          >
            {loading ? "Зберігаємо..." : "Зберегти"}
          </button>
        </div>
      </div>
    </div>
  );
}
