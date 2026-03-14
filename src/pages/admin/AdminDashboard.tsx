import { useNavigate } from "react-router-dom";
import type { FC } from "react";

interface CardProps {
  title: string;
  onClick: () => void;
}

const Card: FC<CardProps> = ({ title, onClick }) => (
  <button
    onClick={onClick}
    className="
      group relative w-full p-6 rounded-xl bg-white shadow-sm
      hover:shadow-md transition-all duration-300
      border border-gray-200 hover:border-primary/40
      flex flex-col justify-between
    "
  >
    <div className="text-lg font-semibold text-gray-900 mb-2">
      {title}
    </div>
    <div className="text-sm text-gray-500 mt-auto">
      Перейти →
    </div>

    <span
      className="
        absolute inset-0 rounded-xl
        ring-1 ring-transparent
        group-hover:ring-primary/30
        transition
      "
    />
  </button>
);

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <h1 className="text-3xl font-semibold tracking-tight">
        Адмін панель
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <Card title="Список товарів" onClick={() => navigate("/admin/productsList")} />
        <Card title="Створити товар" onClick={() => navigate("/admin/productsCreate")} />
        <Card title="Список замовлень" onClick={() => navigate("/admin/ordersList")} />
        <Card title="Керування категоріями" onClick={() => navigate("/admin/categoriesAdmin")} />
        <Card title="Редагувати головну" onClick={() => navigate("/admin/homeEdit")} />
      </div>
    </div>
  );
}
