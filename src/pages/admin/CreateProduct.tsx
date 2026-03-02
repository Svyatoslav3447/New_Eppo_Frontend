import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";

interface Type {
  id: number;
  name: string;
}

interface Parameter {
  id: number;
  name: string;
  required: boolean;
}

interface Subcategory {
  id: number;
  name: string;
  types: Type[];
  parameters?: Parameter[];
}

interface Category {
  id: number;
  name: string;
  subcategories: Subcategory[];
}

// параметри тепер мають масив значень
interface ParameterWithValues {
  id: number;
  name: string;
  values: string[];
  required: boolean;
}

export default function CreateProduct() {
  const navigate = useNavigate();

  // Форма
  const [sku, setSku] = useState("");
  const [priceUsd, setPriceUsd] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<number | null>(null);
  const [typeId, setTypeId] = useState<number | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);

  // Дані
  const [categories, setCategories] = useState<Category[]>([]);
  const [parameters, setParameters] = useState<ParameterWithValues[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));
  }, []);

  const subcategories = categoryId
    ? categories.find((c) => c.id === categoryId)?.subcategories || []
    : [];

  const types = subcategoryId
    ? subcategories.find((s) => s.id === subcategoryId)?.types || []
    : [];

  // Підтягуємо параметри підкатегорії
  useEffect(() => {
    if (!subcategoryId) {
      setParameters([]);
      return;
    }

    const sub = categories
      .find(c => c.id === categoryId)
      ?.subcategories.find(s => s.id === subcategoryId);

    if (sub && sub.parameters?.length) {
      setParameters(
        sub.parameters.map(p => ({
          id: p.id!,
          name: p.name,
          values: [""],
          required: p.required ?? false,
        }))
      );
    } else {
      setParameters([]);
    }
  }, [categoryId, subcategoryId, categories]);

  // Додаємо нове значення для параметру
  const addValue = (paramIndex: number) => {
    const copy = [...parameters];
    copy[paramIndex].values.push("");
    setParameters(copy);
  };

  // Видаляємо значення параметру
  const removeValue = (paramIndex: number, valueIndex: number) => {
    const copy = [...parameters];
    copy[paramIndex].values.splice(valueIndex, 1);
    setParameters(copy);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // перевірка обов'язкових параметрів
    for (const p of parameters) {
      if (p.required && p.values.every((v) => !v.trim())) {
        setError(`Параметр "${p.name}" обов'язковий`);
        return;
      }
    }

    setLoading(true);
    try {
      await api.post("/products", {
        sku,
        price_usd: priceUsd,
        categoryId,
        subcategoryId: subcategoryId || undefined,
        typeId: typeId || undefined,
        parameters: parameters.flatMap((p) =>
          p.values
            .filter((v) => v.trim())
            .map((v) => ({ parameterId: p.id, value: v }))
        ),
      });

      if (photo) {
        const formData = new FormData();
        formData.append("file", photo);
        await api.post(`/products/${sku}/upload-photo`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setSuccess("Продукт успішно створено!");
      setTimeout(() => navigate("/admin/productsList"), 1000);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Сталася помилка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded shadow space-y-6">
      <h1 className="text-2xl font-bold mb-4 text-center sm:text-left">Створити товар</h1>

      {error && <div className="text-red-600 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* SKU */}
        <div className="flex flex-col">
          <label className="mb-1 font-semibold">SKU</label>
          <input
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="border p-2 w-full rounded"
            required
          />
        </div>

        {/* Ціна */}
        <div className="flex flex-col">
          <label className="mb-1 font-semibold">Ціна (USD)</label>
          <input
            type="number"
            value={priceUsd}
            onChange={(e) => setPriceUsd(parseFloat(e.target.value))}
            className="border p-2 w-full rounded"
            min={0}
            step={0.01}
            required
          />
        </div>

        {/* Категорія */}
        <div className="flex flex-col">
          <label className="mb-1 font-semibold">Категорія</label>
          <select
            value={categoryId ?? ""}
            onChange={(e) => {
              setCategoryId(parseInt(e.target.value));
              setSubcategoryId(null);
              setTypeId(null);
              setParameters([]);
            }}
            className="border p-2 w-full rounded"
            required
          >
            <option value="">Оберіть категорію</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Підкатегорія */}
        <div className="flex flex-col">
          <label className="mb-1 font-semibold">Підкатегорія</label>
          <select
            value={subcategoryId ?? ""}
            onChange={(e) => {
              setSubcategoryId(parseInt(e.target.value));
              setTypeId(null);
            }}
            className="border p-2 w-full rounded"
            disabled={!subcategories.length}
          >
            <option value="">Без підкатегорії</option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </div>

        {/* Тип */}
        <div className="flex flex-col">
          <label className="mb-1 font-semibold">Тип</label>
          <select
            value={typeId ?? ""}
            onChange={(e) => setTypeId(parseInt(e.target.value))}
            className="border p-2 w-full rounded"
            disabled={!types.length}
          >
            <option value="">Без типу</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Параметри */}
        {parameters.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Параметри</h3>
            {parameters.map((p, i) => (
              <div key={p.id} className="space-y-1">
                <label className="font-medium">{p.name}{p.required ? '*' : ''}</label>
                {p.values.map((v, vi) => (
                  <div key={vi} className="flex gap-2 mb-1">
                    <input
                      value={v}
                      onChange={(e) => {
                        const copy = [...parameters];
                        copy[i].values[vi] = e.target.value;
                        setParameters(copy);
                      }}
                      className="border p-2 rounded w-full"
                      required={p.required && p.values.every(v => !v.trim())}
                    />
                    <button type="button" onClick={() => removeValue(i, vi)} className="bg-red-500 text-white px-2 rounded">×</button>
                  </div>
                ))}
                <button type="button" onClick={() => addValue(i)} className="bg-blue-500 text-white px-2 rounded text-sm">Додати значення</button>
              </div>
            ))}
          </div>
        )}

        {/* Фото */}
        <div className="flex flex-col">
          <label className="mb-1 font-semibold">Фото</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            className="border p-2 w-full rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded ${loading ? "opacity-50" : ""}`}
        >
          {loading ? "Завантаження..." : "Створити"}
        </button>
      </form>
    </div>
  );
}