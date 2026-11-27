import React, { useState, useMemo } from 'react';
import { Check, Star, CalendarCheck, ArrowRight, Gift, ChevronRight } from 'lucide-react';
import { WhatsAppIcon } from '../ui/WhatsAppIcon';
import { generateWhatsAppUrl, formatIDR } from '../../utils/whatsapp';
import { useStore } from '../../context/StoreContext';

export const PackageBundles: React.FC = () => {
  const { packageBundles, siteContent } = useStore();
  const [isBulk, setIsBulk] = useState(true);
  const { catalogHeaders, general } = siteContent;

  const visibleBundles = useMemo(
    () => packageBundles.filter((b) => b.isActive).slice(0, 3),
    [packageBundles]
  );

  return (
    <section className="w-full border-b border-[#E2E8E5] bg-[#F1F5F3] py-8 lg:py-12" id="paket-haji">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header & Toggle Switch */}
        <div className="text-center max-w-2xl mx-auto mb-5 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 text-[#3A6B5C] text-label-caps uppercase tracking-widest mb-1 font-semibold">
            <span className="w-1.5 h-1.5 bg-[#3A6B5C]" />
            <span>{catalogHeaders.bundleEyebrow}</span>
          </div>
          <h2 className="font-headline text-xl sm:text-2xl lg:text-3xl text-[#18221E] font-semibold tracking-tight mb-1.5">
            {catalogHeaders.bundleHeading}
          </h2>
          <p className="text-xs sm:text-sm text-[#52605A] mb-4 sm:mb-5 leading-relaxed">
            {catalogHeaders.bundleSubtitle}
          </p>

          {/* Segmented Pricing Switch */}
          <div className="inline-grid grid-cols-2 sm:inline-flex items-center bg-[#E2E8E5] p-1 border border-[#C3C8C4] w-full max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setIsBulk(true)}
              aria-label="Pilih harga Paket Jamaah minimal 20 dus dengan diskon 20%"
              className={`px-3 sm:px-4 py-2 text-label-caps uppercase tracking-wider transition-colors cursor-pointer text-center min-h-[36px] ${
                isBulk
                  ? 'bg-[#18221E] text-white font-semibold'
                  : 'text-[#52605A] hover:text-[#18221E]'
              }`}
            >
              <span className="hidden sm:inline">Paket Jamaah (Min. 20 Dus — Hemat 20%)</span>
              <span className="sm:hidden">Paket Jamaah (-20%)</span>
            </button>
            <button
              type="button"
              onClick={() => setIsBulk(false)}
              aria-label="Pilih harga Paket Satuan eceran"
              className={`px-3 sm:px-4 py-2 text-label-caps uppercase tracking-wider transition-colors cursor-pointer text-center min-h-[36px] ${
                !isBulk
                  ? 'bg-[#18221E] text-white font-semibold'
                  : 'text-[#52605A] hover:text-[#18221E]'
              }`}
            >
              <span className="hidden sm:inline">Paket Satuan (Eceran)</span>
              <span className="sm:hidden">Paket Satuan</span>
            </button>
          </div>
        </div>

        {/* Mobile Swipe Cue */}
        <div className="flex lg:hidden items-center justify-between text-label-code text-[#52605A] mb-1 px-1">
          <span>Bandingkan {visibleBundles.length} pilihan paket</span>
          <span className="text-[#264A3F] font-semibold flex items-center gap-1 text-[11px]">
            <span>Geser paket</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Pricing Tier Cards: Perfectly Proportioned 3-Col Layout on Desktop */}
        <div className="flex lg:grid lg:grid-cols-3 gap-4 lg:gap-5 items-stretch overflow-x-auto snap-x snap-mandatory scrollbar-none pt-5 pb-5 -mx-4 px-4 sm:mx-0 sm:px-0">
          {visibleBundles.map((pkg) => {
            const currentPrice = isBulk ? pkg.bulkPrice : pkg.singlePrice;
            const isFeatured = pkg.isPopular;

            const waUrl = generateWhatsAppUrl({
              phone: general.whatsappNumber,
              packageTier: pkg.name,
              price: currentPrice,
              isBulk,
              quantity: isBulk ? 20 : 1,
            });

            return (
              <div
                key={pkg.id}
                className={`flex flex-col h-full justify-between bg-white p-4 sm:p-5 lg:p-6 relative transition-all duration-200 w-[82vw] max-w-[315px] lg:w-auto shrink-0 snap-center ${
                  isFeatured
                    ? 'border-2 border-[#3A6B5C] lg:-translate-y-1.5 shadow-sm'
                    : 'border border-[#E2E8E5] hover:border-[#18221E]'
                }`}
              >
                {/* Featured Badge */}
                {isFeatured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#3A6B5C] text-white px-3 py-0.5 text-label-caps uppercase tracking-wider flex items-center gap-1 font-semibold whitespace-nowrap shadow-xs text-[10px]">
                    <Star className="w-3 h-3 fill-white" />
                    <span>Pilihan Favorit Jamaah</span>
                  </div>
                )}

                <div>
                  {/* Card Header */}
                  <div className={`border-b border-[#E2E8E5] pb-3 mb-3 sm:mb-4 ${isFeatured ? 'pt-1' : ''}`}>
                    <span
                      className={`text-label-caps uppercase tracking-wider block mb-0.5 font-semibold text-[10px] ${
                        isFeatured ? 'text-[#3A6B5C]' : 'text-[#52605A]'
                      }`}
                    >
                      {isFeatured ? 'Paling Direkomendasikan' : pkg.subtitle.split('—')[0]}
                    </span>
                    <h3 className="font-headline text-base sm:text-lg lg:text-xl text-[#18221E] font-bold">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-[#52605A] mt-1 line-clamp-2 leading-relaxed">
                      {pkg.boxDescription}
                    </p>
                  </div>

                  {/* Price Row */}
                  <div className="mb-3 sm:mb-4 pb-3 border-b border-[#E2E8E5]">
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className={`font-headline text-xl lg:text-2xl font-bold ${
                          isFeatured ? 'text-[#3A6B5C]' : 'text-[#18221E]'
                        }`}
                      >
                        {formatIDR(currentPrice)}
                      </span>
                      <span className="text-xs text-[#52605A]">/ dus</span>
                    </div>
                    {isBulk ? (
                      <span className="text-label-code text-[#52605A] line-through block mt-0.5 text-[11px]">
                        {formatIDR(pkg.singlePrice)}
                      </span>
                    ) : (
                      <span className="text-label-code text-[#3A6B5C] block mt-0.5 text-[11px]">
                        Harga Normal Satuan
                      </span>
                    )}
                  </div>

                  {/* Items List */}
                  <div className="flex flex-col gap-1.5 text-xs text-[#18221E] mb-4">
                    <p className="text-label-caps text-[#3A6B5C] uppercase font-semibold text-[10px]">
                      Isian Dus:
                    </p>
                    {pkg.items.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#3A6B5C] shrink-0 mt-0.5" />
                        <span className="leading-snug text-xs">{item}</span>
                      </div>
                    ))}

                    {/* Bonuses */}
                    {pkg.bonuses && pkg.bonuses.length > 0 && (
                      <div className="mt-1.5 pt-2 border-t border-[#E2E8E5] space-y-1">
                        {pkg.bonuses.map((bonus, bIdx) => (
                          <div
                            key={bIdx}
                            className={`flex items-start gap-1.5 ${
                              bonus.includes('GRATIS')
                                ? 'text-[#3A6B5C] font-semibold'
                                : 'text-[#52605A]'
                            }`}
                          >
                            <Gift className="w-3 h-3 text-[#3A6B5C] shrink-0 mt-0.5" />
                            <span className="text-[11px] leading-snug">{bonus}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA Button */}
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Pesan ${pkg.name} via WhatsApp`}
                  className={`w-full inline-flex items-center justify-center gap-2 py-2.5 text-label-caps tracking-wider transition-colors min-h-[40px] text-xs mt-auto ${
                    isFeatured
                      ? 'bg-[#18221E] hover:bg-[#3A6B5C] text-white'
                      : 'border border-[#18221E] text-[#18221E] hover:bg-[#18221E] hover:text-white'
                  }`}
                >
                  <WhatsAppIcon className="w-3.5 h-3.5" />
                  <span>Pesan {pkg.name} via WA</span>
                </a>
              </div>
            );
          })}
        </div>

        {/* Schedule Advisory Note */}
        <div className="mt-3 sm:mt-5 bg-white border border-[#E2E8E5] p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center gap-2.5">
            <CalendarCheck className="w-5 h-5 text-[#3A6B5C] shrink-0" />
            <span className="text-xs sm:text-sm text-[#18221E]">
              <strong>Bebas atur tanggal kirim:</strong> {catalogHeaders.bundleScheduleNote}
            </span>
          </div>
          <a
            href={generateWhatsAppUrl({
              phone: general.whatsappNumber,
              customMessage: catalogHeaders.bundleScheduleMessage,
            })}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Atur jadwal pengiriman paket oleh-oleh haji dan umroh via WhatsApp"
            className="text-label-caps uppercase text-[#3A6B5C] hover:underline underline-offset-4 tracking-wider shrink-0 flex items-center gap-1.5 font-semibold text-xs min-h-[32px]"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 text-[#3A6B5C]" />
            <span>{catalogHeaders.bundleScheduleLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};
