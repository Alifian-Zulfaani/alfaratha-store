import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Sparkles, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { useStore, DEMO_CREDENTIALS } from '../context/StoreContext';

export const LoginPage: React.FC = () => {
  const { login, currentUser } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const fromPath =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ||
    '/admin/pos';

  useEffect(() => {
    if (currentUser) {
      navigate(fromPath, { replace: true });
    }
  }, [currentUser, navigate, fromPath]);

  const handleFillDemo = () => {
    setIdentifier(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = login(identifier, password);
    if (!result.ok) {
      setError(result.error || 'Gagal masuk ke sistem.');
      return;
    }

    navigate(fromPath, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#18221E] flex flex-col justify-between p-4 sm:p-6">
      {/* Top Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#52605A] hover:text-[#18221E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Etalase Toko</span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#E6EFEA] text-[#2C5246] text-[11px] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Internal POS &amp; Gudang</span>
        </div>
      </div>

      {/* Centered Login Card */}
      <main className="w-full max-w-md mx-auto my-8">
        <div className="bg-white border border-[#E2E8E5] shadow-[0_4px_20px_-2px_rgba(24,34,30,0.05)] p-6 sm:p-8">
          {/* Brand Header */}
          <div className="flex flex-col items-start mb-6 pb-5 border-b border-[#E2E8E5]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#18221E] text-white flex items-center justify-center font-headline text-lg font-bold">
                A
              </div>
              <div>
                <h1 className="font-headline text-xl text-[#18221E] font-semibold leading-tight">
                  Portal Staff Alfaratha
                </h1>
                <p className="text-xs text-[#52605A]">
                  Masuk ke sistem kasir &amp; manajemen stok toko
                </p>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              role="alert"
              className="mb-5 p-3 bg-[#FFF5F5] border border-[#BA1A1A]/30 text-[#93000A] text-xs flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Demo Account Quick Fill */}
          <div className="mb-5 p-3.5 bg-[#F1F5F3] border border-[#E2E8E5] flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#3A6B5C]">
                Akun Kasir Demo
              </p>
              <p className="text-xs text-[#52605A] truncate mt-0.5">
                {DEMO_CREDENTIALS.email}
              </p>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#E6EFEA] border border-[#3A6B5C]/40 text-[#2C5246] text-xs font-semibold transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Isi Akun Demo</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-identifier"
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1.5"
              >
                Email atau Username Staff
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#7E8E87] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="login-identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="kasir@alfaratha.store"
                  className="w-full h-11 pl-10 pr-3 bg-[#F8FAF9] border border-[#E2E8E5] focus:border-[#3A6B5C] focus:bg-white text-sm text-[#18221E] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#52605A] mb-1.5"
              >
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7E8E87] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-3 bg-[#F8FAF9] border border-[#E2E8E5] focus:border-[#3A6B5C] focus:bg-white text-sm text-[#18221E] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-[#3A6B5C] hover:bg-[#2E5649] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer mt-2"
            >
              <span>Masuk ke Terminal Kasir</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#E2E8E5] text-[11px] text-[#52605A] flex items-center justify-between">
            <span>Alfaratha Store</span>
            <span className="font-mono text-[#18221E]">Sistem Kasir &amp; Stok</span>
          </div>
        </div>
      </main>

      {/* Bottom Legal */}
      <footer className="text-center text-xs text-[#52605A] pb-2">
        © {new Date().getFullYear()} Alfaratha Store • Pusat Kurma &amp; Oleh-Oleh Haji Umroh
      </footer>
    </div>
  );
};
