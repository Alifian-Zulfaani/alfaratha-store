import React, { useEffect, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { CmsPackageBundle } from '../../types';
import { useStore } from '../../context/StoreContext';

interface PackageBundleModalProps {
  isOpen: boolean;
  editTarget: CmsPackageBundle | null;
  nextSortOrder: number;
  onClose: () => void;
}

export const PackageBundleModal: React.FC<PackageBundleModalProps> = ({
  isOpen,
  editTarget,
  nextSortOrder,
  onClose,
}) => {
  const { savePackageBundle } = useStore();

  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [boxDescription, setBoxDescription] = useState('');
  const [singlePrice, setSinglePrice] = useState('45000');
  const [bulkPrice, setBulkPrice] = useState('36000');
  const [minBulkUnits, setMinBulkUnits] = useState('20');
  const [isPopular, setIsPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState('0');
  const [itemsText, setItemsText] = useState('');
  const [bonusesText, setBonusesText] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setError('');
    setIsSubmitting(false);
    if (editTarget) {
      setName(editTarget.name);
      setSubtitle(editTarget.subtitle);
      setBoxDescription(editTarget.boxDescription);
      setSinglePrice(String(editTarget.singlePrice));
      setBulkPrice(String(editTarget.bulkPrice));
      setMinBulkUnits(String(editTarget.minBulkUnits));
      setIsPopular(Boolean(editTarget.isPopular));
      setIsActive(editTarget.isActive);
      setSortOrder(String(editTarget.sortOrder));
      setItemsText(editTarget.items.join('\n'));
      setBonusesText(editTarget.bonuses.join('\n'));
      setTargetAudience(editTarget.targetAudience);
    } else if (isOpen) {
      setName('');
      setSubtitle('Solusi Oleh-Oleh Jamaah');
      setBoxDescription('');
      setSinglePrice('50000');
      setBulkPrice('40000');
      setMinBulkUnits('20');
      setIsPopular(false);
      setIsActive(true);
      setSortOrder(String(nextSortOrder));
      setItemsText('Kurma Ajwa / Sukkari (± 60 gram)\nKismis Golden (± 30 gram)\nAir Zamzam Segel (80 ml)');
      setBonusesText('Box jinjing rapi anti penyok\nGratis kartu ucapan nama jamaah');
      setTargetAudience('Cocok untuk pembagian keluarga, tetangga, dan rekan kerja.');
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

    const items = itemsText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const bonuses = bonusesText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (items.length === 0) {
      setError('Masukkan minimal 1 baris isi paket.');
      return;
    }
    if (items.length > 6) {
      setError('Maksimal 6 item isian agar tinggi kartu etalase tetap seimbang.');
      return;
    }
    if (bonuses.length > 3) {
      setError('Maksimal 3 poin bonus agar kartu tetap proporsional.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      const res = await savePackageBundle({
        id: editTarget?.id,
        name,
        subtitle,
        boxDescription,
        singlePrice: Math.max(0, parseInt(singlePrice || '0', 10) || 0),
        bulkPrice: Math.max(0, parseInt(bulkPrice || '0', 10) || 0),
        minBulkUnits: Math.max(1, parseInt(minBulkUnits || '20', 10) || 20),
        isPopular,
        items,
        bonuses,
        targetAudience,
        isActive,
        sortOrder: Math.max(0, parseInt(sortOrder || '0', 10) || 0),
      });

      if (!res.ok) {
        setError(res.error || 'Gagal menyimpan paket oleh-oleh.');
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
      aria-labelledby="cms-bundle-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="bg-white border border-[#E2E8E5] shadow-[0_8px_32px_rgba(24,34,30,0.16)] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-4 sm:px-5 py-3.5 bg-[#F1F5F3] border-b border-[#E2E8E5] flex items-center justify-between gap-2 shrink-0">
          <div className="min-w-0 flex-1">
            <h2 id="cms-bundle-title" className="font-headline text-sm sm:text-base font-semibold text-[#18221E] truncate">
              {editTarget ? `Edit ${editTarget.name}` : 'Tambah Paket Oleh-Oleh'}
            </h2>
            <p className="text-[11px] text-[#52605A] truncate">
              Tampilan publik mengunci maksimal 3 paket aktif agar grid tetap simetris.
            </p>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            aria-label="Tutup modal paket"
            className="w-8 h-8 flex items-center justify-center bg-white border border-[#E2E8E5] text-[#52605A] hover:text-[#18221E] cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form id="cms-bundle-form" onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {error && (
            <div role="alert" className="p-3 bg-[#FFF5F5] border border-[#BA1A1A]/30 text-[#93000A] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#52605A]">
                  Nama Paket
                </label>
                <span className="text-[10px] text-[#7E8E87]">{name.length}/40</span>
              </div>
              <input
                type="text"
                required
                maxLength={40}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Misal: Paket Madinah"
                className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#52605A]">
                  Label Singkat (Atas Judul)
                </label>
                <span className="text-[10px] text-[#7E8E87]">{subtitle.length}/65</span>
              </div>
              <input
                type="text"
                required
                maxLength={65}
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Misal: Solusi Praktis & Ekonomis"
                className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
              />
            </div>

            <div className="sm:col-span-2">
              <div className="flex justify-between mb-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#52605A]">
                  Deskripsi Kemasan Dus (Maks 2 Baris)
                </label>
                <span className="text-[10px] text-[#7E8E87]">{boxDescription.length}/120</span>
              </div>
              <input
                type="text"
                required
                maxLength={120}
                value={boxDescription}
                onChange={(e) => setBoxDescription(e.target.value)}
                placeholder="Hardbox magnetik berlapis foil emas dengan sekat elegan..."
                className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
                Harga Satuan / Eceran (IDR)
              </label>
              <input
                type="number"
                min={0}
                required
                value={singlePrice}
                onChange={(e) => setSinglePrice(e.target.value)}
                className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm font-mono text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
                Harga Paket Jamaah / Grosir (IDR)
              </label>
              <input
                type="number"
                min={0}
                required
                value={bulkPrice}
                onChange={(e) => setBulkPrice(e.target.value)}
                className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm font-mono text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
                Minimal Grosir (Dus)
              </label>
              <input
                type="number"
                min={1}
                required
                value={minBulkUnits}
                onChange={(e) => setMinBulkUnits(e.target.value)}
                className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm font-mono text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
                Urutan Tampil (Kiri → Kanan)
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
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
                Isian Dus (1 Item per Baris • Maks 6 Baris)
              </label>
              <textarea
                rows={4}
                required
                value={itemsText}
                onChange={(e) => setItemsText(e.target.value)}
                placeholder={'Kurma Ajwa Madinah (± 70 gram)\nKismis Golden (± 35 gram)'}
                className="w-full p-3 bg-[#F8FAF9] border border-[#E2E8E5] text-xs sm:text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
                Bonus &amp; Keunggulan (1 Poin per Baris • Maks 3 Baris)
              </label>
              <textarea
                rows={3}
                value={bonusesText}
                onChange={(e) => setBonusesText(e.target.value)}
                placeholder={'GRATIS Custom Kartu Ucapan Nama Jamaah\nPita satin eksklusif'}
                className="w-full p-3 bg-[#F8FAF9] border border-[#E2E8E5] text-xs sm:text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
              />
            </div>

            <div className="sm:col-span-2 flex flex-wrap gap-4 pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-[#18221E]">
                <input
                  type="checkbox"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="accent-[#3A6B5C] w-4 h-4"
                />
                <span>Tandai sebagai &ldquo;Pilihan Favorit Jamaah&rdquo; (maks 1 paket)</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-[#18221E]">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="accent-[#3A6B5C] w-4 h-4"
                />
                <span>Tayangkan di Etalase Publik</span>
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
            form="cms-bundle-form"
            className="h-10 px-4 sm:px-5 bg-[#3A6B5C] hover:bg-[#2E5649] disabled:bg-[#7E8E87] disabled:cursor-not-allowed text-white text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Paket'}
          </button>
        </div>
      </div>
    </div>
  );
};
