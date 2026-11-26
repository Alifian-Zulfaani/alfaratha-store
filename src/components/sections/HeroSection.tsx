import React from 'react';
import { ArrowDown, Snowflake, ShieldCheck, Truck, Star, MapPin, ArrowRight } from 'lucide-react';
import { WhatsAppIcon } from '../ui/WhatsAppIcon';
import { generateWhatsAppUrl } from '../../utils/whatsapp';

export const HeroSection: React.FC = () => {
  const scrollToCatalog = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.querySelector('#katalog-produk');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToPackages = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.querySelector('#paket-haji');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full border-b border-[#E2E8E5] bg-white pt-20 sm:pt-24 lg:pt-28 pb-8 sm:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Value Proposition & Intent */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 border border-[#3A6B5C]/30 bg-[#F1F5F3] px-3 py-1 mb-4">
              <span className="w-2 h-2 bg-[#3A6B5C]" />
              <span className="text-label-caps text-[#3A6B5C] uppercase tracking-widest text-[11px]">
                100% Impor Resmi Madinah • Siap Kirim Seluruh Indonesia
              </span>
            </div>

            <h1 className="font-headline text-2xl sm:text-4xl lg:text-[40px] text-[#18221E] tracking-tight leading-[1.2] mb-3.5">
              Sedia Kurma Pilihan &amp; Oleh-Oleh Haji Umroh{' '}
              <span className="text-[#3A6B5C] underline decoration-[#3A6B5C]/30 underline-offset-8">
                Lengkap Tanpa Repot
              </span>
              .
            </h1>

            <p className="text-xs sm:text-sm lg:text-base text-[#52605A] max-w-xl mb-6 leading-relaxed">
              Dari Kurma Ajwa Aliyah Madinah, Kismis Golden Jumbo, hingga dus paket souvenir siap bagi. Preservasi suhu dingin 4°C menjamin kelembapan kurma tetap legit tanpa kutu hingga tiba di rumah Anda.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mb-6">
              <a
                href="#katalog-produk"
                onClick={scrollToCatalog}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#18221E] hover:bg-[#3A6B5C] text-white px-5 py-3 text-label-caps tracking-wider transition-colors duration-200 text-xs sm:text-sm"
              >
                <span>Lihat Katalog &amp; Harga</span>
                <ArrowDown className="w-4 h-4" />
              </a>

              <a
                href={generateWhatsAppUrl({
                  customMessage: 'Halo Admin Alfaratha, saya ingin konsultasi paket oleh-oleh Haji/Umroh.',
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-[#18221E] text-[#18221E] hover:bg-[#F1F5F3] px-5 py-3 text-label-caps tracking-wider transition-colors duration-200 text-xs sm:text-sm"
              >
                <WhatsAppIcon className="w-4 h-4 text-[#3A6B5C]" />
                <span>Konsultasi Paket via WA</span>
              </a>
            </div>

            {/* Micro Proof Line */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 pt-4 border-t border-[#E2E8E5] w-full text-[#52605A] text-label-code text-[11px] sm:text-xs">
              <div className="flex items-center gap-1.5">
                <Snowflake className="w-3.5 h-3.5 text-[#3A6B5C] shrink-0" />
                <span>Cold-Storage 4°C</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3A6B5C] shrink-0" />
                <span>Garansi Kemasan Aman</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
                <Truck className="w-3.5 h-3.5 text-[#3A6B5C] shrink-0" />
                <span>Pengiriman Pulau Jawa</span>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Product Showcase Card (Proportional Desktop Sizing) */}
          <div className="lg:col-span-5 w-full">
            <div className="relative bg-[#F1F5F3] border border-[#E2E8E5] p-3.5 sm:p-4 lg:p-5">
              {/* Top Metadata Strip */}
              <div className="flex items-center justify-between border-b border-[#E2E8E5] pb-2.5 mb-3">
                <span className="text-label-caps text-[#3A6B5C] flex items-center gap-1 font-semibold text-[10.5px]">
                  <Star className="w-3.5 h-3.5 fill-[#3A6B5C]" />
                  PILIHAN JAMAAH 2025
                </span>
                <span className="text-label-code bg-white px-2 py-0.5 border border-[#E2E8E5] text-[#52605A] text-[10px]">
                  TEMPERATUR 4°C
                </span>
              </div>

              {/* Product Hero Image: Proportional max-height on desktop */}
              <div className="relative w-full aspect-[16/10] max-h-[220px] bg-[#E2E8E5] overflow-hidden mb-3 border border-[#E2E8E5]">
                <img
                  src="/images/ajwa.webp"
                  alt="Kurma Ajwa Aliyah Madinah"
                  width={480}
                  height={300}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
                <div className="absolute bottom-2 left-2 bg-[#18221E]/90 backdrop-blur text-white px-2 py-0.5 text-label-code flex items-center gap-1.5 text-[11px]">
                  <MapPin className="w-3 h-3 text-[#E6C093]" />
                  <span>Madinah Al-Munawwarah</span>
                </div>
              </div>

              {/* Product Micro Summary */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <h2 className="font-headline text-base sm:text-lg text-[#18221E] font-semibold tracking-tight">
                    Kurma Ajwa Aliyah Madinah
                  </h2>
                  <div className="flex items-center gap-1 text-[#C4841D]">
                    <Star className="w-3.5 h-3.5 fill-[#C4841D]" />
                    <span className="text-label-code text-[#18221E] font-bold text-xs">4.95</span>
                    <span className="text-label-code text-[#52605A] text-[10px]">(1.2k)</span>
                  </div>
                </div>

                <p className="text-xs text-[#52605A] line-clamp-2 leading-relaxed">
                  Daging buah tebal, serat halus dengan rona kehitaman pekat alami. Dipetik langsung dari kebun dataran tinggi Al-Aliyah Madinah.
                </p>

                {/* Price & Inventory Row */}
                <div className="mt-1 pt-2.5 border-t border-[#E2E8E5] flex items-center justify-between">
                  <div>
                    <span className="text-label-caps text-[#52605A] block uppercase text-[9.5px]">
                      Mulai Dari
                    </span>
                    <span className="font-headline text-sm sm:text-base text-[#18221E] font-bold">
                      Rp 32.000{' '}
                      <span className="text-[11px] font-normal text-[#52605A]">
                        / Dus Paket
                      </span>
                    </span>
                  </div>
                  <a
                    href="#paket-haji"
                    onClick={scrollToPackages}
                    className="inline-flex items-center gap-1.5 border border-[#18221E] bg-white hover:bg-[#18221E] hover:text-white px-3 py-1.5 text-label-caps text-[#18221E] transition-colors text-xs"
                  >
                    <span>Lihat Opsi Dus</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
