import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Banknote,
  QrCode,
  Landmark,
  CreditCard,
  Printer,
  AlertCircle,
  UserCheck,
  Tag,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CartItem, PaymentMethod, PricingMode, ProductCategory, TransactionRecord } from '../../types';
import { formatIDR } from '../../utils/whatsapp';
import { ReceiptModal } from '../../components/pos/ReceiptModal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

interface FlattenedPosItem {
  productId: string;
  variantId: string;
  sku: string;
  name: string;
  variantLabel: string;
  category: Exclude<ProductCategory, 'all'>;
  origin: string;
  imageUrl: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  storageLocation: string;
  badgeText?: string;
}

const CATEGORY_LABELS: { key: ProductCategory; label: string }[] = [
  { key: 'all', label: 'Semua Produk' },
  { key: 'kurma', label: 'Kurma Premium' },
  { key: 'kismis-kacang', label: 'Kacang & Kismis' },
  { key: 'cokelat-gift', label: 'Cokelat & Suvenir' },
  { key: 'zamzam-herbal', label: 'Air Zamzam & Herbal' },
  { key: 'paket', label: 'Paket Oleh-Oleh' },
];

export const PosTerminalPage: React.FC = () => {
  const { products, completeCheckout } = useStore();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoryTrackRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pricingMode, setPricingMode] = useState<PricingMode>('eceran');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashReceivedInput, setCashReceivedInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeReceipt, setActiveReceipt] = useState<TransactionRecord | null>(null);
  const [clearCartModalOpen, setClearCartModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'catalog' | 'cart'>('catalog');

  const scrollCategories = (direction: 'left' | 'right') => {
    if (!categoryTrackRef.current) return;
    const offset = direction === 'left' ? -220 : 220;
    categoryTrackRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  // Flatten products into sellable SKU variants
  const posItems = useMemo<FlattenedPosItem[]>(() => {
    const list: FlattenedPosItem[] = [];
    for (const p of products) {
      for (const v of p.variants) {
        list.push({
          productId: p.id,
          variantId: v.id,
          sku: v.sku,
          name: p.name,
          variantLabel: v.label,
          category: p.category,
          origin: p.origin,
          imageUrl: p.imageUrl,
          price: v.price,
          costPrice: v.costPrice,
          stock: v.stock,
          minStock: v.minStock,
          storageLocation: v.storageLocation,
          badgeText: p.badgeText,
        });
      }
    }
    return list;
  }, [products]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: posItems.length };
    for (const item of posItems) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [posItems]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return posItems.filter((item) => {
      const matchCat = activeCategory === 'all' || item.category === activeCategory;
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.variantLabel.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [posItems, activeCategory, searchQuery]);

  // Financial Calculations
  const totalUnitsInCart = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [cart]
  );

  const discountRate =
    pricingMode === 'jamaah' && totalUnitsInCart > 0
      ? totalUnitsInCart >= 20
        ? 0.2
        : 0.15
      : 0;
  const discount = Math.round(subtotal * discountRate);
  const grandTotal = Math.max(0, subtotal - discount);

  const numericCashReceived = parseInt(cashReceivedInput.replace(/\D/g, '') || '0', 10) || 0;
  const changeAmount =
    paymentMethod === 'cash' ? Math.max(0, numericCashReceived - grandTotal) : 0;
  const isCashShort =
    paymentMethod === 'cash' && cart.length > 0 && numericCashReceived < grandTotal;

  // Keep cart maxStock synchronized with latest products stock
  useEffect(() => {
    setCart((prev) =>
      prev
        .map((c) => {
          const liveItem = posItems.find(
            (i) => i.productId === c.productId && i.variantId === c.variantId
          );
          if (!liveItem) return null;
          return {
            ...c,
            maxStock: liveItem.stock,
            unitPrice: liveItem.price,
            quantity: Math.min(c.quantity, Math.max(0, liveItem.stock)),
          };
        })
        .filter((c): c is CartItem => c !== null && c.quantity > 0)
    );
  }, [posItems]);

  const handleAddToCart = (item: FlattenedPosItem) => {
    setErrorMsg('');
    if (item.stock <= 0) {
      setErrorMsg(`Stok "${item.name} (${item.variantLabel})" sedang habis.`);
      return;
    }

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (c) => c.productId === item.productId && c.variantId === item.variantId
      );
      if (existingIdx >= 0) {
        const current = prev[existingIdx];
        if (current.quantity >= item.stock) {
          setErrorMsg(
            `Maksimal stok tersedia untuk "${item.name} (${item.variantLabel})" hanya ${item.stock} unit.`
          );
          return prev;
        }
        const next = [...prev];
        next[existingIdx] = {
          ...current,
          quantity: current.quantity + 1,
          maxStock: item.stock,
        };
        return next;
      }

      return [
        ...prev,
        {
          productId: item.productId,
          variantId: item.variantId,
          sku: item.sku,
          productName: item.name,
          variantLabel: item.variantLabel,
          category: item.category,
          imageUrl: item.imageUrl,
          unitPrice: item.price,
          costPrice: item.costPrice,
          quantity: 1,
          maxStock: item.stock,
        },
      ];
    });
  };

  const handleUpdateQty = (productId: string, variantId: string, delta: number) => {
    setErrorMsg('');
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId || item.variantId !== variantId) return item;
          const nextQty = item.quantity + delta;
          if (nextQty <= 0) return null;
          if (nextQty > item.maxStock) {
            setErrorMsg(
              `Stok "${item.productName} (${item.variantLabel})" tersisa ${item.maxStock} unit.`
            );
            return item;
          }
          return { ...item, quantity: nextQty };
        })
        .filter((i): i is CartItem => i !== null)
    );
  };

  const handleRemoveItem = (productId: string, variantId: string) => {
    setErrorMsg('');
    setCart((prev) =>
      prev.filter((i) => !(i.productId === productId && i.variantId === variantId))
    );
  };

  const handleClearCart = () => {
    setCart([]);
    setCashReceivedInput('');
    setNotes('');
    setErrorMsg('');
  };

  const handleCheckout = () => {
    setErrorMsg('');
    if (cart.length === 0) {
      setErrorMsg('Tambahkan minimal 1 produk ke keranjang terlebih dahulu.');
      return;
    }

    const res = completeCheckout({
      items: cart,
      customerName: customerName || 'Pelanggan Walk-In',
      pricingMode,
      paymentMethod,
      cashReceived: paymentMethod === 'cash' ? numericCashReceived : grandTotal,
      notes,
    });

    if (!res.ok) {
      setErrorMsg(res.error || 'Checkout gagal diproses.');
      return;
    }

    if (res.transaction) {
      setActiveReceipt(res.transaction);
      setCart([]);
      setCashReceivedInput('');
      setCustomerName('');
      setNotes('');
    }
  };

  // Keyboard shortcuts F2 (focus search) and F9 (checkout)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F9') {
        e.preventDefault();
        handleCheckout();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const quickCashOptions = useMemo(() => {
    if (grandTotal <= 0) return [50000, 100000, 200000, 500000];
    const roundUp50 = Math.ceil(grandTotal / 50000) * 50000;
    const roundUp100 = Math.ceil(grandTotal / 100000) * 100000;
    const candidates = Array.from(
      new Set([
        grandTotal,
        roundUp50 === grandTotal ? grandTotal + 50000 : roundUp50,
        roundUp100 <= roundUp50 ? roundUp50 + 50000 : roundUp100,
        Math.max(500000, roundUp100 + 100000),
      ])
    );
    return candidates.slice(0, 4);
  }, [grandTotal]);

  const paymentOptions: {
    id: PaymentMethod;
    label: string;
    sub: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'cash', label: 'Tunai / Cash', sub: 'Kasir Langsung', icon: Banknote },
    { id: 'qris', label: 'QRIS', sub: 'Scan QR', icon: QrCode },
    { id: 'transfer', label: 'Transfer Bank', sub: 'BSI / BCA', icon: Landmark },
    { id: 'edc', label: 'Debit EDC', sub: 'Kartu Debit', icon: CreditCard },
  ];

  return (
    <div className="flex flex-col flex-1 h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)] max-h-[calc(100dvh-3.5rem)] sm:max-h-[calc(100dvh-4rem)] overflow-hidden bg-[#F8FAF9]">
      {/* Mobile Tab Switcher (Catalog vs Cart) */}
      <div className="lg:hidden shrink-0 z-20 bg-white border-b border-[#E2E8E5] grid grid-cols-2 p-1.5 gap-1.5">
        <button
          type="button"
          onClick={() => setMobileTab('catalog')}
          className={`py-2 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            mobileTab === 'catalog'
              ? 'bg-[#18221E] text-white'
              : 'bg-[#F1F5F3] text-[#52605A]'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Katalog Kasir ({filteredItems.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('cart')}
          className={`py-2 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            mobileTab === 'cart'
              ? 'bg-[#3A6B5C] text-white'
              : 'bg-[#F1F5F3] text-[#52605A]'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Keranjang ({totalUnitsInCart})</span>
        </button>
      </div>

      {/* Split Workspace: Bounded Viewport Height on All Breakpoints for Pinned Search & Controls */}
      <div className="flex flex-col lg:flex-row flex-1 items-stretch min-h-0 overflow-hidden">
        {/* LEFT PANEL: Product Catalog Grid (62%) */}
        <section
          className={`w-full lg:w-[62%] xl:w-[64%] h-full p-3 sm:p-5 flex flex-col gap-2.5 sm:gap-3.5 min-w-0 min-h-0 ${
            mobileTab === 'cart' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Pinned Search & Category Filter Bar */}
          <div className="bg-white border border-[#E2E8E5] p-2.5 sm:p-4 flex flex-col gap-2.5 sm:gap-3 shrink-0 shadow-[0_2px_10px_-4px_rgba(24,34,30,0.06)]">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#7E8E87] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk, varian, atau kode SKU..."
                aria-label="Cari produk kasir"
                className="w-full h-9 sm:h-10 pl-9 pr-9 sm:pr-16 bg-[#F8FAF9] border border-[#E2E8E5] focus:border-[#3A6B5C] focus:bg-white text-sm text-[#18221E] focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Hapus pencarian"
                  className="absolute right-2.5 sm:right-9 top-1/2 -translate-y-1/2 text-[#7E8E87] hover:text-[#18221E] p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <span className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-[#E2E8E5] text-[#52605A] text-[10px] font-mono font-semibold">
                F2
              </span>
            </div>

            {/* Category Filter Pills with visible scroll & navigation arrows */}
            <div className="flex items-center gap-1.5 min-w-0">
              <button
                type="button"
                onClick={() => scrollCategories('left')}
                aria-label="Geser kategori ke kiri"
                className="hidden sm:flex w-7 h-7 items-center justify-center border border-[#E2E8E5] bg-[#F8FAF9] hover:bg-[#E6EFEA] text-[#18221E] shrink-0 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div
                ref={categoryTrackRef}
                className="flex items-center gap-1.5 overflow-x-auto pb-1.5 flex-1 min-w-0 scroll-smooth"
              >
                {CATEGORY_LABELS.map((cat) => {
                  const isActive = activeCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setActiveCategory(cat.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer shrink-0 border ${
                        isActive
                          ? 'bg-[#3A6B5C] text-white border-[#3A6B5C]'
                          : 'bg-[#F1F5F3] text-[#52605A] border-[#E2E8E5] hover:border-[#18221E] hover:text-[#18221E]'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span
                        className={`px-1.5 py-0.2 text-[10px] font-mono ${
                          isActive ? 'bg-white/20 text-white' : 'bg-white text-[#52605A]'
                        }`}
                      >
                        {categoryCounts[cat.key] || 0}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => scrollCategories('right')}
                aria-label="Geser kategori ke kanan"
                className="hidden sm:flex w-7 h-7 items-center justify-center border border-[#E2E8E5] bg-[#F8FAF9] hover:bg-[#E6EFEA] text-[#18221E] shrink-0 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Product SKU Grid Container */}
          <div className="flex-1 overflow-y-auto pr-1 sm:pr-1.5 min-h-0">
            {filteredItems.length === 0 ? (
              <div className="bg-white border border-[#E2E8E5] p-8 sm:p-10 text-center text-sm text-[#52605A]">
                Tidak ada produk atau SKU yang cocok dengan pencarian &ldquo;{searchQuery}&rdquo;.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-3.5 pb-2">
              {filteredItems.map((item) => {
                const isOutOfStock = item.stock <= 0;
                const isLowStock = item.stock > 0 && item.stock <= item.minStock;
                const inCart = cart.find(
                  (c) => c.productId === item.productId && c.variantId === item.variantId
                );

                return (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className={`bg-white border transition-colors flex flex-col justify-between p-3 sm:p-3.5 ${
                      isOutOfStock
                        ? 'border-[#E2E8E5] opacity-70'
                        : inCart
                        ? 'border-[#3A6B5C] shadow-[0_4px_20px_-2px_rgba(58,107,92,0.12)]'
                        : 'border-[#E2E8E5] hover:border-[#3A6B5C]/50 shadow-[0_4px_20px_-2px_rgba(24,34,30,0.03)]'
                    }`}
                  >
                    <div>
                      <div className="relative w-full h-28 sm:h-32 bg-[#F1F5F3] border border-[#E2E8E5] overflow-hidden mb-2.5">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                        {item.badgeText && (
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-[#18221E] text-white text-[9.5px] font-semibold uppercase tracking-wider">
                            {item.badgeText}
                          </span>
                        )}
                        <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-[#3A6B5C] text-white text-[10px] font-medium">
                          {item.variantLabel}
                        </span>
                        {inCart && (
                          <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-[#3A6B5C] text-white text-[10px] font-bold">
                            {inCart.quantity} di keranjang
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#8C6D46]">
                        {item.sku}
                      </p>
                      <h3 className="font-headline text-sm font-semibold text-[#18221E] leading-snug line-clamp-1 mt-0.5">
                        {item.name}
                      </h3>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#E2E8E5] flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span
                          className={`block text-[10px] font-semibold uppercase ${
                            isOutOfStock
                              ? 'text-[#BA1A1A]'
                              : isLowStock
                              ? 'text-[#8C6D46]'
                              : 'text-[#3A6B5C]'
                          }`}
                        >
                          {isOutOfStock
                            ? 'STOK HABIS'
                            : isLowStock
                            ? `STOK: ${item.stock} (MENIPIS)`
                            : `STOK: ${item.stock} UNIT`}
                        </span>
                        <span className="font-headline text-sm font-bold text-[#18221E]">
                          {formatIDR(item.price)}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => handleAddToCart(item)}
                        aria-label={`Tambah ${item.name} ${item.variantLabel} ke keranjang`}
                        className={`shrink-0 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors ${
                          isOutOfStock
                            ? 'bg-[#E2E8E5] text-[#7E8E87] cursor-not-allowed'
                            : 'bg-[#18221E] hover:bg-[#3A6B5C] text-white cursor-pointer'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isOutOfStock ? 'Habis' : 'Tambah'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
              </div>
            )}
          </div>
        </section>

        {/* RIGHT PANEL: Order Cart & Payment Terminal (Independent scroll on Desktop & Mobile Cart Tab) */}
        <aside
          className={`w-full lg:w-[38%] xl:w-[36%] bg-white border-t lg:border-t-0 lg:border-l border-[#E2E8E5] flex flex-col flex-1 lg:flex-none h-full overflow-y-auto min-h-0 ${
            mobileTab === 'catalog' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Cart Header & Mode Switch */}
          <div className="p-3.5 sm:p-4 bg-[#F1F5F3] border-b border-[#E2E8E5] space-y-2.5 shrink-0">
            <div className="flex items-center justify-between">
              <p className="font-headline text-sm font-bold text-[#18221E]">
                Keranjang Kasir • {totalUnitsInCart} Item
              </p>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setClearCartModalOpen(true)}
                  className="text-[11px] font-semibold text-[#BA1A1A] hover:underline cursor-pointer"
                >
                  Kosongkan
                </button>
              )}
            </div>

            {/* Pricing Mode Toggle (Eceran vs Jamaah) */}
            <div className="grid grid-cols-2 bg-[#E2E8E5] p-1 gap-1">
              <button
                type="button"
                onClick={() => setPricingMode('eceran')}
                className={`py-1.5 text-[10.5px] font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  pricingMode === 'eceran'
                    ? 'bg-[#18221E] text-white'
                    : 'text-[#52605A] hover:text-[#18221E]'
                }`}
              >
                Eceran / Walk-In
              </button>
              <button
                type="button"
                onClick={() => setPricingMode('jamaah')}
                className={`py-1.5 text-[10.5px] font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  pricingMode === 'jamaah'
                    ? 'bg-[#3A6B5C] text-white'
                    : 'text-[#52605A] hover:text-[#18221E]'
                }`}
              >
                Harga Jamaah (-{totalUnitsInCart >= 20 ? '20%' : '15%'})
              </button>
            </div>

            {/* Customer Input */}
            <div className="flex items-center gap-2 bg-white border border-[#E2E8E5] px-3 py-1.5">
              <UserCheck className="w-4 h-4 text-[#3A6B5C] shrink-0" />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nama Pelanggan / Rombongan KBIH..."
                aria-label="Nama pelanggan atau rombongan"
                className="w-full text-xs text-[#18221E] placeholder:text-[#7E8E87] focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Error Feedback Banner */}
          {errorMsg && (
            <div
              role="alert"
              className="mx-3.5 mt-3 p-2.5 bg-[#FFF5F5] border border-[#BA1A1A]/30 text-[#93000A] text-xs flex items-start gap-2 shrink-0"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Cart Items List */}
          <div className="p-3.5 sm:p-4 space-y-2.5 flex-1">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-6 text-[#52605A]">
                <ShoppingCart className="w-7 h-7 text-[#C3C8C4] mb-1.5" />
                <p className="text-xs font-semibold text-[#18221E]">Keranjang Masih Kosong</p>
                <p className="text-[11px] mt-0.5 max-w-[220px]">
                  Klik tombol &ldquo;Tambah&rdquo; pada produk untuk memulai transaksi.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="bg-[#F8FAF9] border border-[#E2E8E5] p-2.5 flex flex-col gap-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#18221E] leading-tight truncate">
                        {item.productName}
                      </p>
                      <p className="text-[10.5px] text-[#52605A] mt-0.5">
                        {item.variantLabel} • {formatIDR(item.unitPrice)} (Sisa: {item.maxStock})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.productId, item.variantId)}
                      aria-label={`Hapus ${item.productName} dari keranjang`}
                      className="text-[#7E8E87] hover:text-[#BA1A1A] p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center border border-[#E2E8E5] bg-white">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateQty(item.productId, item.variantId, -1)
                        }
                        aria-label="Kurangi jumlah"
                        className="w-7 h-7 flex items-center justify-center text-[#18221E] hover:bg-[#F1F5F3] cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-mono font-semibold text-[#18221E]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateQty(item.productId, item.variantId, 1)
                        }
                        aria-label="Tambah jumlah"
                        className="w-7 h-7 flex items-center justify-center text-[#18221E] hover:bg-[#F1F5F3] cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-headline text-sm font-bold text-[#18221E]">
                      {formatIDR(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Calculator Footer */}
          <div className="p-3.5 sm:p-4 bg-[#F8FAF9] border-t border-[#E2E8E5] space-y-2.5 shrink-0">
            {/* Subtotal & Discount Summary */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[#52605A]">
                <span>Subtotal ({totalUnitsInCart} unit)</span>
                <span className="font-mono font-medium text-[#18221E]">
                  {formatIDR(subtotal)}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-[#3A6B5C] font-medium">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Diskon Jamaah ({Math.round(discountRate * 100)}%)
                  </span>
                  <span className="font-mono">-{formatIDR(discount)}</span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-1.5 border-t border-[#E2E8E5]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#52605A]">
                  Total Tagihan
                </span>
                <span className="font-headline text-lg sm:text-xl font-bold text-[#18221E]">
                  {formatIDR(grandTotal)}
                </span>
              </div>
            </div>

            {/* Payment Method Grid */}
            <div>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#52605A] mb-1">
                Metode Pembayaran
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {paymentOptions.map((opt) => {
                  const Icon = opt.icon;
                  const active = paymentMethod === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPaymentMethod(opt.id)}
                      className={`p-2 border text-left flex items-center gap-2 transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#18221E] text-white border-[#18221E]'
                          : 'bg-white text-[#18221E] border-[#E2E8E5] hover:border-[#3A6B5C]'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <div className="min-w-0 leading-tight">
                        <span className="block text-[10.5px] font-bold uppercase truncate">
                          {opt.label}
                        </span>
                        <span
                          className={`block text-[9.5px] truncate ${
                            active ? 'text-[#BEC9C3]' : 'text-[#52605A]'
                          }`}
                        >
                          {opt.sub}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cash Received & Change Calculator */}
            {paymentMethod === 'cash' && (
              <div className="bg-white border border-[#E2E8E5] p-2.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="cash-received"
                    className="text-[10.5px] font-semibold uppercase tracking-wider text-[#52605A]"
                  >
                    Uang Diterima
                  </label>
                  <input
                    id="cash-received"
                    type="number"
                    min={0}
                    value={cashReceivedInput}
                    onChange={(e) => setCashReceivedInput(e.target.value)}
                    placeholder="0"
                    className="w-36 h-8 px-2 text-right font-mono text-sm font-bold text-[#18221E] bg-[#F8FAF9] border border-[#E2E8E5] focus:border-[#3A6B5C] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-4 gap-1">
                  {quickCashOptions.map((val, idx) => (
                    <button
                      key={`${val}-${idx}`}
                      type="button"
                      onClick={() => setCashReceivedInput(String(val))}
                      className="py-1 px-1 bg-[#F1F5F3] hover:bg-[#3A6B5C] hover:text-white border border-[#E2E8E5] text-[10px] font-mono font-semibold text-[#18221E] transition-colors cursor-pointer truncate"
                    >
                      {idx === 0 && grandTotal > 0 ? 'Uang Pas' : `${val / 1000}rb`}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-[#E2E8E5] text-xs">
                  <span className="text-[#52605A] font-medium">Kembalian</span>
                  {isCashShort ? (
                    <span className="font-mono font-semibold text-[#BA1A1A]">
                      Kurang {formatIDR(grandTotal - numericCashReceived)}
                    </span>
                  ) : (
                    <span className="font-mono font-bold text-[#3A6B5C] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {formatIDR(changeAmount)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Notes (compact) */}
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan pesanan (opsional)..."
              className="w-full h-8 px-2.5 bg-white border border-[#E2E8E5] text-xs text-[#18221E] placeholder:text-[#7E8E87] focus:outline-none focus:border-[#3A6B5C]"
            />

            {/* Primary Checkout Button */}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full h-11 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
                cart.length === 0
                  ? 'bg-[#E2E8E5] text-[#7E8E87] cursor-not-allowed'
                  : 'bg-[#3A6B5C] hover:bg-[#2E5649] text-white cursor-pointer'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>Selesaikan Transaksi &amp; Struk (F9)</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Digital Receipt Modal */}
      <ReceiptModal
        transaction={activeReceipt}
        onClose={() => setActiveReceipt(null)}
      />

      {/* Confirm Clear Cart Modal */}
      <ConfirmModal
        isOpen={clearCartModalOpen}
        variant="warning"
        icon="delete"
        title="Kosongkan Keranjang Kasir"
        message={`Hapus seluruh ${totalUnitsInCart} item dari keranjang kasir?`}
        description="Daftar belanja yang sedang disusun akan dibersihkan, sementara stok produk tidak berubah."
        confirmLabel="Ya, Kosongkan"
        onCancel={() => setClearCartModalOpen(false)}
        onConfirm={() => {
          handleClearCart();
          setClearCartModalOpen(false);
        }}
      />
    </div>
  );
};
