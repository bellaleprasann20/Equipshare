import React from "react";

/**
 * Pagination controls for tables/lists (equipment list, rental
 * history, allocation history, etc).
 *
 * Usage:
 *   <Pagination
 *     currentPage={page}
 *     totalPages={Math.ceil(totalCount / pageSize)}
 *     onPageChange={setPage}
 *   />
 */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // Build a compact page list: 1 ... (current-1, current, current+1) ... last
  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const sortedPages = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const pageButtons = [];
  let lastPage = 0;
  for (const p of sortedPages) {
    if (p - lastPage > 1) {
      pageButtons.push(
        <span key={`ellipsis-${p}`} className="px-2 text-gray-400">
          …
        </span>
      );
    }
    pageButtons.push(
      <button
        key={p}
        onClick={() => onPageChange(p)}
        aria-current={p === currentPage ? "page" : undefined}
        className={[
          "min-w-[2rem] rounded-md px-2 py-1 text-sm",
          p === currentPage
            ? "bg-blue-600 text-white font-medium"
            : "text-gray-700 hover:bg-gray-100",
        ].join(" ")}
      >
        {p}
      </button>
    );
    lastPage = p;
  }

  return (
    <nav className="flex items-center justify-center gap-1 py-4" aria-label="Pagination">
      <button
        onClick={() => canGoPrev && onPageChange(currentPage - 1)}
        disabled={!canGoPrev}
        className="rounded-md px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Prev
      </button>
      {pageButtons}
      <button
        onClick={() => canGoNext && onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        className="rounded-md px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </nav>
  );
}
