import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import axios from "axios";

const NP_API_KEY = import.meta.env.NP_API;

interface NP_Area {
  Description: string;
  Ref: string;
}

interface NP_City {
  Description: string;
  Ref: string;
  Area: string;
  AreaRef: string;
}

export default function Checkout() {
  const { items, clearCart } = useCart();

  // Дані замовника
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [delivery, setDelivery] = useState("");
  const [payment, setPayment] = useState("");
  const [callConfirm, setCallConfirm] = useState("");
  const [comment, setComment] = useState("");

  // Міста і відділення
  const [areas, setAreas] = useState<NP_Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<NP_Area | null>(null);
  const [cityQuery, setCityQuery] = useState("");
  const [cities, setCities] = useState<NP_City[]>([]);
  const [selectedCity, setSelectedCity] = useState<NP_City | null>(null);
  const [branches, setBranches] = useState<string[]>([]);
  const [npBranch, setNpBranch] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // --- Розрахунок знижки ---
  const total = items.reduce((acc, i) => acc + i.price_grn * i.quantity, 0);
  const discounts = [
    { amount: 10000, percent: 12 },
    { amount: 5000, percent: 7 },
    { amount: 2000, percent: 3 },
  ].sort((a, b) => b.amount - a.amount);
  const currentDiscount = discounts.find(d => total >= d.amount)?.percent || 0;
  const discountAmount = Math.round(total * currentDiscount / 100);
  const discountedTotal = Math.round(total - discountAmount);
  const nextDiscount = discounts
    .filter(d => d.amount > total)
    .sort((a, b) => a.amount - b.amount)[0];
  const missingForNext = nextDiscount ? Math.round(nextDiscount.amount - total) : 0;

  // --- Завантаження областей ---
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await axios.post("https://api.novaposhta.ua/v2.0/json/", {
          apiKey: NP_API_KEY,
          modelName: "Address",
          calledMethod: "getAreas",
          methodProperties: {},
        });
        setAreas(res.data.data.map((a: any) => ({ Description: a.Description, Ref: a.Ref })));
      } catch (err) {
        console.error(err);
      }
    };
    fetchAreas();
  }, []);

  const fetchCities = async (query: string) => {
    if (!query || !selectedArea) return setCities([]);
    try {
      const res = await axios.post("https://api.novaposhta.ua/v2.0/json/", {
        apiKey: NP_API_KEY,
        modelName: "Address",
        calledMethod: "getCities",
        methodProperties: { FindByString: query, AreaRef: selectedArea.Ref },
      });
      setCities(
        res.data.data.map((c: any) => ({
          Description: c.Description,
          Ref: c.Ref,
          Area: c.AreaDescription,
          AreaRef: c.Area,
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBranches = async (cityRef: string) => {
    if (!cityRef) return setBranches([]);
    try {
      const res = await axios.post("https://api.novaposhta.ua/v2.0/json/", {
        apiKey: NP_API_KEY,
        modelName: "AddressGeneral",
        calledMethod: "getWarehouses",
        methodProperties: { CityRef: cityRef, TypeOfWarehouse: "Warehouse" },
      });
      setBranches(res.data.data.map((b: any) => b.Description));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCityQuery(value);
    setSelectedCity(null);
    setNpBranch("");
    if (value.length > 0) fetchCities(value);
  };

  const handleCitySelect = (city: NP_City) => {
    setSelectedCity(city);
    setCityQuery(city.Description);
    fetchBranches(city.Ref);
    setCities([]);
  };

  const submitOrder = async () => {
    if (!selectedArea) return setError("Виберіть область");
    if (!selectedCity) return setError("Виберіть місто");
    if (!npBranch) return setError("Виберіть відділення");
    if (!lastName.trim()) return setError("Прізвище обов'язкове");
    if (!firstName.trim()) return setError("Ім'я обов'язкове");
    if (!phone.trim()) return setError("Телефон обов'язковий");
    if (!delivery) return setError("Виберіть спосіб доставки");
    if (!payment) return setError("Виберіть спосіб оплати");
    if (!callConfirm) return setError("Вкажіть, чи потрібен дзвінок");
    if (items.length === 0) return setError("Кошик порожній");

    setLoading(true);
    setError("");

    try {
      await axios.post(`${API_URL}/orders`, {
        lastName,
        firstName,
        phone,
        delivery,
        area: selectedArea.Description,
        city: selectedCity.Description,
        npBranch,
        payment,
        callConfirm,
        comment,
        discount_percent: currentDiscount,
        total_after_discount: discountedTotal,
        items: items.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
          selectedParams: i.selectedParams || {},
        })),
      });

      clearCart();
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Помилка при оформленні замовлення");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {success ? (
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-green-700">Дякуємо за замовлення!</h1>
          <p className="mb-6">Ваше замовлення успішно оформлено.</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded transition"
          >
            Повернутися на головну
          </button>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-6">Оформлення замовлення</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Кошик */}
            <div className="border rounded-lg p-5 bg-white shadow-md space-y-4">
              <h2 className="text-lg font-semibold mb-2">Ваше замовлення</h2>
              {items.length === 0 ? (
                <p className="text-gray-500">Кошик порожній</p>
              ) : (
                items.map((i) => (
                  <div key={`${i.id}-${JSON.stringify(i.selectedParams)}`} className="flex items-center justify-between border-b pb-2 mb-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={`${API_URL}/images/products/${i.sku}.webp`}
                        alt={i.sku}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `${API_URL}/images/products/default.webp`;
                        }}
                      />
                      <div>
                        <div className="font-medium">{i.sku}</div>
                        {/* Вибрані параметри */}
                        {i.selectedParams && Object.keys(i.selectedParams).length > 0 && (
                          <div className="text-xs text-gray-500">
                            {Object.entries(i.selectedParams).map(([paramId, value]) => (
                              <span key={paramId}>Розмір: {value}{' '}</span>
                            ))}
                          </div>
                        )}
                        <div className="text-sm text-gray-500">{i.quantity} × {i.price_grn.toFixed(2)} ₴</div>
                      </div>
                    </div>
                    <div className="font-bold text-purple-700">{(i.quantity * i.price_grn).toFixed(2)} ₴</div>
                  </div>
                ))
              )}
              {items.length > 0 && (
                <div className="border-t pt-2 font-bold text-right text-lg space-y-1">
                  <div>Разом: {discountedTotal} ₴</div>
                  {currentDiscount > 0 && (
                    <div className="text-green-600 text-sm font-semibold">
                      Застосовано знижку {currentDiscount}%
                    </div>
                  )}
                  {nextDiscount && total < nextDiscount.amount && (
                    <div className="text-purple-700 text-sm font-semibold">
                      До знижки {nextDiscount.percent}% не вистачає {missingForNext} ₴
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Форма */}
            <div className="border rounded-lg p-5 bg-white shadow-md space-y-3">
              <h2 className="text-lg font-semibold mb-4">Контактні дані</h2>

              <label className="block font-semibold mb-1">Прізвище *</label>
              <input className="w-full border rounded p-2 mb-2" value={lastName} onChange={e => setLastName(e.target.value)} />

              <label className="block font-semibold mb-1">Ім'я *</label>
              <input className="w-full border rounded p-2 mb-2" value={firstName} onChange={e => setFirstName(e.target.value)} />

              <label className="block font-semibold mb-1">Телефон *</label>
              <input className="w-full border rounded p-2 mb-2" value={phone} onChange={e => setPhone(e.target.value)} />

              <label className="block font-semibold mb-1">Спосіб доставки *</label>
              <select className="w-full border rounded p-2 mb-2" value={delivery} onChange={e => setDelivery(e.target.value)}>
                <option value="">Виберіть спосіб доставки</option>
                <option value="nova_poshta">Нова Пошта</option>
              </select>

              <label className="block font-semibold mb-1">Область *</label>
              <select
                className="w-full border rounded p-2 mb-2"
                value={selectedArea?.Ref || ""}
                onChange={e => {
                  const area = areas.find(a => a.Ref === e.target.value) || null;
                  setSelectedArea(area);
                  setCityQuery("");
                  setSelectedCity(null);
                  setBranches([]);
                  setCities([]);
                }}
              >
                <option value="">Виберіть область</option>
                {areas.map(a => <option key={a.Ref} value={a.Ref}>{a.Description}</option>)}
              </select>

              <label className="block font-semibold mb-1">Місто *</label>
              <input
                className="w-full border rounded p-2 mb-2"
                value={cityQuery}
                onChange={handleCityChange}
                placeholder="Введіть місто..."
                disabled={!selectedArea}
              />
              {cities.length > 0 && (
                <ul className="border rounded max-h-40 overflow-auto mb-2">
                  {cities.map(c => (
                    <li
                      key={c.Ref}
                      className="p-2 hover:bg-purple-100 cursor-pointer transition"
                      onClick={() => handleCitySelect(c)}
                    >
                      {c.Description}
                    </li>
                  ))}
                </ul>
              )}

              <label className="block font-semibold mb-1">Відділення Нової Пошти *</label>
              <select className="w-full border rounded p-2 mb-2" value={npBranch} onChange={e => setNpBranch(e.target.value)} disabled={!selectedCity}>
                <option value="">Виберіть відділення</option>
                {branches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>

              <label className="block font-semibold mb-1">Спосіб оплати *</label>
              <select className="w-full border rounded p-2 mb-2" value={payment} onChange={e => setPayment(e.target.value)}>
                <option value="">Виберіть спосіб оплати</option>
                <option value="cash">Готівка</option>
                <option value="card">На карту</option>
              </select>

              <label className="block font-semibold mb-1">Чи потрібен дзвінок для підтвердження замовлення? *</label>
              <select className="w-full border rounded p-2 mb-2" value={callConfirm} onChange={e => setCallConfirm(e.target.value)}>
                <option value="">Виберіть</option>
                <option value="yes">Так</option>
                <option value="no">Ні</option>
              </select>

              <label className="block font-semibold mb-1">Коментар (не обов'язково)</label>
              <textarea className="w-full border rounded p-2 mb-2" rows={3} value={comment} onChange={e => setComment(e.target.value)} />

              {error && <div className="text-red-500 font-semibold mb-2">{error}</div>}

              <button
                onClick={submitOrder}
                disabled={loading || items.length === 0}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded transition font-semibold"
              >
                {loading ? "Оформляємо..." : "Підтвердити замовлення"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}