import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios"; // ваш axios з базовим URL з .env

type Category = {
  id: number;
  name: string;
};

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.get<Category[]>("/categories")
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  return (
    <footer className="mt-20 bg-gradient-to-b from-gray-900 to-black text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-14">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Про магазин */}
          <div>
            <h3 className="text-white text-xl font-bold mb-4 tracking-wide">
              EPPO
            </h3>
            <p className="text-sm leading-relaxed text-gray-400">
              Стильна жіноча та чоловіча біжутерія.
              Опт та роздріб по всій Україні.
            </p>

            <p className="mt-3 text-sm text-gray-500">
              Івано-Франківськ
            </p>
          </div>

          {/* Категорії */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              Категорії
            </h3>

            {categories.length === 0 ? (
              <p className="text-sm text-gray-500">
                Завантаження…
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {categories.map(cat => (
                  <li key={cat.id}>
                    <Link
                      to={`/products?category=${cat.id}`}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Контакти */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              Контакти
            </h3>

            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                Vodafone:
                <a
                  href="tel:+380996247225"
                  className="ml-2 hover:text-white transition"
                >
                  +38 099 624 72 25
                </a>
              </li>
              <li>
                Київстар:
                <a
                  href="tel:+380682128618"
                  className="ml-2 hover:text-white transition"
                >
                  +38 068 212 86 18
                </a>
              </li>
              <li>
                Київстар:
                <a
                  href="tel:+380682516511"
                  className="ml-2 hover:text-white transition"
                >
                  +38 068 251 65 11
                </a>
              </li>
              <li>
                Email:
                <a
                  href="mailto:eppo.market@gmail.com"
                  className="ml-2 hover:text-white transition"
                >
                  eppo.market@gmail.com
                </a>
              </li>
            </ul>

            <div className="mt-4 text-sm text-gray-500">
              <p>Пн–Пт: 9:00 – 16:00</p>
              <p>Сб, Нд — вихідні</p>
            </div>
          </div>

        </div>

        {/* нижня лінія */}
        <div className="mt-12 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} EPPO. Всі права захищені.
        </div>

      </div>
    </footer>
  );
}
