import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Briefcase,
  Building2,
  ReceiptText,
  Banknote,
  CheckCircle2,
  LogOut,
  Save,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatIDR } from '../../utils/whatsapp';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export const ProfilePage: React.FC = () => {
  const { currentUser, updateProfile, logout, transactions } = useStore();
  const navigate = useNavigate();

  const [name, setName] = useState(currentUser?.name || '');
  const [branch, setBranch] = useState(currentUser?.branch || 'Alfaratha Store');
  const [savedNotice, setSavedNotice] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  React.useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setBranch(currentUser.branch);
    }
  }, [currentUser]);

  const staffStats = useMemo(() => {
    const staffTrx = transactions.filter(
      (t) => t.cashierName.toLowerCase() === (currentUser?.name || '').toLowerCase()
    );
    const totalSales = staffTrx.reduce((sum, t) => sum + t.total, 0);
    return {
      handledCount: staffTrx.length,
      totalSales,
    };
  }, [transactions, currentUser?.name]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setSaveError('');
    setSavedNotice(false);
    setIsSaving(true);
    try {
      const res = await updateProfile({ name, branch });
      if (!res.ok) {
        setSaveError(res.error || 'Gagal menyimpan profil.');
        return;
      }
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmLogout = async () => {
    setLogoutModalOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 flex-1 w-full">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#3A6B5C] mb-1">
            <span className="w-1.5 h-1.5 bg-[#3A6B5C]" />
            <span>Pengaturan Akun Staff</span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-semibold text-[#18221E] tracking-tight">
            Profil Saya
          </h1>
          <p className="text-xs sm:text-sm text-[#52605A] mt-0.5">
            Kelola identitas staff kasir, ringkasan transaksi, dan sesi akun aktif.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setLogoutModalOpen(true)}
          className="h-10 px-4 border border-[#BA1A1A]/40 bg-[#FFF5F5] hover:bg-[#BA1A1A] text-[#BA1A1A] hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0 w-full sm:w-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar dari Akun</span>
        </button>
      </div>

      {/* Balanced 12-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column (5 cols): Staff Overview + Performance Cards */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <section className="bg-white border border-[#E2E8E5] p-5 shadow-[0_4px_20px_-2px_rgba(24,34,30,0.03)] flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#18221E] text-white flex items-center justify-center font-headline text-xl font-bold shrink-0">
              {currentUser?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-headline text-lg font-semibold text-[#18221E] truncate">
                {currentUser?.name}
              </h2>
              <p className="text-xs text-[#52605A] truncate">{currentUser?.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="px-2 py-0.5 bg-[#E6EFEA] text-[#2C5246] text-[10.5px] font-semibold uppercase">
                  {currentUser?.role}
                </span>
                <span className="text-[11px] text-[#52605A] truncate">
                  {currentUser?.branch}
                </span>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 flex-1">
            <div className="bg-white border border-[#E2E8E5] p-4 shadow-[0_4px_20px_-2px_rgba(24,34,30,0.03)] flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#52605A]">
                <span>Faktur Ditangani</span>
                <ReceiptText className="w-4 h-4 text-[#3A6B5C]" />
              </div>
              <div className="mt-4">
                <p className="font-headline text-2xl font-bold text-[#18221E]">
                  {staffStats.handledCount} Faktur
                </p>
                <p className="text-[11px] text-[#52605A] mt-1">
                  Transaksi oleh {currentUser?.name}
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#E2E8E5] p-4 shadow-[0_4px_20px_-2px_rgba(24,34,30,0.03)] flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#52605A]">
                <span>Total Penjualan</span>
                <Banknote className="w-4 h-4 text-[#3A6B5C]" />
              </div>
              <div className="mt-4">
                <p className="font-headline text-2xl font-bold text-[#3A6B5C] truncate">
                  {formatIDR(staffStats.totalSales)}
                </p>
                <p className="text-[11px] text-[#52605A] mt-1">
                  Akumulasi nilai penjualan kasir
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (7 cols): Identity Form */}
        <section className="lg:col-span-7 bg-white border border-[#E2E8E5] p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(24,34,30,0.03)] flex flex-col justify-between">
          <div>
            <h3 className="font-headline text-base font-semibold text-[#18221E] pb-3 border-b border-[#E2E8E5] mb-4">
              Detail Identitas Staff
            </h3>

            {savedNotice && (
              <div className="mb-4 p-3 bg-[#E6EFEA] border border-[#3A6B5C]/30 text-[#2C5246] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3A6B5C] shrink-0" />
                <span>Perubahan profil berhasil disimpan.</span>
              </div>
            )}

            {saveError && (
              <div role="alert" className="mb-4 p-3 bg-[#FFF5F5] border border-[#BA1A1A]/30 text-[#93000A] text-xs">
                {saveError}
              </div>
            )}

            <form id="profile-form" onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="profile-name"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1.5"
                  >
                    Nama Tampilan Staff
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#7E8E87] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="profile-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 bg-[#F8FAF9] border border-[#E2E8E5] focus:border-[#3A6B5C] focus:bg-white text-sm text-[#18221E] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="profile-branch"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1.5"
                  >
                    Nama Outlet / Cabang
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-[#7E8E87] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="profile-branch"
                      type="text"
                      required
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 bg-[#F8FAF9] border border-[#E2E8E5] focus:border-[#3A6B5C] focus:bg-white text-sm text-[#18221E] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1.5">
                    Email Akun
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#7E8E87] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      disabled
                      value={currentUser?.email || ''}
                      className="w-full h-10 pl-9 pr-3 bg-[#F1F5F3] border border-[#E2E8E5] text-sm text-[#52605A] cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1.5">
                    Peran / Akses
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-[#7E8E87] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      disabled
                      value={currentUser?.role || ''}
                      className="w-full h-10 pl-9 pr-3 bg-[#F1F5F3] border border-[#E2E8E5] text-sm text-[#52605A] cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E2E8E5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-[11px] text-[#52605A]">
              Perubahan nama akan otomatis dipakai pada faktur transaksi berikutnya.
            </span>
            <button
              type="submit"
              disabled={isSaving}
              form="profile-form"
              className="h-10 px-5 bg-[#3A6B5C] hover:bg-[#2E5649] disabled:bg-[#7E8E87] disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0 w-full sm:w-auto"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </section>
      </div>

      <ConfirmModal
        isOpen={logoutModalOpen}
        variant="danger"
        icon="logout"
        title="Konfirmasi Keluar"
        message={`Akhiri sesi kasir atas nama ${currentUser?.name || 'Staff'}?`}
        description="Data transaksi dan stok yang sudah diproses tetap tersimpan aman. Anda perlu login kembali untuk mengakses halaman kasir dan inventori."
        confirmLabel="Ya, Keluar"
        onCancel={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
};
