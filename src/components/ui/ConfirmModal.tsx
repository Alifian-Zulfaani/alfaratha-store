import React, { useEffect } from 'react';
import { AlertTriangle, LogOut, Trash2, HelpCircle, X } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  variant?: 'danger' | 'warning' | 'primary';
  icon?: 'logout' | 'delete' | 'warning' | 'question';
  title: string;
  message: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  variant = 'danger',
  icon = 'warning',
  title,
  message,
  description,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  onCancel,
  onConfirm,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const IconComponent =
    icon === 'logout'
      ? LogOut
      : icon === 'delete'
      ? Trash2
      : icon === 'question'
      ? HelpCircle
      : AlertTriangle;

  const iconColorClass =
    variant === 'danger'
      ? 'text-[#BA1A1A]'
      : variant === 'warning'
      ? 'text-[#8C6D46]'
      : 'text-[#3A6B5C]';

  const confirmButtonClass =
    variant === 'danger'
      ? 'bg-[#BA1A1A] hover:bg-[#93000A] text-white'
      : variant === 'warning'
      ? 'bg-[#8C6D46] hover:bg-[#755935] text-white'
      : 'bg-[#3A6B5C] hover:bg-[#2E5649] text-white';

  return (
    <div
      className="fixed inset-0 !mt-0 m-0 z-50 flex items-center justify-center p-4 bg-[#18221E]/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-white border border-[#E2E8E5] shadow-[0_8px_32px_rgba(24,34,30,0.16)] w-full max-w-md flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="px-5 py-3.5 bg-[#F1F5F3] border-b border-[#E2E8E5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[#18221E]">
            <IconComponent className={`w-4 h-4 ${iconColorClass}`} />
            <h2 id="confirm-modal-title" className="font-headline text-sm font-semibold">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Tutup dialog konfirmasi"
            className="w-7 h-7 flex items-center justify-center bg-white border border-[#E2E8E5] text-[#52605A] hover:text-[#18221E] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-2">
          <p className="text-sm text-[#18221E] font-medium leading-snug">{message}</p>
          {description && (
            <p className="text-xs text-[#52605A] leading-relaxed">{description}</p>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="px-5 py-3.5 bg-[#F8FAF9] border-t border-[#E2E8E5] flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="h-9 px-4 border border-[#E2E8E5] bg-white hover:bg-[#F1F5F3] text-xs font-semibold text-[#52605A] cursor-pointer transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-9 px-4 text-xs font-semibold cursor-pointer transition-colors ${confirmButtonClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
