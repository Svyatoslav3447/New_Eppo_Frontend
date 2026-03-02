import { useEffect, useState } from "react";
import { api } from "../../api/axios";
import ConfirmModal from "../../components/ConfirmModal";

interface ParameterItem {
  id?: number;
  name: string;
  required?: boolean;
}

interface TypeItem {
  id?: number;
  name: string;
}

interface SubcategoryItem {
  id?: number;
  name: string;
  types: TypeItem[];
  parameters?: ParameterItem[];
}

interface CategoryItem {
  id?: number;
  name: string;
  subcategories: SubcategoryItem[];
}

export default function CategoryAdmin() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [categoryName, setCategoryName] = useState("");
  const [subcategories, setSubcategories] = useState<SubcategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [editingCategory, setEditingCategory] =
    useState<CategoryItem | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const fetchCategories = async () => {
    const res = await api.get("/categories");
    setCategories(res.data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openModal = (category?: CategoryItem) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
      setSubcategories(
        category?.subcategories.map((s) => ({
          ...s,
          types: s.types || [],
          parameters: s.parameters || [], // ← додаємо параметри
        })) || []
      );
    } else {
      setEditingCategory(null);
      setCategoryName("");
      setSubcategories([]);
    }
    setError("");
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setError("Назва категорії обовʼязкова");
      return;
    }

    setLoading(true);

    try {
      let catId: number;

      // --- Категорія ---
      if (editingCategory?.id) {
        await api.patch(`/categories/category/${editingCategory.id}`, { name: categoryName });
        catId = editingCategory.id;
      } else {
        const res = await api.post("/categories/category", { name: categoryName });
        catId = res.data.id;
      }

      // --- Підкатегорії ---
      const oldSubIds = editingCategory?.subcategories.map(s => s.id!).filter(Boolean) || [];
      const newSubIds: number[] = [];

      for (const sub of subcategories) {
        if (!sub.name.trim()) continue;

        let subId: number;

        if (sub.id) {
          await api.patch(`/categories/subcategory/${sub.id}`, { name: sub.name });
          subId = sub.id;
        } else {
          const res = await api.post("/categories/subcategory", { name: sub.name, categoryId: catId });
          subId = res.data.id;
        }

        newSubIds.push(subId);

        // --- Типи ---
        const oldTypeIds = editingCategory?.subcategories
          .find(s => s.id === sub.id)
          ?.types.map(t => t.id!)
          .filter(Boolean) || [];
        const newTypeIds: number[] = [];

        for (const t of sub.types) {
          if (!t.name.trim()) continue;

          let typeId: number;

          if (t.id) {
            await api.patch(`/categories/type/${t.id}`, { name: t.name });
            typeId = t.id;
          } else {
            const res = await api.post("/categories/type", { name: t.name, subcategoryId: subId });
            typeId = res.data.id;
          }

          newTypeIds.push(typeId);
        }

        // --- Параметри ---
        const oldParamIds = editingCategory?.subcategories
          .find(s => s.id === sub.id)
          ?.parameters?.map(p => p.id!)
          .filter(Boolean) || [];
        const newParamIds: number[] = [];

        for (const p of sub.parameters || []) {
          if (!p.name.trim()) continue;

          let paramId: number;

          if (p.id) {
            await api.patch(`/categories/subcategory-parameter/${p.id}`, {
              name: p.name,
              required: p.required || false
            });
            paramId = p.id;
          } else {
            const res = await api.post("/categories/subcategory-parameter", {
              name: p.name,
              required: p.required || false,
              subcategoryId: subId
            });
            paramId = res.data.id; // ← присвоюємо тут
          }

          newParamIds.push(paramId);
        }

        // Видалення параметрів
        const deletedParamIds = oldParamIds.filter(id => !newParamIds.includes(id));
        for (const delId of deletedParamIds) {
          await api.delete(`/categories/subcategory-parameter/${delId}`);
        }

        // Видалення типів
        const deletedTypeIds = oldTypeIds.filter(id => !newTypeIds.includes(id));
        for (const delId of deletedTypeIds) {
          await api.delete(`/categories/type/${delId}`);
        }
      }

      // Видалення підкатегорій
      const deletedSubIds = oldSubIds.filter(id => !newSubIds.includes(id));
      for (const delId of deletedSubIds) {
        await api.delete(`/categories/subcategory/${delId}`);
      }

      closeModal();
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || "Помилка");
    } finally {
      setLoading(false);
    }
  };

  const addSubcategory = () =>
    setSubcategories([...subcategories, { name: "", types: [], parameters: [] }]);

  const removeSubcategory = (i: number) =>
    setSubcategories(subcategories.filter((_, idx) => idx !== i));

  const addType = (i: number) => {
    const copy = [...subcategories];
    copy[i].types.push({ name: "" });
    setSubcategories(copy);
  };

  const removeType = (si: number, ti: number) => {
    const copy = [...subcategories];
    copy[si].types.splice(ti, 1);
    setSubcategories(copy);
  };


  return (
    <div className="max-w-full sm:max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Керування категоріями
        </h1>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition"
        >
          + Нова категорія
        </button>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-xl border shadow-sm hover:shadow-md transition p-4 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start flex-col sm:flex-row gap-2 sm:gap-0">
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-2">{cat.name}</h2>
                {cat.subcategories.length > 0 && (
                  <div className="space-y-1 text-sm text-gray-600">
                    {cat.subcategories.map((sub) => (
                      <div key={sub.id} className="break-words">
                        <span className="font-medium">{sub.name}</span>
                        {sub.types.length > 0 && (
                          <span className="ml-1 text-gray-400">
                            ({sub.types.map((t) => t.name).join(", ")})
                          </span>
                        )}
                        {sub.parameters && sub.parameters.length > 0 && (
                          <span className="ml-1 text-gray-500">
                            [{sub.parameters.map((p) => p.name).join(", ")}]
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-2 sm:mt-0">
                <button
                  onClick={() => openModal(cat)}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Редагувати
                </button>
                <button
                  onClick={() =>
                    cat.id &&
                    setConfirmDelete({
                      id: cat.id,
                      name: cat.name,
                    })
                  }
                  className="text-sm text-red-600 hover:underline"
                >
                  Видалити
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full sm:max-w-3xl p-4 sm:p-6 max-h-[90vh] overflow-auto animate-fade-in">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
              {editingCategory ? "Редагування" : "Нова категорія"}
            </h2>

            {error && (
              <div className="mb-4 text-red-600 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Назва категорії"
                className="w-full border rounded-lg px-3 py-2 sm:px-4 sm:py-2 focus:ring-2 focus:ring-primary outline-none"
              />

              {subcategories.map((sub, si) => (
                <div
                  key={si}
                  className="border rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Підкатегорія</span>
                    <button
                      type="button"
                      onClick={() => removeSubcategory(si)}
                      className="text-sm text-red-600"
                    >
                      Видалити
                    </button>
                  </div>

                  <input
                    value={sub.name}
                    onChange={(e) => {
                      const copy = [...subcategories];
                      copy[si].name = e.target.value;
                      setSubcategories(copy);
                    }}
                    placeholder="Назва підкатегорії"
                    className="w-full border rounded-lg px-2 sm:px-3 py-2"
                  />

                  {/* Типи */}
                  {sub.types.map((t, ti) => (
                    <div
                      key={ti}
                      className="flex items-center gap-2 pl-3 sm:pl-4 border-l border-gray-200"
                    >
                      <input
                        value={t.name}
                        onChange={(e) => {
                          const copy = [...subcategories];
                          copy[si].types[ti].name = e.target.value;
                          setSubcategories(copy);
                        }}
                        placeholder="Тип"
                        className="flex-1 border rounded-lg px-2 sm:px-3 py-2"
                      />
                      <button
                        type="button"
                        onClick={() => removeType(si, ti)}
                        className="text-red-600 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addType(si)}
                    className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition"
                  >
                    <span className="text-base leading-none">＋</span> Додати тип
                  </button>

                  {/* Параметри */}
                  {sub.parameters && sub.parameters.length > 0 && (
                    <div className="pl-3 sm:pl-4 border-l border-gray-200 space-y-2">
                      {sub.parameters!.map((p, pi) => (
                        <div key={pi} className="flex items-center gap-2">
                          <input
                            value={p.name}
                            onChange={(e) => {
                              const copy = [...subcategories];
                              copy[si].parameters![pi].name = e.target.value;
                              setSubcategories(copy);
                            }}
                            placeholder="Параметр"
                            className="flex-1 border rounded-lg px-2 sm:px-3 py-2"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...subcategories];
                              copy[si].parameters!.splice(pi, 1);
                              setSubcategories(copy);
                            }}
                            className="text-red-600 text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                <button
                  type="button"
                  onClick={() => {
                    const copy = [...subcategories];
                    if (!copy[si].parameters) copy[si].parameters = [];
                    copy[si].parameters.push({ name: "" });
                    setSubcategories(copy);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition"
                >
                  <span className="text-base leading-none">＋</span> Додати параметр
                </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addSubcategory}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/30 text-sm text-primary hover:bg-primary/5 transition"
              >
                + Додати підкатегорію
              </button>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-2 sm:mt-0">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg border w-full sm:w-auto"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-primary text-white w-full sm:w-auto disabled:opacity-50"
                >
                  Зберегти
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Видалити категорію?"
          message={`Категорія "${confirmDelete.name}" буде повністю видалена`}
          onConfirm={async () => {
            await api.delete(
              `/categories/category/${confirmDelete.id}`
            );
            setConfirmDelete(null);
            fetchCategories();
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}