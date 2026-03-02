import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import { Pagination } from "../../components/Pagination";

export const OrderStatus = {
  PENDING: "Нове",
  PROCESSING: "В обробці",
  COMPLETED: "Завершено",
  CANCELLED: "Відмінено",
} as const;

type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

const paymentLabels: Record<string, string> = {
  card: "На карту",
  cash: "Накладений платіж",
};

interface OrderItem {
  quantity: number;
  price_usd: number | string;
}

interface Order {
  id: number;
  firstName: string;
  lastName?: string;
  phone: string;
  payment?: string;
  created_at: string;
  status: OrderStatus;
  comment?: string;
  items: OrderItem[];

  total_after_discount?: number;
  discount_percent?: number;
  remainingToNextDiscount?: number;
}

export default function OrdersList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [, setRate] = useState<number>(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ordersRes, rateRes] = await Promise.all([
          api.get<Order[]>("/orders"),
          api.get("/currency"),
        ]);

        // 🔹 Сортуємо останні замовлення зверху
        setOrders(
          ordersRes.data.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        );

        setRate(Number(rateRes.data.rate));
      } catch (err: any) {
        setError(err.response?.data?.message || "Помилка");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const totalPages = Math.ceil(orders.length / perPage);

  // відбираємо лише поточну сторінку
  const paginatedOrders = orders.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Замовлення</h1>

      {loading && <p>Завантаження...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
        <div className="flex justify-end mb-2 items-center gap-2">
          <label>Показувати по:</label>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <table className="min-w-full border-collapse border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-center">№</th>
              <th className="border p-2">Дата і час</th>
              <th className="border p-2">Прізвище</th>
              <th className="border p-2">Імʼя</th>
              <th className="border p-2">Сума</th>
              <th className="border p-2">Телефон</th>
              <th className="border p-2">Оплата</th>
              <th className="border p-2">Коментар</th>
              <th className="border p-2">Стан</th>
              <th className="border p-2 text-center">Дія</th>
            </tr>
          </thead>

<tbody className="bg-white">
  {paginatedOrders.map((order, i) => (
    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
      <td className="border p-2 text-center">{(currentPage - 1) * perPage + i + 1}</td>
      <td className="border p-2">{new Date(order.created_at).toLocaleString()}</td>
      <td className="border p-2">{order.lastName || "-"}</td>
      <td className="border p-2">{order.firstName}</td>
      <td className="border p-2 font-semibold text-gray-800">
        {Math.round(order.total_after_discount ?? 0)} ₴
        {order.discount_percent ? (
          <div className="text-xs text-gray-500">
            Застосовано знижку: {order.discount_percent}%
          </div>
        ) : null}
      </td>
      <td className="border p-2">{order.phone}</td>
      <td className="border p-2">
        {order.payment ? paymentLabels[order.payment] ?? order.payment : "-"}
      </td>
      <td className="border p-2">{order.comment || "-"}</td>
      <td className="border p-2">
        <span
          className={`px-2 py-1 rounded text-sm font-medium ${
            order.status === "Нове"
              ? "bg-yellow-100 text-yellow-800"
              : order.status === "В обробці"
              ? "bg-blue-100 text-blue-800"
              : order.status === "Завершено"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {order.status}
        </span>
      </td>
      <td className="border p-2 text-center">
        <button
          onClick={() => navigate(`/admin/orders/${order.id}`)}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
        >
          Деталі
        </button>
      </td>
    </tr>
  ))}
</tbody>
        </table>
      </div>
      {/* Пагінація */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
    </div>
  );
}