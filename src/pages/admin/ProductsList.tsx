import { useEffect, useState } from "react";
import { getProducts, deleteProduct, type Product } from "../../api/products";
import EditProductModal from "../../components/EditProductModal";
import ConfirmModal from "../../components/ConfirmModal";

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Для модалки редагування
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  // Для пошуку
  const [search, setSearch] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts({
        page: 1,
        limit: 1000,
        search
      });
      setProducts(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      setConfirmDelete(null);
    } catch (err) {
      console.error(err);
      alert("Помилка при видаленні товару");
    }
  };

  // Фільтруємо продукти по SKU
  const filteredProducts = products.filter(p =>
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Список товарів</h1>

      {/* Пошук */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          className="border rounded px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Знайти товар по SKU"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={() => {}}
        >
          Знайти
        </button>
      </div>

      {loading ? (
        <p>Завантаження...</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2 text-center">ID</th>
                <th className="border p-2">Фото</th>
                <th className="border p-2">SKU</th>
                <th className="border p-2">Категорія</th>
                <th className="border p-2">Підкатегорія</th>
                <th className="border p-2">Тип</th>
                <th className="border p-2">Ціна USD</th>
                <th className="border p-2">Ціна UAH</th>
                <th className="border p-2">Дії</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className={`
                      transition-colors
                      ${product.is_hidden
                        ? "bg-gray-100 text-gray-400"
                        : "hover:bg-gray-50"}
                    `}
                  >
                  <td className="border p-2 text-center">{product.id}</td>
                  <td className="border p-2">
                    <img
                      src={`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/images/products/${product.sku}.webp`}
                      alt={product.sku}
                      className="w-16 h-16 object-contain"
                      onError={(e) =>
                        (e.currentTarget.src = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/images/products/default.webp`)
                      }
                    />
                  </td>
                  <td className="border p-2">
                    <div className="flex items-center gap-2">
                      <span>{product.sku}</span>

                      {product.is_hidden && (
                        <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-600 font-semibold">
                          Прихований
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="border p-2">{product.category?.name}</td>
                  <td className="border p-2">{product.subcategory?.name || "-"}</td>
                  <td className="border p-2">{product.type?.name || "-"}</td>
                  <td className="border p-2">{product.price_usd}</td>
                  <td className="border p-2">{product.price_grn}</td>
                  <td className="border p-2 flex gap-2">
                    <button
                      className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition"
                      onClick={() => setEditingProduct(product)}
                    >
                      Редагувати
                    </button>
                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                      onClick={() => setConfirmDelete(product)}
                    >
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Модалки */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdated={() => {
            fetchProducts();
            setEditingProduct(null);
          }}
          // передаємо параметри в модалку
          initialParameters={editingProduct.parameters || []}
        />
      )}
      {confirmDelete && (
        <ConfirmModal
          title="Видалити товар?"
          message={`Ви точно хочете видалити товар "${confirmDelete.sku}"?`}
          onConfirm={() => handleDelete(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );

}

