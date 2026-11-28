import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  Wallet,
  TrendingUp,
  Search,
  Plus,
  History,
  FileSpreadsheet,
  RefreshCw,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import {
  NormalizedProduct,
  NormalizedProductVariant,
  ProductCategory,
  StorageLocation,
} from '../../types';
import { formatIDR } from '../../utils/whatsapp';
import {
  exportInventoryToExcel,
  exportMutationsToExcel,
} from '../../utils/excelExport';
import { StockAdjustmentModal } from '../../components/pos/StockAdjustmentModal';
import { ProductFormModal } from '../../components/pos/ProductFormModal';
import {
  StockMutationsView,
  MutationFilterState,
  filterStockLogs,
} from '../../components/pos/StockMutationsView';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { TablePagination } from '../../components/ui/TablePagination';

interface InventoryRow {
  product: NormalizedProduct;
  variant: NormalizedProductVariant;
}

const CATEGORY_NAME: Record<Exclude<ProductCategory, 'all'>, string> = {
  kurma: 'Kurma Premium',
  'kismis-kacang': 'Kacang & Kismis',
  'cokelat-gift': 'Cokelat & Suvenir',
  'zamzam-herbal': 'Air Zamzam & Herbal',
  paket: 'Paket Oleh-Oleh',
};

const DEFAULT_MUTATION_FILTERS: MutationFilterState = {
  searchQuery: '',
  typeFilter: 'all',
  staffFilter: 'all',
  periodFilter: 'all',
};

export const InventoryPage: React.FC = () => {
  const { products, stockLogs, siteContent, deleteProduct } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeView: 'stock' | 'mutations' =
    searchParams.get('tab') === 'mutasi' ? 'mutations' : 'stock';
  const [isExporting, setIsExporting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory>('all');
  const [locationFilter, setLocationFilter] = useState<'all' | StorageLocation>('all');
  const [statusTab, setStatusTab] = useState<'all' | 'aman' | 'menipis' | 'habis'>('all');

  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [mutationFilters, setMutationFilters] =
    useState<MutationFilterState>(DEFAULT_MUTATION_FILTERS);
  const [mutPageSize, setMutPageSize] = useState<number>(10);
  const [mutCurrentPage, setMutCurrentPage] = useState<number>(1);

  const [adjustTarget, setAdjustTarget] = useState<InventoryRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<InventoryRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NormalizedProduct | null>(null);

  const switchView = (view: 'stock' | 'mutations') => {
    const nextParams = new URLSearchParams(searchParams);
    if (view === 'mutations') {
      nextParams.set('tab', 'mutasi');
    } else {
      nextParams.delete('tab');
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleOpenSkuMutations = (sku: string) => {
    setMutationFilters({
      ...DEFAULT_MUTATION_FILTERS,
      searchQuery: sku,
    });
    setMutCurrentPage(1);
    switchView('mutations');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMutationFiltersChange = (next: Partial<MutationFilterState>) => {
    setMutationFilters((prev) => ({ ...prev, ...next }));
    setMutCurrentPage(1);
  };

  const handleResetMutationFilters = () => {
    setMutationFilters(DEFAULT_MUTATION_FILTERS);
    setMutCurrentPage(1);
  };

  const filteredMutationLogs = useMemo(
    () => filterStockLogs(stockLogs, mutationFilters),
    [stockLogs, mutationFilters]
  );

  const allRows = useMemo<InventoryRow[]>(() => {
    const rows: InventoryRow[] = [];
    for (const product of products) {
      for (const variant of product.variants) {
        rows.push({ product, variant });
      }
    }
    return rows;
  }, [products]);

  const kpis = useMemo(() => {
    let totalUnits = 0;
    let totalAssetValue = 0;
    let totalRetailValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let safeStockCount = 0;

    for (const { variant } of allRows) {
      totalUnits += variant.stock;
      totalAssetValue += variant.stock * variant.costPrice;
      totalRetailValue += variant.stock * variant.price;
      if (variant.stock <= 0) {
        outOfStockCount++;
      } else if (variant.stock <= variant.minStock) {
        lowStockCount++;
      } else {
        safeStockCount++;
      }
    }

    return {
      totalSkus: allRows.length,
      totalUnits,
      totalAssetValue,
      totalRetailValue,
      lowStockCount,
      outOfStockCount,
      safeStockCount,
    };
  }, [allRows]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allRows.filter(({ product, variant }) => {
      if (categoryFilter !== 'all' && product.category !== categoryFilter) return false;
      if (locationFilter !== 'all' && variant.storageLocation !== locationFilter) return false;

      if (statusTab === 'habis' && variant.stock > 0) return false;
      if (
        statusTab === 'menipis' &&
        (variant.stock <= 0 || variant.stock > variant.minStock)
      ) {
        return false;
      }
      if (statusTab === 'aman' && variant.stock <= variant.minStock) return false;

      if (
        q &&
        !product.name.toLowerCase().includes(q) &&
        !variant.sku.toLowerCase().includes(q) &&
        !variant.label.toLowerCase().includes(q)
      ) {
        return false;
      }

      return true;
    });
  }, [allRows, categoryFilter, locationFilter, statusTab, searchQuery]);

  // Reset to page 1 when filters or pageSize change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, locationFilter, statusTab, pageSize]);

  const totalPages = useMemo(() => {
    if (pageSize <= 0) return 1;
    return Math.max(1, Math.ceil(filteredRows.length / pageSize));
  }, [filteredRows.length, pageSize]);

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRows = useMemo(() => {
    if (pageSize <= 0) return filteredRows;
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, safeCurrentPage, pageSize]);

  const displayStart = filteredRows.length === 0 ? 0 : (safeCurrentPage - 1) * (pageSize <= 0 ? filteredRows.length : pageSize) + 1;
  const displayEnd =
    pageSize <= 0
      ? filteredRows.length
      : Math.min(filteredRows.length, safeCurrentPage * pageSize);

  const handleExportExcel = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const storeName = siteContent.general.storeName;
      if (activeView === 'mutations') {
        await exportMutationsToExcel(filteredMutationLogs, storeName);
      } else {
        await exportInventoryToExcel(filteredRows, storeName);
      }
    } catch (err) {
      console.error('Gagal mengekspor Excel inventori:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 flex-1">
      {/* Page Header & Primary Actions */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#3A6B5C] mb-1">
            <span className="w-1.5 h-1.5 bg-[#3A6B5C]" />
            <span>Manajemen Stok Toko</span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-semibold text-[#18221E] tracking-tight">
            Stok &amp; Inventori Produk
          </h1>
          <p className="text-xs sm:text-sm text-[#52605A] mt-0.5">
            Pantau jumlah stok, tanggal kadaluarsa, lokasi penyimpanan, dan mutasi barang.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 w-full lg:w-auto">
          <button
            type="button"
            disabled={isExporting}
            onClick={() => void handleExportExcel()}
            className="h-10 px-3 sm:px-4 bg-white hover:bg-[#F1F5F3] disabled:opacity-60 disabled:cursor-not-allowed border border-[#E2E8E5] text-[#18221E] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#3A6B5C] shrink-0" />
            <span>{isExporting ? 'Menyiapkan Excel...' : 'Export Excel'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditTarget(null);
              setFormOpen(true);
            }}
            className="h-10 px-4 bg-[#3A6B5C] hover:bg-[#2E5649] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Tambah Produk Baru</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher Tab Bar */}
      <div
        role="tablist"
        aria-label="Mode tampilan inventori"
        className="bg-white border border-[#E2E8E5] p-1.5 flex items-center gap-1.5"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeView === 'stock'}
          onClick={() => switchView('stock')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 text-[11px] sm:text-xs font-semibold whitespace-nowrap border transition-colors cursor-pointer ${
            activeView === 'stock'
              ? 'bg-[#18221E] text-white border-[#18221E]'
              : 'bg-[#F8FAF9] text-[#52605A] border-[#E2E8E5] hover:border-[#18221E] hover:text-[#18221E]'
          }`}
        >
          <Package className="w-3.5 h-3.5 shrink-0" />
          <span>Daftar Stok ({kpis.totalSkus})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeView === 'mutations'}
          onClick={() => switchView('mutations')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 text-[11px] sm:text-xs font-semibold whitespace-nowrap border transition-colors cursor-pointer ${
            activeView === 'mutations'
              ? 'bg-[#18221E] text-white border-[#18221E]'
              : 'bg-[#F8FAF9] text-[#52605A] border-[#E2E8E5] hover:border-[#18221E] hover:text-[#18221E]'
          }`}
        >
          <History className="w-3.5 h-3.5 shrink-0" />
          <span>Riwayat Mutasi ({stockLogs.length})</span>
        </button>
      </div>

      {activeView === 'stock' ? (
        <>
      {/* 4 KPI Summary Tiles */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8E5] p-4 shadow-[0_4px_20px_-2px_rgba(24,34,30,0.04)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#52605A]">
              Total SKU &amp; Unit
            </span>
            <div className="w-8 h-8 bg-[#F1F5F3] flex items-center justify-center text-[#18221E]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-2xl font-bold text-[#18221E]">
                {kpis.totalSkus}
              </span>
              <span className="text-xs text-[#3A6B5C] font-semibold">
                SKU ({kpis.totalUnits.toLocaleString('id-ID')} Unit)
              </span>
            </div>
            <p className="text-[11px] text-[#52605A] mt-1">
              Terhubung dengan kasir POS &amp; katalog toko
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8E5] p-4 shadow-[0_4px_20px_-2px_rgba(24,34,30,0.04)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#52605A]">
              Nilai Modal Stok
            </span>
            <div className="w-8 h-8 bg-[#E6EFEA] flex items-center justify-center text-[#3A6B5C]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-headline text-2xl font-bold text-[#18221E]">
              {formatIDR(kpis.totalAssetValue)}
            </span>
            <p className="text-[11px] text-[#52605A] mt-1">
              Total nilai pembelian stok aktif saat ini
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8E5] p-4 shadow-[0_4px_20px_-2px_rgba(24,34,30,0.04)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#52605A]">
              Potensi Nilai Jual
            </span>
            <div className="w-8 h-8 bg-[#E6EFEA] flex items-center justify-center text-[#3A6B5C]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-headline text-2xl font-bold text-[#3A6B5C]">
              {formatIDR(kpis.totalRetailValue)}
            </span>
            <p className="text-[11px] text-[#52605A] mt-1">
              Estimasi total omzet retail dari sisa stok
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8E5] p-4 shadow-[0_4px_20px_-2px_rgba(24,34,30,0.04)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#52605A]">
              Peringatan Stok Menipis
            </span>
            <span className="px-2 py-0.5 bg-[#F5EFE6] text-[#8C6D46] text-[10px] font-semibold uppercase">
              Perlu Restock
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-2xl font-bold text-[#18221E]">
                {kpis.lowStockCount + kpis.outOfStockCount} SKU
              </span>
              {kpis.outOfStockCount > 0 && (
                <span className="text-xs font-semibold text-[#BA1A1A] flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {kpis.outOfStockCount} Habis
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#52605A] mt-1">
              Varian dengan stok &le; batas aman minimum
            </p>
          </div>
        </div>
      </section>

      {/* Filters & Segment Tabs */}
      <section className="bg-white border border-[#E2E8E5] p-4 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#7E8E87] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama produk, SKU, atau kemasan..."
              className="w-full h-10 pl-9 pr-9 bg-[#F8FAF9] border border-[#E2E8E5] focus:border-[#3A6B5C] focus:bg-white text-sm text-[#18221E] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Hapus pencarian"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7E8E87] hover:text-[#18221E] p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as ProductCategory)}
              aria-label="Filter kategori"
              className="w-full lg:w-auto h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-xs font-medium text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
            >
              <option value="all">Semua Kategori</option>
              <option value="kurma">Kurma Premium</option>
              <option value="kismis-kacang">Kacang &amp; Kismis</option>
              <option value="cokelat-gift">Cokelat &amp; Suvenir</option>
              <option value="zamzam-herbal">Air Zamzam &amp; Herbal</option>
              <option value="paket">Paket Oleh-Oleh</option>
            </select>

            <select
              value={locationFilter}
              onChange={(e) =>
                setLocationFilter(e.target.value as 'all' | StorageLocation)
              }
              aria-label="Filter lokasi gudang"
              className="w-full lg:w-auto h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-xs font-medium text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
            >
              <option value="all">Semua Lokasi Simpan</option>
              <option value="Ruang Pendingin">Ruang Pendingin</option>
              <option value="Gudang Kering">Gudang Kering</option>
              <option value="Gudang Palet">Gudang Palet</option>
              <option value="Etalase Toko">Etalase Toko</option>
            </select>
          </div>
        </div>

        {/* Status Segment Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { key: 'all' as const, label: `Semua (${kpis.totalSkus})` },
            { key: 'aman' as const, label: `Stok Aman (${kpis.safeStockCount})` },
            { key: 'menipis' as const, label: `Menipis (${kpis.lowStockCount})` },
            { key: 'habis' as const, label: `Habis (${kpis.outOfStockCount})` },
          ].map((tab) => {
            const active = statusTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusTab(tab.key)}
                className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap border transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#18221E] text-white border-[#18221E]'
                    : 'bg-[#F1F5F3] text-[#52605A] border-[#E2E8E5] hover:border-[#18221E]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Inventory DataTable: Max height <= 100vh with internal scroll, sticky thead & pagination */}
      <section className="bg-white border border-[#E2E8E5] shadow-[0_4px_20px_-2px_rgba(24,34,30,0.03)] flex flex-col max-h-[calc(100vh-8rem)]">
        <div className="overflow-auto flex-1 relative">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-[#F1F5F3] shadow-[inset_0_-1px_0_#E2E8E5]">
              <tr className="text-[10.5px] font-semibold uppercase tracking-wider text-[#52605A]">
                <th className="py-3 px-4 min-w-[250px]">Item &amp; Varian Spesifikasi</th>
                <th className="py-3 px-3 min-w-[130px]">Kategori</th>
                <th className="py-3 px-3 min-w-[140px]">Lokasi Gudang</th>
                <th className="py-3 px-3 min-w-[100px]">Expired</th>
                <th className="py-3 px-3 text-right min-w-[110px]">Harga Modal</th>
                <th className="py-3 px-3 text-right min-w-[110px]">Harga Jual</th>
                <th className="py-3 px-4 min-w-[175px]">Ketersediaan Stok</th>
                <th className="py-3 px-4 text-center min-w-[170px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8E5] text-xs text-[#18221E]">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#52605A]">
                    Tidak ada item inventori yang sesuai filter.
                  </td>
                </tr>
              ) : (
                paginatedRows.map(({ product, variant }) => {
                  const isOut = variant.stock <= 0;
                  const isLow = variant.stock > 0 && variant.stock <= variant.minStock;
                  const ratio = Math.min(
                    100,
                    Math.round((variant.stock / Math.max(1, variant.minStock * 3)) * 100)
                  );

                  return (
                    <tr
                      key={`${product.id}-${variant.id}`}
                      className="hover:bg-[#F8FAF9] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-10 h-10 object-cover border border-[#E2E8E5] shrink-0 bg-[#F1F5F3]"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-[#18221E] truncate max-w-[210px]">
                              {product.name}
                            </p>
                            <p className="text-[11px] text-[#52605A] font-mono">
                              <span className="text-[#3A6B5C] font-semibold">
                                {variant.sku}
                              </span>{' '}
                              • {variant.label}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-block whitespace-nowrap px-2 py-0.5 bg-[#F1F5F3] border border-[#E2E8E5] text-[10px] font-semibold uppercase tracking-wider text-[#52605A]">
                          {CATEGORY_NAME[product.category]}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex whitespace-nowrap items-center gap-1 px-2 py-0.5 text-[11px] font-medium ${
                            variant.storageLocation === 'Ruang Pendingin'
                              ? 'bg-[#E6EFEA] text-[#2C5246]'
                              : 'bg-[#F1F5F3] text-[#52605A]'
                          }`}
                        >
                          {variant.storageLocation}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-[#52605A]">
                        {variant.expiredDate}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-[#52605A]">
                        {formatIDR(variant.costPrice)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-semibold text-[#18221E]">
                        {formatIDR(variant.price)}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold font-mono">{variant.stock} unit</span>
                            <span
                              className={`font-semibold ${
                                isOut
                                  ? 'text-[#BA1A1A]'
                                  : isLow
                                  ? 'text-[#8C6D46]'
                                  : 'text-[#3A6B5C]'
                              }`}
                            >
                              {isOut ? 'Habis' : isLow ? 'Menipis' : 'Aman'}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[#E2E8E5] overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                isOut
                                  ? 'bg-[#BA1A1A]'
                                  : isLow
                                  ? 'bg-[#E6C093]'
                                  : 'bg-[#3A6B5C]'
                              }`}
                              style={{ width: `${ratio}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-[#7E8E87]">
                            Min. batas: {variant.minStock} unit
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setAdjustTarget({ product, variant })}
                            title="Sesuaikan Stok Masuk/Keluar"
                            aria-label={`Sesuaikan stok ${product.name} ${variant.label}`}
                            className="h-8 px-2.5 bg-[#F1F5F3] hover:bg-[#3A6B5C] hover:text-white border border-[#E2E8E5] text-[#18221E] text-[10.5px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Stok</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenSkuMutations(variant.sku)}
                            title={`Lihat riwayat mutasi ${variant.sku}`}
                            aria-label={`Lihat riwayat mutasi ${product.name} ${variant.label}`}
                            className="w-8 h-8 flex items-center justify-center bg-[#F1F5F3] hover:bg-[#3A6B5C] hover:text-white border border-[#E2E8E5] text-[#3A6B5C] transition-colors cursor-pointer"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditTarget({ product, variant });
                              setFormOpen(true);
                            }}
                            title="Edit Spesifikasi Produk"
                            aria-label={`Edit ${product.name}`}
                            className="w-8 h-8 flex items-center justify-center bg-[#F1F5F3] hover:bg-[#18221E] hover:text-white border border-[#E2E8E5] text-[#52605A] transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(product)}
                            title="Hapus Produk"
                            aria-label={`Hapus ${product.name}`}
                            className="w-8 h-8 flex items-center justify-center bg-[#F1F5F3] hover:bg-[#BA1A1A] hover:text-white border border-[#E2E8E5] text-[#52605A] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <TablePagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          totalItems={filteredRows.length}
          itemLabel="SKU"
          displayStart={displayStart}
          displayEnd={displayEnd}
          pageSize={pageSize}
          pageSizeSelectId="inv-page-size"
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </section>
        </>
      ) : (
        <StockMutationsView
          allLogs={stockLogs}
          filteredLogs={filteredMutationLogs}
          filters={mutationFilters}
          pageSize={mutPageSize}
          currentPage={mutCurrentPage}
          onFiltersChange={handleMutationFiltersChange}
          onResetFilters={handleResetMutationFilters}
          onPageChange={setMutCurrentPage}
          onPageSizeChange={(size) => {
            setMutPageSize(size);
            setMutCurrentPage(1);
          }}
        />
      )}

      {/* Modals */}
      <StockAdjustmentModal
        target={adjustTarget}
        onClose={() => setAdjustTarget(null)}
      />

      <ProductFormModal
        isOpen={formOpen}
        editTarget={editTarget}
        onClose={() => {
          setFormOpen(false);
          setEditTarget(null);
        }}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        variant="danger"
        icon="delete"
        title="Konfirmasi Hapus Produk"
        message={`Hapus produk "${deleteTarget?.name || ''}" dari inventori?`}
        description="Seluruh varian kemasan di dalam produk ini juga akan ikut dihapus dari halaman Kasir POS dan Katalog Toko. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Hapus Produk"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteProduct(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
};
