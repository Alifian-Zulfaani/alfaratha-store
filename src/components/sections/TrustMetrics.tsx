import React from 'react';
import { ShieldCheck, Package, Snowflake, Plane } from 'lucide-react';

export const TrustMetrics: React.FC = () => {
  const metrics = [
    {
      icon: ShieldCheck,
      badge: 'KEASLIAN TERUJI',
      title: '100% Impor Resmi',
      desc: 'Langsung dari perkebunan kurma Madinah & Makkah berizin resmi.',
    },
    {
      icon: Package,
      badge: 'REKAM JEJAK',
      title: '10.000+ Paket',
      desc: 'Dipercaya ribuan jamaah, KBIHU, dan travel umroh terkemuka.',
    },
    {
      icon: Snowflake,
      badge: 'PENYIMPANAN SEJUK',
      title: 'Kualitas Terjaga',
      desc: 'Daging buah tetap empuk lembab, tidak asam atau berulat.',
    },
    {
      icon: Plane,
      badge: 'BEBAS BAGASI',
      title: '0 kg Beban Koper',
      desc: 'Dus tiba di alamat Anda sebelum jadwal kepulangan dari Tanah Suci.',
    },
  ];

  return (
    <section className="w-full bg-[#F8FAF9] border-b border-[#E2E8E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#E2E8E5] border border-[#E2E8E5]">
          {metrics.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white p-4 sm:p-5 flex flex-col gap-1.5 transition-colors hover:bg-[#F1F5F3]"
              >
                <div className="flex items-center gap-2 text-[#3A6B5C]">
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-label-caps uppercase tracking-wider text-[#52605A]">
                    {item.badge}
                  </span>
                </div>
                <p className="font-headline text-base sm:text-lg text-[#18221E] font-semibold leading-snug">
                  {item.title}
                </p>
                <p className="text-xs sm:text-sm text-[#52605A] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
