import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Warehouse,
  ReceiptText,
  LogOut,
  Menu,
  X,
  ExternalLink,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ConfirmModal } from '../ui/ConfirmModal';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { currentUser, logout, products } = useStore();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const lowStockCount = products.reduce((count, product) => {
    return (
      count +
      product.variants.filter((v) => v.stock <= v.minStock).length
    );
  }, 0);

  // Close profile dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleConfirmLogout = () => {
    setLogoutConfirmOpen(false);
    setProfileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      to: '/admin/pos',
      label: 'Kasir (POS)',
      icon: ShoppingBag,
    },
    {
      to: '/admin/inventory',
      label: 'Stok & Inventori',
      icon: Warehouse,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
    },
    {
      to: '/admin/transactions',
      label: 'Riwayat Transaksi',
      icon: ReceiptText,
    },
  ];

  const todayLabel = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const renderSidebarContent = (collapsed: boolean) => (
    <div className="flex flex-col h-full justify-between select-none">
      <div>
        {/* Brand Header */}
        <div
          className={`h-16 flex items-center border-b border-white/10 bg-[#0F1714] ${
            collapsed ? 'justify-center px-2' : 'px-5 gap-3'
          }`}
        >
          <div className="w-9 h-9 bg-[#3A6B5C] flex items-center justify-center text-white font-headline font-bold text-lg shrink-0">
            A
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-headline text-base font-semibold tracking-tight text-white leading-none truncate">
                ALFARATHA
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#9ED1BF] mt-1">
                Kasir &amp; Inventori
              </span>
            </div>
          )}
        </div>

        {/* Section Label */}
        {!collapsed ? (
          <div className="px-5 pt-6 pb-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7E8E87]">
              Menu Utama
            </p>
          </div>
        ) : (
          <div className="pt-4" />
        )}

        {/* Navigation Links */}
        <nav
          className={`flex flex-col gap-1 ${collapsed ? 'px-2' : 'px-3'}`}
          aria-label="Navigasi Admin"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `group relative flex items-center transition-colors ${
                    collapsed
                      ? 'justify-center px-2 py-2.5'
                      : 'justify-between gap-2.5 px-3.5 py-2.5'
                  } text-sm ${
                    isActive
                      ? 'bg-[#3A6B5C] text-white font-semibold'
                      : 'text-[#BEC9C3] hover:bg-white/10 hover:text-white font-medium'
                  }`
                }
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </span>

                {!collapsed && item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#F5EFE6] text-[#8C6D46]">
                    {item.badge}
                  </span>
                )}

                {collapsed && item.badge !== undefined && (
                  <span className="absolute top-1.5 right-2.5 w-2 h-2 rounded-full bg-[#E6C093]" />
                )}

                {/* Hover Tooltip when Sidebar is Collapsed */}
                {collapsed && (
                  <span
                    role="tooltip"
                    className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#18221E] text-white border border-white/15 text-xs font-medium whitespace-nowrap shadow-md z-50"
                  >
                    {item.label}
                    {item.badge !== undefined ? ` (${item.badge} Menipis)` : ''}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Link back to Public Storefront */}
        <div className={`${collapsed ? 'px-2' : 'px-3'} mt-6 pt-4 border-t border-white/10`}>
          <Link
            to="/"
            className={`group relative flex items-center text-xs text-[#9ED1BF] hover:bg-white/5 hover:text-white transition-colors ${
              collapsed ? 'justify-center px-2 py-2.5' : 'justify-between gap-2 px-3.5 py-2'
            }`}
          >
            {collapsed ? (
              <ExternalLink className="w-4 h-4 shrink-0" />
            ) : (
              <>
                <span>Lihat Etalase Toko</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </>
            )}

            {collapsed && (
              <span
                role="tooltip"
                className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#18221E] text-white border border-white/15 text-xs font-medium whitespace-nowrap shadow-md z-50"
              >
                Lihat Etalase Toko
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#18221E] flex flex-col lg:flex-row">
      {/* Desktop Fixed Sidebar (Collapsible) */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 bg-[#18221E] text-white z-40 border-r border-[#E2E8E5]/10 transition-all duration-200 print:hidden ${
          sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-64'
        }`}
      >
        {renderSidebarContent(sidebarCollapsed)}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex print:hidden">
          <div
            className="fixed inset-0 bg-[#18221E]/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-[#18221E] text-white h-full z-10 flex flex-col">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Tutup navigasi admin"
              className="absolute top-4 right-3 w-8 h-8 flex items-center justify-center text-[#BEC9C3] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            {renderSidebarContent(false)}
          </aside>
        </div>
      )}

      {/* Main Content Shell */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64'
        }`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-14 sm:h-16 bg-white/95 backdrop-blur-md border-b border-[#E2E8E5] px-4 sm:px-6 flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Mobile Drawer Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Buka menu admin"
              className="lg:hidden w-9 h-9 border border-[#E2E8E5] bg-[#F8FAF9] flex items-center justify-center text-[#18221E] shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Sidebar Collapse Toggle */}
            <button
              type="button"
              onClick={() => setSidebarCollapsed((c) => !c)}
              aria-label={sidebarCollapsed ? 'Buka sidebar navigasi' : 'Tutup sidebar navigasi'}
              title={sidebarCollapsed ? 'Buka sidebar' : 'Tutup sidebar'}
              className="hidden lg:flex w-8 h-8 border border-[#E2E8E5] bg-[#F8FAF9] hover:bg-[#E6EFEA] items-center justify-center text-[#18221E] shrink-0 transition-colors cursor-pointer"
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>

            <span className="text-xs font-semibold text-[#18221E] truncate">
              Alfaratha Store
            </span>

            <span className="hidden sm:inline text-[#C3C8C4]">•</span>

            <span className="hidden sm:inline text-xs text-[#52605A] truncate">
              {todayLabel}
            </span>
          </div>

          {/* Right Profile Trigger & Dropdown */}
          <div className="relative shrink-0" ref={profileDropdownRef}>
            <button
              type="button"
              onClick={() => setProfileMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={profileMenuOpen}
              aria-label="Menu profil staff"
              className="flex items-center gap-2.5 px-2 py-1 border border-transparent hover:border-[#E2E8E5] hover:bg-[#F8FAF9] transition-colors cursor-pointer"
            >
              <div className="hidden sm:block text-right leading-tight">
                <p className="text-xs font-semibold text-[#18221E]">
                  {currentUser?.name || 'Staff Alfaratha'}
                </p>
                <p className="text-[10.5px] text-[#52605A]">
                  {currentUser?.role || 'Kasir'}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#18221E] text-white flex items-center justify-center text-xs font-bold shrink-0">
                {currentUser?.name?.charAt(0) || 'A'}
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#52605A] transition-transform duration-150 ${
                  profileMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {profileMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-1.5 w-56 bg-white border border-[#E2E8E5] shadow-[0_8px_24px_-4px_rgba(24,34,30,0.12)] py-1.5 z-50"
              >
                <div className="px-3.5 py-2 border-b border-[#E2E8E5]">
                  <p className="text-xs font-semibold text-[#18221E] truncate">
                    {currentUser?.name}
                  </p>
                  <p className="text-[11px] text-[#52605A] truncate">
                    {currentUser?.email}
                  </p>
                </div>

                <Link
                  to="/admin/profile"
                  role="menuitem"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#18221E] hover:bg-[#F1F5F3] transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-[#3A6B5C]" />
                  <span>Profil Saya</span>
                </Link>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    setLogoutConfirmOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-[#BA1A1A] hover:bg-[#FFF5F5] transition-colors cursor-pointer text-left border-t border-[#E2E8E5] mt-1 pt-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0">{children}</main>
      </div>

      {/* Global Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={logoutConfirmOpen}
        variant="danger"
        icon="logout"
        title="Konfirmasi Keluar"
        message={`Akhiri sesi kasir atas nama ${currentUser?.name || 'Staff'}?`}
        description="Data transaksi dan stok yang sudah diproses tetap tersimpan aman. Anda perlu login kembali untuk mengakses halaman kasir dan inventori."
        confirmLabel="Ya, Keluar"
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
};
