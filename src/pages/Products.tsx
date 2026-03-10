import { useEffect, useState } from "react";
import { getProducts, type Product } from "../api/products";
import { useCart } from "../context/CartContext";
import { Filters } from "../components/Filters";
import { ProductCard } from "../components/ProductCard";
import { Pagination } from "../components/Pagination";
import { useSearchParams } from "react-router-dom";

export default function Products() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const [itemsPerPage, setItemsPerPage] = useState(Number(searchParams.get("limit")) || 8);
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "");
  const [subcategoryFilter, setSubcategoryFilter] = useState(searchParams.get("subcategory") || "");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "");
  const [sort, setSort] = useState<any>(searchParams.get("sort") || "default");
  const { addToCart } = useCart();
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [categoriesData, setCategoriesData] = useState<any[]>([]);  
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  useEffect(() => {
    const params: any = {};
  
    if (currentPage !== 1) params.page = currentPage;
    if (itemsPerPage !== 8) params.limit = itemsPerPage;
    if (categoryFilter) params.category = categoryFilter;
    if (subcategoryFilter) params.subcategory = subcategoryFilter;
    if (typeFilter) params.type = typeFilter;
    if (sort !== "default") params.sort = sort;
    if (searchQuery) params.search = searchQuery;
  
    setSearchParams(params);
  }, [
    currentPage,
    itemsPerPage,
    categoryFilter,
    subcategoryFilter,
    typeFilter,
    sort,
    searchQuery
  ]);
  useEffect(() => {
    fetch("https://new-eppo.onrender.com/api/categories")
      .then(res => res.json())
      .then(setCategoriesData)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await getProducts({
                            page: currentPage,
                            limit: itemsPerPage,
                            category: categoryFilter,
                            subcategory: subcategoryFilter,
                            type: typeFilter,
                            sort
                          });
        setProducts(res.data);       // масив продуктів
        setTotalPages(res.pagination.totalPages); // кількість сторінок
      } catch (err: any) {
        console.error(err);
        setError("Не вдалося завантажити товари");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [currentPage, itemsPerPage]);

  useEffect(() => setCurrentPage(1), [categoryFilter, subcategoryFilter, typeFilter, searchQuery, itemsPerPage]);

  const categories = categoriesData.map(c => c.name);
  const subcategories =
    categoriesData
      .find(c => c.name === categoryFilter)
      ?.subcategories?.map((s: any) => s.name) ?? [];
  const types =
    categoriesData
      .find(c => c.name === categoryFilter)
      ?.subcategories?.find((s: any) => s.name === subcategoryFilter)
      ?.types?.map((t: any) => t.name) ?? [];

  const filtered = products
    .filter(p =>
      !p.is_hidden &&
      (!categoryFilter || p.category.name === categoryFilter) &&
      (!subcategoryFilter || p.subcategory?.name === subcategoryFilter) &&
      (!typeFilter || p.type?.name === typeFilter) &&
      (!searchQuery || p.sku.toLowerCase().includes(searchQuery))
    )
    .sort((a, b) => {
      switch (sort) {
        case "name":
          return a.sku.localeCompare(b.sku, undefined, { numeric: true, sensitivity: "base" });
        case "price_asc":
          return a.price_grn - b.price_grn;
        case "price_desc":
          return b.price_grn - a.price_grn;
        case "popular":
          return (b.totalSold ?? 0) - (a.totalSold ?? 0);
        default:
          const aE = a.sku.toUpperCase().startsWith("E");
          const bE = b.sku.toUpperCase().startsWith("E");
          if (aE && !bE) return -1;
          if (!aE && bE) return 1;
          return a.sku.localeCompare(b.sku, undefined, { numeric: true, sensitivity: "base" });
      }
    });


  const changeQuantity = (id: number, delta: number) => {
    setQuantities(prev => ({ ...prev, [id]: Math.max(1, (prev[id] ?? 1) + delta) }));
  };
  const setQuantity = (id: number, value: number) => {
    setQuantities(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="p-4 sm:p-8 bg-gradient-to-b from-purple-50 to-white min-h-screen">
      <h1 className="text-3xl sm:text-5xl font-extrabold mb-6 text-purple-700 tracking-tight drop-shadow-md">
        Наш товар
      </h1>

      {/* MOBILE FILTER & SORT BUTTONS */}
      <div className="flex justify-between items-center mb-4 lg:hidden">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-500 transition"
        >
          Фільтри
        </button>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as any)}
          className="border border-purple-300 text-purple-700 rounded-lg p-2 shadow-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition"
        >
          <option value="default">Без фільтру</option>
          <option value="name">По назві</option>
          <option value="price_asc">Від дешевого до дорогого</option>
          <option value="price_desc">Від дорогого до дешевого</option>
          <option value="popular">По популярності</option>
        </select>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* LEFT: Filters */}
        <aside
          className={`w-full lg:w-1/4 lg:sticky top-8 bg-white rounded-2xl p-6 shadow-lg h-fit lg:block ${
            showMobileFilters
              ? "block fixed inset-0 z-50 bg-white p-6 overflow-auto"
              : "hidden lg:block"
          }`}
          style={{ top: '64px' }}
        >
          <div className="flex justify-between items-center mb-4 lg:hidden">
            <h2 className="text-xl font-bold text-purple-700">Фільтри</h2>
            <button
              onClick={() => setShowMobileFilters(false)}
              className="text-purple-700 font-bold text-2xl"
            >
              ×
            </button>
          </div>

          <Filters
            categories={categories}
            subcategories={subcategories}
            types={types}
            categoryFilter={categoryFilter}
            subcategoryFilter={subcategoryFilter}
            typeFilter={typeFilter}
            sort={sort}
            itemsPerPage={itemsPerPage}
            onCategoryChange={value => { setCategoryFilter(value); setSubcategoryFilter(""); setTypeFilter(""); }}
            onSubcategoryChange={value => { setSubcategoryFilter(value); setTypeFilter(""); }}
            onTypeChange={value => setTypeFilter(value)}
            onSortChange={value => setSort(value as any)}
            onItemsPerPageChange={value => setItemsPerPage(value)}
          />
        </aside>

        {/* RIGHT: Products */}
        <main className="flex-1">
          <div className="hidden lg:flex items-center justify-between mb-6 gap-4">
            <div className="flex gap-2 items-center">
              <span className="font-medium text-gray-700">Сортування:</span>
              <select
                value={sort}
                onChange={e => setSort(e.target.value as any)}
                className="border border-purple-300 text-purple-700 rounded p-2 shadow-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition"
              >
                <option value="default">Без фільтру</option>
                <option value="name">По назві</option>
                <option value="price_asc">Від дешевого до дорогого</option>
                <option value="price_desc">Від дорогого до дешевого</option>
                <option value="popular">По популярності</option>
              </select>
            </div>

            <div className="flex gap-2 items-center">
              <span className="font-medium text-gray-700">На сторінку:</span>
              <select
                value={itemsPerPage}
                onChange={e => setItemsPerPage(Number(e.target.value))}
                className="border border-purple-300 text-purple-700 rounded p-2 shadow-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition"
              >
                <option value={8}>8</option>
                <option value={16}>16</option>
                <option value={32}>32</option>
              </select>
            </div>
          </div>

          {loading && <p className="text-purple-600 font-medium animate-pulse">Завантаження...</p>}
          {error && <p className="text-red-500 font-medium">{error}</p>}

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((p: Product) => (
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

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </main>
      </div>
    </div>
  );
}






