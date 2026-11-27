import React from 'react';
import { Snowflake, Luggage, Sliders, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { WhatsAppIcon } from '../ui/WhatsAppIcon';
import { generateWhatsAppUrl } from '../../utils/whatsapp';
import { useStore } from '../../context/StoreContext';
import { DEFAULT_SITE_CONTENT } from '../../data/cmsDefaults';

export const BentoAdvantages: React.FC = () => {
  const { siteContent } = useStore();
  const { bentoAdvantages, general } = siteContent;
  const fallbackCards = DEFAULT_SITE_CONTENT.bentoAdvantages.cards;
  const card0 = bentoAdvantages.cards[0] ?? fallbackCards[0];
  const card1 = bentoAdvantages.cards[1] ?? fallbackCards[1];
  const card2 = bentoAdvantages.cards[2] ?? fallbackCards[2];
  const card3 = bentoAdvantages.cards[3] ?? fallbackCards[3];

  return (
    <section className="w-full border-b border-[#E2E8E5] bg-white py-8 lg:py-12" id="standar-mutu">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-4 border-b border-[#E2E8E5] mb-5 sm:mb-6">
          <div>
            <span className="text-label-caps text-[#3A6B5C] uppercase tracking-widest block mb-1 font-semibold">
              {bentoAdvantages.eyebrow}
            </span>
            <h2 className="font-headline text-xl sm:text-2xl lg:text-3xl text-[#18221E] font-semibold tracking-tight">
              {bentoAdvantages.heading}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#52605A] max-w-md leading-relaxed">
            {bentoAdvantages.subtitle}
          </p>
        </div>

        {/* Asymmetrical Bento Grid on Desktop, 2x2 Compact Grid on Mobile */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-3 sm:gap-5 items-stretch">
          {/* Bento 1: Penyimpanan Sejuk */}
          <div className="col-span-2 sm:col-span-1 md:col-span-7 h-full bg-white border border-[#E2E8E5] p-4 sm:p-5 lg:p-6 flex flex-col justify-between transition-colors hover:border-[#18221E]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#3A6B5C]/15 flex items-center justify-center text-[#3A6B5C]">
                  <Snowflake className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-label-code border border-[#3A6B5C]/40 text-[#3A6B5C] bg-[#F1F5F3] px-2 py-0.5 text-[10px] sm:text-xs">
                  {card0.tag}
                </span>
              </div>
              <h3 className="font-headline text-base sm:text-lg text-[#18221E] font-bold mb-1.5">
                {card0.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#52605A] leading-relaxed mb-4">
                {card0.desc}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#E2E8E5] text-label-code text-[#18221E]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3A6B5C] shrink-0" />
                <span className="text-[11px] sm:text-xs truncate">{card0.footerLeft}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3A6B5C] shrink-0" />
                <span className="text-[11px] sm:text-xs truncate">{card0.footerRight}</span>
              </div>
            </div>
          </div>

          {/* Bento 2: Bebas Bagasi */}
          <div className="col-span-2 sm:col-span-1 md:col-span-5 h-full bg-white border border-[#E2E8E5] p-4 sm:p-5 lg:p-6 flex flex-col justify-between transition-colors hover:border-[#18221E]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#F1F5F3] flex items-center justify-center text-[#18221E]">
                  <Luggage className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-label-code border border-[#E2E8E5] text-[#52605A] px-2 py-0.5 bg-[#F1F5F3] text-[10px] sm:text-xs">
                  {card1.tag}
                </span>
              </div>
              <h3 className="font-headline text-base sm:text-lg text-[#18221E] font-bold mb-1.5">
                {card1.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#52605A] leading-relaxed mb-4">
                {card1.desc}
              </p>
            </div>
            <div className="pt-3 border-t border-[#E2E8E5] flex items-center justify-between text-label-code text-[#18221E]">
              <span className="text-[11px] sm:text-xs">{card1.footerLeft}</span>
              <span className="text-[#3A6B5C] font-semibold text-[11px] sm:text-xs">{card1.footerRight}</span>
            </div>
          </div>

          {/* Bento 3: Custom Paket Sesuai Anggaran */}
          <div className="col-span-2 sm:col-span-1 md:col-span-5 h-full bg-white border border-[#E2E8E5] p-4 sm:p-5 lg:p-6 flex flex-col justify-between transition-colors hover:border-[#18221E]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#F1F5F3] flex items-center justify-center text-[#18221E]">
                  <Sliders className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-label-code border border-[#E2E8E5] text-[#52605A] px-2 py-0.5 bg-[#F1F5F3] text-[10px] sm:text-xs">
                  {card2.tag}
                </span>
              </div>
              <h3 className="font-headline text-base sm:text-lg text-[#18221E] font-bold mb-1.5">
                {card2.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#52605A] leading-relaxed mb-4">
                {card2.desc}
              </p>
            </div>
            <div className="pt-3 border-t border-[#E2E8E5] flex items-center justify-between text-label-code">
              <span className="text-[#52605A] text-[11px] sm:text-xs">{card2.footerLeft}</span>
              <a
                href={generateWhatsAppUrl({
                  phone: general.whatsappNumber,
                  customMessage: card2.waMessage || 'Halo Admin, saya ingin custom isian dus oleh-oleh sesuai budget.',
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3A6B5C] font-semibold hover:underline flex items-center gap-1.5 text-[11px] sm:text-xs"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-[#3A6B5C]" />
                <span>{card2.footerRight}</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Bento 4: Pengiriman Bergaransi */}
          <div className="col-span-2 sm:col-span-1 md:col-span-7 h-full bg-white border border-[#E2E8E5] p-4 sm:p-5 lg:p-6 flex flex-col justify-between transition-colors hover:border-[#18221E]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#3A6B5C]/15 flex items-center justify-center text-[#3A6B5C]">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-label-code border border-[#3A6B5C]/40 text-[#3A6B5C] bg-[#F1F5F3] px-2 py-0.5 text-[10px] sm:text-xs">
                  {card3.tag}
                </span>
              </div>
              <h3 className="font-headline text-base sm:text-lg text-[#18221E] font-bold mb-1.5">
                {card3.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#52605A] leading-relaxed mb-4">
                {card3.desc}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#E2E8E5] text-label-code text-[#18221E]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3A6B5C] shrink-0" />
                <span className="text-[11px] sm:text-xs truncate">{card3.footerLeft}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3A6B5C] shrink-0" />
                <span className="text-[11px] sm:text-xs truncate">{card3.footerRight}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
