import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { getOrders } from "../api/orders";
import { getCurrencyRate } from "../api/currency";

interface UserProfile {
  firstName: string;
  lastName?: string;
  phone: string;
}

interface OrderItem {
  id: number;
  product: {
    sku: string;
    price_usd: number;
    price_grn: number;
  };
  quantity: number;
}

interface Order {
  id: number;
  created_at: string;
  status: string;
  items: OrderItem[];
  total_grn?: number;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

export default function Profile() {
  const [user, setUser] = useState<UserProfile>({ firstName: "", lastName: "", phone: "" });
  const [editing, setEditing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  useEffect(() => {
    let rate = 1;

    getCurrencyRate().then(r => {
      rate = r.rate || 1;

      api.get("/users/me").then(res => setUser(res.data));

      getOrders()
        .then(res => {
          const ordersWithGrn = res.map((order: any) => {
            const itemsWithGrn = order.items.map((i: any) => ({
              ...i,
              product: {
                ...i.product,
                price_grn: Math.round((i.price_usd ?? 0) * rate),
              },
            }));
            const total_grn = itemsWithGrn.reduce((sum: number, i: OrderItem) => {
              return sum + (i.product.price_grn ?? 0) * i.quantity;
            }, 0);
            return { ...order, items: itemsWithGrn, total_grn };
          });
          setOrders(ordersWithGrn);
        })
        .finally(() => setLoadingOrders(false));
    });
  }, []);

  const saveProfile = async () => {
    try {
      await api.patch("/users/me", user);
      setEditing(false);
      showToast("Дані збережено!", "success");
    } catch (err) {
      console.error(err);
      showToast("Помилка при збереженні даних", "error");
    }
  };

  const changePassword = async () => {
    try {
      await api.patch("/users/me/password", { oldPassword: password, newPassword });
      setPassword("");
      setNewPassword("");
      showToast("Пароль змінено!", "success");
    } catch (err) {
      console.error(err);
      showToast("Помилка при зміні пароля", "error");
    }
  };

  return (
    <div className="p-6 sm:p-12 max-w-5xl mx-auto space-y-10 relative">
      <h1 className="text-3xl sm:text-5xl font-extrabold text-purple-700 text-center drop-shadow-md mb-6">
        Особистий кабінет
      </h1>

      {/* Toasts */}
      <div className="fixed top-6 right-6 space-y-2 z-50">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`px-4 py-2 rounded shadow-md text-white font-medium transition ${
              t.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* Дані користувача */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-purple-700">Ваші дані</h2>
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1 space-y-3">
            <label className="font-medium text-gray-700">Ім’я</label>
            <input
              type="text"
              value={user.firstName}
              disabled={!editing}
              onChange={e => setUser(prev => ({ ...prev, firstName: e.target.value }))}
              className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition"
            />
            <label className="font-medium text-gray-700">Прізвище</label>
            <input
              type="text"
              value={user.lastName || ""}
              disabled={!editing}
              onChange={e => setUser(prev => ({ ...prev, lastName: e.target.value }))}
              className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition"
            />
            <label className="font-medium text-gray-700">Телефон</label>
            <input
              type="text"
              value={user.phone}
              disabled={!editing}
              onChange={e => setUser(prev => ({ ...prev, phone: e.target.value }))}
              className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition"
            />
          </div>
          <div className="flex flex-col gap-3 justify-start">
            {editing ? (
              <>
                <button onClick={saveProfile} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">
                  Зберегти
                </button>
                <button onClick={() => setEditing(false)} className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                  Відміна
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
                Редагувати
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Зміна пароля */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-purple-700">Змінити пароль</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="password"
            placeholder="Старий пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition"
          />
          <input
            type="password"
            placeholder="Новий пароль"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition"
          />
          <button onClick={changePassword} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition">
            Змінити пароль
          </button>
        </div>
      </div>

      {/* Історія замовлень */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-purple-700">Історія замовлень</h2>
        {loadingOrders ? (
          <p className="text-purple-600 animate-pulse">Завантаження...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-500">Замовлень ще немає</p>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="border rounded-lg p-4 space-y-2 hover:shadow-md transition">
                <div className="flex flex-col sm:flex-row justify-between text-gray-700 font-medium">
                  <span>Номер замовлення: <strong>{order.id}</strong></span>
                  <span>Дата: <strong>{new Date(order.created_at).toLocaleDateString()}</strong></span>
                  <span>Статус: <strong>{order.status}</strong></span>
                </div>

                <div className="space-y-1 mt-2">
                  {order.items.map(i => (
                    <div key={i.id} className="flex justify-between text-gray-600">
                      <span>{i.product.sku}</span>
                      <span>{i.quantity} × {i.product.price_grn} ₴</span>
                    </div>
                  ))}
                </div>

                <div className="text-right font-bold text-gray-800">
                  Сума: {order.total_grn} ₴
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}