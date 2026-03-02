import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartModal from "./CartModal";
import { api } from "../api/axios";
import { motion } from "framer-motion";
import {
  HiOutlineShoppingCart,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineSearch,
  HiOutlineUser,
} from "react-icons/hi";

interface User {
  id: number;
  phone: string;
  role: "USER" | "ADMIN";
  firstName?: string;
  lastName?: string;
}

export default function Header() {
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { items } = useCart();

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return setUser(null);
    try {
      const res = await api.get<User>("/users/me");
      setUser(res.data);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
    window.addEventListener("auth-change", fetchUser);
    return () => window.removeEventListener("auth-change", fetchUser);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search)}`);
      setSearch("");
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.dispatchEvent(new Event("auth-change"));
    navigate("/");
  };

  const navLinks = [
    { name: "Товари", path: "/products" },
    { name: "Про нас", path: "/about" },
    { name: "Контакти", path: "/contacts" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between h-16">

        {/* Логотип */}
        <Link to="/" className="text-2xl font-bold text-purple-900">
          Eppo
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex md:items-center md:space-x-8 flex-1 justify-center">
          {navLinks.map(link => (
            <motion.div key={link.name} whileHover={{ scale: 1.05 }}>
              <Link
                to={link.path}
                className="text-gray-800 font-medium hover:text-purple-700 transition-colors duration-300"
              >
                {link.name}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Right Icons Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          <motion.button
            onClick={() => setSearchOpen(v => !v)}
            className="p-2 rounded-full hover:bg-purple-100 transition-colors"
            whileHover={{ scale: 1.1 }}
          >
            <HiOutlineSearch size={20} />
          </motion.button>

          {user ? (
            <>
              {user.role === "ADMIN" && (
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link
                    to="/admin"
                    className="text-red-500 font-semibold hover:text-red-600 transition-colors"
                  >
                    ADMIN
                  </Link>
                </motion.div>
              )}

              <Link
                to="/profile"
                className="p-2 rounded-full hover:bg-purple-100 transition-colors flex items-center space-x-1"
              >
                <HiOutlineUser size={20} />
                <span>{user.firstName || "Кабінет"}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-red-500 px-3 py-1 rounded-full hover:bg-red-50 transition-colors"
              >
                Вийти
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="p-2 rounded-full hover:bg-purple-100 transition-colors"
            >
              Вхід
            </Link>
          )}

          <motion.button
            onClick={() => setCartOpen(true)}
            className="relative p-2 rounded-full hover:bg-purple-100 transition-colors"
            whileHover={{ scale: 1.1 }}
          >
            <HiOutlineShoppingCart size={20} />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 w-5 h-5 text-xs rounded-full flex items-center justify-center text-white">
                {items.length}
              </span>
            )}
          </motion.button>
        </div>

        {/* Mobile Icons */}
        <div className="flex md:hidden items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(v => !v)}
            className="text-gray-800 text-2xl"
          >
            {mobileMenuOpen ? <HiOutlineX size={28} /> : <HiOutlineMenu size={28} />}
          </button>

          <button
            onClick={() => setSearchOpen(v => !v)}
            className="p-2 rounded-full hover:bg-purple-100 transition-colors"
          >
            <HiOutlineSearch size={20} />
          </button>

          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2 rounded-full hover:bg-purple-100 transition-colors"
          >
            <HiOutlineShoppingCart size={20} />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 w-5 h-5 text-xs rounded-full flex items-center justify-center text-white">
                {items.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-16 left-0 w-full bg-white z-50 p-4 shadow-md"
        >
          <form onSubmit={handleSearch} className="relative w-full">
            <HiOutlineSearch className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Пошук товарів..."
              className="w-full pl-10 pr-3 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm"
              autoFocus
            />
          </form>
        </motion.div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="md:hidden bg-white shadow-lg p-4 space-y-2 z-40"
        >
          {navLinks.map(link => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-800 font-medium hover:text-purple-700 py-2 transition-colors duration-300"
            >
              {link.name}
            </Link>
          ))}

          {/* Admin + Profile */}
          {user && (
            <>
              {user.role === "ADMIN" && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-red-500 font-semibold py-2 hover:text-red-600 transition-colors"
                >
                  ADMIN
                </Link>
              )}
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-800 py-2 hover:text-purple-700 transition-colors"
              >
                👤 {user.firstName || "Кабінет"}
              </Link>
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="block text-left text-red-500 py-2"
              >
                Вийти
              </button>
            </>
          )}

          {!user && (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-800 font-medium hover:text-purple-700 py-2 transition-colors duration-300"
            >
              Вхід
            </Link>
          )}
        </motion.div>
      )}

      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}