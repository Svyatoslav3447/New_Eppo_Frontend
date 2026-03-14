interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxButtons?: number; // опційно, скільки сторінок показувати навколо поточної
}

function getPageNumbers(currentPage: number, totalPages: number, maxButtons = 5) {
  const pages: (number | '...')[] = [];

  if (totalPages <= maxButtons) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const numAdjacents = Math.floor((maxButtons - 3) / 2); // кнопки навколо поточної

  let startPage = currentPage - numAdjacents;
  let endPage = currentPage + numAdjacents;

  // Гарантуємо, що вони не виходять за межі
  if (startPage < 2) {
    endPage += 2 - startPage;
    startPage = 2;
  }
  if (endPage > totalPages - 1) {
    startPage -= endPage - (totalPages - 1);
    endPage = totalPages - 1;
  }

  startPage = Math.max(startPage, 2);

  pages.push(1);

  if (startPage > 2) pages.push('...');

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (endPage < totalPages - 1) pages.push('...');

  pages.push(totalPages);

  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxButtons = 5,
}: PaginationProps) {
  const pageNumbers = getPageNumbers(currentPage, totalPages, maxButtons);

  return (
    <div className="mt-6 flex justify-center gap-2 flex-wrap">
      <button
        className="px-3 py-1 rounded-lg border border-purple-300 text-purple-700 hover:bg-purple-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Назад
      </button>

      {pageNumbers.map((p, idx) =>
        p === '...' ? (
          <span key={idx} className="px-3 py-1">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1 rounded-lg border shadow-sm transition ${
              currentPage === p
                ? "bg-purple-600 text-white border-purple-600"
                : "border-purple-300 text-purple-700 hover:bg-purple-50"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        className="px-3 py-1 rounded-lg border border-purple-300 text-purple-700 hover:bg-purple-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Вперед
      </button>
    </div>
  );
}
