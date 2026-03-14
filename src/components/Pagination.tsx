interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxButtons?: number; // скільки кнопок показувати навколо поточної
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxButtons = 5,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  const half = Math.floor(maxButtons / 2);

  // Завжди перша сторінка
  pages.push(1);

  let startPage = Math.max(currentPage - half, 2);
  let endPage = Math.min(currentPage + half, totalPages - 1);

  // Коригуємо, якщо поточна сторінка близько до країв
  if (currentPage <= half + 1) {
    startPage = 2;
    endPage = Math.min(maxButtons, totalPages - 1);
  }
  if (currentPage >= totalPages - half) {
    startPage = Math.max(totalPages - maxButtons + 1, 2);
    endPage = totalPages - 1;
  }

  // Додаємо «...» якщо початок > 2
  if (startPage > 2) pages.push('...');

  // Сторінки між першою та останньою
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // Додаємо «...» якщо кінець < totalPages - 1
  if (endPage < totalPages - 1) pages.push('...');

  // Завжди остання сторінка
  pages.push(totalPages);

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
          <span key={idx} className="px-3 py-1 select-none">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
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
