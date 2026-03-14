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
  pages.push(1); // завжди перша

  let start = Math.max(currentPage - Math.floor(maxVisible / 2), 2);
  let end = Math.min(currentPage + Math.floor(maxVisible / 2), totalPages - 1);

  // Якщо на початку менше сторінок
  if (currentPage <= Math.floor(maxVisible / 2) + 1) {
    start = 2;
    end = Math.min(maxVisible + 1, totalPages - 1);
  }

  // Якщо близько до кінця
  if (currentPage >= totalPages - Math.floor(maxVisible / 2)) {
    end = totalPages - 1;
    start = Math.max(totalPages - maxVisible, 2);
  }

  if (start > 2) pages.push('...');

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages - 1) pages.push('...');
  pages.push(totalPages); // завжди остання

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
