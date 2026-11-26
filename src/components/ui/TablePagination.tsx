import React, { useMemo } from 'react';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemLabel: string;
  displayStart: number;
  displayEnd: number;
  pageSize: number;
  pageSizeSelectId: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemLabel,
  displayStart,
  displayEnd,
  pageSize,
  pageSizeSelectId,
  onPageChange,
  onPageSizeChange,
}) => {
  const visiblePages = useMemo<(number | 'ellipsis-left' | 'ellipsis-right')[]>(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis-left' | 'ellipsis-right')[] = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) pages.push('ellipsis-left');
    for (let p = start; p <= end; p++) {
      pages.push(p);
    }
    if (end < totalPages - 1) pages.push('ellipsis-right');
    pages.push(totalPages);

    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="px-3 sm:px-4 py-3 bg-[#F8FAF9] border-t border-[#E2E8E5] flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3 text-xs text-[#52605A] shrink-0">
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <span>
          Menampilkan <strong className="text-[#18221E]">{displayStart}–{displayEnd}</strong> dari{' '}
          <strong className="text-[#18221E]">{totalItems}</strong> {itemLabel}
        </span>

        <div className="flex items-center gap-1.5">
          <label htmlFor={pageSizeSelectId} className="text-[11px]">
            Baris:
          </label>
          <select
            id={pageSizeSelectId}
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-7 px-2 bg-white border border-[#E2E8E5] text-xs font-medium text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={0}>Semua</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="h-7 px-2 sm:px-2.5 bg-white border border-[#E2E8E5] text-[11px] font-semibold text-[#18221E] hover:bg-[#F1F5F3] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <span className="sm:hidden">Prev</span>
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        {visiblePages.map((entry) =>
          typeof entry === 'string' ? (
            <span
              key={entry}
              className="w-6 h-7 flex items-center justify-center text-[11px] text-[#7E8E87] select-none"
            >
              …
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              onClick={() => onPageChange(entry)}
              className={`w-7 h-7 border text-[11px] font-semibold transition-colors cursor-pointer ${
                entry === currentPage
                  ? 'bg-[#18221E] text-white border-[#18221E]'
                  : 'bg-white text-[#52605A] border-[#E2E8E5] hover:border-[#18221E]'
              }`}
            >
              {entry}
            </button>
          )
        )}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="h-7 px-2 sm:px-2.5 bg-white border border-[#E2E8E5] text-[11px] font-semibold text-[#18221E] hover:bg-[#F1F5F3] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <span className="sm:hidden">Next</span>
          <span className="hidden sm:inline">Selanjutnya</span>
        </button>
      </div>
    </div>
  );
};
