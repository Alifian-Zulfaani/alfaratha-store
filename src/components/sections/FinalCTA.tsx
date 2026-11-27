import React, { useState } from 'react';
import { MapPin, Check, ExternalLink, Navigation } from 'lucide-react';
import { WhatsAppIcon } from '../ui/WhatsAppIcon';
import { generateWhatsAppUrl } from '../../utils/whatsapp';
import { useStore } from '../../context/StoreContext';

export const FinalCTA: React.FC = () => {
  const { siteContent } = useStore();
  const { finalCta, general } = siteContent;
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  return (
    <section className="w-full bg-[#F8FAF9] py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#18221E] text-white p-6 sm:p-8 lg:p-12 border border-[#26332E] relative overflow-hidden">
          {/* Ambient Decorative Detail */}
          <div className="absolute right-0 top-0 w-96 h-96 bg-[#3A6B5C]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          {/* 2-Column Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            {/* Left Column (7 cols): Copy, CTAs, Guarantees */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div className="inline-flex items-center gap-2 border border-[#3A6B5C]/40 bg-[#3A6B5C]/15 px-3 py-1 mb-4 w-fit">
                <span className="w-1.5 h-1.5 bg-[#B9EEDA]" />
                <span className="text-label-caps text-[#B9EEDA] uppercase tracking-widest font-semibold">
                  {finalCta.badge}
                </span>
              </div>

              <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight mb-4 leading-tight">
                {finalCta.heading}
              </h2>

              <p className="text-xs sm:text-sm text-[#DAE5DE] mb-6 sm:mb-8 leading-relaxed max-w-xl">
                {finalCta.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
                <a
                  href={generateWhatsAppUrl({
                    phone: general.whatsappNumber,
                    customMessage: finalCta.primaryWaMessage,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#3A6B5C] hover:bg-[#2E5649] text-white px-6 py-3.5 text-label-caps tracking-wider transition-colors shadow-sm"
                  aria-label="Pesan paket oleh-oleh via WhatsApp Alfaratha"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                  <span>{finalCta.primaryBtnLabel}</span>
                </a>

                <a
                  href={general.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/30 text-white hover:bg-white/10 px-5 py-3.5 text-label-caps tracking-wider transition-colors"
                  aria-label="Buka lokasi Alfaratha Kurma di Google Maps"
                >
                  <MapPin className="w-4 h-4 text-[#E6C093]" />
                  <span>{finalCta.secondaryBtnLabel}</span>
                </a>
              </div>

              {/* Trust Guarantees */}
              <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-5 text-label-code text-[#DAE5DE]">
                {finalCta.guarantees.map((guarantee, idx) => (
                  <span key={`${guarantee}-${idx}`} className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-[#B9EEDA]" /> {guarantee}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Column (5 cols): High-Performance Google Maps Card */}
            <div className="lg:col-span-5 w-full flex flex-col bg-[#121A17] border border-[#26332E]">
              {/* Top Metadata Strip */}
              <div className="p-3 border-b border-[#26332E] flex items-center justify-between text-label-code">
                <span className="text-[#B9EEDA] flex items-center gap-1.5 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-[#E6C093]" />
                  {finalCta.mapTitle}
                </span>
                <span className="border border-[#26332E] bg-[#18221E] px-2 py-0.5 text-label-caps text-[#DAE5DE]">
                  {finalCta.mapBadge}
                </span>
              </div>

              {/* Map Canvas: Interactive on demand (Zero 3rd-party cookies & Zero blocking time on initial load) */}
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:h-[280px] bg-[#18221E] overflow-hidden">
                {isMapLoaded ? (
                  <iframe
                    src={general.googleMapsEmbedUrl}
                    title={`Lokasi ${finalCta.mapTitle} di Google Maps`}
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#151F1B] relative">
                    {/* Architectural Grid Background */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#B9EEDA_1px,transparent_1px)] [background-size:16px_16px]" />

                    <div className="relative z-10 flex flex-col items-center max-w-xs">
                      <div className="w-12 h-12 bg-[#3A6B5C]/20 border border-[#3A6B5C] flex items-center justify-center text-[#B9EEDA] mb-3">
                        <MapPin className="w-6 h-6 text-[#E6C093]" />
                      </div>
                      <h3 className="font-headline text-base text-white font-semibold mb-1">
                        {finalCta.mapCardTitle}
                      </h3>
                      <p className="text-xs text-[#DAE5DE] mb-4">
                        {finalCta.mapCardDesc}
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsMapLoaded(true)}
                        className="inline-flex items-center gap-2 bg-[#3A6B5C] hover:bg-[#2E5649] text-white px-4 py-2 text-label-caps tracking-wider transition-colors cursor-pointer border border-[#B9EEDA]/30"
                        aria-label="Tampilkan Peta Interaktif Google Maps"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>{finalCta.mapActionLabel}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Map Footer Strip with Direct Google Maps Link */}
              <div className="p-3 border-t border-[#26332E] flex items-center justify-between text-label-code bg-[#18221E]">
                <span className="text-[#DAE5DE] text-xs">
                  {general.operatingHours}
                </span>
                <a
                  href={general.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E6C093] hover:text-white transition-colors flex items-center gap-1 font-semibold text-label-caps"
                  aria-label="Petunjuk arah langsung ke Alfaratha di Google Maps"
                >
                  <span>Petunjuk Arah</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
