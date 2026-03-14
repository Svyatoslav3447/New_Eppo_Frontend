interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisible?: number; // скільки сторінок показувати між першою і останньою
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = 5,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  
  // 1. Визначаємо межі "вікна" навколо поточної сторінки
  let start = Math.max(2, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages - 1, start + maxVisible - 1);

  // 2. Коригуємо початок, якщо кінець вперся в ліміт
  if (end === totalPages - 1) {
    start = Math.max(2, end - maxVisible + 1);
  }

  // Побудова масиву
  pages.push(1); // Завжди перша

  if (start > 2) {
    pages.push('...');
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages - 1) {
    pages.push('...');
  }

  pages.push(totalPages); // Завжди остання

  return (
    <div className="flex justify-center gap-2 mt-4 flex-wrap">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
      >
        Назад
      </button>

      {pages.map((p, idx) =>
        p === '...' ? (
          // Використовуйте комбінований ключ, щоб уникнути помилок React
          <span key={`dots-${idx}`} className="px-3 py-1 select-none">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`px-3 py-1 rounded border ${
              currentPage === p ? 'bg-purple-600 text-white border-purple-600' : 'hover:bg-gray-100'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
      >
        Вперед
      </button>
    </div>
  );
}
