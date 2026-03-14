import { Outlet, NavLink } from "react-router-dom";
import { useState } from "react";
import CurrencyModal from "../../components/CurrencyModal";
import MinOrderModal from "../../components/MinOrderModal";
import { HiMenu, HiX } from "react-icons/hi";

const navItem =
  "px-4 py-2 rounded-md transition-all duration-200 text-sm font-medium";
const navActive =
  "bg-primary/20 text-white shadow-inner";
const navInactive =
  "text-gray-400 hover:text-white hover:bg-white/5";

export default function AdminLayout() {
  const [isCurrencyOpen, setCurrencyOpen] = useState(false);
  const [isMinOrderOpen, setMinOrderOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const navLinks = [
    ["/", "Головна"],
    ["/admin", "Дошка"],
    ["/admin/productsList", "Список товарів"],
    ["/admin/productsCreate", "Створити товар"],
    ["/admin/ordersList", "Список замовлень"],
    ["/admin/categoriesAdmin", "Керувати категоріями"],
    ["/admin/homeEdit", "Редагувати головну сторінку"],
  ] as const;

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-gray-100">
      {/* Mobile Header */}
      <div className="sm:hidden flex justify-between items-center p-4 bg-gray-900 text-white">
        <h1 className="text-lg font-semibold tracking-wide">Admin Panel</h1>
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-md bg-gray-800/50 hover:bg-gray-800/70 transition"
        >
          {isSidebarOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed sm:relative top-0 left-0 h-full sm:h-auto bg-gray-900 text-white 
          flex flex-col justify-between border-r border-white/10
          transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          transition-transform duration-300 sm:translate-x-0 w-64 z-50
        `}
      >
        <div className="p-6">
          <h1 className="hidden sm:block text-lg font-semibold tracking-wide mb-8">
            Admin Panel
          </h1>

          <nav className="flex flex-col gap-1">
            {navLinks.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `${navItem} ${isActive ? navActive : navInactive}`
                }
                onClick={() => setSidebarOpen(false)} // закриваємо на мобільних
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-white/10 space-y-3">
          <button
            onClick={() => setCurrencyOpen(true)}
            className="w-full py-2 rounded-md bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 transition"
          >
            Курс валюти
          </button>
          <button
            onClick={() => setMinOrderOpen(true)}
            className="w-full py-2 rounded-md bg-red-500/10 text-red-300 hover:bg-red-500/20 transition"
          >
            Мін. сума замовлення
          </button>
        </div>
      </aside>

      {/* Overlay для мобільного */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Content */}
      <main className="flex-1 p-4 sm:p-8 animate-fade-in">
        <Outlet />
      </main>

      <CurrencyModal isOpen={isCurrencyOpen} onClose={() => setCurrencyOpen(false)} />
      <MinOrderModal isOpen={isMinOrderOpen} onClose={() => setMinOrderOpen(false)} />
    </div>
  );
}
