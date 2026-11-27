import React, { useEffect, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { CmsFaqItem } from '../../types';
import { useStore } from '../../context/StoreContext';

interface FaqModalProps {
  isOpen: boolean;
  editTarget: CmsFaqItem | null;
  nextSortOrder: number;
  onClose: () => void;
}

export const FaqModal: React.FC<FaqModalProps> = ({
  isOpen,
  editTarget,
  nextSortOrder,
  onClose,
}) => {
  const { saveFaq } = useStore();

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [badge, setBadge] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [sortOrder, setSortOrder] = useState('0');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setError('');
    setIsSubmitting(false);
    if (editTarget) {
      setQuestion(editTarget.question);
      setAnswer(editTarget.answer);
      setBadge(editTarget.badge || '');
      setIsPublished(editTarget.isPublished);
      setSortOrder(String(editTarget.sortOrder));
    } else if (isOpen) {
      setQuestion('');
      setAnswer('');
      setBadge('Info Layanan');
      setIsPublished(true);
      setSortOrder(String(nextSortOrder));
    }
  }, [editTarget, isOpen, nextSortOrder]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);

    try {
      const res = await saveFaq({
        id: editTarget?.id,
        question,
        answer,
        badge: badge.trim() || undefined,
        isPublished,
        sortOrder: Math.max(0, parseInt(sortOrder || '0', 10) || 0),
      });

      if (!res.ok) {
        setError(res.error || 'Gagal menyimpan FAQ.');
        return;
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 !mt-0 m-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#18221E]/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cms-faq-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="bg-white border border-[#E2E8E5] shadow-[0_8px_32px_rgba(24,34,30,0.16)] w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-4 sm:px-5 py-3.5 bg-[#F1F5F3] border-b border-[#E2E8E5] flex items-center justify-between gap-2 shrink-0">
          <div className="min-w-0 flex-1">
            <h2 id="cms-faq-title" className="font-headline text-sm sm:text-base font-semibold text-[#18221E] truncate">
              {editTarget ? 'Edit Pertanyaan FAQ' : 'Tambah Pertanyaan FAQ Baru'}
            </h2>
            <p className="text-[11px] text-[#52605A] truncate">
              4 FAQ aktif teratas tampil pada akordeon Landing Page.
            </p>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            aria-label="Tutup modal FAQ"
            className="w-8 h-8 flex items-center justify-center bg-white border border-[#E2E8E5] text-[#52605A] hover:text-[#18221E] cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form id="cms-faq-form" onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {error && (
            <div role="alert" className="p-3 bg-[#FFF5F5] border border-[#BA1A1A]/30 text-[#93000A] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#52605A]">
                Pertanyaan
              </label>
              <span className="text-[10px] text-[#7E8E87]">{question.length}/120</span>
            </div>
            <input
              type="text"
              required
              maxLength={120}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Apakah Air Zamzam dan Kurma Ajwa dijamin asli?"
              className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#52605A]">
                Jawaban Lengkap
              </label>
              <span className="text-[10px] text-[#7E8E87]">{answer.length}/450</span>
            </div>
            <textarea
              rows={5}
              required
              maxLength={450}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Penjelasan ringkas dan meyakinkan..."
              className="w-full p-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
                Tag Kategori (Opsional)
              </label>
              <input
                type="text"
                maxLength={30}
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Garansi Keaslian"
                className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
                Urutan Tampil
              </label>
              <input
                type="number"
                min={0}
                required
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm font-mono text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
              />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-[#18221E]">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="accent-[#3A6B5C] w-4 h-4"
            />
            <span>Publikasikan di Etalase</span>
          </label>
        </form>

        <div className="px-4 sm:px-5 py-3.5 bg-[#F8FAF9] border-t border-[#E2E8E5] flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="h-10 px-4 border border-[#E2E8E5] bg-white hover:bg-[#F1F5F3] disabled:opacity-50 text-xs font-semibold text-[#52605A] cursor-pointer transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            form="cms-faq-form"
            className="h-10 px-4 sm:px-5 bg-[#3A6B5C] hover:bg-[#2E5649] disabled:bg-[#7E8E87] disabled:cursor-not-allowed text-white text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan FAQ'}
          </button>
        </div>
      </div>
    </div>
  );
};
