import { useEffect, useState } from "react";
import { api } from "../api/products";
import type { Product } from "../api/products";
import ConfirmModal from "./ConfirmModal";

interface ParameterValues {
  parameter: { id: number; name: string };
  values: string[];
}

interface Props {
  product: Product;
  onClose: () => void;
  onUpdated: () => void;
  initialParameters?: ParameterValues[];
}

interface Type {
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  name: string;
  types: Type[];
}

interface Category {
  id: number;
  name: string;
  subcategories: Subcategory[];
}

interface Props {
  product: Product;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditProductModal({
  product,
  onClose,
  onUpdated,
  initialParameters = [],
}: Props) {
  const [parameters, setParameters] = useState<ParameterValues[]>(initialParameters);
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const [form, setForm] = useState<{
    sku: string;
    price_usd: number;
    // stock: number;
    categoryId: number;
    subcategoryId?: number | null;
    typeId?: number | null;
  }>({
    sku: product.sku,
    price_usd: product.price_usd,
    // stock: product.stock ?? 0,
    categoryId: product.category.id,
    subcategoryId: product.subcategory?.id ?? undefined,
    typeId: product.type?.id ?? undefined,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [confirmChanges, setConfirmChanges] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [isHidden, setIsHidden] = useState<boolean>(product.is_hidden ?? false);

  const updateParamValue = (paramId: number, index: number, value: string) => {
    setParameters(params =>
      params.map(p =>
        p.parameter.id === paramId
          ? { ...p, values: p.values.map((v, i) => (i === index ? value : v)) }
          : p
      )
    );
  };

  const addParamValue = (paramId: number) => {
    setParameters(params =>
      params.map(p =>
        p.parameter.id === paramId
          ? { ...p, values: [...p.values, ""] }
          : p
      )
    );
  };

  const removeParamValue = (paramId: number, index: number) => {
    setParameters(params =>
      params.map(p =>
        p.parameter.id === paramId
          ? { ...p, values: p.values.filter((_, i) => i !== index) }
          : p
      )
    );
  };
  // Фото
  const [displayedImage, setDisplayedImage] = useState<string>(`${BASE_URL}/images/products/${product.sku}.webp`);
  const processImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = e => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        // Встановлюємо квадратний canvas
        const size = Math.min(img.width, img.height);
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Canvas не підтримується");

        // Малюємо центрований квадрат
        ctx.drawImage(
          img,
          (img.width - size) / 2,
          (img.height - size) / 2,
          size,
          size,
          0,
          0,
          size,
          size
        );

        // Конвертуємо у WebP
        canvas.toBlob(
          blob => {
            if (!blob) return reject("Помилка при конвертації");
            resolve(new File([blob], file.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" }));
          },
          "image/webp",
          0.9
        );
      };

      img.onerror = reject;
      reader.onerror = reject;

      reader.readAsDataURL(file);
    });
  };
  useEffect(() => setImageFailed(false), [form.sku]);
  useEffect(() => {
    // якщо змінився вибраний файл → показуємо його
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setDisplayedImage(objectUrl);

      // очищаємо URL при зміні файлу
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      // якщо файл не вибрано → показуємо стару картинку за початковим SKU
      setDisplayedImage(`${BASE_URL}/images/products/${product.sku}.webp`);
    }
  }, [selectedFile, product.sku]);
  // Завантажуємо категорії
  useEffect(() => {
    api.get<Category[]>("/categories").then(res => setCategories(res.data));
  }, []);
  useEffect(() => {
    setIsHidden(product.is_hidden ?? false);
  }, [product]);
  // Вибрані підкатегорії та типи
  const subcategories = categories.find(c => c.id === form.categoryId)?.subcategories || [];
  const types = subcategories.find(s => s.id === form.subcategoryId)?.types || [];

  // 💾 Збереження продукту
  const handleSave = async () => {
    try {
      await api.patch(`/products/${product.id}`, {
        sku: form.sku,
        price_usd: form.price_usd,
        categoryId: form.categoryId,
        subcategoryId: form.subcategoryId,
        typeId: form.typeId,
        is_hidden: isHidden,
        parameters: parameters.flatMap(p =>
          p.values.map(v => ({
            parameterId: p.parameter.id,
            value: v,
          }))
        ),
      });

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        await api.post(`/products/${encodeURIComponent(form.sku)}/upload-photo`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setConfirmChanges(false);
      onUpdated();
    } catch (err) {
      console.error(err);
      alert("Помилка при редагуванні товару");
    }
  };

  return (
  <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Редагувати товар {product.sku}</h2>

      {/* Фото продукту */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold">Фото товару</label>
        <input
          type="file"
          accept="image/*"
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onChange={async e => {
            const file = e.target.files?.[0];
            if (file) {
              try {
                const webpFile = await processImage(file);
                setSelectedFile(webpFile);
              } catch (err) {
                console.error("Помилка при обробці зображення:", err);
                alert("Не вдалося обробити фото");
              }
            } else {
              setSelectedFile(null);
            }
          }}
        />
        <img
          src={displayedImage}
          alt={form.sku}
          className="w-32 h-32 object-contain border rounded hover:scale-105 transition"
          onError={() => !imageFailed && setImageFailed(true)}
        />
      </div>

      {/* Дані продукту */}
      <div className="flex flex-col gap-3">
        <input
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="SKU"
          value={form.sku}
          onChange={e => setForm({ ...form, sku: e.target.value })}
        />
        <input
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Ціна USD"
          type="number"
          value={form.price_usd}
          onChange={e => setForm({ ...form, price_usd: Number(e.target.value) })}
        />

        <select
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={form.categoryId}
          onChange={e =>
            setForm({ ...form, categoryId: Number(e.target.value), subcategoryId: undefined, typeId: undefined })
          }
        >
          <option value="">-- Оберіть категорію --</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={form.subcategoryId ?? ""}
          onChange={e =>
            setForm({
              ...form,
              subcategoryId: e.target.value === "" ? undefined : Number(e.target.value),
              typeId: undefined,
            })
          }
        >
          <option value="">-- Оберіть підкатегорію --</option>
          {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {/* Параметри */}
        {parameters.map(p => (
          <div key={p.parameter.id} className="flex flex-col gap-2">
            <label className="font-semibold">{p.parameter.name}</label>
            {p.values.map((v, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="border rounded px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={v}
                  onChange={e => updateParamValue(p.parameter.id, i, e.target.value)}
                />
                <button
                  type="button"
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  onClick={() => removeParamValue(p.parameter.id, i)}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
              onClick={() => addParamValue(p.parameter.id)}
            >
              Додати значення
            </button>
          </div>
        ))}
        <select
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={form.typeId ?? ""}
          onChange={e =>
            setForm({
              ...form,
              typeId: e.target.value === "" ? undefined : Number(e.target.value),
            })
          }
        >
          <option value="">-- Оберіть тип --</option>
          {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {/* Кнопки */}
      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 border rounded hover:bg-gray-100 transition"
        >
          Відмінити
        </button>
        <button
          onClick={() => setConfirmChanges(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Зберегти
        </button>
      </div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isHidden}
          onChange={e => setIsHidden(e.target.checked)}
        />
        <span className="font-semibold text-red-600">
          Приховати товар
        </span>
      </label>

      {/* Підтвердження */}
      {confirmChanges && (
        <ConfirmModal
          title="Підтвердьте зміни"
          message="Ви точно хочете зберегти ці зміни?"
          onConfirm={handleSave}
          onCancel={() => setConfirmChanges(false)}
        />
      )}
    </div>
  </div>
  );
}
