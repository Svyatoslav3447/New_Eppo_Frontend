import { useEffect, useState } from "react";
import { getProducts, type Product } from "../api/products";
import { useCart } from "../context/CartContext";
import { ProductCard } from "../components/ProductCard";
import { Pagination } from "../components/Pagination";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  const { addToCart } = useCart();

  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const changeQuantity = (id: number, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] ?? 1) + delta)
    }));
  };

  const setQuantity = (id: number, value: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: value
    }));
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const res = await getProducts(currentPage, itemsPerPage);

        setProducts(res.data);
        setTotalPages(res.totalPages);

      } catch (err) {
        console.error(err);
        setError("Не вдалося завантажити товари");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, itemsPerPage]);

  return (
    <div className="p-4 sm:p-8 bg-gradient-to-b from-purple-50 to-white min-h-screen">
      <h1 className="text-3xl sm:text-5xl font-extrabold mb-6 text-purple-700 tracking-tight drop-shadow-md">
        Наш товар
      </h1>

      {loading && (
        <p className="text-purple-600 font-medium animate-pulse">
          Завантаження...
        </p>
      )}

      {error && (
        <p className="text-red-500 font-medium">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products
          .filter(p => !p.is_hidden)
          .map(p => (
            <ProductCard
              key={p.id}
              product={p}
              quantity={quantities[p.id] ?? 1}
              changeQuantity={changeQuantity}
              setQuantity={setQuantity}
              addToCart={addToCart}
            />
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
