import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api/axios";

export const OrderStatus = {
  PENDING: "Нове",
  PROCESSING: "В обробці",
  COMPLETED: "Завершено",
  CANCELLED: "Відмінено",
} as const;

type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

interface OrderItem {
  id: number;
  product: { id: number; name: string; sku: string };
  quantity: number;
  price_usd: number | string;
  selectedParams?: Record<number, string>;
  selectedParamsNames?: Record<string, string>;
}

interface Order {
  id: number;
  firstName: string;
  lastName?: string;
  phone: string;
  created_at: string;
  status: OrderStatus;
  comment?: string;
  delivery?: string;
  city?: string;
  npBranch?: string;
  payment?: string;
  callConfirm?: string;
  discount_percent?: number; 
  total_after_discount?: number;
  items: OrderItem[];
}

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const paymentLabels: Record<string, string> = {
    card: "На карту",
    cash: "Накладений платіж",
  };
  const deliveryLabels: Record<string, string> = {
    nova_poshta: "Нова Пошта",
  };
  const callConfirmLabels: Record<string, string> = {
    yes: "Так",
    no: "Ні",
  };
  const [order, setOrder] = useState<Order | null>(null);
  const [rate, setRate] = useState<number>(1);
  const [status, setStatus] = useState<OrderStatus>("Нове");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [orderRes, rateRes] = await Promise.all([
          api.get(`/orders/${id}`),
          api.get(`/currency`),
        ]);
        setOrder(orderRes.data);
        setStatus(orderRes.data.status);
        setRate(Number(rateRes.data.rate));
      } catch (err: any) {
        setError(err.response?.data?.message || "Помилка завантаження");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const changeStatus = async (newStatus: OrderStatus) => {
    try {
      await api.patch(`/orders/${id}/status`, { status: newStatus });
      setStatus(newStatus);
    } catch {
      alert("Не вдалося змінити статус");
    }
  };

  if (loading) return <p className="p-6">Завантаження...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!order) return null;

  const totalUSD = order.items.reduce(
    (sum, i) => sum + Number(i.price_usd) * i.quantity,
    0
  );
  const totalUAH = totalUSD * rate;

  const discountPercent = Number(order.discount_percent ?? 0);
  const totalAfterDiscountUSD = Number(order.total_after_discount ?? totalUSD);
  const totalAfterDiscountUAH = totalAfterDiscountUSD;

  // ------------------------
  // Групування товарів за SKU з підрахунком кожного значення параметра
  // ------------------------
  const groupedItems = Object.values(
    order.items.reduce<
      Record<
        string,
        {
          item: OrderItem;
          paramCounts: Record<string, number>; // "Розмір: 15" → кількість
        }
      >
    >((acc, item) => {
      if (!acc[item.product.sku]) acc[item.product.sku] = { item, paramCounts: {} };

      if (item.selectedParams && Object.keys(item.selectedParams).length > 0) {
        Object.entries(item.selectedParams).forEach(([paramId, value]) => {
          const paramName = item.selectedParamsNames?.[paramId] ?? `Параметр ${paramId}`;
          const key = `${paramName}: ${value}`;
          if (!acc[item.product.sku].paramCounts[key]) {
            acc[item.product.sku].paramCounts[key] = item.quantity;
          } else {
            acc[item.product.sku].paramCounts[key] += item.quantity;
          }
        });
      } else {
        // Товари без параметрів
        if (!acc[item.product.sku].paramCounts["Без параметрів"]) {
          acc[item.product.sku].paramCounts["Без параметрів"] = item.quantity;
        } else {
          acc[item.product.sku].paramCounts["Без параметрів"] += item.quantity;
        }
      }

      return acc;
    }, {})
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 hover:underline mb-4"
      >
        ← Назад
      </button>

      <h1 className="text-2xl font-bold mb-4">Замовлення №{order.id}</h1>

      {/* Інформація про замовника */}
      <div className="border rounded p-4 space-y-2 bg-white shadow-sm">
        <p><b>Імʼя:</b> {order.firstName || "-"}</p>
        <p><b>Прізвище:</b> {order.lastName || "-"}</p>
        <p><b>Телефон:</b> {order.phone || "-"}</p>
        <p><b>Дата:</b> {new Date(order.created_at).toLocaleString()}</p>
        <p><b>Спосіб доставки:</b> {order.delivery ? deliveryLabels[order.delivery] ?? order.delivery : "-"}</p>
        <p><b>Місто:</b> {order.city || "-"}</p>
        <p><b>Відділення Нової Пошти:</b> {order.npBranch || "-"}</p>
        <p><b>Спосіб оплати:</b> {order.payment ? paymentLabels[order.payment] ?? order.payment : "-"}</p>
        <p><b>Підтвердження дзвінком:</b> {order.callConfirm ? callConfirmLabels[order.callConfirm] ?? order.callConfirm : "-"}</p>
        <p><b>Коментар:</b> {order.comment || "-"}</p>
        <div className="flex items-center gap-2">
          <b>Статус:</b>
          <select
            value={status}
            onChange={(e) => changeStatus(e.target.value as OrderStatus)}
            className="border px-2 py-1 rounded"
          >
            {Object.values(OrderStatus).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Товари для мобільного */}
      <div className="space-y-4 sm:hidden">
        {groupedItems.map(({ item, paramCounts }) => {
          const priceUSD = Number(item.price_usd);
          const priceUAH = priceUSD * rate;
          const totalQty = Object.values(paramCounts).reduce((a,b)=>a+b,0);
          const sumUSD = priceUSD * totalQty;
          const sumUAH = sumUSD * rate;

          return (
            <div key={item.id} className="border rounded p-4 flex flex-col sm:flex-row items-start gap-2 bg-white shadow-sm">
              <img
                src={`${API_URL}/images/products/${item.product.sku}.webp`}
                alt={item.product.sku}
                className="w-full h-40 object-contain mb-2"
                onError={(e) =>
                  (e.currentTarget.src = `${API_URL}/images/products/default.webp`)
                }
              />
              <div className="flex-1 space-y-1 text-sm">
                <p><b>Артикул:</b> {item.product.sku}</p>
                <p><b>Ціна:</b> {priceUSD.toFixed(2)} USD / {priceUAH.toFixed(2)} грн</p>
                <p><b>Сума:</b> {sumUSD.toFixed(2)} USD / {sumUAH.toFixed(2)} грн</p>
                {Object.keys(paramCounts).length > 0 && (
                  <div className="mt-1">
                    <b>Вибрані параметри:</b>
                    <ul className="list-disc list-inside text-gray-600">
                      {Object.entries(paramCounts).map(([paramWithName, qty], idx) => (
                        <li key={idx}>{paramWithName} - {qty} шт.</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Таблиця для десктопу */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">№</th>
              <th className="border p-2">Фото</th>
              <th className="border p-2">Артикул</th>
              <th className="border p-2">Параметри</th>
              <th className="border p-2">К-сть</th>
              <th className="border p-2">Ціна (USD / грн)</th>
              <th className="border p-2">Сума (USD / грн)</th>
            </tr>
          </thead>
          <tbody>
            {groupedItems.map(({ item, paramCounts }, i) => {
              const priceUSD = Number(item.price_usd);
              const priceUAH = priceUSD * rate;
              const totalQty = Object.values(paramCounts).reduce((a,b)=>a+b,0);
              const sumUSD = priceUSD * totalQty;
              const sumUAH = sumUSD * rate;
              return (
                <tr key={item.id}>
                  <td className="border p-2">{i + 1}</td>
                  <td className="border p-2">
                    <img
                      src={`${API_URL}/images/products/${item.product.sku}.webp`}
                      alt={item.product.sku}
                      className="w-16 h-16 object-contain"
                      onError={(e) =>
                        (e.currentTarget.src = `${API_URL}/images/products/default.webp`)
                      }
                    />
                  </td>
                  <td className="border p-2">{item.product.sku}</td>
                  <td className="border p-2">
                    <ul className="list-disc list-inside text-gray-600">
                      {Object.entries(paramCounts).map(([paramWithName, qty], idx) => (
                        <li key={idx}>{paramWithName} - {qty} шт.</li>
                      ))}
                    </ul>
                  </td>
                  <td className="border p-2">{totalQty}</td>
                  <td className="border p-2">{priceUSD.toFixed(2)} / {priceUAH.toFixed(2)}</td>
                  <td className="border p-2">{sumUSD.toFixed(2)} / {sumUAH.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td colSpan={6} className="border p-2 text-right">Разом:</td>
              <td className="border p-2">{totalUSD.toFixed(2)} / {totalUAH.toFixed(2)}</td>
            </tr>
            {discountPercent > 0 && (
              <>
                <tr className="font-bold text-yellow-700">
                  <td colSpan={6} className="border p-2 text-right">Знижка ({discountPercent}%):</td>
                  <td className="border p-2">- {((totalUAH - totalAfterDiscountUAH) / rate).toFixed(2)} / - {((totalUAH - totalAfterDiscountUAH)).toFixed(2)}</td>
                </tr>
                <tr className="font-bold text-green-800">
                  <td colSpan={6} className="border p-2 text-right">Разом після знижки:</td>
                  <td className="border p-2">{(totalAfterDiscountUSD / rate).toFixed(2)} / {totalAfterDiscountUAH.toFixed(2)}</td>
                </tr>
              </>
            )}
          </tfoot>
        </table>
      </div>
    </div>
  );
}
