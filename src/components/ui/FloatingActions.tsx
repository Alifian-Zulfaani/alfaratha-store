import React, { useState, useEffect } from 'react';
import { ArrowUp, X } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { generateWhatsAppUrl } from '../../utils/whatsapp';
import { useStore } from '../../context/StoreContext';

export const FloatingActions: React.FC = () => {
  const { siteContent } = useStore();
  const { general } = siteContent;
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2.5 pointer-events-auto">
      {/* Scroll to Top Button (Circular, identical size to WhatsApp button, sits directly above it) */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#18221E] text-white border border-white/20 hover:border-white/40 hover:bg-[#26332E] flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg hover:scale-105 active:scale-95 shrink-0"
          aria-label="Kembali ke atas halaman"
          title="Kembali ke atas"
        >
          <ArrowUp className="w-5 h-5 text-white" />
        </button>
      )}

      {/* WhatsApp Action Row (Aligned to right edge so WhatsApp button aligns vertically with Scroll to Top) */}
      <div className="flex items-center gap-2.5">
        {/* Desktop Tooltip Pill (Extends to the left) */}
        {showTooltip && (
          <div className="hidden lg:flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-[#E2E8E5] text-xs font-medium text-[#18221E] shadow-md">
            <span className="w-2 h-2 rounded-full bg-[#25D366]" />
            <span>{general.floatingTooltip}</span>
            <button
              type="button"
              onClick={() => setShowTooltip(false)}
              className="text-[#52605A] hover:text-[#18221E] ml-1 p-0.5 rounded-full hover:bg-[#F1F5F3] cursor-pointer"
              aria-label="Tutup notifikasi"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* WhatsApp Button (MDI icon, identical circular size, vibrant WhatsApp green) */}
        <a
          href={generateWhatsAppUrl({ phone: general.whatsappNumber })}
          target="_blank"
          rel="noopener noreferrer"
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-[#18221E] flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-105 active:scale-95 border border-white/20 shrink-0"
          aria-label="Pesan via WhatsApp Alfaratha Store"
          title="Chat WhatsApp"
        >
          <WhatsAppIcon className="w-6 h-6 text-[#18221E]" />
        </a>
      </div>
    </div>
  );
};
