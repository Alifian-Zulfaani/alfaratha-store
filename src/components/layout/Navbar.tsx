import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { WhatsAppIcon } from '../ui/WhatsAppIcon';
import { generateWhatsAppUrl } from '../../utils/whatsapp';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('katalog');

  const navLinks = [
    { id: 'katalog', label: 'Katalog Kurma', href: '#katalog-produk' },
    { id: 'paket', label: 'Paket Oleh-Oleh', href: '#paket-haji' },
    { id: 'mutu', label: 'Keunggulan Produk', href: '#standar-mutu' },
    { id: 'testimoni-faq', label: 'Testimoni & FAQ', href: '#faq-testimoni' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, id: string) => {
    e.preventDefault();
    setActiveTab(id);
    setIsOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#F8FAF9]/90 backdrop-blur-md border-b border-[#E2E8E5]">
      <div className="h-16 lg:h-20 max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand Mark & Title */}
        <a
          href="#"
          className="flex items-center gap-2.5 sm:gap-3 shrink-0 focus:outline-none"
          aria-label="Alfaratha Store Beranda"
        >
          <div className="w-8 h-8 lg:w-9 lg:h-9 bg-[#18221E] flex items-center justify-center text-white font-headline text-base lg:text-lg font-semibold tracking-wider rounded-none">
            A
          </div>
          <span className="font-headline text-[17px] lg:text-xl text-[#18221E] tracking-tight font-semibold">
            Alfaratha Store
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href, link.id)}
                className={`text-[14px] font-medium tracking-tight transition-colors py-1 ${
                  isActive
                    ? 'text-[#18221E] font-semibold border-b-2 border-[#18221E]'
                    : 'text-[#52605A] hover:text-[#18221E]'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          <a
            href={generateWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 lg:gap-2 bg-[#3A6B5C] hover:bg-[#2E5649] text-white px-3 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm font-semibold tracking-wide transition-colors"
          >
            <WhatsAppIcon className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">Konsultasi via WA</span>
            <span className="sm:hidden">Tanya WA</span>
          </a>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden w-9 h-9 border border-[#E2E8E5] flex items-center justify-center text-[#18221E] bg-white hover:bg-[#F1F5F3] cursor-pointer"
            aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div
          id="mobile-nav-drawer"
          className="lg:hidden border-t border-[#E2E8E5] bg-white px-4 py-3 flex flex-col gap-1 shadow-sm"
        >
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href, link.id)}
              className="py-2.5 px-3 text-[#18221E] font-medium text-sm hover:bg-[#F1F5F3] transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 mt-1 border-t border-[#E2E8E5] flex flex-col gap-2 px-1">
            <a
              href={generateWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#3A6B5C] hover:bg-[#2E5649] text-white py-2.5 text-xs font-semibold tracking-wide transition-colors"
            >
              <WhatsAppIcon className="w-4 h-4 text-white" />
              <span>Chat CS Alfaratha via WhatsApp</span>
            </a>
            <div className="flex items-center justify-between text-label-code text-[#52605A] px-2 pt-1">
              <span>Stok Segar &amp; Higienis</span>
              <span className="text-[#3A6B5C] font-semibold">100% Impor Resmi</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
