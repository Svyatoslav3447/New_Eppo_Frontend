interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  visibleEndCount?: number; // скільки сторінок показати перед останньою
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  visibleEndCount = 5,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];

  // Перша сторінка
  pages.push(1);

  // Блок перед останньою сторінкою
  const startBlock = Math.max(totalPages - visibleEndCount, 2);
  const endBlock = totalPages - 1;

  if (startBlock > 2) pages.push('...');

  for (let i = startBlock; i <= endBlock; i++) {
    pages.push(i);
  }

  // Остання сторінка
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
