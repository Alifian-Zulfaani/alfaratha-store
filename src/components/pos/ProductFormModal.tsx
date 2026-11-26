import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  NormalizedProduct,
  NormalizedProductVariant,
  ProductCategory,
  StorageLocation,
} from '../../types';
import { useStore } from '../../context/StoreContext';

interface ProductFormModalProps {
  isOpen: boolean;
  editTarget?: { product: NormalizedProduct; variant: NormalizedProductVariant } | null;
  onClose: () => void;
}

const IMAGE_PRESETS = [
  { label: 'Kurma Ajwa', url: '/images/ajwa.webp' },
  { label: 'Kurma Sukari', url: '/images/sukkari.webp' },
  { label: 'Kurma Medjool', url: '/images/medjool.webp' },
  { label: 'Kurma Khalas', url: '/images/khalas.webp' },
  { label: 'Kismis Golden', url: '/images/kismis.webp' },
  { label: 'Pistachio', url: '/images/pistachio.webp' },
  { label: 'Cokelat Truffle', url: '/images/truffle.webp' },
  { label: 'Gift Hampers', url: '/images/gift-hampers.webp' },
  { label: 'Air Zamzam', url: '/images/zamzam.webp' },
  { label: 'Madu Kashmir', url: '/images/madu-kashmir.webp' },
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  editTarget,
  onClose,
}) => {
  const { addProduct, updateProductVariant } = useStore();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<Exclude<ProductCategory, 'all'>>('kurma');
  const [origin, setOrigin] = useState('Madinah Al-Munawwarah');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('/images/ajwa.webp');
  const [variantLabel, setVariantLabel] = useState('Kemasan 500 gr');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('85000');
  const [costPrice, setCostPrice] = useState('60000');
  const [stock, setStock] = useState('25');
  const [minStock, setMinStock] = useState('5');
  const [storageLocation, setStorageLocation] =
    useState<StorageLocation>('Ruang Pendingin');
  const [expiredDate, setExpiredDate] = useState('2027-08-31');

  useEffect(() => {
    if (editTarget) {
      setName(editTarget.product.name);
      setCategory(editTarget.product.category);
      setOrigin(editTarget.product.origin);
      setDescription(editTarget.product.description);
      setImageUrl(editTarget.product.imageUrl);
      setVariantLabel(editTarget.variant.label);
      setSku(editTarget.variant.sku);
      setPrice(String(editTarget.variant.price));
      setCostPrice(String(editTarget.variant.costPrice));
      setStock(String(editTarget.variant.stock));
      setMinStock(String(editTarget.variant.minStock));
      setStorageLocation(editTarget.variant.storageLocation);
      setExpiredDate(editTarget.variant.expiredDate);
    } else if (isOpen) {
      setName('');
      setCategory('kurma');
      setOrigin('Madinah Al-Munawwarah');
      setDescription('');
      setImageUrl('/images/ajwa.webp');
      setVariantLabel('Kemasan 500 gr');
      setSku(`KRM-NEW-${String(Math.floor(100 + Math.random() * 899))}`);
      setPrice('85000');
      setCostPrice('60000');
      setStock('25');
      setMinStock('5');
      setStorageLocation('Ruang Pendingin');
      setExpiredDate('2027-08-31');
    }
  }, [editTarget, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = Math.max(0, parseInt(price || '0', 10) || 0);
    const numericCost = Math.max(0, parseInt(costPrice || '0', 10) || 0);
    const numericStock = Math.max(0, parseInt(stock || '0', 10) || 0);
    const numericMin = Math.max(0, parseInt(minStock || '5', 10) || 5);

    if (editTarget) {
      updateProductVariant(editTarget.product.id, editTarget.variant.id, {
        name,
        category,
        origin,
        description,
        imageUrl,
        variantLabel,
        sku,
        price: numericPrice,
        costPrice: numericCost,
        minStock: numericMin,
        storageLocation,
        expiredDate,
      });
    } else {
      addProduct({
        name,
        category,
        origin,
        description,
        imageUrl,
        variantLabel,
        sku,
        price: numericPrice,
        costPrice: numericCost,
        stock: numericStock,
        minStock: numericMin,
        storageLocation,
        expiredDate,
      });
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 !mt-0 m-0 z-50 flex items-center justify-center p-4 bg-[#18221E]/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-form-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-[#E2E8E5] shadow-[0_8px_32px_rgba(24,34,30,0.16)] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="px-4 sm:px-5 py-3.5 bg-[#F1F5F3] border-b border-[#E2E8E5] flex items-center justify-between gap-2 shrink-0">
          <h2 id="product-form-title" className="font-headline text-sm sm:text-base font-semibold text-[#18221E] truncate">
            {editTarget ? 'Edit Produk & Spesifikasi SKU' : 'Tambah Produk Baru ke Inventori'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup form produk"
            className="w-8 h-8 flex items-center justify-center bg-white border border-[#E2E8E5] text-[#52605A] hover:text-[#18221E] cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="product-form" onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
                Nama Produk
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Misal: Kurma Ajwa Royal Grade A"
                className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as Exclude<ProductCategory, 'all'>)
                }
                className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
              >
                <option value="kurma">Kurma Premium</option>
                <option value="kismis-kacang">Kacang &amp; Kismis</option>
                <option value="cokelat-gift">Cokelat &amp; Suvenir</option>
                <option value="zamzam-herbal">Air Zamzam &amp; Herbal</option>
                <option value="paket">Paket Oleh-Oleh</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
                Asal / Origin
              </label>
              <input
                type="text"
                required
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
                Varian Kemasan
              </label>
              <input
                type="text"
                required
                value={variantLabel}
                onChange={(e) => setVariantLabel(e.target.value)}
                placeholder="250g, 500g, 1kg, 1 Dus, Galon 5L"
                className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
                Kode SKU
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm font-mono text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
                Harga Modal (IDR)
              </label>
              <input
                type="number"
                min={0}
                required
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm font-mono text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
                Harga Jual Retail (IDR)
              </label>
              <input
                type="number"
                min={0}
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm font-mono text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
                Lokasi Penyimpanan
              </label>
              <select
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value as StorageLocation)}
                className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
              >
                <option value="Ruang Pendingin">Ruang Pendingin</option>
                <option value="Gudang Kering">Gudang Kering</option>
                <option value="Gudang Palet">Gudang Palet</option>
                <option value="Etalase Toko">Etalase Toko</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
                Tanggal Kadaluarsa (Exp. Date)
              </label>
              <input
                type="date"
                required
                value={expiredDate}
                onChange={(e) => setExpiredDate(e.target.value)}
                className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
              />
            </div>

            {!editTarget && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
                  Stok Awal (Unit)
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm font-mono text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
                Ambang Peringatan Stok (Min. Stok)
              </label>
              <input
                type="number"
                min={1}
                required
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm font-mono text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
                Gambar Produk Preset
              </label>
              <select
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
              >
                {IMAGE_PRESETS.map((preset) => (
                  <option key={preset.url} value={preset.url}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
                Deskripsi Singkat Produk
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi tekstur, rasa, dan keunggulan produk..."
                className="w-full p-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
              />
            </div>
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
            form="product-form"
            className="h-10 px-4 sm:px-5 bg-[#3A6B5C] hover:bg-[#2E5649] text-white text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap"
          >
            {editTarget ? 'Simpan Perubahan' : 'Simpan Produk Baru'}
          </button>
        </div>
      </div>
    </div>
  );
};
