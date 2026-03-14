interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxButtons?: number; // загальна кількість кнопок (включно з 1 та totalPages)
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxButtons = 7,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];

  const visibleButtons = maxButtons - 2; // без першої та останньої
  const half = Math.floor(visibleButtons / 2);

  let start = Math.max(currentPage - half, 2);
  let end = Math.min(currentPage + half, totalPages - 1);

  // Коригуємо, якщо на початку або в кінці не вистачає кнопок
  const needed = visibleButtons - (end - start + 1);
  if (needed > 0) {
    if (start === 2) {
      end = Math.min(end + needed, totalPages - 1);
    } else if (end === totalPages - 1) {
      start = Math.max(start - needed, 2);
    }
  }

  pages.push(1); // перша сторінка
  if (start > 2) pages.push('...');

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages - 1) pages.push('...');
  pages.push(totalPages); // остання сторінка

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
