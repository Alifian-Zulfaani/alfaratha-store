import React, { useMemo } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { StockAdjustmentType, StockLog } from '../../types';
import { TablePagination } from '../ui/TablePagination';

export type MutationPeriodFilter = 'all' | 'today' | '7d' | '30d';

export interface MutationFilterState {
  searchQuery: string;
  typeFilter: 'all' | StockAdjustmentType;
  staffFilter: string;
  periodFilter: MutationPeriodFilter;
}

export const MUTATION_TYPE_LABELS: Record<StockAdjustmentType, string> = {
  penjualan: 'Penjualan POS',
  restock: 'Restock Masuk',
  rusak: 'Stok Rusak',
  retur: 'Retur Barang',
  koreksi: 'Koreksi Opname',
};

function getPeriodStartTimestamp(period: MutationPeriodFilter): number | null {
  if (period === 'all') return null;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayMs = startOfToday.getTime();
  if (period === 'today') return todayMs;
  if (period === '7d') return todayMs - 6 * 86_400_000;
  return todayMs - 29 * 86_400_000;
}

/**
 * Pure filter helper shared by the DataTable UI and CSV export so both
 * stay strictly consistent with the active search query, type, staff, and period.
 */
export function filterStockLogs(logs: StockLog[], filters: MutationFilterState): StockLog[] {
  const query = filters.searchQuery.trim().toLowerCase();
  const periodStart = getPeriodStartTimestamp(filters.periodFilter);

  return logs.filter((log) => {
    if (filters.typeFilter !== 'all' && log.type !== filters.typeFilter) {
      return false;
    }
    if (filters.staffFilter !== 'all' && log.staffName !== filters.staffFilter) {
      return false;
    }
    if (periodStart !== null && new Date(log.timestamp).getTime() < periodStart) {
      return false;
    }
    if (query) {
      const haystacks = [
        log.sku,
        log.productName,
        log.variantLabel,
        log.reason,
        log.staffName,
        MUTATION_TYPE_LABELS[log.type],
      ];
      if (!haystacks.some((val) => val.toLowerCase().includes(query))) {
        return false;
      }
    }
    return true;
  });
}

interface StockMutationsViewProps {
  allLogs: StockLog[];
  filteredLogs: StockLog[];
  filters: MutationFilterState;
  pageSize: number;
  currentPage: number;
  onFiltersChange: (next: Partial<MutationFilterState>) => void;
  onResetFilters: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const TYPE_TABS: { key: 'all' | StockAdjustmentType; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'penjualan', label: 'Penjualan POS' },
  { key: 'restock', label: 'Restock Masuk' },
  { key: 'rusak', label: 'Stok Rusak' },
  { key: 'retur', label: 'Retur Barang' },
  { key: 'koreksi', label: 'Koreksi Opname' },
];

export const StockMutationsView: React.FC<StockMutationsViewProps> = ({
  allLogs,
  filteredLogs,
  filters,
  pageSize,
  currentPage,
  onFiltersChange,
  onResetFilters,
  onPageChange,
  onPageSizeChange,
}) => {
  const hasActiveFilter =
    filters.searchQuery.trim() !== '' ||
    filters.typeFilter !== 'all' ||
    filters.staffFilter !== 'all' ||
    filters.periodFilter !== 'all';

  const staffOptions = useMemo(() => {
    const names = new Set<string>();
    for (const log of allLogs) {
      if (log.staffName.trim()) {
        names.add(log.staffName.trim());
      }
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b, 'id-ID'));
  }, [allLogs]);

  const typeCounts = useMemo(() => {
    const counts: Record<'all' | StockAdjustmentType, number> = {
      all: allLogs.length,
      penjualan: 0,
      restock: 0,
      rusak: 0,
      retur: 0,
      koreksi: 0,
    };
    for (const log of allLogs) {
      counts[log.type]++;
    }
    return counts;
  }, [allLogs]);

  const kpis = useMemo(() => {
    let unitsIn = 0;
    let unitsOut = 0;
    let inEvents = 0;
    let outEvents = 0;

    for (const log of filteredLogs) {
      if (log.delta > 0) {
        unitsIn += log.delta;
        inEvents++;
      } else {
        unitsOut += Math.abs(log.delta);
        outEvents++;
      }
    }

    const todayStartMs = getPeriodStartTimestamp('today') ?? 0;
    let todayCount = 0;
    let todayPosCount = 0;
    let todayWarehouseCount = 0;

    for (const log of allLogs) {
      if (new Date(log.timestamp).getTime() >= todayStartMs) {
        todayCount++;
        if (log.type === 'penjualan') {
          todayPosCount++;
        } else {
          todayWarehouseCount++;
        }
      }
    }

    return {
      filteredTotal: filteredLogs.length,
      unitsIn,
      inEvents,
      unitsOut,
      outEvents,
      todayCount,
      todayPosCount,
      todayWarehouseCount,
    };
  }, [allLogs, filteredLogs]);

  const totalPages = useMemo(() => {
    if (pageSize <= 0) return 1;
    return Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  }, [filteredLogs.length, pageSize]);

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedLogs = useMemo(() => {
    if (pageSize <= 0) return filteredLogs;
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, safeCurrentPage, pageSize]);

  const displayStart =
    filteredLogs.length === 0
      ? 0
      : (safeCurrentPage - 1) * (pageSize <= 0 ? filteredLogs.length : pageSize) + 1;
  const displayEnd =
    pageSize <= 0
      ? filteredLogs.length
      : Math.min(filteredLogs.length, safeCurrentPage * pageSize);

  return (
    <>
      {/* 4 Contextual Audit KPI Cards (Option A) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8E5] p-4 shadow-[0_4px_20px_-2px_rgba(24,34,30,0.04)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#52605A]">
              Total Log Mutasi
            </span>
            <div className="w-8 h-8 bg-[#F1F5F3] flex items-center justify-center text-[#18221E]">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-2xl font-bold text-[#18221E]">
                {kpis.filteredTotal}
              </span>
              <span className="text-xs text-[#3A6B5C] font-semibold">
                {hasActiveFilter ? `dari ${allLogs.length} log` : 'Catatan Audit'}
              </span>
            </div>
            <p className="text-[11px] text-[#52605A] mt-1">
              {hasActiveFilter
                ? 'Jumlah mutasi sesuai filter aktif'
                : 'Audit otomatis transaksi POS & penyesuaian gudang'}
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8E5] p-4 shadow-[0_4px_20px_-2px_rgba(24,34,30,0.04)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#52605A]">
              Total Unit Masuk
            </span>
            <div className="w-8 h-8 bg-[#E6EFEA] flex items-center justify-center text-[#3A6B5C]">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-2xl font-bold text-[#3A6B5C]">
                +{kpis.unitsIn.toLocaleString('id-ID')}
              </span>
              <span className="text-xs text-[#52605A] font-medium">
                Unit ({kpis.inEvents}x)
              </span>
            </div>
            <p className="text-[11px] text-[#52605A] mt-1">
              Dari restock masuk, retur &amp; koreksi positif
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8E5] p-4 shadow-[0_4px_20px_-2px_rgba(24,34,30,0.04)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#52605A]">
              Total Unit Keluar
            </span>
            <div className="w-8 h-8 bg-[#F5EFE6] flex items-center justify-center text-[#8C6D46]">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-2xl font-bold text-[#8C6D46]">
                -{kpis.unitsOut.toLocaleString('id-ID')}
              </span>
              <span className="text-xs text-[#52605A] font-medium">
                Unit ({kpis.outEvents}x)
              </span>
            </div>
            <p className="text-[11px] text-[#52605A] mt-1">
              Penjualan kasir POS, stok rusak &amp; koreksi keluar
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8E5] p-4 shadow-[0_4px_20px_-2px_rgba(24,34,30,0.04)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#52605A]">
              Aktivitas Hari Ini
            </span>
            <div className="w-8 h-8 bg-[#F1F5F3] flex items-center justify-center text-[#3A6B5C]">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-2xl font-bold text-[#18221E]">
                {kpis.todayCount}
              </span>
              <span className="text-xs text-[#52605A] font-medium">
                {kpis.todayPosCount} POS • {kpis.todayWarehouseCount} Gudang
              </span>
            </div>
            <p className="text-[11px] text-[#52605A] mt-1">
              Total pergerakan stok tercatat hari ini
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filter Toolbar */}
      <section className="bg-white border border-[#E2E8E5] p-4 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#7E8E87] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
              placeholder="Cari produk, SKU, keterangan / no. faktur (#TRX), atau staff..."
              aria-label="Cari riwayat mutasi stok"
              className="w-full h-10 pl-9 pr-9 bg-[#F8FAF9] border border-[#E2E8E5] focus:border-[#3A6B5C] focus:bg-white text-sm text-[#18221E] focus:outline-none"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => onFiltersChange({ searchQuery: '' })}
                aria-label="Hapus pencarian mutasi"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7E8E87] hover:text-[#18221E] p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-center gap-2">
            <select
              value={filters.staffFilter}
              onChange={(e) => onFiltersChange({ staffFilter: e.target.value })}
              aria-label="Filter petugas staff"
              className="w-full lg:w-auto h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-xs font-medium text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
            >
              <option value="all">Semua Petugas</option>
              {staffOptions.map((staff) => (
                <option key={staff} value={staff}>
                  {staff}
                </option>
              ))}
            </select>

            <select
              value={filters.periodFilter}
              onChange={(e) =>
                onFiltersChange({ periodFilter: e.target.value as MutationPeriodFilter })
              }
              aria-label="Filter periode mutasi"
              className="w-full lg:w-auto h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-xs font-medium text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
            >
              <option value="all">Semua Waktu</option>
              <option value="today">Hari Ini</option>
              <option value="7d">7 Hari Terakhir</option>
              <option value="30d">30 Hari Terakhir</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {TYPE_TABS.map((tab) => {
              const active = filters.typeFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onFiltersChange({ typeFilter: tab.key })}
                  className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap border transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#18221E] text-white border-[#18221E]'
                      : 'bg-[#F1F5F3] text-[#52605A] border-[#E2E8E5] hover:border-[#18221E]'
                  }`}
                >
                  {tab.label} ({typeCounts[tab.key]})
                </button>
              );
            })}
          </div>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={onResetFilters}
              className="h-8 px-2.5 bg-white hover:bg-[#F1F5F3] border border-[#E2E8E5] text-[11px] font-semibold text-[#52605A] hover:text-[#18221E] inline-flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </section>

      {/* Mutations DataTable with Sticky Header & Pagination */}
      <section className="bg-white border border-[#E2E8E5] shadow-[0_4px_20px_-2px_rgba(24,34,30,0.03)] flex flex-col max-h-[calc(100vh-8rem)]">
        <div className="overflow-auto flex-1 relative">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-[#F1F5F3] shadow-[inset_0_-1px_0_#E2E8E5]">
              <tr className="text-[10.5px] font-semibold uppercase tracking-wider text-[#52605A]">
                <th className="py-3 px-4 min-w-[135px]">Waktu</th>
                <th className="py-3 px-3 min-w-[240px]">Item &amp; Varian SKU</th>
                <th className="py-3 px-3 min-w-[140px]">Jenis Mutasi</th>
                <th className="py-3 px-3 text-right min-w-[145px]">Perubahan &amp; Saldo</th>
                <th className="py-3 px-3 min-w-[215px]">Keterangan / Referensi</th>
                <th className="py-3 px-4 min-w-[135px]">Petugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8E5] text-xs text-[#18221E]">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 px-4 text-center text-[#52605A]">
                    <p>Tidak ada catatan mutasi stok yang sesuai filter.</p>
                    {hasActiveFilter && (
                      <button
                        type="button"
                        onClick={onResetFilters}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#3A6B5C] hover:underline cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Tampilkan semua riwayat mutasi</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const isPositive = log.delta > 0;
                  const isDamaged = log.type === 'rusak';

                  const badgeColorClass = isDamaged
                    ? 'bg-[#FFF5F5] text-[#93000A] border border-[#BA1A1A]/20'
                    : isPositive
                    ? 'bg-[#E6EFEA] text-[#2C5246]'
                    : 'bg-[#F5EFE6] text-[#8C6D46]';

                  const deltaColorClass = isDamaged
                    ? 'text-[#BA1A1A]'
                    : isPositive
                    ? 'text-[#3A6B5C]'
                    : 'text-[#8C6D46]';

                  return (
                    <tr key={log.id} className="hover:bg-[#F8FAF9] transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-[#52605A]">
                        {new Date(log.timestamp).toLocaleString('id-ID', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>

                      <td className="py-3 px-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-[#18221E] truncate max-w-[230px]">
                            {log.productName}
                          </p>
                          <p className="text-[11px] text-[#52605A] font-mono">
                            <span className="text-[#3A6B5C] font-semibold">{log.sku}</span> •{' '}
                            {log.variantLabel}
                          </p>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 whitespace-nowrap px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badgeColorClass}`}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="w-3 h-3 shrink-0" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 shrink-0" />
                          )}
                          <span>{MUTATION_TYPE_LABELS[log.type]}</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap font-mono">
                        <span className={`text-sm font-bold ${deltaColorClass}`}>
                          {isPositive ? `+${log.delta}` : log.delta} unit
                        </span>
                        <p className="text-[10.5px] text-[#52605A]">
                          {log.stockBefore} &rarr; {log.stockAfter}
                        </p>
                      </td>

                      <td className="py-3 px-3 text-xs text-[#52605A]">
                        <p className="max-w-[260px] break-words leading-snug">{log.reason}</p>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-xs font-medium text-[#18221E]">
                        {log.staffName}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          totalItems={filteredLogs.length}
          itemLabel="mutasi"
          displayStart={displayStart}
          displayEnd={displayEnd}
          pageSize={pageSize}
          pageSizeSelectId="mut-page-size"
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </section>
    </>
  );
};
