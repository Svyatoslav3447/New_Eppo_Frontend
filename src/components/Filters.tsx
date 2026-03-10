interface FilterOption {
  id: number;
  name: string;
}

interface FiltersProps {
  categories: FilterOption[];
  subcategories: FilterOption[];
  types: FilterOption[];
  categoryFilter?: number;
  subcategoryFilter?: number;
  typeFilter?: number;
  sort: string;
  itemsPerPage: number;
  onCategoryChange: (value?: number) => void;
  onSubcategoryChange: (value?: number) => void;
  onTypeChange: (value?: number) => void;
  onSortChange: (value: string) => void;
  onItemsPerPageChange: (value: number) => void;
}
export function Filters({
  categories,
  subcategories,
  types,
  categoryFilter,
  subcategoryFilter,
  typeFilter,
  sort,
  itemsPerPage,
  onCategoryChange,
  onSubcategoryChange,
  onTypeChange,
  onSortChange,
  onItemsPerPageChange,
}: FiltersProps) {
  const selectClass =
    "w-full text-purple-700 p-2 rounded-lg border border-purple-300 shadow-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition";

  return (
    <div className="flex flex-col gap-4">
      <label className="font-semibold text-gray-700">Категорія</label>
      <select
        value={categoryFilter}
        onChange={e => onCategoryChange(e.target.value)}
        className={selectClass}
      >
        <option value="">Всі категорії</option>
        {categories.map(c => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <label className="font-semibold text-gray-700">Підкатегорія</label>
      <select
        value={subcategoryFilter}
        onChange={e => onSubcategoryChange(e.target.value)}
        disabled={!categoryFilter}
        className={selectClass + (subcategoryFilter ? "" : " opacity-70")}
      >
        <option value="">Всі підкатегорії</option>
        {subcategories.map(c => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <label className="font-semibold text-gray-700">Тип</label>
      <select
        value={typeFilter}
        onChange={e => onTypeChange(e.target.value)}
        disabled={!subcategoryFilter}
        className={selectClass + (typeFilter ? "" : " opacity-70")}
      >
        <option value="">Всі типи</option>
        {types.map(t => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <label className="font-semibold text-gray-700">Сортування</label>
      <select
        value={sort}
        onChange={e => onSortChange(e.target.value)}
        className={selectClass}
      >
        <option value="default">Без фільтру</option>
        <option value="name">По назві</option>
        <option value="price_asc">Від дешевого до дорогого</option>
        <option value="price_desc">Від дорогого до дешевого</option>
        <option value="popular">По популярності</option>
      </select>

      <label className="font-semibold text-gray-700">К-сть на сторінку</label>
      <select
        value={itemsPerPage}
        onChange={e => onItemsPerPageChange(Number(e.target.value))}
        className={selectClass}
      >
        <option value={8}>8</option>
        <option value={16}>16</option>
        <option value={32}>32</option>
      </select>
    </div>
  );

}
