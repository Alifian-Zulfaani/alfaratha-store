import React, { useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { StockLog } from '../../types';

interface StockMutationDrawerProps {
  isOpen: boolean;
  logs: StockLog[];
  onClose: () => void;
}

const TYPE_LABELS: Record<StockLog['type'], string> = {
  restock: 'Restock Masuk',
  rusak: 'Stok Rusak',
  retur: 'Retur Barang',
  koreksi: 'Koreksi Opname',
  penjualan: 'Penjualan POS',
};

export const StockMutationDrawer: React.FC<StockMutationDrawerProps> = ({
  isOpen,
  logs,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 !mt-0 m-0 z-50 flex justify-end bg-[#18221E]/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Riwayat Mutasi Stok"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border-l border-[#E2E8E5] w-full max-w-lg h-full flex flex-col shadow-xl">
        <div className="px-5 py-4 bg-[#F1F5F3] border-b border-[#E2E8E5] flex items-center justify-between">
          <div>
            <h2 className="font-headline text-base font-semibold text-[#18221E]">
              Log Riwayat Mutasi Stok
            </h2>
            <p className="text-xs text-[#52605A]">
              Audit otomatis pengurangan POS &amp; restock gudang
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup riwayat mutasi stok"
            className="w-8 h-8 flex items-center justify-center bg-white border border-[#E2E8E5] text-[#52605A] hover:text-[#18221E] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#E2E8E5]">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#52605A]">
              Belum ada catatan mutasi stok.
            </div>
          ) : (
            logs.map((log) => {
              const isPositive = log.delta > 0;
              return (
                <div key={log.id} className="p-4 hover:bg-[#F8FAF9] transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            isPositive
                              ? 'bg-[#E6EFEA] text-[#2C5246]'
                              : 'bg-[#F5EFE6] text-[#8C6D46]'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {TYPE_LABELS[log.type]}
                        </span>
                        <span className="font-mono text-[10.5px] text-[#52605A]">{log.sku}</span>
                      </div>
                      <p className="font-semibold text-xs text-[#18221E] mt-1 truncate">
                        {log.productName} ({log.variantLabel})
                      </p>
                      <p className="text-[11px] text-[#52605A] mt-0.5">{log.reason}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`font-mono text-sm font-bold ${
                          isPositive ? 'text-[#3A6B5C]' : 'text-[#8C6D46]'
                        }`}
                      >
                        {isPositive ? `+${log.delta}` : log.delta}
                      </span>
                      <p className="text-[10.5px] text-[#52605A] font-mono">
                        {log.stockBefore} → {log.stockAfter}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-[#7E8E87]">
                    <span>Staff: {log.staffName}</span>
                    <span>
                      {new Date(log.timestamp).toLocaleString('id-ID', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
