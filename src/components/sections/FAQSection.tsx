import React, { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { WhatsAppIcon } from '../ui/WhatsAppIcon';
import { FAQS_DATA } from '../../data/faqs';
import { generateWhatsAppUrl } from '../../utils/whatsapp';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const toggleFaq = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="lg:col-span-7 flex flex-col">
      <div className="border-b border-[#E2E8E5] pb-4 mb-6">
        <span className="text-label-caps text-[#3A6B5C] uppercase tracking-widest block mb-1 font-semibold">
          Pertanyaan Umum
        </span>
        <h2 className="font-headline text-2xl lg:text-3xl text-[#18221E] font-semibold tracking-tight">
          Klarifikasi &amp; Informasi Mutu
        </h2>
        <p className="text-xs sm:text-sm text-[#52605A] mt-1">
          Jawaban transparan seputar keaslian kurma, kemasan, dan pengiriman.
        </p>
      </div>

      {/* FAQ Accordion List (Sharp 0px architecture) */}
      <div className="flex flex-col divide-y divide-[#E2E8E5] border border-[#E2E8E5] bg-white">
        {FAQS_DATA.slice(0, 4).map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={faq.id} className="faq-item">
              <button
                type="button"
                onClick={() => toggleFaq(index)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-headline text-sm sm:text-base text-[#18221E] hover:bg-[#F1F5F3] transition-colors cursor-pointer"
                aria-expanded={isOpen}
              >
                <span className="font-medium">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#52605A] shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-[#52605A] leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Direct Inquiries Strip */}
      <div className="mt-4 p-4 bg-[#F1F5F3] border border-[#E2E8E5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <span className="text-xs text-[#52605A]">
          Punya pertanyaan seputar kurasi jenis kurma lainnya?
        </span>
        <a
          href={generateWhatsAppUrl({
            customMessage: 'Halo Admin Alfaratha, saya punya pertanyaan spesifik seputar kurma & paket oleh-oleh.',
          })}
          target="_blank"
          rel="noopener noreferrer"
          className="text-label-caps text-[#18221E] hover:text-[#3A6B5C] uppercase font-semibold flex items-center gap-1.5 transition-colors"
        >
          <WhatsAppIcon className="w-3.5 h-3.5 text-[#3A6B5C]" />
          <span>Tanya Admin WA</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
