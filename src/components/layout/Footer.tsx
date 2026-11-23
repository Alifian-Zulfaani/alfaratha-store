import React from 'react';
import { ShieldCheck, MapPin } from 'lucide-react';
import { WhatsAppIcon } from '../ui/WhatsAppIcon';
import { generateWhatsAppUrl } from '../../utils/whatsapp';

export const Footer: React.FC = () => {
  const scrollTo = (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full bg-[#18221E] text-white border-t border-[#18221E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/10">
          {/* Col 1: Brand & Origin Guarantee */}
          <div className="md:col-span-1 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-white text-[#18221E] flex items-center justify-center font-headline text-sm font-bold">
                A
              </div>
              <span className="font-headline text-lg tracking-tight text-white font-semibold">
                Alfaratha Store
              </span>
            </div>
            <p className="text-xs text-[#DAE5DE] leading-relaxed">
              Kurasi kurma grade super dan souvenir ibadah autentik Tanah Suci dengan protokol preservasi suhu terkendali.
            </p>
            <div className="inline-flex items-center gap-2 border border-[#3A6B5C] text-[#B9EEDA] px-2.5 py-1 text-label-caps w-fit font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Asli Garansi Madinah &amp; Makkah</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="flex flex-col gap-2.5">
            <p className="text-label-caps uppercase tracking-widest text-white font-semibold">
              Navigasi
            </p>
            <a
              className="text-xs text-[#DAE5DE] hover:text-white transition-colors py-1"
              href="#katalog-produk"
              onClick={scrollTo('#katalog-produk')}
            >
              Katalog Kurma
            </a>
            <a
              className="text-xs text-[#DAE5DE] hover:text-white transition-colors py-1"
              href="#paket-haji"
              onClick={scrollTo('#paket-haji')}
            >
              Paket Oleh-Oleh
            </a>
            <a
              className="text-xs text-[#DAE5DE] hover:text-white transition-colors py-1"
              href="#standar-mutu"
              onClick={scrollTo('#standar-mutu')}
            >
              Keunggulan Cold-Storage
            </a>
            <a
              className="text-xs text-[#DAE5DE] hover:text-white transition-colors py-1"
              href="#faq-testimoni"
              onClick={scrollTo('#faq-testimoni')}
            >
              Testimoni &amp; FAQ
            </a>
          </div>

          {/* Col 3: Preservasi & Jam Gudang */}
          <div className="flex flex-col gap-2.5">
            <p className="text-label-caps uppercase tracking-widest text-white font-semibold">
              Preservasi &amp; Jam Gudang
            </p>
            <div className="text-xs text-[#DAE5DE] space-y-1">
              <p className="text-white font-medium">Cold Storage Distribution:</p>
              <p>Senin – Minggu: 07:30 – 22:00 WIB</p>
            </div>
            <p className="text-xs text-[#DAE5DE] mt-1 leading-relaxed">
              Suhu stabil 2°C – 4°C untuk menjaga kelembapan daging kurma primer.
            </p>
            <a
              href="https://maps.app.goo.gl/mFNWPrfMV3TEtqqV8"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Petunjuk arah lokasi gudang Alfaratha Kurma di Google Maps"
              className="text-label-code text-[#E6C093] hover:text-white transition-colors flex items-center gap-1.5 mt-1 font-semibold"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Lokasi Gudang di Google Maps ↗</span>
            </a>
          </div>

          {/* Col 4: Kontak Langsung */}
          <div className="flex flex-col gap-2.5">
            <p className="text-label-caps uppercase tracking-widest text-white font-semibold">
              Kontak Langsung
            </p>
            <p className="text-xs text-[#DAE5DE]">
              Layanan pemesanan partai &amp; hampers jamaah:
            </p>
            <a
              className="inline-flex items-center gap-2 font-headline text-base sm:text-lg text-white hover:text-[#B9EEDA] transition-colors py-1"
              href={generateWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Hubungi nomor WhatsApp resmi Alfaratha"
            >
              <WhatsAppIcon className="w-5 h-5 text-[#B9EEDA]" />
              <span>+62 812-3456-7890</span>
            </a>
            <span className="text-label-code text-[#DAE5DE]">
              admin@alfaratha.store
            </span>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#DAE5DE]">
          <div>© 2025 Alfaratha Store. Seluruh Hak Cipta Dilindungi.</div>
          <div className="flex items-center gap-6 text-label-code">
            <a
              className="hover:text-white transition-colors py-1"
              href="#standar-mutu"
              onClick={scrollTo('#standar-mutu')}
            >
              Kebijakan Mutu
            </a>
            <a
              className="hover:text-white transition-colors py-1"
              href="#standar-mutu"
              onClick={scrollTo('#standar-mutu')}
            >
              Garansi Kepulangan
            </a>
            <a
              className="hover:text-white transition-colors py-1"
              href="#alur-pemesanan"
              onClick={scrollTo('#alur-pemesanan')}
            >
              Pengiriman Dingin
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
