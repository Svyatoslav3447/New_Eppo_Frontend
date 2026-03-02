interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="mt-6 flex justify-center gap-2 flex-wrap">
      <button
        className="px-3 py-1 rounded-lg border border-purple-300 text-purple-700 hover:bg-purple-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Назад
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
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
      ))}

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