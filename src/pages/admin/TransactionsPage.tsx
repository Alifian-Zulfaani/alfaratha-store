import React, { useState, useMemo, useEffect } from 'react';
import { ReceiptText, Search, Download, Eye, Banknote, TrendingUp, Calendar, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PaymentMethod, TransactionRecord } from '../../types';
import { formatIDR } from '../../utils/whatsapp';
import { ReceiptModal } from '../../components/pos/ReceiptModal';
import { TablePagination } from '../../components/ui/TablePagination';

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cash: 'Tunai',
  qris: 'QRIS',
  transfer: 'Transfer',
  edc: 'Debit EDC',
};

export const TransactionsPage: React.FC = () => {
  const { transactions } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | PaymentMethod>('all');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedReceipt, setSelectedReceipt] = useState<TransactionRecord | null>(null);

  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    let totalRevenue = 0;
    let todayRevenue = 0;
    let todayCount = 0;

    for (const trx of transactions) {
      totalRevenue += trx.total;
      if (trx.timestamp.slice(0, 10) === todayStr) {
        todayRevenue += trx.total;
        todayCount++;
      }
    }

    const avgOrder = transactions.length > 0 ? Math.round(totalRevenue / transactions.length) : 0;

    return {
      totalCount: transactions.length,
      totalRevenue,
      todayRevenue,
      todayCount,
      avgOrder,
    };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return transactions.filter((trx) => {
      if (paymentFilter !== 'all' && trx.paymentMethod !== paymentFilter) return false;
      if (
        q &&
        !trx.invoiceNumber.toLowerCase().includes(q) &&
        !trx.customerName.toLowerCase().includes(q) &&
        !trx.cashierName.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [transactions, paymentFilter, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, paymentFilter, pageSize]);

  const totalPages = useMemo(() => {
    if (pageSize <= 0) return 1;
    return Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  }, [filteredTransactions.length, pageSize]);

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedTransactions = useMemo(() => {
    if (pageSize <= 0) return filteredTransactions;
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, safeCurrentPage, pageSize]);

  const displayStart =
    filteredTransactions.length === 0
      ? 0
      : (safeCurrentPage - 1) * (pageSize <= 0 ? filteredTransactions.length : pageSize) + 1;
  const displayEnd =
    pageSize <= 0
      ? filteredTransactions.length
      : Math.min(filteredTransactions.length, safeCurrentPage * pageSize);

  const handleExportCsv = () => {
    const headers = [
      'No Invoice',
      'Waktu',
      'Kasir',
      'Pelanggan',
      'Mode Harga',
      'Item',
      'Subtotal',
      'Diskon',
      'Total Bayar',
      'Metode Bayar',
    ];

    const rows = [
      headers.join(','),
      ...filteredTransactions.map((trx) => {
        const itemSummary = trx.items
          .map((i) => `${i.productName} (${i.variantLabel}) x${i.quantity}`)
          .join(' | ');
        return [
          `"${trx.invoiceNumber}"`,
          `"${new Date(trx.timestamp).toLocaleString('id-ID')}"`,
          `"${trx.cashierName}"`,
          `"${trx.customerName.replace(/"/g, '""')}"`,
          `"${trx.pricingMode}"`,
          `"${itemSummary.replace(/"/g, '""')}"`,
          trx.subtotal,
          trx.discount,
          trx.total,
          `"${PAYMENT_LABEL[trx.paymentMethod]}"`,
        ].join(',');
      }),
    ];

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alfaratha-transaksi-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 flex-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#3A6B5C] mb-1">
            <span className="w-1.5 h-1.5 bg-[#3A6B5C]" />
            <span>Laporan Penjualan &amp; Struk</span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-semibold text-[#18221E] tracking-tight">
            Riwayat Transaksi Kasir
          </h1>
          <p className="text-xs sm:text-sm text-[#52605A] mt-0.5">
            Daftar seluruh faktur penjualan POS beserta opsi lihat ulang struk dan ekspor CSV.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="h-10 px-4 bg-[#18221E] hover:bg-[#3A6B5C] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Penjualan</span>
        </button>
      </div>

      {/* KPI Summary Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8E5] p-4 shadow-[0_4px_20px_-2px_rgba(24,34,30,0.03)]">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#52605A]">
            <span>Omzet Hari Ini</span>
            <Calendar className="w-4 h-4 text-[#3A6B5C]" />
          </div>
          <p className="font-headline text-2xl font-bold text-[#18221E] mt-3">
            {formatIDR(stats.todayRevenue)}
          </p>
          <p className="text-[11px] text-[#3A6B5C] font-medium mt-1">
            {stats.todayCount} transaksi tercatat hari ini
          </p>
        </div>

        <div className="bg-white border border-[#E2E8E5] p-4 shadow-[0_4px_20px_-2px_rgba(24,34,30,0.03)]">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#52605A]">
            <span>Total Omzet Kumulatif</span>
            <Banknote className="w-4 h-4 text-[#3A6B5C]" />
          </div>
          <p className="font-headline text-2xl font-bold text-[#18221E] mt-3">
            {formatIDR(stats.totalRevenue)}
          </p>
          <p className="text-[11px] text-[#52605A] mt-1">
            Akumulasi seluruh faktur tersimpan
          </p>
        </div>

        <div className="bg-white border border-[#E2E8E5] p-4 shadow-[0_4px_20px_-2px_rgba(24,34,30,0.03)]">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#52605A]">
            <span>Total Faktur</span>
            <ReceiptText className="w-4 h-4 text-[#8C6D46]" />
          </div>
          <p className="font-headline text-2xl font-bold text-[#18221E] mt-3">
            {stats.totalCount} Faktur
          </p>
          <p className="text-[11px] text-[#52605A] mt-1">
            Eceran &amp; Paket Rombongan Jamaah
          </p>
        </div>

        <div className="bg-white border border-[#E2E8E5] p-4 shadow-[0_4px_20px_-2px_rgba(24,34,30,0.03)]">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#52605A]">
            <span>Rata-Rata Transaksi</span>
            <TrendingUp className="w-4 h-4 text-[#3A6B5C]" />
          </div>
          <p className="font-headline text-2xl font-bold text-[#18221E] mt-3">
            {formatIDR(stats.avgOrder)}
          </p>
          <p className="text-[11px] text-[#52605A] mt-1">
            Nilai keranjang rata-rata per faktur
          </p>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="bg-white border border-[#E2E8E5] p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#7E8E87] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nomor faktur (TRX-...), nama pelanggan, atau kasir..."
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

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value as 'all' | PaymentMethod)}
          aria-label="Filter metode pembayaran"
          className="h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-xs font-medium text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
        >
          <option value="all">Semua Metode Bayar</option>
          <option value="cash">Tunai / Cash</option>
          <option value="qris">QRIS</option>
          <option value="transfer">Transfer Bank</option>
          <option value="edc">Debit EDC</option>
        </select>
      </section>

      {/* Transactions DataTable: Max height <= 100vh with internal scroll, sticky thead & pagination */}
      <section className="bg-white border border-[#E2E8E5] shadow-[0_4px_20px_-2px_rgba(24,34,30,0.03)] flex flex-col max-h-[calc(100vh-8rem)]">
        <div className="overflow-auto flex-1 relative">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-[#F1F5F3] shadow-[inset_0_-1px_0_#E2E8E5]">
              <tr className="text-[10.5px] font-semibold uppercase tracking-wider text-[#52605A]">
                <th className="py-3 px-4 min-w-[140px]">No. Invoice</th>
                <th className="py-3 px-3 min-w-[150px]">Waktu</th>
                <th className="py-3 px-3 min-w-[170px]">Pelanggan &amp; Kasir</th>
                <th className="py-3 px-3 min-w-[230px]">Daftar Item</th>
                <th className="py-3 px-3 min-w-[110px]">Metode</th>
                <th className="py-3 px-3 text-right min-w-[130px]">Total Nominal</th>
                <th className="py-3 px-4 text-center min-w-[110px]">Struk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8E5] text-xs text-[#18221E]">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#52605A]">
                    Belum ada riwayat transaksi yang cocok.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-[#F8FAF9] transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-[#3A6B5C]">
                      {trx.invoiceNumber}
                      <span className="block text-[10px] font-sans uppercase text-[#8C6D46]">
                        {trx.pricingMode === 'jamaah' ? 'Paket Jamaah' : 'Eceran'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-[#52605A]">
                      {new Date(trx.timestamp).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-semibold text-[#18221E] truncate max-w-[180px]">
                        {trx.customerName}
                      </p>
                      <p className="text-[11px] text-[#52605A]">Kasir: {trx.cashierName}</p>
                    </td>

                    <td className="py-3 px-3">
                      <ul className="space-y-0.5 text-[11px] text-[#52605A]">
                        {trx.items.slice(0, 2).map((item) => (
                          <li
                            key={`${item.productId}-${item.variantId}`}
                            className="truncate max-w-[230px]"
                          >
                            <span className="font-semibold text-[#18221E]">
                              {item.quantity}x
                            </span>{' '}
                            {item.productName} ({item.variantLabel})
                          </li>
                        ))}
                        {trx.items.length > 2 && (
                          <li className="text-[10px] font-semibold text-[#3A6B5C]">
                            +{trx.items.length - 2} item lainnya
                          </li>
                        )}
                      </ul>
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-block whitespace-nowrap px-2 py-0.5 bg-[#E6EFEA] text-[#2C5246] text-[10.5px] font-semibold uppercase">
                        {PAYMENT_LABEL[trx.paymentMethod]}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <span className="font-headline font-bold text-sm text-[#18221E]">
                        {formatIDR(trx.total)}
                      </span>
                      {trx.discount > 0 && (
                        <span className="block text-[10px] text-[#3A6B5C]">
                          Hemat {formatIDR(trx.discount)}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedReceipt(trx)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F1F5F3] hover:bg-[#18221E] hover:text-white border border-[#E2E8E5] text-[#18221E] text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Struk</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <TablePagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          totalItems={filteredTransactions.length}
          itemLabel="transaksi"
          displayStart={displayStart}
          displayEnd={displayEnd}
          pageSize={pageSize}
          pageSizeSelectId="trx-page-size"
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </section>

      <ReceiptModal
        transaction={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
};
