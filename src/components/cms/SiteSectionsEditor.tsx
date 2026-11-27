import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { SiteContentBundle, SiteSectionKey } from '../../types';
import { useStore } from '../../context/StoreContext';

interface SaveBannerProps {
  savedMsg: string;
  errorMsg: string;
}

const SaveBanner: React.FC<SaveBannerProps> = ({ savedMsg, errorMsg }) => (
  <>
    {savedMsg && (
      <div className="p-3 bg-[#E6EFEA] border border-[#3A6B5C]/30 text-[#2C5246] text-xs flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-[#3A6B5C] shrink-0" />
        <span>{savedMsg}</span>
      </div>
    )}
    {errorMsg && (
      <div role="alert" className="p-3 bg-[#FFF5F5] border border-[#BA1A1A]/30 text-[#93000A] text-xs flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{errorMsg}</span>
      </div>
    )}
  </>
);

interface SectionFormCardProps {
  title: string;
  subtitle: string;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
}

const SectionFormCard: React.FC<SectionFormCardProps> = ({
  title,
  subtitle,
  saving,
  onSubmit,
  children,
}) => (
  <form
    onSubmit={onSubmit}
    className="bg-white border border-[#E2E8E5] shadow-[0_4px_20px_-2px_rgba(24,34,30,0.03)] flex flex-col"
  >
    <div className="px-4 sm:px-5 py-3.5 bg-[#F1F5F3] border-b border-[#E2E8E5] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div>
        <h3 className="font-headline text-sm sm:text-base font-semibold text-[#18221E]">{title}</h3>
        <p className="text-[11px] text-[#52605A]">{subtitle}</p>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="h-9 px-4 bg-[#3A6B5C] hover:bg-[#2E5649] disabled:bg-[#7E8E87] disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 w-full sm:w-auto"
      >
        <Save className="w-3.5 h-3.5" />
        <span>{saving ? 'Menyimpan...' : 'Simpan Bagian Ini'}</span>
      </button>
    </div>
    <div className="p-4 sm:p-5 space-y-4 text-xs">{children}</div>
  </form>
);

const IMAGE_PRESETS = [
  { label: 'Kurma Ajwa', url: '/images/ajwa.webp' },
  { label: 'Kurma Sukari', url: '/images/sukkari.webp' },
  { label: 'Kurma Medjool', url: '/images/medjool.webp' },
  { label: 'Paket Madinah Box', url: '/images/gift-hampers.webp' },
  { label: 'Paket Barokah', url: '/images/paket-barokah.webp' },
];

export const HeroAndStrengthsEditor: React.FC = () => {
  const { siteContent, saveSiteSection } = useStore();
  const [hero, setHero] = useState(siteContent.hero);
  const [metrics, setMetrics] = useState(siteContent.trustMetrics);
  const [bento, setBento] = useState(siteContent.bentoAdvantages);
  const [savingKey, setSavingKey] = useState<SiteSectionKey | null>(null);
  const [savedMsg, setSavedMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setHero(siteContent.hero);
    setMetrics(siteContent.trustMetrics);
    setBento(siteContent.bentoAdvantages);
  }, [siteContent]);

  const handleSave = async <K extends SiteSectionKey>(
    e: React.FormEvent,
    key: K,
    data: SiteContentBundle[K],
    label: string
  ) => {
    e.preventDefault();
    if (savingKey) return;
    setErrorMsg('');
    setSavedMsg('');
    setSavingKey(key);
    try {
      const res = await saveSiteSection(key, data);
      if (!res.ok) {
        setErrorMsg(res.error || 'Gagal menyimpan perubahan.');
        return;
      }
      setSavedMsg(`Bagian "${label}" berhasil diperbarui dan langsung aktif di Landing Page.`);
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-5">
      <SaveBanner savedMsg={savedMsg} errorMsg={errorMsg} />

      {/* 1. Hero & Featured Card */}
      <SectionFormCard
        title="Bagian Hero & Kartu Sorotan Utama"
        subtitle="Teks pembuka di atas halaman depan beserta kartu produk sorotan di sisi kanan."
        saving={savingKey === 'hero'}
        onSubmit={(e) => void handleSave(e, 'hero', hero, 'Hero & Kartu Sorotan')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
              Badge Atas Hero (Max 75 kar)
            </label>
            <input
              type="text"
              maxLength={75}
              required
              value={hero.badgeText}
              onChange={(e) => setHero({ ...hero, badgeText: e.target.value })}
              className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
              Judul Utama (Awalan)
            </label>
            <input
              type="text"
              maxLength={65}
              required
              value={hero.titlePrefix}
              onChange={(e) => setHero({ ...hero, titlePrefix: e.target.value })}
              className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
              Judul Sorotan Berwarna Hijau
            </label>
            <input
              type="text"
              maxLength={35}
              required
              value={hero.titleHighlight}
              onChange={(e) => setHero({ ...hero, titleHighlight: e.target.value })}
              className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
              Paragraf Deskripsi Hero (Max 240 kar)
            </label>
            <textarea
              rows={2}
              maxLength={240}
              required
              value={hero.description}
              onChange={(e) => setHero({ ...hero, description: e.target.value })}
              className="w-full p-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
              Label Tombol Katalog (Kiri)
            </label>
            <input
              type="text"
              maxLength={32}
              required
              value={hero.primaryCtaLabel}
              onChange={(e) => setHero({ ...hero, primaryCtaLabel: e.target.value })}
              className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
              Label Tombol WhatsApp (Kanan)
            </label>
            <input
              type="text"
              maxLength={32}
              required
              value={hero.secondaryCtaLabel}
              onChange={(e) => setHero({ ...hero, secondaryCtaLabel: e.target.value })}
              className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
            />
          </div>

          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {([0, 1, 2] as const).map((idx) => (
              <div key={idx}>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
                  Micro Proof #{idx + 1}
                </label>
                <input
                  type="text"
                  maxLength={28}
                  required
                  value={hero.proofItems[idx]}
                  onChange={(e) => {
                    const next: [string, string, string] = [...hero.proofItems] as [string, string, string];
                    next[idx] = e.target.value;
                    setHero({ ...hero, proofItems: next });
                  }}
                  className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm text-[#18221E] focus:outline-none focus:border-[#3A6B5C]"
                />
              </div>
            ))}
          </div>

          <div className="sm:col-span-2 pt-3 border-t border-[#E2E8E5]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#3A6B5C] mb-3">
              Kartu Showcase Hero (Sisi Kanan)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10.5px] font-semibold uppercase text-[#52605A] mb-1">
                  Badge Kiri
                </label>
                <input
                  type="text"
                  maxLength={25}
                  value={hero.showcaseBadge}
                  onChange={(e) => setHero({ ...hero, showcaseBadge: e.target.value })}
                  className="w-full h-9 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-xs"
                />
              </div>
              <div>
                <label className="block text-[10.5px] font-semibold uppercase text-[#52605A] mb-1">
                  Status Kanan
                </label>
                <input
                  type="text"
                  maxLength={20}
                  value={hero.showcaseStatus}
                  onChange={(e) => setHero({ ...hero, showcaseStatus: e.target.value })}
                  className="w-full h-9 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-xs"
                />
              </div>
              <div>
                <label className="block text-[10.5px] font-semibold uppercase text-[#52605A] mb-1">
                  Gambar Kartu
                </label>
                <select
                  value={hero.showcaseImageUrl}
                  onChange={(e) => setHero({ ...hero, showcaseImageUrl: e.target.value })}
                  className="w-full h-9 px-2 bg-[#F8FAF9] border border-[#E2E8E5] text-xs"
                >
                  {IMAGE_PRESETS.map((p) => (
                    <option key={p.url} value={p.url}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10.5px] font-semibold uppercase text-[#52605A] mb-1">
                  Judul Produk Showcase
                </label>
                <input
                  type="text"
                  maxLength={45}
                  value={hero.showcaseTitle}
                  onChange={(e) => setHero({ ...hero, showcaseTitle: e.target.value })}
                  className="w-full h-9 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-xs"
                />
              </div>
              <div>
                <label className="block text-[10.5px] font-semibold uppercase text-[#52605A] mb-1">
                  Asal / Origin Pin
                </label>
                <input
                  type="text"
                  maxLength={35}
                  value={hero.showcaseLocation}
                  onChange={(e) => setHero({ ...hero, showcaseLocation: e.target.value })}
                  className="w-full h-9 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-xs"
                />
              </div>
              <div>
                <label className="block text-[10.5px] font-semibold uppercase text-[#52605A] mb-1">
                  Harga Mulai (Teks)
                </label>
                <input
                  type="text"
                  maxLength={25}
                  value={hero.showcasePriceValue}
                  onChange={(e) => setHero({ ...hero, showcasePriceValue: e.target.value })}
                  className="w-full h-9 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </SectionFormCard>

      {/* 2. Trust Metrics (Fixed 4 Cards) */}
      <SectionFormCard
        title="4 Kartu Metrik Kepercayaan (Bawah Hero)"
        subtitle="Susunan dikunci 4 kartu simetris agar proporsional di desktop maupun 2x2 di mobile."
        saving={savingKey === 'trustMetrics'}
        onSubmit={(e) => void handleSave(e, 'trustMetrics', metrics, 'Metrik Kepercayaan')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.items.map((item, idx) => (
            <div key={idx} className="p-3.5 bg-[#F8FAF9] border border-[#E2E8E5] space-y-2.5">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#3A6B5C]">
                Kartu #{idx + 1}
              </span>
              <input
                type="text"
                maxLength={28}
                required
                value={item.badge}
                onChange={(e) => {
                  const next = [...metrics.items] as typeof metrics.items;
                  next[idx] = { ...item, badge: e.target.value };
                  setMetrics({ items: next });
                }}
                placeholder="Label Kecil Atas"
                className="w-full h-9 px-2.5 bg-white border border-[#E2E8E5] text-xs"
              />
              <input
                type="text"
                maxLength={32}
                required
                value={item.title}
                onChange={(e) => {
                  const next = [...metrics.items] as typeof metrics.items;
                  next[idx] = { ...item, title: e.target.value };
                  setMetrics({ items: next });
                }}
                placeholder="Judul Utama"
                className="w-full h-9 px-2.5 bg-white border border-[#E2E8E5] text-sm font-semibold"
              />
              <textarea
                rows={2}
                maxLength={105}
                required
                value={item.desc}
                onChange={(e) => {
                  const next = [...metrics.items] as typeof metrics.items;
                  next[idx] = { ...item, desc: e.target.value };
                  setMetrics({ items: next });
                }}
                className="w-full p-2.5 bg-white border border-[#E2E8E5] text-xs"
              />
            </div>
          ))}
        </div>
      </SectionFormCard>

      {/* 3. Bento Advantages (Fixed 4 Cards) */}
      <SectionFormCard
        title="Standar Mutu (4 Kartu Bento Asimetris)"
        subtitle="Layout 7:5 & 5:7 tetap terkunci untuk menjaga ritme visual halaman depan."
        saving={savingKey === 'bentoAdvantages'}
        onSubmit={(e) => void handleSave(e, 'bentoAdvantages', bento, 'Standar Mutu')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-2 border-b border-[#E2E8E5]">
          <div>
            <label className="block text-[10.5px] font-semibold uppercase text-[#52605A] mb-1">
              Eyebrow
            </label>
            <input
              type="text"
              maxLength={35}
              value={bento.eyebrow}
              onChange={(e) => setBento({ ...bento, eyebrow: e.target.value })}
              className="w-full h-9 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-xs"
            />
          </div>
          <div>
            <label className="block text-[10.5px] font-semibold uppercase text-[#52605A] mb-1">
              Judul Section
            </label>
            <input
              type="text"
              maxLength={55}
              value={bento.heading}
              onChange={(e) => setBento({ ...bento, heading: e.target.value })}
              className="w-full h-9 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-xs"
            />
          </div>
          <div>
            <label className="block text-[10.5px] font-semibold uppercase text-[#52605A] mb-1">
              Subjudul Kanan
            </label>
            <input
              type="text"
              maxLength={100}
              value={bento.subtitle}
              onChange={(e) => setBento({ ...bento, subtitle: e.target.value })}
              className="w-full h-9 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bento.cards.map((card, idx) => (
            <div key={idx} className="p-3.5 bg-[#F8FAF9] border border-[#E2E8E5] space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#3A6B5C]">
                  Bento #{idx + 1}
                </span>
                <input
                  type="text"
                  maxLength={24}
                  value={card.tag}
                  onChange={(e) => {
                    const next = [...bento.cards] as typeof bento.cards;
                    next[idx] = { ...card, tag: e.target.value };
                    setBento({ ...bento, cards: next });
                  }}
                  className="h-7 px-2 bg-white border border-[#E2E8E5] text-[10.5px] font-semibold w-40 text-right"
                />
              </div>
              <input
                type="text"
                maxLength={50}
                required
                value={card.title}
                onChange={(e) => {
                  const next = [...bento.cards] as typeof bento.cards;
                  next[idx] = { ...card, title: e.target.value };
                  setBento({ ...bento, cards: next });
                }}
                className="w-full h-9 px-2.5 bg-white border border-[#E2E8E5] text-sm font-semibold"
              />
              <textarea
                rows={2}
                maxLength={180}
                required
                value={card.desc}
                onChange={(e) => {
                  const next = [...bento.cards] as typeof bento.cards;
                  next[idx] = { ...card, desc: e.target.value };
                  setBento({ ...bento, cards: next });
                }}
                className="w-full p-2.5 bg-white border border-[#E2E8E5] text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  maxLength={28}
                  value={card.footerLeft}
                  onChange={(e) => {
                    const next = [...bento.cards] as typeof bento.cards;
                    next[idx] = { ...card, footerLeft: e.target.value };
                    setBento({ ...bento, cards: next });
                  }}
                  placeholder="Poin Kiri Bawah"
                  className="h-8 px-2 bg-white border border-[#E2E8E5] text-[11px]"
                />
                <input
                  type="text"
                  maxLength={28}
                  value={card.footerRight}
                  onChange={(e) => {
                    const next = [...bento.cards] as typeof bento.cards;
                    next[idx] = { ...card, footerRight: e.target.value };
                    setBento({ ...bento, cards: next });
                  }}
                  placeholder="Poin Kanan Bawah"
                  className="h-8 px-2 bg-white border border-[#E2E8E5] text-[11px]"
                />
              </div>
            </div>
          ))}
        </div>
      </SectionFormCard>
    </div>
  );
};

export const StepsAndCtaEditor: React.FC = () => {
  const { siteContent, saveSiteSection } = useStore();
  const [stepsData, setStepsData] = useState(siteContent.orderSteps);
  const [finalCta, setFinalCta] = useState(siteContent.finalCta);
  const [headers, setHeaders] = useState(siteContent.catalogHeaders);
  const [savingKey, setSavingKey] = useState<SiteSectionKey | null>(null);
  const [savedMsg, setSavedMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setStepsData(siteContent.orderSteps);
    setFinalCta(siteContent.finalCta);
    setHeaders(siteContent.catalogHeaders);
  }, [siteContent]);

  const handleSave = async <K extends SiteSectionKey>(
    e: React.FormEvent,
    key: K,
    data: SiteContentBundle[K],
    label: string
  ) => {
    e.preventDefault();
    if (savingKey) return;
    setErrorMsg('');
    setSavedMsg('');
    setSavingKey(key);
    try {
      const res = await saveSiteSection(key, data);
      if (!res.ok) {
        setErrorMsg(res.error || 'Gagal menyimpan perubahan.');
        return;
      }
      setSavedMsg(`Bagian "${label}" berhasil disimpan ke Supabase.`);
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-5">
      <SaveBanner savedMsg={savedMsg} errorMsg={errorMsg} />

      {/* Order Steps */}
      <SectionFormCard
        title="Alur Cara Pemesanan (3 Langkah Tetap)"
        subtitle="Mengatur judul section beserta 3 langkah urutan pemesanan di etalase."
        saving={savingKey === 'orderSteps'}
        onSubmit={(e) => void handleSave(e, 'orderSteps', stepsData, 'Cara Pemesanan')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-2 border-b border-[#E2E8E5]">
          <input
            type="text"
            maxLength={35}
            value={stepsData.eyebrow}
            onChange={(e) => setStepsData({ ...stepsData, eyebrow: e.target.value })}
            placeholder="Eyebrow"
            className="h-9 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-xs"
          />
          <input
            type="text"
            maxLength={50}
            value={stepsData.heading}
            onChange={(e) => setStepsData({ ...stepsData, heading: e.target.value })}
            placeholder="Judul Section"
            className="h-9 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-xs"
          />
          <input
            type="text"
            maxLength={45}
            value={stepsData.hoursBadge}
            onChange={(e) => setStepsData({ ...stepsData, hoursBadge: e.target.value })}
            placeholder="Jam Layanan Admin"
            className="h-9 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-xs"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stepsData.steps.map((st, idx) => (
            <div key={st.step} className="p-3.5 bg-[#F8FAF9] border border-[#E2E8E5] space-y-2.5">
              <span className="text-[10.5px] font-bold uppercase text-[#3A6B5C]">
                LANGKAH {st.step}
              </span>
              <input
                type="text"
                maxLength={45}
                required
                value={st.title}
                onChange={(e) => {
                  const next = [...stepsData.steps] as typeof stepsData.steps;
                  next[idx] = { ...st, title: e.target.value };
                  setStepsData({ ...stepsData, steps: next });
                }}
                className="w-full h-9 px-2.5 bg-white border border-[#E2E8E5] text-xs font-semibold"
              />
              <textarea
                rows={3}
                maxLength={160}
                required
                value={st.desc}
                onChange={(e) => {
                  const next = [...stepsData.steps] as typeof stepsData.steps;
                  next[idx] = { ...st, desc: e.target.value };
                  setStepsData({ ...stepsData, steps: next });
                }}
                className="w-full p-2.5 bg-white border border-[#E2E8E5] text-xs"
              />
            </div>
          ))}
        </div>
      </SectionFormCard>

      {/* Final CTA & Map Card */}
      <SectionFormCard
        title="Banner Penutup (Final CTA) & Kartu Google Maps"
        subtitle="Mengatur ajakan penutup beserta teks kartu peta toko."
        saving={savingKey === 'finalCta'}
        onSubmit={(e) => void handleSave(e, 'finalCta', finalCta, 'Banner Penutup & Peta')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10.5px] font-semibold uppercase text-[#52605A] mb-1">
              Badge Atas
            </label>
            <input
              type="text"
              maxLength={40}
              value={finalCta.badge}
              onChange={(e) => setFinalCta({ ...finalCta, badge: e.target.value })}
              className="w-full h-9 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-xs"
            />
          </div>
          <div>
            <label className="block text-[10.5px] font-semibold uppercase text-[#52605A] mb-1">
              Judul Besar Penutup
            </label>
            <input
              type="text"
              maxLength={85}
              value={finalCta.heading}
              onChange={(e) => setFinalCta({ ...finalCta, heading: e.target.value })}
              className="w-full h-9 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-xs"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10.5px] font-semibold uppercase text-[#52605A] mb-1">
              Deskripsi CTA
            </label>
            <textarea
              rows={2}
              maxLength={220}
              value={finalCta.description}
              onChange={(e) => setFinalCta({ ...finalCta, description: e.target.value })}
              className="w-full p-3 bg-[#F8FAF9] border border-[#E2E8E5] text-xs"
            />
          </div>
          <div>
            <label className="block text-[10.5px] font-semibold uppercase text-[#52605A] mb-1">
              Tombol Utama WhatsApp
            </label>
            <input
              type="text"
              maxLength={35}
              value={finalCta.primaryBtnLabel}
              onChange={(e) => setFinalCta({ ...finalCta, primaryBtnLabel: e.target.value })}
              className="w-full h-9 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-xs"
            />
          </div>
          <div>
            <label className="block text-[10.5px] font-semibold uppercase text-[#52605A] mb-1">
              Judul Kartu Peta (Tutup / Belum Muat)
            </label>
            <input
              type="text"
              maxLength={40}
              value={finalCta.mapCardTitle}
              onChange={(e) => setFinalCta({ ...finalCta, mapCardTitle: e.target.value })}
              className="w-full h-9 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-xs"
            />
          </div>
        </div>
      </SectionFormCard>

      {/* Catalog / Bundle / Testimonial / FAQ Headers */}
      <SectionFormCard
        title="Judul & Pengantar Section Katalog, Paket, Testimoni, FAQ"
        subtitle="Mengatur heading setiap blok section agar konsisten tanpa mengedit kode."
        saving={savingKey === 'catalogHeaders'}
        onSubmit={(e) => void handleSave(e, 'catalogHeaders', headers, 'Judul Section Etalase')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10.5px] font-semibold uppercase text-[#52605A] mb-1">
              Judul Katalog Produk
            </label>
            <input
              type="text"
              maxLength={50}
              value={headers.productHeading}
              onChange={(e) => setHeaders({ ...headers, productHeading: e.target.value })}
              className="w-full h-9 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-xs"
            />
          </div>
          <div>
            <label className="block text-[10.5px] font-semibold uppercase text-[#52605A] mb-1">
              Judul Grosir Kartonan (Strip Bawah Katalog)
            </label>
            <input
              type="text"
              maxLength={70}
              value={headers.wholesaleTitle}
              onChange={(e) => setHeaders({ ...headers, wholesaleTitle: e.target.value })}
              className="w-full h-9 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-xs"
            />
          </div>
          <div>
            <label className="block text-[10.5px] font-semibold uppercase text-[#52605A] mb-1">
              Judul Section Paket Oleh-Oleh
            </label>
            <input
              type="text"
              maxLength={50}
              value={headers.bundleHeading}
              onChange={(e) => setHeaders({ ...headers, bundleHeading: e.target.value })}
              className="w-full h-9 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-xs"
            />
          </div>
          <div>
            <label className="block text-[10.5px] font-semibold uppercase text-[#52605A] mb-1">
              Catatan Jadwal Kirim Paket
            </label>
            <input
              type="text"
              maxLength={120}
              value={headers.bundleScheduleNote}
              onChange={(e) => setHeaders({ ...headers, bundleScheduleNote: e.target.value })}
              className="w-full h-9 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-xs"
            />
          </div>
          <div>
            <label className="block text-[10.5px] font-semibold uppercase text-[#52605A] mb-1">
              Judul Section Testimoni
            </label>
            <input
              type="text"
              maxLength={40}
              value={headers.testimonialHeading}
              onChange={(e) => setHeaders({ ...headers, testimonialHeading: e.target.value })}
              className="w-full h-9 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-xs"
            />
          </div>
          <div>
            <label className="block text-[10.5px] font-semibold uppercase text-[#52605A] mb-1">
              Judul Section FAQ
            </label>
            <input
              type="text"
              maxLength={45}
              value={headers.faqHeading}
              onChange={(e) => setHeaders({ ...headers, faqHeading: e.target.value })}
              className="w-full h-9 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-xs"
            />
          </div>
        </div>
      </SectionFormCard>
    </div>
  );
};

export const GeneralContactEditor: React.FC = () => {
  const { siteContent, saveSiteSection } = useStore();
  const [general, setGeneral] = useState(siteContent.general);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setGeneral(siteContent.general);
  }, [siteContent.general]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setErrorMsg('');
    setSavedMsg('');
    setSaving(true);
    try {
      const res = await saveSiteSection('general', general);
      if (!res.ok) {
        setErrorMsg(res.error || 'Gagal menyimpan profil toko.');
        return;
      }
      setSavedMsg('Profil toko, nomor WhatsApp, jam buka & tautan peta berhasil diperbarui.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <SaveBanner savedMsg={savedMsg} errorMsg={errorMsg} />

      <SectionFormCard
        title="Identitas Toko, Nomor WhatsApp, Jam Buka & Google Maps"
        subtitle="Dipakai di Navbar, tombol Pesan via WA, Struk Digital POS, Footer, dan Peta Toko."
        saving={saving}
        onSubmit={(e) => void handleSubmit(e)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
              Nama Toko / Brand
            </label>
            <input
              type="text"
              required
              maxLength={40}
              value={general.storeName}
              onChange={(e) => setGeneral({ ...general, storeName: e.target.value })}
              className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
              Email Resmi Toko
            </label>
            <input
              type="email"
              required
              maxLength={60}
              value={general.email}
              onChange={(e) => setGeneral({ ...general, email: e.target.value })}
              className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
              Nomor WhatsApp Sistem (Awali 62, Tanpa +)
            </label>
            <input
              type="text"
              required
              maxLength={20}
              value={general.whatsappNumber}
              onChange={(e) =>
                setGeneral({
                  ...general,
                  whatsappNumber: e.target.value.replace(/\D/g, ''),
                })
              }
              placeholder="6281554431137"
              className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
              Format Tampilan Nomor WhatsApp
            </label>
            <input
              type="text"
              required
              maxLength={25}
              value={general.whatsappDisplay}
              onChange={(e) => setGeneral({ ...general, whatsappDisplay: e.target.value })}
              placeholder="+62 815-5443-1137"
              className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
              Jam Operasional Lengkap
            </label>
            <input
              type="text"
              required
              maxLength={60}
              value={general.operatingHours}
              onChange={(e) => setGeneral({ ...general, operatingHours: e.target.value })}
              className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
              Teks Tooltip WhatsApp Melayang
            </label>
            <input
              type="text"
              maxLength={40}
              value={general.floatingTooltip}
              onChange={(e) => setGeneral({ ...general, floatingTooltip: e.target.value })}
              className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
              Tagline Singkat Footer
            </label>
            <textarea
              rows={2}
              maxLength={160}
              value={general.tagline}
              onChange={(e) => setGeneral({ ...general, tagline: e.target.value })}
              className="w-full p-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
              Tautan Google Maps Toko
            </label>
            <input
              type="url"
              required
              value={general.googleMapsUrl}
              onChange={(e) => setGeneral({ ...general, googleMapsUrl: e.target.value })}
              className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
              Badge Garansi Footer
            </label>
            <input
              type="text"
              maxLength={50}
              value={general.footerBadge}
              onChange={(e) => setGeneral({ ...general, footerBadge: e.target.value })}
              className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
              Teks Hak Cipta Footer
            </label>
            <input
              type="text"
              maxLength={80}
              value={general.copyrightText}
              onChange={(e) => setGeneral({ ...general, copyrightText: e.target.value })}
              className="w-full h-10 px-3 bg-[#F8FAF9] border border-[#E2E8E5] text-sm"
            />
          </div>
        </div>
      </SectionFormCard>
    </div>
  );
};
