import React, { useEffect, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { CmsTestimonial } from '../../types';
import { useStore } from '../../context/StoreContext';

interface TestimonialModalProps {
  isOpen: boolean;
  editTarget: CmsTestimonial | null;
  nextSortOrder: number;
  onClose: () => void;
}

export const TestimonialModal: React.FC<TestimonialModalProps> = ({
  isOpen,
  editTarget,
  nextSortOrder,
  onClose,
}) => {
  const { saveTestimonial } = useStore();

  const [author, setAuthor] = useState('');
  const [role, setRole] = useState('');
  const [city, setCity] = useState('');
  const [rating, setRating] = useState('5');
  const [content, setContent] = useState('');
  const [purchasedProduct, setPurchasedProduct] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [sortOrder, setSortOrder] = useState('0');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setError('');
    setIsSubmitting(false);
    if (editTarget) {
      setAuthor(editTarget.author);
      setRole(editTarget.role);
      setCity(editTarget.city);
      setRating(String(editTarget.rating));
      setContent(editTarget.content);
      setPurchasedProduct(editTarget.purchasedProduct);
      setIsPublished(editTarget.isPublished);
      setSortOrder(String(editTarget.sortOrder));
    } else if (isOpen) {
      setAuthor('');
      setRole('Jamaah Umroh');
      setCity('Surabaya');
      setRating('5');
      setContent('');
      setPurchasedProduct('Paket Madinah Box');
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
      const res = await saveTestimonial({
        id: editTarget?.id,
        author,
        role,
        city,
        rating: Math.min(5, Math.max(1, parseInt(rating || '5', 10) || 5)),
        content,
        purchasedProduct,
        isPublished,
        sortOrder: Math.max(0, parseInt(sortOrder || '0', 10) || 0),
      });

      if (!res.ok) {
        setError(res.error || 'Gagal menyimpan testimoni.');
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
      aria-labelledby="cms-testi-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="bg-white border border-[#E2E8E5] shadow-[0_8px_32px_rgba(24,34,30,0.16)] w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-4 sm:px-5 py-3.5 bg-[#F1F5F3] border-b border-[#E2E8E5] flex items-center justify-between gap-2 shrink-0">
          <div className="min-w-0 flex-1">
            <h2 id="cms-testi-title" className="font-headline text-sm sm:text-base font-semibold text-[#18221E] truncate">
              {editTarget ? `Edit Testimoni • ${editTarget.author}` : 'Tambah Testimoni Jamaah'}
            </h2>
            <p className="text-[11px] text-[#52605A] truncate">
              2 testimoni aktif teratas tampil berdampingan dengan FAQ di Landing Page.
            </p>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            aria-label="Tutup modal testimoni"
            className="w-8 h-8 flex items-center justify-center bg-white border border-[#E2E8E5] text-[#52605A] hover:text-[#18221E] cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form id="cms-testi-form" onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {error && (
            <div role="alert" className="p-3 bg-[#FFF5F5] border border-[#BA1A1A]/30 text-[#93000A] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <div className="flex justify-between mb-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#52605A]">
                  Nama Jamaah / Pelanggan
                </label>
                <span className="text-[10px] text-[#7E8E87]">{author.length}/45</span>
              </div>
              <input
                type="text"
                required
                maxLength={45}
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Misal: Hj. Maryam Subagyo"
                className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#52605A]">
                  Peran / Keterangan
                </label>
                <span className="text-[10px] text-[#7E8E87]">{role.length}/50</span>
              </div>
              <input
                type="text"
                required
                maxLength={50}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Jamaah Umroh Reguler"
                className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#52605A]">
                  Kota Asal
                </label>
                <span className="text-[10px] text-[#7E8E87]">{city.length}/35</span>
              </div>
              <input
                type="text"
                required
                maxLength={35}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Surabaya"
                className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
                Rating Bintang
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
              >
                <option value="5">5 Bintang (★★★★★)</option>
                <option value="4">4 Bintang (★★★★)</option>
                <option value="3">3 Bintang (★★★)</option>
              </select>
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

            <div className="sm:col-span-2">
              <div className="flex justify-between mb-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#52605A]">
                  Kutipan Ulasan Jamaah
                </label>
                <span className="text-[10px] text-[#7E8E87]">{content.length}/290</span>
              </div>
              <textarea
                rows={4}
                required
                maxLength={290}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Alhamdulillah kepulangan umroh kemarin sangat tenang..."
                className="w-full p-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
                Catatan Produk yang Dibeli (Internal CMS)
              </label>
              <input
                type="text"
                maxLength={80}
                value={purchasedProduct}
                onChange={(e) => setPurchasedProduct(e.target.value)}
                placeholder="120 Box Paket Madinah"
                className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-[#18221E]">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="accent-[#3A6B5C] w-4 h-4"
                />
                <span>Publikasikan di Etalase</span>
              </label>
            </div>
          </div>
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
            form="cms-testi-form"
            className="h-10 px-4 sm:px-5 bg-[#3A6B5C] hover:bg-[#2E5649] disabled:bg-[#7E8E87] disabled:cursor-not-allowed text-white text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Testimoni'}
          </button>
        </div>
      </div>
    </div>
  );
};
