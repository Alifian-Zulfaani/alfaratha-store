import React, { useState, useEffect } from 'react';
import { X, ArrowUpCircle, ArrowDownCircle, AlertCircle } from 'lucide-react';
import { NormalizedProduct, NormalizedProductVariant, StockAdjustmentType } from '../../types';
import { useStore } from '../../context/StoreContext';

interface StockAdjustmentModalProps {
  target: { product: NormalizedProduct; variant: NormalizedProductVariant } | null;
  onClose: () => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ target, onClose }) => {
  const { adjustStock } = useStore();
  const [direction, setDirection] = useState<'in' | 'out'>('in');
  const [adjType, setAdjType] = useState<Exclude<StockAdjustmentType, 'penjualan'>>('restock');
  const [qty, setQty] = useState<string>('10');
  const [reason, setReason] = useState<string>('Restock Supplier');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (target) {
      setDirection('in');
      setAdjType('restock');
      setQty('10');
      setReason('Restock Supplier');
      setError('');
    }
  }, [target]);

  useEffect(() => {
    if (!target) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [target, onClose]);

  if (!target) return null;

  const { product, variant } = target;
  const numericQty = Math.max(0, parseInt(qty || '0', 10) || 0);
  const delta = direction === 'in' ? numericQty : -numericQty;
  const projectedStock = variant.stock + delta;

  const handleDirectionChange = (dir: 'in' | 'out') => {
    setDirection(dir);
    if (dir === 'in') {
      setAdjType('restock');
      setReason('Restock Supplier');
    } else {
      setAdjType('rusak');
      setReason('Stok Rusak / Retur');
    }
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numericQty <= 0) {
      setError('Masukkan jumlah stok lebih dari 0.');
      return;
    }

    const res = adjustStock(product.id, variant.id, delta, adjType, reason);
    if (!res.ok) {
      setError(res.error || 'Gagal memperbarui stok.');
      return;
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 !mt-0 m-0 z-50 flex items-center justify-center p-4 bg-[#18221E]/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stock-adj-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-[#E2E8E5] shadow-[0_8px_32px_rgba(24,34,30,0.16)] w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="px-4 sm:px-5 py-3.5 bg-[#F1F5F3] border-b border-[#E2E8E5] flex items-center justify-between gap-2 shrink-0">
          <div className="min-w-0 flex-1">
            <h2 id="stock-adj-title" className="font-headline text-sm font-semibold text-[#18221E] truncate">
              Penyesuaian Stok (Stock Adjustment)
            </h2>
            <p className="text-[11px] text-[#52605A] truncate">
              {product.name} • {variant.label} ({variant.sku})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal penyesuaian stok"
            className="w-8 h-8 flex items-center justify-center bg-white border border-[#E2E8E5] text-[#52605A] hover:text-[#18221E] cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="stock-adj-form" onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3 bg-[#FFF5F5] border border-[#BA1A1A]/30 text-[#93000A] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Direction Switcher */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDirectionChange('in')}
              className={`py-2.5 px-2.5 sm:px-3 border flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer ${
                direction === 'in'
                  ? 'bg-[#3A6B5C] text-white border-[#3A6B5C]'
                  : 'bg-[#F8FAF9] text-[#52605A] border-[#E2E8E5] hover:border-[#18221E]'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4 shrink-0" />
              <span>Stok Masuk (+)</span>
            </button>
            <button
              type="button"
              onClick={() => handleDirectionChange('out')}
              className={`py-2.5 px-2.5 sm:px-3 border flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer ${
                direction === 'out'
                  ? 'bg-[#18221E] text-white border-[#18221E]'
                  : 'bg-[#F8FAF9] text-[#52605A] border-[#E2E8E5] hover:border-[#18221E]'
              }`}
            >
              <ArrowDownCircle className="w-4 h-4 shrink-0" />
              <span>Stok Keluar (-)</span>
            </button>
          </div>

          {/* Adjustment Type */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
              Jenis Mutasi
            </label>
            <select
              value={adjType}
              onChange={(e) =>
                setAdjType(e.target.value as Exclude<StockAdjustmentType, 'penjualan'>)
              }
              className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
            >
              {direction === 'in' ? (
                <>
                  <option value="restock">Restock Supplier Masuk</option>
                  <option value="retur">Retur Pelanggan Layak Jual</option>
                  <option value="koreksi">Koreksi Opname (+)</option>
                </>
              ) : (
                <>
                  <option value="rusak">Stok Rusak / Kadaluarsa</option>
                  <option value="retur">Retur ke Supplier</option>
                  <option value="koreksi">Koreksi Opname (-)</option>
                </>
              )}
            </select>
          </div>

          {/* Quantity & Projection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="adj-qty"
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1"
              >
                Jumlah Unit
              </label>
              <input
                id="adj-qty"
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm font-semibold text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
              />
            </div>
            <div className="bg-[#F1F5F3] border border-[#E2E8E5] px-3 py-2 flex flex-col justify-center">
              <span className="text-[10px] uppercase tracking-wider text-[#52605A]">
                Proyeksi Stok Akhir
              </span>
              <span
                className={`font-headline text-base font-bold ${
                  projectedStock < 0
                    ? 'text-[#BA1A1A]'
                    : projectedStock <= variant.minStock
                    ? 'text-[#8C6D46]'
                    : 'text-[#3A6B5C]'
                }`}
              >
                {variant.stock} → {projectedStock} unit
              </span>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label
              htmlFor="adj-reason"
              className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1"
            >
              Catatan / Keterangan
            </label>
            <input
              id="adj-reason"
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Misal: Kedatangan stok baru dari supplier"
              className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
            />
          </div>
        </form>

        {/* Fixed Modal Footer */}
        <div className="px-4 sm:px-5 py-3.5 bg-[#F8FAF9] border-t border-[#E2E8E5] flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 border border-[#E2E8E5] bg-white hover:bg-[#F1F5F3] text-xs font-semibold text-[#52605A] cursor-pointer transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            form="stock-adj-form"
            className="h-10 px-4 sm:px-5 bg-[#3A6B5C] hover:bg-[#2E5649] text-white text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap"
          >
            Simpan Perubahan Stok
          </button>
        </div>
      </div>
    </div>
  );
};
