import { useEffect, useState, useRef } from "react";
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
  const printRef = useRef<HTMLDivElement>(null);

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

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

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
  
  const handlePrint = () => {
    if (!printRef.current || !order) return;
  
    const printWindow = window.open("", "_blank", "width=700,height=900");
    if (!printWindow) return;
  
    const html = `
      <html>
        <head>
          <title>Замовлення №${order.id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#333; margin:20px; }
            h1 { text-align:center; font-size:24px; margin-bottom:10px; }
            .customer-info p { margin:4px 0; font-size:14px; }
            table { width:100%; border-collapse:collapse; margin-top:10px; }
            th, td { border:1px solid #ccc; padding:6px 8px; font-size:13px; text-align:center; }
            th { background-color:#f5f5f5; font-weight:600; }
            tbody tr:nth-child(even){ background-color:#fafafa; }
            tfoot td { font-weight:bold; font-size:14px; }
            .discount { color:#d97706; }
            .total-after-discount { color:#16a34a; }
            img { width:50px; height:50px; object-fit:contain; }
          </style>
        </head>
        <body>
          <h1>Замовлення №${order.id}</h1>
          <div class="customer-info">
            <p><b>Імʼя:</b> ${order.firstName || "-"}</p>
            <p><b>Прізвище:</b> ${order.lastName || "-"}</p>
            <p><b>Телефон:</b> ${order.phone || "-"}</p>
            <p><b>Дата:</b> ${order.created_at ? new Date(order.created_at).toLocaleString() : "-"}</p>
            <p><b>Доставка:</b> ${order.delivery ? deliveryLabels[order.delivery] ?? order.delivery : "-"}</p>
            <p><b>Місто:</b> ${order.city || "-"}</p>
            <p><b>Відділення:</b> ${order.npBranch || "-"}</p>
            <p><b>Оплата:</b> ${order.payment ? paymentLabels[order.payment] ?? order.payment : "-"}</p>
            <p><b>Підтвердження дзвінком:</b> ${order.callConfirm ? callConfirmLabels[order.callConfirm] ?? order.callConfirm : "-"}</p>
            <p><b>Коментар:</b></p>
            <div style="
              border:1px solid #ccc;
              padding:8px;
              margin-top:4px;
              max-width:600px;
              word-break:break-word;
              white-space:pre-wrap;
              background:#fafafa;
            ">
              ${order.comment || "-"}
            </div>
          </div>
  
          <table>
            <thead>
              <tr>
                <th>№</th>
                <th>Фото</th>
                <th>Артикул</th>
                <th>Параметри</th>
                <th>К-сть</th>
                <th>Ціна (грн)</th>
                <th>Сума (грн)</th>
              </tr>
            </thead>
            <tbody>
              ${groupedItems.map(({ item, paramCounts }, i) => {
                const totalQty = Object.values(paramCounts).reduce((a,b)=>a+b,0);
                const priceUAH = (Number(item.price_usd) * rate).toFixed(2);
                const sumUAH = (Number(item.price_usd) * totalQty * rate).toFixed(2);
                const params = Object.entries(paramCounts)
                  .filter(([k]) => k)
                  .map(([k,v]) => `${k} - ${v} шт.`)
                  .join(", ") || "-";
  
                const imgSrc = `${BASE_URL}/images/products/${item.product.sku}.webp`;
  
                return `
                  <tr>
                    <td>${i+1}</td>
                    <td><img src="${imgSrc}" onerror="this.src='${BASE_URL}/images/products/default.webp'"/></td>
                    <td>${item.product.sku}</td>
                    <td>${params}</td>
                    <td>${totalQty}</td>
                    <td>${priceUAH}</td>
                    <td>${sumUAH}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" style="text-align:right;">Разом:</td>
                <td>${(totalUSD * rate).toFixed(2)}</td>
              </tr>
              ${discountPercent > 0 ? `
                <tr class="discount">
                  <td colspan="6" style="text-align:right;">Знижка (${discountPercent}%):</td>
                  <td>- ${((totalUSD - totalAfterDiscountUSD) * rate).toFixed(2)}</td>
                </tr>
                <tr class="total-after-discount">
                  <td colspan="6" style="text-align:right;">Разом після знижки:</td>
                  <td>${(totalAfterDiscountUSD * rate).toFixed(2)}</td>
                </tr>
              ` : ""}
            </tfoot>
          </table>
        </body>
      </html>
    `;
  
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
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

  const groupedItems = Object.values(
    order.items.reduce<
      Record<
        string,
        {
          item: OrderItem;
          paramCounts: Record<string, number>;
        }
      >
    >((acc, item) => {
      if (!acc[item.product.sku]) acc[item.product.sku] = { item, paramCounts: {} };

      if (item.selectedParams && Object.keys(item.selectedParams).length > 0) {
        Object.entries(item.selectedParams).forEach(([paramId, value]) => {
          const paramName = item.selectedParamsNames?.[paramId] ?? `Параметр ${paramId}`;
          const key = `${paramName}: ${value}`;
          acc[item.product.sku].paramCounts[key] = (acc[item.product.sku].paramCounts[key] || 0) + item.quantity;
        });
      } else {
        acc[item.product.sku].paramCounts[""] = (acc[item.product.sku].paramCounts[""] || 0) + item.quantity;
      }

      return acc;
    }, {})
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Кнопки Назад і Друк */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline"
        >
          ← Назад
        </button>
        <button
          onClick={handlePrint}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Друк
        </button>
      </div>

      {/* Весь контент для друку */}
      <div ref={printRef}>
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
          {order.comment && (
            <div className="max-w-[500px]">
              <b>Коментар:</b>
              <div className="mt-1 max-h-32 overflow-y-auto break-words whitespace-pre-wrap text-gray-700 border rounded p-2 bg-gray-50">
                {order.comment}
              </div>
            </div>
          )}
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

        {/* Товари */}
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
                  src={`${BASE_URL}/images/products/${item.product.sku}.webp`}
                  alt={item.product.sku}
                  className="w-full h-40 object-contain mb-2"
                  onError={(e) =>
                    (e.currentTarget.src = `${BASE_URL}/images/products/default.webp`)
                  }
                />
                <div className="flex-1 space-y-1 text-sm">
                  <p><b>Артикул:</b> {item.product.sku}</p>
                  <p><b>Ціна:</b> {priceUSD.toFixed(2)} USD / {priceUAH.toFixed(2)} грн</p>
                  <p><b>Сума:</b> {sumUSD.toFixed(2)} USD / {sumUAH.toFixed(2)} грн</p>
                  {Object.entries(paramCounts).filter(([k]) => k).length > 0 && (
                    <div className="mt-1">
                      <b>Вибрані параметри:</b>
                      <ul className="list-disc list-inside text-gray-600">
                        {Object.entries(paramCounts)
                          .filter(([paramWithName]) => paramWithName)
                          .map(([paramWithName, qty], idx) => (
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
                        src={`${BASE_URL}/images/products/${item.product.sku}.webp`}
                        alt={item.product.sku}
                        className="w-16 h-16 object-contain"
                        onError={(e) =>
                          (e.currentTarget.src = `${BASE_URL}/images/products/default.webp`)
                        }
                      />
                    </td>
                    <td className="border p-2">{item.product.sku}</td>
                    <td className="border p-2">
                      <ul className="list-disc list-inside text-gray-600">
                        {Object.entries(paramCounts)
                          .filter(([paramWithName]) => paramWithName)
                          .map(([paramWithName, qty], idx) => (
                            <li key={idx}>{paramWithName} - {qty} шт.</li>
                        ))}
                      </ul>
                    </td>
                    <td className="border p-2">{totalQty}</td>
                    <td className="border p-2">{priceUAH.toFixed(2)}</td>
                    <td className="border p-2">{sumUAH.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="font-bold">
                <td colSpan={6} className="border p-2 text-right">Разом:</td>
                <td className="border p-2">{totalUAH.toFixed(2)}</td>
              </tr>
              {discountPercent > 0 && (
                <>
                  <tr className="font-bold text-yellow-700">
                    <td colSpan={6} className="border p-2 text-right">Знижка ({discountPercent}%):</td>
                    <td className="border p-2">
                      - {(totalUAH - totalAfterDiscountUSD).toFixed(2)}
                    </td>
                  </tr>
                  <tr className="font-bold text-green-800">
                    <td colSpan={6} className="border p-2 text-right">Разом після знижки:</td>
                    <td className="border p-2">{totalAfterDiscountUSD.toFixed(2)}</td>
                  </tr>
                </>
              )}
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
