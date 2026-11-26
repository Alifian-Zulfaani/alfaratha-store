import React, { useEffect } from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { TransactionRecord } from '../../types';
import { formatIDR } from '../../utils/whatsapp';
import { WhatsAppIcon } from '../ui/WhatsAppIcon';

interface ReceiptModalProps {
  transaction: TransactionRecord | null;
  onClose: () => void;
}

const PAYMENT_LABEL: Record<TransactionRecord['paymentMethod'], string> = {
  cash: 'Tunai / Cash',
  qris: 'QRIS Dinamis',
  transfer: 'Transfer Bank',
  edc: 'Debit EDC',
};

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  useEffect(() => {
    if (!transaction) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [transaction, onClose]);

  if (!transaction) return null;

  const formattedDate = new Date(transaction.timestamp).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const handlePrint = () => {
    window.print();
  };

  const buildWhatsAppReceiptUrl = () => {
    const itemsText = transaction.items
      .map(
        (item) =>
          `• ${item.productName} (${item.variantLabel}) x${item.quantity} = ${formatIDR(
            item.lineTotal
          )}`
      )
      .join('\n');

    const msg =
      `*STRUK DIGITAL ALFARATHA STORE*\n` +
      `No. Faktur: ${transaction.invoiceNumber}\n` +
      `Tanggal: ${formattedDate}\n` +
      `Pelanggan: ${transaction.customerName}\n` +
      `Kasir: ${transaction.cashierName}\n` +
      `--------------------------------\n` +
      `${itemsText}\n` +
      `--------------------------------\n` +
      `Subtotal: ${formatIDR(transaction.subtotal)}\n` +
      (transaction.discount > 0
        ? `Diskon Paket Jamaah: -${formatIDR(transaction.discount)}\n`
        : '') +
      `*TOTAL BAYAR: ${formatIDR(transaction.total)}*\n` +
      `Metode: ${PAYMENT_LABEL[transaction.paymentMethod]}\n` +
      (transaction.paymentMethod === 'cash'
        ? `Tunai Diterima: ${formatIDR(transaction.cashReceived)}\nKembalian: ${formatIDR(
            transaction.changeAmount
          )}\n`
        : '') +
      `\nJazakumullahu Khairan. Semoga berkah & menjadi oleh-oleh yang dinanti keluarga.`;

    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div
      className="fixed inset-0 !mt-0 m-0 z-50 flex items-center justify-center p-4 bg-[#18221E]/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-[#E2E8E5] shadow-[0_8px_32px_rgba(24,34,30,0.16)] w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Top Bar (hidden on print) */}
        <div className="px-5 py-3.5 bg-[#F1F5F3] border-b border-[#E2E8E5] flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2 text-[#2C5246]">
            <CheckCircle2 className="w-5 h-5 text-[#3A6B5C]" />
            <h2 id="receipt-modal-title" className="font-headline text-sm font-semibold">
              Transaksi Selesai • Struk Digital
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal struk"
            className="w-8 h-8 flex items-center justify-center bg-white border border-[#E2E8E5] text-[#52605A] hover:text-[#18221E] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 font-sans text-xs text-[#18221E]">
          <div className="text-center pb-4 border-b border-dashed border-[#C3C8C4]">
            <div className="w-9 h-9 bg-[#18221E] text-white font-headline font-bold text-base flex items-center justify-center mx-auto mb-2">
              A
            </div>
            <h3 className="font-headline text-base font-bold tracking-tight">
              ALFARATHA STORE
            </h3>
            <p className="text-[11px] text-[#52605A]">
              Pusat Kurma Premium &amp; Oleh-Oleh Haji Umroh
            </p>
            <p className="text-[10px] text-[#52605A] mt-0.5">
              Alfaratha Store • WA: +62 815-5443-1137
            </p>
          </div>

          {/* Transaction Metadata */}
          <div className="py-3 border-b border-dashed border-[#C3C8C4] space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#52605A]">No. Faktur</span>
              <span className="font-mono font-semibold">{transaction.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#52605A]">Waktu</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#52605A]">Kasir</span>
              <span>{transaction.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#52605A]">Pelanggan</span>
              <span className="font-medium text-right max-w-[60%] truncate">
                {transaction.customerName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#52605A]">Mode Harga</span>
              <span className="uppercase font-semibold text-[#3A6B5C]">
                {transaction.pricingMode === 'jamaah' ? 'Paket Jamaah' : 'Eceran / Retail'}
              </span>
            </div>
          </div>

          {/* Itemized Lines */}
          <div className="py-3 border-b border-dashed border-[#C3C8C4] space-y-2.5">
            {transaction.items.map((item) => (
              <div key={`${item.productId}-${item.variantId}`} className="flex flex-col">
                <div className="flex justify-between gap-2 font-medium">
                  <span>
                    {item.productName} ({item.variantLabel})
                  </span>
                  <span className="font-mono shrink-0">{formatIDR(item.lineTotal)}</span>
                </div>
                <span className="text-[10.5px] text-[#52605A] font-mono">
                  {item.quantity} x {formatIDR(item.unitPrice)} • {item.sku}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="py-3 border-b border-dashed border-[#C3C8C4] space-y-1.5 text-[11.5px]">
            <div className="flex justify-between text-[#52605A]">
              <span>Subtotal</span>
              <span className="font-mono">{formatIDR(transaction.subtotal)}</span>
            </div>
            {transaction.discount > 0 && (
              <div className="flex justify-between text-[#3A6B5C] font-medium">
                <span>Diskon Paket Jamaah</span>
                <span className="font-mono">-{formatIDR(transaction.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-[#18221E] pt-1 border-t border-[#E2E8E5]">
              <span>TOTAL TAGIHAN</span>
              <span className="font-headline">{formatIDR(transaction.total)}</span>
            </div>
            <div className="flex justify-between text-[#52605A] pt-1">
              <span>Metode Pembayaran</span>
              <span className="font-semibold text-[#18221E]">
                {PAYMENT_LABEL[transaction.paymentMethod]}
              </span>
            </div>
            <div className="flex justify-between text-[#52605A]">
              <span>Diterima</span>
              <span className="font-mono">{formatIDR(transaction.cashReceived)}</span>
            </div>
            {transaction.paymentMethod === 'cash' && (
              <div className="flex justify-between font-semibold text-[#2C5246]">
                <span>Kembalian</span>
                <span className="font-mono">{formatIDR(transaction.changeAmount)}</span>
              </div>
            )}
          </div>

          {transaction.notes && (
            <div className="py-2.5 border-b border-dashed border-[#C3C8C4] text-[11px] text-[#52605A]">
              <span className="font-semibold text-[#18221E]">Catatan: </span>
              {transaction.notes}
            </div>
          )}

          <div className="pt-4 text-center text-[10.5px] text-[#52605A] space-y-0.5">
            <p className="font-semibold text-[#18221E]">Jazakumullahu Khairan Katsiran</p>
            <p>Garansi 100% Asli Madinah &amp; Makkah • Simpan di suhu sejuk</p>
          </div>
        </div>

        {/* Modal Footer Actions (hidden on print) */}
        <div className="p-4 bg-[#F8FAF9] border-t border-[#E2E8E5] grid grid-cols-2 gap-2.5 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="h-10 bg-[#18221E] hover:bg-[#26332E] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Struk</span>
          </button>

          <a
            href={buildWhatsAppReceiptUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 bg-[#3A6B5C] hover:bg-[#2E5649] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <WhatsAppIcon className="w-4 h-4 text-white" />
            <span>Kirim ke WA</span>
          </a>
        </div>
      </div>
    </div>
  );
};
