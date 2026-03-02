import { useState, useEffect } from "react";
import { api } from "../api/axios";
interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CurrencyModal({ isOpen, onClose }: Props) {
  const [rate, setRate] = useState<number>(1);
  const [, setNewRate] = useState<number>(1);
  const [inputValue, setInputValue] = useState<string>("1");

  // Отримати поточний курс при відкритті
    useEffect(() => {
    if (!isOpen) return;

    api.get("/currency")
        .then(res => {
        const r = res.data.rate; // беремо число з об’єкта
        setRate(r);
        setNewRate(r);
        setInputValue(r.toString());
        })
        .catch(err => {
        console.error("Не вдалося отримати курс:", err);
        alert("Помилка при отриманні курсу");
        });
    }, [isOpen]);

  const handleConfirm = async () => {
    const parsed = parseFloat(inputValue);
    if (isNaN(parsed) || parsed <= 0) {
      alert("Введіть правильний курс");
      return;
    }
    try {
      await api.patch("/currency", { rate: parsed });
      setRate(parsed);
      setNewRate(parsed);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Помилка при оновленні курсу");
    }
  };

  if (!isOpen) return null;

  return (
  <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 space-y-4">
      <h3 className="text-xl font-bold mb-2">Змінити курс валюти</h3>
      <p className="text-gray-700 mb-4">Поточний курс: <span className="font-semibold">{rate}</span></p>

      <input
        type="number"
        step="0.01"
        className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
      />

      <div className="flex justify-end gap-3 mt-2">
        <button
          className="px-4 py-2 border rounded hover:bg-gray-100 transition"
          onClick={onClose}
        >
          Відмінити
        </button>
        <button
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          onClick={handleConfirm}
        >
          Підтвердити
        </button>
      </div>
    </div>
  </div>
  );
}