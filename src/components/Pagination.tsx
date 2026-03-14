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
  const half = Math.floor(maxVisible / 2);

  // Завжди перша сторінка
  pages.push(1);

  let start = Math.max(currentPage - half, 2);
  let end = Math.min(currentPage + half, totalPages - 1);

  // Корекція якщо занадто близько до початку
  if (currentPage <= half + 1) {
    start = 2;
    end = Math.min(1 + maxVisible, totalPages - 1);
  }

  // Корекція якщо занадто близько до кінця
  if (currentPage >= totalPages - half) {
    end = totalPages - 1;
    start = Math.max(totalPages - maxVisible, 2);
  }

  // Додаємо "..." якщо потрібно
  if (start > 2) pages.push('...');

  // Додаємо сторінки між першою і останньою
  for (let i = start; i <= 5; i++) {
    pages.push(i);
  }

  if (end < totalPages - 1) pages.push('...');

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
