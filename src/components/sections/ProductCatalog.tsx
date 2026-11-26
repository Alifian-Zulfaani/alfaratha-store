import React, { useState } from 'react';
import { MapPin, Star, Layers, Download, ChevronRight } from 'lucide-react';
import { WhatsAppIcon } from '../ui/WhatsAppIcon';
import { useStore } from '../../context/StoreContext';
import { ProductCategory, NormalizedProduct } from '../../types';
import { generateWhatsAppUrl, formatIDR } from '../../utils/whatsapp';

export const ProductCatalog: React.FC = () => {
  const { products } = useStore();
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('all');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, number>>({});

  const categories: { key: ProductCategory; label: string }[] = [
    { key: 'all', label: 'Semua Produk' },
    { key: 'kurma', label: 'Kurma Premium' },
    { key: 'kismis-kacang', label: 'Kacang & Kismis' },
    { key: 'cokelat-gift', label: 'Cokelat & Suvenir' },
    { key: 'zamzam-herbal', label: 'Air Zamzam & Herbal' },
  ];

  const retailProducts = products.filter((item) => item.category !== 'paket');

  const filteredProducts = retailProducts.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const handleSelectVariant = (productId: string, variantIndex: number) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: variantIndex,
    }));
  };

  const getActiveVariant = (product: NormalizedProduct) => {
    const idx = selectedVariants[product.id] ?? product.defaultVariantIndex ?? 0;
    return product.variants[idx] || product.variants[0];
  };

  return (
    <section className="w-full border-b border-[#E2E8E5] bg-[#F8FAF9] py-8 lg:py-12" id="katalog-produk">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Catalog Header & Filter Control */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#E2E8E5] mb-5 sm:mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[#3A6B5C] text-label-caps uppercase tracking-widest mb-1 font-semibold">
              <span className="w-1.5 h-1.5 bg-[#3A6B5C]" />
              <span>Pilihan Panen Segar &amp; Oleh-Oleh</span>
            </div>
            <h2 className="font-headline text-xl sm:text-2xl lg:text-3xl text-[#18221E] font-semibold tracking-tight">
              Katalog Produk Pilihan Alfaratha
            </h2>
            <p className="text-xs sm:text-sm text-[#52605A] mt-0.5">
              Tersedia dalam kemasan pouch higienis, box retail, hingga kartonan grosir.
            </p>
          </div>

          {/* Clean Filter Track */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 -mx-4 px-4 sm:mx-0 sm:px-0 max-w-full">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  aria-label={`Filter kategori ${cat.label}`}
                  className={`px-3 sm:px-3.5 py-1.5 text-label-caps uppercase tracking-wider transition-colors cursor-pointer shrink-0 whitespace-nowrap min-h-[34px] ${
                    isActive
                      ? 'bg-[#18221E] text-white font-semibold border border-[#18221E]'
                      : 'bg-[#F1F5F3] text-[#52605A] hover:text-[#18221E] border border-[#E2E8E5]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Swipe Cue Banner */}
        <div className="flex md:hidden items-center justify-between text-label-code text-[#52605A] mb-3 px-1">
          <span>{filteredProducts.length} produk pilihan</span>
          <span className="text-[#264A3F] font-semibold flex items-center gap-1 text-[11px]">
            <span>Geser produk</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Products Layout: Swipe Carousel on Mobile, 4-Col Grid on Desktop for Perfect Proportions */}
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-5 -mx-4 px-4 sm:mx-0 sm:px-0 items-stretch">
          {filteredProducts.map((product) => {
            const activeVariant = getActiveVariant(product);
            const isOutOfStock = activeVariant.stock <= 0 || !activeVariant.inStock;
            const isLowStock =
              !isOutOfStock && activeVariant.stock <= activeVariant.minStock;
            const waUrl = generateWhatsAppUrl({
              productName: product.name,
              variantLabel: activeVariant.label,
              price: activeVariant.price,
            });

            return (
              <div
                key={product.id}
                className={`product-item flex flex-col h-full bg-white border border-[#E2E8E5] transition-colors duration-200 hover:border-[#18221E] group w-[76vw] max-w-[280px] md:w-auto shrink-0 snap-center justify-between ${
                  isOutOfStock ? 'opacity-85' : ''
                }`}
              >
                {/* Top Status Strip */}
                <div className="p-2 sm:p-2.5 border-b border-[#E2E8E5] flex items-center justify-between text-[#52605A] text-label-code bg-white shrink-0">
                  <span className="flex items-center gap-1 text-[#3A6B5C] font-semibold text-[10.5px]">
                    <Star className="w-3 h-3 fill-[#3A6B5C]" />
                    {product.badgeText ? product.badgeText.toUpperCase() : 'MUTU TERJAMIN'}
                  </span>
                  {isOutOfStock ? (
                    <span className="border border-[#BA1A1A]/30 px-1.5 py-0.5 bg-[#FFF5F5] text-[#93000A] font-semibold text-[9.5px] uppercase">
                      Stok Habis
                    </span>
                  ) : isLowStock ? (
                    <span className="border border-[#E8DCCF] px-1.5 py-0.5 bg-[#F5EFE6] text-[#8C6D46] font-semibold text-[9.5px]">
                      Sisa {activeVariant.stock} Unit
                    </span>
                  ) : (
                    <span className="border border-[#E2E8E5] px-1.5 py-0.5 bg-[#F1F5F3] text-[9.5px]">
                      Stok Tersedia
                    </span>
                  )}
                </div>

                {/* Product Image: Proportional Height on Desktop to prevent massive cards */}
                <div className="relative w-full aspect-[16/11] max-h-[190px] xl:max-h-[175px] bg-[#F1F5F3] overflow-hidden border-b border-[#E2E8E5] shrink-0">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    width={280}
                    height={190}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute bottom-1.5 left-1.5 bg-[#18221E]/90 text-white px-2 py-0.5 text-label-code flex items-center gap-1 text-[10px]">
                    <MapPin className="w-3 h-3 text-[#E6C093]" />
                    <span className="truncate max-w-[150px]">{product.origin}</span>
                  </div>
                </div>

                {/* Product Body: Uniform Spacing and Exact Alignment across cards */}
                <div className="p-3 sm:p-3.5 flex flex-col flex-grow justify-between">
                  <div>
                    {/* Rating Row */}
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1 text-[#C4841D]">
                        <Star className="w-3 h-3 fill-[#C4841D]" />
                        <span className="text-label-code font-bold text-[#18221E] text-xs">
                          {product.rating.toFixed(1)}
                        </span>
                        <span className="text-label-code text-[#52605A] text-[10px]">
                          ({product.reviewsCount})
                        </span>
                      </div>
                      <span className="text-label-code text-[#3A6B5C] font-semibold text-[10.5px]">
                        Grade Super
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="font-headline text-sm sm:text-[15px] text-[#18221E] font-semibold mb-1 line-clamp-1 leading-snug">
                      {product.name}
                    </h3>

                    {/* Description: Standardized 2-line height */}
                    <p className="text-xs text-[#52605A] mb-2 line-clamp-2 h-[34px] leading-relaxed">
                      {product.description}
                    </p>

                    {/* Variant Selector: Standardized height so all cards line up horizontally */}
                    <div className="mb-2.5 min-h-[52px] flex flex-col justify-start">
                      <span className="text-label-caps text-[#52605A] block uppercase mb-1 text-[9.5px]">
                        Pilih Kemasan:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {product.variants.map((v, idx) => {
                          const isSelected =
                            idx ===
                            (selectedVariants[product.id] ??
                              product.defaultVariantIndex ??
                              0);
                          return (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => handleSelectVariant(product.id, idx)}
                              aria-label={`Pilih kemasan ${v.label} seharga ${formatIDR(v.price)}`}
                              className={`px-2 py-0.5 text-[10.5px] border transition-colors cursor-pointer min-h-[26px] flex items-center ${
                                isSelected
                                  ? 'bg-[#18221E] text-white border-[#18221E] font-semibold'
                                  : 'bg-[#F1F5F3] text-[#18221E] border-[#E2E8E5] hover:border-[#18221E]'
                              }`}
                            >
                              {v.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Price & CTA: strictly aligned to bottom */}
                  <div className="border-t border-[#E2E8E5] pt-2 mt-auto">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-label-caps text-[#52605A] uppercase text-[9px]">
                        Harga ({activeVariant.label})
                      </span>
                      <div className="text-right">
                        <span className="font-headline text-sm sm:text-base text-[#18221E] font-bold">
                          {formatIDR(activeVariant.price)}
                        </span>
                        {activeVariant.originalPrice && (
                          <span className="block text-[9.5px] text-[#52605A] line-through">
                            {formatIDR(activeVariant.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {isOutOfStock ? (
                      <button
                        type="button"
                        disabled
                        className="w-full inline-flex items-center justify-center gap-1.5 bg-[#E2E8E5] text-[#52605A] py-2 text-label-caps tracking-wider text-xs min-h-[36px] cursor-not-allowed"
                      >
                        <span>Stok Habis</span>
                      </button>
                    ) : (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Pesan ${product.name} varian ${activeVariant.label} via WhatsApp`}
                        className="w-full inline-flex items-center justify-center gap-1.5 bg-[#18221E] hover:bg-[#3A6B5C] text-white py-2 text-label-caps tracking-wider transition-colors text-xs min-h-[36px]"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
                        <span>Pesan via WA</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Wholesale Strip */}
        <div className="mt-5 sm:mt-6 bg-[#F1F5F3] border border-[#E2E8E5] p-3.5 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#3A6B5C]/15 flex items-center justify-center text-[#3A6B5C] shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline text-sm sm:text-base text-[#18221E] font-semibold">
                Butuh Pembelian Kartonan / Grosir Masjid &amp; KBIH?
              </h3>
              <p className="text-xs text-[#52605A]">
                Dapatkan daftar harga khusus partai besar untuk pengajian, pondok pesantren, dan majelis taklim.
              </p>
            </div>
          </div>

          <a
            href={generateWhatsAppUrl({
              customMessage: 'Halo Admin Alfaratha, saya minta Pricelist Grosir Kartonan Kurma & Oleh-oleh Alfaratha.',
            })}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Unduh daftar harga grosir kurma kartonan via WhatsApp"
            className="shrink-0 w-full md:w-auto inline-flex items-center justify-center gap-2 bg-[#18221E] hover:bg-[#3A6B5C] text-white px-4 py-2 text-label-caps tracking-wider transition-colors min-h-[38px] text-xs"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
            <span>Minta Pricelist via WA</span>
            <Download className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};
