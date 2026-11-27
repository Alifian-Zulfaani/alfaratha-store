import React, { useState, useMemo } from 'react';
import {
  Gift,
  MessageSquareQuote,
  HelpCircle,
  LayoutTemplate,
  ListChecks,
  Store,
  Plus,
  Pencil,
  Trash2,
  Star,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { CmsFaqItem, CmsPackageBundle, CmsTestimonial } from '../../types';
import { formatIDR } from '../../utils/whatsapp';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { PackageBundleModal } from '../../components/cms/PackageBundleModal';
import { TestimonialModal } from '../../components/cms/TestimonialModal';
import { FaqModal } from '../../components/cms/FaqModal';
import {
  GeneralContactEditor,
  HeroAndStrengthsEditor,
  StepsAndCtaEditor,
} from '../../components/cms/SiteSectionsEditor';

type CmsTabKey =
  | 'bundles'
  | 'testimonials'
  | 'faqs'
  | 'hero'
  | 'steps'
  | 'general';

export const ContentCmsPage: React.FC = () => {
  const {
    packageBundles,
    testimonials,
    faqs,
    savePackageBundle,
    deletePackageBundle,
    saveTestimonial,
    deleteTestimonial,
    saveFaq,
    deleteFaq,
  } = useStore();

  const [activeTab, setActiveTab] = useState<CmsTabKey>('bundles');

  const [bundleModalOpen, setBundleModalOpen] = useState(false);
  const [editBundleTarget, setEditBundleTarget] = useState<CmsPackageBundle | null>(null);

  const [testiModalOpen, setTestiModalOpen] = useState(false);
  const [editTestiTarget, setEditTestiTarget] = useState<CmsTestimonial | null>(null);

  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editFaqTarget, setEditFaqTarget] = useState<CmsFaqItem | null>(null);

  const [deleteDialog, setDeleteDialog] = useState<{
    kind: 'bundle' | 'testimonial' | 'faq';
    id: string;
    label: string;
  } | null>(null);

  const activeBundleIds = useMemo(
    () =>
      new Set(
        packageBundles
          .filter((b) => b.isActive)
          .slice(0, 3)
          .map((b) => b.id)
      ),
    [packageBundles]
  );

  const activeTestiIds = useMemo(
    () =>
      new Set(
        testimonials
          .filter((t) => t.isPublished)
          .slice(0, 2)
          .map((t) => t.id)
      ),
    [testimonials]
  );

  const activeFaqIds = useMemo(
    () =>
      new Set(
        faqs
          .filter((f) => f.isPublished)
          .slice(0, 4)
          .map((f) => f.id)
      ),
    [faqs]
  );

  const tabs: { key: CmsTabKey; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'bundles', label: `Paket Oleh-Oleh (${packageBundles.length})`, icon: Gift },
    { key: 'testimonials', label: `Testimoni (${testimonials.length})`, icon: MessageSquareQuote },
    { key: 'faqs', label: `FAQ (${faqs.length})`, icon: HelpCircle },
    { key: 'hero', label: 'Hero & Keunggulan', icon: LayoutTemplate },
    { key: 'steps', label: 'Alur & Header', icon: ListChecks },
    { key: 'general', label: 'Toko & Kontak', icon: Store },
  ];

  const handleConfirmDelete = async () => {
    if (!deleteDialog) return;
    if (deleteDialog.kind === 'bundle') {
      await deletePackageBundle(deleteDialog.id);
    } else if (deleteDialog.kind === 'testimonial') {
      await deleteTestimonial(deleteDialog.id);
    } else {
      await deleteFaq(deleteDialog.id);
    }
    setDeleteDialog(null);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 flex-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#3A6B5C] mb-1">
            <span className="w-1.5 h-1.5 bg-[#3A6B5C]" />
            <span>CMS Halaman Publik (Supabase Realtime)</span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-semibold text-[#18221E] tracking-tight">
            Konten Etalase Toko
          </h1>
          <p className="text-xs sm:text-sm text-[#52605A] mt-0.5">
            Kelola Paket Oleh-Oleh, Testimoni, FAQ, teks Hero, keunggulan, dan kontak WhatsApp dengan batas layout terkunci aman.
          </p>
        </div>

        <Link
          to="/"
          className="h-10 px-4 bg-white hover:bg-[#F1F5F3] border border-[#E2E8E5] text-[#18221E] text-xs font-semibold flex items-center justify-center gap-2 transition-colors shrink-0 w-full sm:w-auto"
        >
          <span>Lihat Etalase Live</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#3A6B5C]" />
        </Link>
      </div>

      {/* Responsive Tab Strip */}
      <div className="bg-white border border-[#E2E8E5] p-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold whitespace-nowrap border transition-colors cursor-pointer shrink-0 ${
                  active
                    ? 'bg-[#18221E] text-white border-[#18221E]'
                    : 'bg-[#F8FAF9] text-[#52605A] border-[#E2E8E5] hover:border-[#18221E] hover:text-[#18221E]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: PACKAGE BUNDLES */}
      {activeTab === 'bundles' && (
        <section className="space-y-4">
          <div className="bg-white border border-[#E2E8E5] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-[#52605A]">
              <p className="font-semibold text-[#18221E]">
                Slot Etalase Paket: {activeBundleIds.size} dari maks 3 kolom tampil aktif
              </p>
              <p className="mt-0.5">
                Halaman depan menampilkan 3 paket aktif pertama berdasarkan urutan terkecil agar grid 3 kolom selalu sejajar.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditBundleTarget(null);
                setBundleModalOpen(true);
              }}
              className="h-10 px-4 bg-[#3A6B5C] hover:bg-[#2E5649] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Paket</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {packageBundles.map((pkg) => {
              const isVisibleOnLanding = activeBundleIds.has(pkg.id);
              return (
                <div
                  key={pkg.id}
                  className={`bg-white border p-4 flex flex-col justify-between gap-4 ${
                    pkg.isPopular ? 'border-2 border-[#3A6B5C]' : 'border-[#E2E8E5]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#E2E8E5]">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className="px-1.5 py-0.5 bg-[#F1F5F3] border border-[#E2E8E5] text-[10px] font-mono text-[#52605A]">
                            Urutan #{pkg.sortOrder}
                          </span>
                          {pkg.isPopular && (
                            <span className="px-1.5 py-0.5 bg-[#3A6B5C] text-white text-[10px] font-semibold">
                              FAVORIT
                            </span>
                          )}
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-semibold ${
                              isVisibleOnLanding
                                ? 'bg-[#E6EFEA] text-[#2C5246]'
                                : 'bg-[#F5EFE6] text-[#8C6D46]'
                            }`}
                          >
                            {isVisibleOnLanding ? 'Tampil di Etalase' : pkg.isActive ? 'Cadangan (>3)' : 'Draft'}
                          </span>
                        </div>
                        <h3 className="font-headline text-base font-bold text-[#18221E] truncate">
                          {pkg.name}
                        </h3>
                        <p className="text-[11px] text-[#52605A] line-clamp-2 mt-0.5">
                          {pkg.boxDescription}
                        </p>
                      </div>
                    </div>

                    <div className="py-2.5 flex items-baseline justify-between border-b border-[#E2E8E5] text-xs">
                      <div>
                        <span className="text-[#52605A] block text-[10px] uppercase">Harga Grosir Jamaah</span>
                        <span className="font-headline font-bold text-base text-[#3A6B5C]">
                          {formatIDR(pkg.bulkPrice)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[#52605A] block text-[10px] uppercase">Satuan</span>
                        <span className="font-mono font-semibold text-[#18221E]">
                          {formatIDR(pkg.singlePrice)}
                        </span>
                      </div>
                    </div>

                    <ul className="mt-2.5 space-y-1 text-[11px] text-[#52605A]">
                      {pkg.items.map((item, idx) => (
                        <li key={idx} className="truncate">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-[#E2E8E5] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => void savePackageBundle({ ...pkg, isActive: !pkg.isActive })}
                      className="h-8 px-2.5 bg-[#F8FAF9] hover:bg-[#F1F5F3] border border-[#E2E8E5] text-[11px] font-semibold text-[#18221E] flex items-center gap-1 cursor-pointer"
                    >
                      {pkg.isActive ? <Eye className="w-3.5 h-3.5 text-[#3A6B5C]" /> : <EyeOff className="w-3.5 h-3.5 text-[#7E8E87]" />}
                      <span>{pkg.isActive ? 'Aktif' : 'Draft'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditBundleTarget(pkg);
                          setBundleModalOpen(true);
                        }}
                        aria-label={`Edit paket ${pkg.name}`}
                        className="h-8 px-2.5 bg-[#F1F5F3] hover:bg-[#18221E] hover:text-white border border-[#E2E8E5] text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteDialog({ kind: 'bundle', id: pkg.id, label: pkg.name })
                        }
                        aria-label={`Hapus paket ${pkg.name}`}
                        className="w-8 h-8 flex items-center justify-center bg-[#F1F5F3] hover:bg-[#BA1A1A] hover:text-white border border-[#E2E8E5] text-[#52605A] cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 2: TESTIMONIALS */}
      {activeTab === 'testimonials' && (
        <section className="space-y-4">
          <div className="bg-white border border-[#E2E8E5] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-[#52605A]">
              <p className="font-semibold text-[#18221E]">
                Slot Testimoni Etalase: {activeTestiIds.size} dari maks 2 kartu aktif teratas
              </p>
              <p className="mt-0.5">
                2 testimoni aktif urutan teratas otomatis tampil sejajar kolom FAQ di halaman depan.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditTestiTarget(null);
                setTestiModalOpen(true);
              }}
              className="h-10 px-4 bg-[#3A6B5C] hover:bg-[#2E5649] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Testimoni</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testimonials.map((rev) => {
              const isVisibleOnLanding = activeTestiIds.has(rev.id);
              return (
                <div key={rev.id} className="bg-white border border-[#E2E8E5] p-4 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E2E8E5] mb-2.5">
                      <div className="flex items-center gap-1 text-[#C4841D]">
                        {Array.from({ length: rev.rating }).map((_, idx) => (
                          <Star key={idx} className="w-3.5 h-3.5 fill-[#C4841D]" />
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-[#F1F5F3] border border-[#E2E8E5] text-[10px] font-mono text-[#52605A]">
                          #{rev.sortOrder}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-semibold ${
                            isVisibleOnLanding
                              ? 'bg-[#E6EFEA] text-[#2C5246]'
                              : 'bg-[#F5EFE6] text-[#8C6D46]'
                          }`}
                        >
                          {isVisibleOnLanding ? 'Tampil di Etalase' : rev.isPublished ? 'Arsip (>2)' : 'Draft'}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#18221E] italic leading-relaxed">
                      &ldquo;{rev.content}&rdquo;
                    </p>
                    <p className="text-[11px] font-semibold text-[#18221E] mt-2">
                      {rev.author} — <span className="font-normal text-[#52605A]">{rev.role} ({rev.city})</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E2E8E5] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => void saveTestimonial({ ...rev, isPublished: !rev.isPublished })}
                      className="h-8 px-2.5 bg-[#F8FAF9] hover:bg-[#F1F5F3] border border-[#E2E8E5] text-[11px] font-semibold text-[#18221E] flex items-center gap-1 cursor-pointer"
                    >
                      {rev.isPublished ? <Eye className="w-3.5 h-3.5 text-[#3A6B5C]" /> : <EyeOff className="w-3.5 h-3.5 text-[#7E8E87]" />}
                      <span>{rev.isPublished ? 'Tayang' : 'Draft'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditTestiTarget(rev);
                          setTestiModalOpen(true);
                        }}
                        className="h-8 px-2.5 bg-[#F1F5F3] hover:bg-[#18221E] hover:text-white border border-[#E2E8E5] text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteDialog({ kind: 'testimonial', id: rev.id, label: rev.author })
                        }
                        aria-label={`Hapus testimoni ${rev.author}`}
                        className="w-8 h-8 flex items-center justify-center bg-[#F1F5F3] hover:bg-[#BA1A1A] hover:text-white border border-[#E2E8E5] text-[#52605A] cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 3: FAQS */}
      {activeTab === 'faqs' && (
        <section className="space-y-4">
          <div className="bg-white border border-[#E2E8E5] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-[#52605A]">
              <p className="font-semibold text-[#18221E]">
                Slot FAQ Etalase: {activeFaqIds.size} dari maks 4 pertanyaan aktif teratas
              </p>
              <p className="mt-0.5">
                4 FAQ aktif urutan terkecil tampil di akordeon Landing Page agar tinggi section seimbang dengan Testimoni.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditFaqTarget(null);
                setFaqModalOpen(true);
              }}
              className="h-10 px-4 bg-[#3A6B5C] hover:bg-[#2E5649] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah FAQ</span>
            </button>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => {
              const isVisibleOnLanding = activeFaqIds.has(faq.id);
              return (
                <div key={faq.id} className="bg-white border border-[#E2E8E5] p-4 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="px-1.5 py-0.5 bg-[#F1F5F3] border border-[#E2E8E5] text-[10px] font-mono text-[#52605A]">
                          #{faq.sortOrder}
                        </span>
                        {faq.badge && (
                          <span className="px-1.5 py-0.5 bg-[#F1F5F3] text-[#3A6B5C] text-[10px] font-semibold">
                            {faq.badge}
                          </span>
                        )}
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-semibold ${
                            isVisibleOnLanding
                              ? 'bg-[#E6EFEA] text-[#2C5246]'
                              : 'bg-[#F5EFE6] text-[#8C6D46]'
                          }`}
                        >
                          {isVisibleOnLanding ? 'Tampil di Etalase' : faq.isPublished ? 'Arsip (>4)' : 'Draft'}
                        </span>
                      </div>
                      <h3 className="font-headline text-sm sm:text-base font-semibold text-[#18221E]">
                        {faq.question}
                      </h3>
                      <p className="text-xs text-[#52605A] mt-1 leading-relaxed">{faq.answer}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pt-2 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => void saveFaq({ ...faq, isPublished: !faq.isPublished })}
                        className="h-8 px-2.5 bg-[#F8FAF9] hover:bg-[#F1F5F3] border border-[#E2E8E5] text-[11px] font-semibold text-[#18221E] flex items-center gap-1 cursor-pointer"
                      >
                        {faq.isPublished ? <Eye className="w-3.5 h-3.5 text-[#3A6B5C]" /> : <EyeOff className="w-3.5 h-3.5 text-[#7E8E87]" />}
                        <span>{faq.isPublished ? 'Tayang' : 'Draft'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditFaqTarget(faq);
                          setFaqModalOpen(true);
                        }}
                        className="h-8 px-2.5 bg-[#F1F5F3] hover:bg-[#18221E] hover:text-white border border-[#E2E8E5] text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteDialog({ kind: 'faq', id: faq.id, label: faq.question })
                        }
                        aria-label={`Hapus FAQ ${faq.question}`}
                        className="w-8 h-8 flex items-center justify-center bg-[#F1F5F3] hover:bg-[#BA1A1A] hover:text-white border border-[#E2E8E5] text-[#52605A] cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 4: HERO, TRUST METRICS & BENTO */}
      {activeTab === 'hero' && <HeroAndStrengthsEditor />}

      {/* TAB 5: ORDER STEPS, FINAL CTA & SECTION HEADERS */}
      {activeTab === 'steps' && <StepsAndCtaEditor />}

      {/* TAB 6: STORE GENERAL & CONTACT */}
      {activeTab === 'general' && <GeneralContactEditor />}

      {/* Modals */}
      <PackageBundleModal
        isOpen={bundleModalOpen}
        editTarget={editBundleTarget}
        nextSortOrder={packageBundles.length}
        onClose={() => {
          setBundleModalOpen(false);
          setEditBundleTarget(null);
        }}
      />

      <TestimonialModal
        isOpen={testiModalOpen}
        editTarget={editTestiTarget}
        nextSortOrder={testimonials.length}
        onClose={() => {
          setTestiModalOpen(false);
          setEditTestiTarget(null);
        }}
      />

      <FaqModal
        isOpen={faqModalOpen}
        editTarget={editFaqTarget}
        nextSortOrder={faqs.length}
        onClose={() => {
          setFaqModalOpen(false);
          setEditFaqTarget(null);
        }}
      />

      <ConfirmModal
        isOpen={!!deleteDialog}
        variant="danger"
        icon="delete"
        title="Konfirmasi Hapus Konten"
        message={`Hapus "${deleteDialog?.label || ''}" dari database?`}
        description="Konten yang dihapus akan langsung hilang dari etalase publik Alfaratha Store."
        confirmLabel="Ya, Hapus"
        onCancel={() => setDeleteDialog(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
};
