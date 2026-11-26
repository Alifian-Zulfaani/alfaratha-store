import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  NormalizedProduct,
  NormalizedProductVariant,
  Product,
  ProductCategory,
  StorageLocation,
  TransactionRecord,
  StockLog,
  StockAdjustmentType,
  StaffUser,
  CartItem,
  PricingMode,
  PaymentMethod,
  NewProductInput,
} from '../types';
import { PRODUCTS_DATA } from '../data/products';

const STORAGE_KEYS = {
  PRODUCTS: 'alfaratha_products_v1',
  TRANSACTIONS: 'alfaratha_transactions_v1',
  STOCK_LOGS: 'alfaratha_stock_logs_v1',
  AUTH: 'alfaratha_auth_v1',
} as const;

export const DEMO_CREDENTIALS = {
  email: 'kasir@alfaratha.store',
  password: 'alfaratha2025',
} as const;

const STAFF_DIRECTORY: Record<string, { password: string; user: StaffUser }> = {
  'kasir@alfaratha.store': {
    password: DEMO_CREDENTIALS.password,
    user: {
      id: 'staff-01',
      username: 'kasir',
      email: 'kasir@alfaratha.store',
      name: 'Siti Nurhaliza',
      role: 'Kasir',
      branch: 'Alfaratha Store',
    },
  },
  'admin@alfaratha.store': {
    password: DEMO_CREDENTIALS.password,
    user: {
      id: 'staff-02',
      username: 'admin',
      email: 'admin@alfaratha.store',
      name: 'Ahmad Fauzi',
      role: 'Supervisor',
      branch: 'Alfaratha Store',
    },
  },
};

function normalizeStorageLocation(raw?: string): StorageLocation | undefined {
  if (!raw) return undefined;
  if (raw === 'Cold-Storage 4°C' || raw === 'Ruang Pendingin') return 'Ruang Pendingin';
  if (raw === 'Gudang Rak Kering' || raw === 'Gudang Kering') return 'Gudang Kering';
  if (raw === 'Gudang Palet A' || raw === 'Gudang Palet') return 'Gudang Palet';
  if (raw === 'Rak Display Depan' || raw === 'Etalase Toko') return 'Etalase Toko';
  return 'Gudang Kering';
}

function inferStorageLocation(
  category: Exclude<ProductCategory, 'all'>,
  variantId: string
): StorageLocation {
  if (variantId.includes('zamzam-galon')) return 'Gudang Palet';
  if (variantId.includes('botol') || variantId.includes('himsalt') || variantId.includes('sekat')) {
    return 'Etalase Toko';
  }
  if (category === 'kurma' || variantId.includes('truffle') || variantId.includes('kerikil')) {
    return 'Ruang Pendingin';
  }
  if (category === 'kismis-kacang') return 'Gudang Kering';
  return 'Etalase Toko';
}

function generateSku(productId: string, variantId: string, index: number): string {
  const prefixMap: Record<string, string> = {
    kurma: 'KRM',
    'kismis-kacang': 'KCG',
    'cokelat-gift': 'CKL',
    'zamzam-herbal': 'ZAM',
    paket: 'PKT',
  };
  const code = variantId
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 6);
  const pPrefix = prefixMap[productId.split('-')[0]] || productId.slice(0, 3).toUpperCase();
  return `${pPrefix}-${code}-${String(index + 1).padStart(2, '0')}`;
}

// Initial curated stock presets so inventory KPIs look realistic out-of-the-box
const INITIAL_STOCK_PRESETS: Record<string, { stock: number; minStock: number; sku?: string }> = {
  'ajwa-500g': { stock: 42, minStock: 10, sku: 'KRM-AJW-500' },
  'ajwa-1kg': { stock: 24, minStock: 8, sku: 'KRM-AJW-1000' },
  'ajwa-1kg-vip': { stock: 12, minStock: 5, sku: 'KRM-AJW-VIP' },
  'sukari-1kg': { stock: 18, minStock: 10, sku: 'KRM-SKR-1000' },
  'sukari-3kg-hc': { stock: 14, minStock: 5, sku: 'KRM-SKR-3K' },
  'sukari-3kg-super': { stock: 9, minStock: 5, sku: 'KRM-SKR-3KS' },
  'khalas-1kg': { stock: 65, minStock: 15, sku: 'KRM-KHL-1000' },
  'khalas-10kg': { stock: 10, minStock: 4, sku: 'KRM-KHL-10K' },
  'tunis-500g': { stock: 30, minStock: 10, sku: 'KRM-TNS-500' },
  'tunis-1kg': { stock: 22, minStock: 8, sku: 'KRM-TNS-1000' },
  'mesir-1kg': { stock: 48, minStock: 12, sku: 'KRM-MSR-1000' },
  'bam-550g': { stock: 5, minStock: 8, sku: 'KRM-BAM-550' }, // Stok menipis sample
  'medjool-500g': { stock: 24, minStock: 8, sku: 'KRM-MDJ-500' },
  'pistachio-500g': { stock: 38, minStock: 10, sku: 'KCG-PST-500' },
  'kismis-1kg': { stock: 29, minStock: 10, sku: 'KCG-KSM-1000' },
  'truffle-1kg-pouch': { stock: 32, minStock: 10, sku: 'CKL-TRF-1000' },
  'sekat-1pcs': { stock: 4, minStock: 10, sku: 'CKL-SKT-01' }, // Stok menipis sample
  'hampers-1pcs': { stock: 150, minStock: 30, sku: 'CKL-HMP-01' },
  'hampers-100pcs': { stock: 8, minStock: 3, sku: 'CKL-HMP-100' },
  'zamzam-galon-5l': { stock: 4, minStock: 8, sku: 'ZAM-GLN-005' }, // Stok menipis sample
  'zamzam-botol-1pcs': { stock: 350, minStock: 50, sku: 'ZAM-BTL-050' },
  'zamzam-botol-100pcs': { stock: 12, minStock: 4, sku: 'ZAM-BTL-100' },
  'himsalt-500g': { stock: 44, minStock: 10, sku: 'HRB-HMS-500' },
};

const PACKAGE_PRODUCTS: Product[] = [
  {
    id: 'paket-barokah-box',
    name: 'Paket Barokah Siap Bagi',
    category: 'paket',
    origin: 'Alfaratha Store',
    description: 'Dus jinjing hemat isi Kurma Khalas, Kismis, Kacang Arab, dan Air Zamzam 80ml.',
    badge: 'favorit',
    badgeText: 'Paket Hemat',
    imageUrl: '/images/paket-barokah.webp',
    defaultVariantIndex: 0,
    features: ['Box jinjing anti penyok', 'Isi 4 item lengkap', 'Siap distribusi jamaah'],
    variants: [
      { id: 'pkt-barokah-ecer', sku: 'PKT-BRK-01', label: 'Satuan / Dus', price: 32000, costPrice: 21000, inStock: true, stock: 85, minStock: 20, storageLocation: 'Etalase Toko', expiredDate: '2027-08-30' },
      { id: 'pkt-barokah-jamaah', sku: 'PKT-BRK-20', label: 'Grosir (Min. 20)', price: 25000, costPrice: 20000, inStock: true, stock: 60, minStock: 15, storageLocation: 'Gudang Palet', expiredDate: '2027-08-30' },
    ],
    rating: 4.9,
    reviewsCount: 214,
  },
  {
    id: 'paket-madinah-box',
    name: 'Paket Madinah Box Eksklusif',
    category: 'paket',
    origin: 'Alfaratha Store',
    description: 'Hardbox tenteng foil emas isi Kurma Sukkari/Ajwa, Kismis, Pistachio, Cokelat & Zamzam 80ml.',
    badge: 'best-seller',
    badgeText: 'Favorit Jamaah',
    imageUrl: '/images/gift-hampers.webp',
    defaultVariantIndex: 0,
    features: ['Gratis Custom Kartu Nama', 'Isi 5 item favorit', 'Garansi kemasan aman'],
    variants: [
      { id: 'pkt-madinah-ecer', sku: 'PKT-MDN-01', label: 'Satuan / Dus', price: 58000, costPrice: 38000, inStock: true, stock: 120, minStock: 25, storageLocation: 'Etalase Toko', expiredDate: '2027-08-30' },
      { id: 'pkt-madinah-jamaah', sku: 'PKT-MDN-20', label: 'Grosir (Min. 20)', price: 46000, costPrice: 36000, inStock: true, stock: 95, minStock: 20, storageLocation: 'Gudang Palet', expiredDate: '2027-08-30' },
    ],
    rating: 4.96,
    reviewsCount: 389,
  },
];

function normalizeProducts(rawProducts: Product[]): NormalizedProduct[] {
  return rawProducts.map((product) => ({
    ...product,
    origin: product.origin === 'Alfaratha Curated' ? 'Alfaratha Store' : product.origin,
    variants: product.variants.map((v, idx): NormalizedProductVariant => {
      const preset = INITIAL_STOCK_PRESETS[v.id];
      const stock = v.stock ?? preset?.stock ?? 25;
      const minStock = v.minStock ?? preset?.minStock ?? 5;
      return {
        ...v,
        sku: v.sku ?? preset?.sku ?? generateSku(product.id, v.id, idx),
        costPrice: v.costPrice ?? Math.round(v.price * 0.72),
        stock,
        minStock,
        inStock: stock > 0,
        storageLocation:
          normalizeStorageLocation(v.storageLocation) ??
          inferStorageLocation(product.category, v.id),
        expiredDate: v.expiredDate ?? '2027-08-31',
      };
    }),
  }));
}

function getInitialProducts(): NormalizedProduct[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) {
      const parsed = JSON.parse(saved) as Product[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return normalizeProducts(parsed);
      }
    }
  } catch {
    // Fallback to initial dataset
  }
  return normalizeProducts([...PRODUCTS_DATA, ...PACKAGE_PRODUCTS]);
}

const SEED_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'trx-seed-01',
    invoiceNumber: 'TRX-2026-0841',
    timestamp: new Date(Date.now() - 1000 * 60 * 145).toISOString(),
    cashierName: 'Siti Nurhaliza',
    customerName: 'Bpk. H. Syarifudin (Kloter 12)',
    pricingMode: 'jamaah',
    items: [
      {
        productId: 'paket-madinah-box',
        variantId: 'pkt-madinah-jamaah',
        sku: 'PKT-MDN-20',
        productName: 'Paket Madinah Box Eksklusif',
        variantLabel: 'Grosir (Min. 20)',
        unitPrice: 46000,
        quantity: 20,
        lineTotal: 920000,
      },
      {
        productId: 'kurma-ajwa-madinah',
        variantId: 'ajwa-500g',
        sku: 'KRM-AJW-500',
        productName: 'Kurma Ajwa Aliyah Madinah',
        variantLabel: 'Kemasan 500 gr',
        unitPrice: 85000,
        quantity: 2,
        lineTotal: 170000,
      },
    ],
    subtotal: 1090000,
    discount: 163500,
    total: 926500,
    paymentMethod: 'transfer',
    cashReceived: 926500,
    changeAmount: 0,
    notes: 'Kirim ke Asrama Haji Sukolilo besok pagi',
  },
  {
    id: 'trx-seed-02',
    invoiceNumber: 'TRX-2026-0842',
    timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    cashierName: 'Siti Nurhaliza',
    customerName: 'Ibu Hj. Aminah (Walk-in)',
    pricingMode: 'eceran',
    items: [
      {
        productId: 'kurma-sukari-qassim',
        variantId: 'sukari-1kg',
        sku: 'KRM-SKR-1000',
        productName: 'Kurma Sukari Rutob Al-Qassim',
        variantLabel: 'Kemasan 1 Kg',
        unitPrice: 65000,
        quantity: 3,
        lineTotal: 195000,
      },
      {
        productId: 'kismis-golden',
        variantId: 'kismis-1kg',
        sku: 'KCG-KSM-1000',
        productName: 'Kismis Manis Golden Jumbo',
        variantLabel: 'Kemasan 1 Kg',
        unitPrice: 90000,
        quantity: 1,
        lineTotal: 90000,
      },
    ],
    subtotal: 285000,
    discount: 0,
    total: 285000,
    paymentMethod: 'cash',
    cashReceived: 300000,
    changeAmount: 15000,
  },
];

const SEED_STOCK_LOGS: StockLog[] = [
  {
    id: 'log-seed-01',
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    productId: 'kurma-ajwa-madinah',
    variantId: 'ajwa-500g',
    sku: 'KRM-AJW-500',
    productName: 'Kurma Ajwa Aliyah Madinah',
    variantLabel: 'Kemasan 500 gr',
    type: 'restock',
    delta: 20,
    stockBefore: 22,
    stockAfter: 42,
    reason: 'Restock Container Madinah Batch #M26-04',
    staffName: 'Ahmad Fauzi',
  },
  {
    id: 'log-seed-02',
    timestamp: new Date(Date.now() - 1000 * 60 * 145).toISOString(),
    productId: 'kurma-ajwa-madinah',
    variantId: 'ajwa-500g',
    sku: 'KRM-AJW-500',
    productName: 'Kurma Ajwa Aliyah Madinah',
    variantLabel: 'Kemasan 500 gr',
    type: 'penjualan',
    delta: -2,
    stockBefore: 44,
    stockAfter: 42,
    reason: 'Transaksi Kasir #TRX-2026-0841',
    staffName: 'Siti Nurhaliza',
  },
];

export interface CheckoutPayload {
  items: CartItem[];
  customerName: string;
  customerPhone?: string;
  pricingMode: PricingMode;
  paymentMethod: PaymentMethod;
  cashReceived: number;
  notes?: string;
}

export interface CheckoutResult {
  ok: boolean;
  error?: string;
  transaction?: TransactionRecord;
}

interface StoreContextValue {
  products: NormalizedProduct[];
  transactions: TransactionRecord[];
  stockLogs: StockLog[];
  currentUser: StaffUser | null;
  login: (identifier: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  updateProfile: (updates: { name: string; branch: string }) => void;
  completeCheckout: (payload: CheckoutPayload) => CheckoutResult;
  adjustStock: (
    productId: string,
    variantId: string,
    delta: number,
    type: Exclude<StockAdjustmentType, 'penjualan'>,
    reason: string
  ) => { ok: boolean; error?: string };
  addProduct: (input: NewProductInput) => void;
  updateProductVariant: (
    productId: string,
    variantId: string,
    updates: {
      name: string;
      category: Exclude<ProductCategory, 'all'>;
      origin: string;
      description: string;
      imageUrl: string;
      variantLabel: string;
      sku: string;
      price: number;
      costPrice: number;
      minStock: number;
      storageLocation: StorageLocation;
      expiredDate: string;
    }
  ) => void;
  deleteProduct: (productId: string) => void;
  resetDemoData: () => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<NormalizedProduct[]>(getInitialProducts);

  const [transactions, setTransactions] = useState<TransactionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) {
        const parsed = JSON.parse(saved) as TransactionRecord[];
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return SEED_TRANSACTIONS;
  });

  const [stockLogs, setStockLogs] = useState<StockLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STOCK_LOGS);
      if (saved) {
        const parsed = JSON.parse(saved) as StockLog[];
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return SEED_STOCK_LOGS;
  });

  const [currentUser, setCurrentUser] = useState<StaffUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
      if (saved) {
        const parsed = JSON.parse(saved) as StaffUser;
        if (parsed.branch && parsed.branch.toLowerCase().includes('cold-storage')) {
          return { ...parsed, branch: 'Alfaratha Store' };
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch {
      // ignore quota errors
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch {
      // ignore
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STOCK_LOGS, JSON.stringify(stockLogs));
    } catch {
      // ignore
    }
  }, [stockLogs]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH);
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  // Listen for cross-tab localStorage updates
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.PRODUCTS && e.newValue) {
        setProducts(normalizeProducts(JSON.parse(e.newValue) as Product[]));
      }
      if (e.key === STORAGE_KEYS.TRANSACTIONS && e.newValue) {
        setTransactions(JSON.parse(e.newValue) as TransactionRecord[]);
      }
      if (e.key === STORAGE_KEYS.STOCK_LOGS && e.newValue) {
        setStockLogs(JSON.parse(e.newValue) as StockLog[]);
      }
      if (e.key === STORAGE_KEYS.AUTH) {
        setCurrentUser(e.newValue ? (JSON.parse(e.newValue) as StaffUser) : null);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = useCallback((identifier: string, password: string) => {
    const normalizedId = identifier.trim().toLowerCase();
    const matchByEmail = STAFF_DIRECTORY[normalizedId];
    const matchByUsername = Object.values(STAFF_DIRECTORY).find(
      (entry) => entry.user.username.toLowerCase() === normalizedId
    );
    const entry = matchByEmail || matchByUsername;

    if (!entry) {
      return {
        ok: false,
        error: 'Akun staff tidak ditemukan. Gunakan tombol "Isi Akun Demo" untuk akses cepat.',
      };
    }

    if (entry.password !== password) {
      return {
        ok: false,
        error: 'Password salah. Periksa kembali atau gunakan akun demo.',
      };
    }

    setCurrentUser(entry.user);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const updateProfile = useCallback((updates: { name: string; branch: string }) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        name: updates.name.trim() || prev.name,
        branch: updates.branch.trim() || prev.branch,
      };
    });
  }, []);

  const completeCheckout = useCallback(
    (payload: CheckoutPayload): CheckoutResult => {
      if (payload.items.length === 0) {
        return { ok: false, error: 'Keranjang belanja masih kosong.' };
      }

      // 1. Validate sufficient stock for every item
      for (const item of payload.items) {
        const prod = products.find((p) => p.id === item.productId);
        const variant = prod?.variants.find((v) => v.id === item.variantId);
        if (!prod || !variant) {
          return { ok: false, error: `Produk "${item.productName}" tidak ditemukan di database.` };
        }
        if (item.quantity <= 0) {
          return { ok: false, error: `Jumlah pembelian "${item.productName}" tidak valid.` };
        }
        if (variant.stock < item.quantity) {
          return {
            ok: false,
            error: `Stok "${item.productName} (${item.variantLabel})" tidak mencukupi. Tersisa ${variant.stock} unit.`,
          };
        }
      }

      // 2. Compute financials
      const subtotal = payload.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
      const totalQty = payload.items.reduce((sum, i) => sum + i.quantity, 0);
      // Mode Jamaah: diskon 15% untuk paket jamaah / pembelian grosir (atau aktif langsung jika mode Jamaah dipilih & qty >= 10 atau paket, agar kasir bisa langsung memberi harga jamaah)
      const qualifiesBulkDiscount = payload.pricingMode === 'jamaah' && totalQty >= 1;
      const discountRate = qualifiesBulkDiscount ? (totalQty >= 20 ? 0.18 : 0.15) : 0;
      const discount = Math.round(subtotal * discountRate);
      const total = Math.max(0, subtotal - discount);

      if (payload.paymentMethod === 'cash' && payload.cashReceived < total) {
        return {
          ok: false,
          error: `Uang tunai diterima kurang dari total tagihan (Kurang Rp ${(total - payload.cashReceived).toLocaleString('id-ID')}).`,
        };
      }

      const cashReceived = payload.paymentMethod === 'cash' ? payload.cashReceived : total;
      const changeAmount =
        payload.paymentMethod === 'cash' ? Math.max(0, cashReceived - total) : 0;

      const nextSequence = 843 + transactions.length;
      const invoiceNumber = `TRX-${new Date().getFullYear()}-${String(nextSequence).padStart(4, '0')}`;
      const nowIso = new Date().toISOString();
      const cashierName = currentUser?.name ?? 'Kasir Alfaratha';

      // 3. Deduct stock & build stock logs
      const newLogs: StockLog[] = [];
      const updatedProducts = products.map((prod) => {
        const hasSoldVariant = payload.items.some((i) => i.productId === prod.id);
        if (!hasSoldVariant) return prod;

        return {
          ...prod,
          variants: prod.variants.map((variant) => {
            const soldItem = payload.items.find(
              (i) => i.productId === prod.id && i.variantId === variant.id
            );
            if (!soldItem) return variant;

            const stockBefore = variant.stock;
            const stockAfter = Math.max(0, stockBefore - soldItem.quantity);

            newLogs.push({
              id: `log-${Date.now()}-${variant.id}`,
              timestamp: nowIso,
              productId: prod.id,
              variantId: variant.id,
              sku: variant.sku,
              productName: prod.name,
              variantLabel: variant.label,
              type: 'penjualan',
              delta: -soldItem.quantity,
              stockBefore,
              stockAfter,
              reason: `Penjualan POS #${invoiceNumber}`,
              staffName: cashierName,
            });

            return {
              ...variant,
              stock: stockAfter,
              inStock: stockAfter > 0,
            };
          }),
        };
      });

      const transaction: TransactionRecord = {
        id: `trx-${Date.now()}`,
        invoiceNumber,
        timestamp: nowIso,
        cashierName,
        customerName: payload.customerName.trim() || 'Pelanggan Walk-In',
        customerPhone: payload.customerPhone?.trim() || undefined,
        pricingMode: payload.pricingMode,
        items: payload.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          sku: item.sku,
          productName: item.productName,
          variantLabel: item.variantLabel,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineTotal: item.unitPrice * item.quantity,
        })),
        subtotal,
        discount,
        total,
        paymentMethod: payload.paymentMethod,
        cashReceived,
        changeAmount,
        notes: payload.notes?.trim() || undefined,
      };

      setProducts(updatedProducts);
      setTransactions((prev) => [transaction, ...prev]);
      setStockLogs((prev) => [...newLogs, ...prev]);

      return { ok: true, transaction };
    },
    [products, transactions.length, currentUser]
  );

  const adjustStock = useCallback(
    (
      productId: string,
      variantId: string,
      delta: number,
      type: Exclude<StockAdjustmentType, 'penjualan'>,
      reason: string
    ) => {
      if (delta === 0) {
        return { ok: false, error: 'Jumlah penyesuaian stok tidak boleh nol.' };
      }

      const targetProd = products.find((p) => p.id === productId);
      const targetVar = targetProd?.variants.find((v) => v.id === variantId);
      if (!targetProd || !targetVar) {
        return { ok: false, error: 'Varian produk tidak ditemukan.' };
      }

      const stockAfter = targetVar.stock + delta;
      if (stockAfter < 0) {
        return {
          ok: false,
          error: `Stok akhir tidak boleh negatif (sisa saat ini ${targetVar.stock}).`,
        };
      }

      const staffName = currentUser?.name ?? 'Admin Gudang';
      const logEntry: StockLog = {
        id: `log-${Date.now()}-${variantId}`,
        timestamp: new Date().toISOString(),
        productId,
        variantId,
        sku: targetVar.sku,
        productName: targetProd.name,
        variantLabel: targetVar.label,
        type,
        delta,
        stockBefore: targetVar.stock,
        stockAfter,
        reason: reason.trim() || `Penyesuaian (${type})`,
        staffName,
      };

      setProducts((prev) =>
        prev.map((prod) => {
          if (prod.id !== productId) return prod;
          return {
            ...prod,
            variants: prod.variants.map((v) =>
              v.id === variantId ? { ...v, stock: stockAfter, inStock: stockAfter > 0 } : v
            ),
          };
        })
      );
      setStockLogs((prev) => [logEntry, ...prev]);

      return { ok: true };
    },
    [products, currentUser]
  );

  const addProduct = useCallback(
    (input: NewProductInput) => {
      const slug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const id = `${slug}-${Date.now().toString().slice(-4)}`;
      const variantId = `${id}-v1`;

      const newProduct: NormalizedProduct = {
        id,
        name: input.name.trim(),
        category: input.category,
        origin: input.origin.trim() || 'Timur Tengah',
        description: input.description.trim() || 'Produk kurasi kualitas tinggi Alfaratha Store.',
        badge: 'premium',
        badgeText: input.badgeText?.trim() || 'Produk Baru',
        imageUrl: input.imageUrl.trim() || '/images/ajwa.webp',
        defaultVariantIndex: 0,
        features: [
          'Kualitas Terjaga & Higienis',
          `Disimpan di ${input.storageLocation}`,
          'Siap Kirim & Tersedia di Toko',
        ],
        variants: [
          {
            id: variantId,
            sku: input.sku.trim().toUpperCase() || generateSku(id, variantId, 0),
            label: input.variantLabel.trim() || 'Kemasan 500 gr',
            price: input.price,
            costPrice: input.costPrice,
            inStock: input.stock > 0,
            stock: input.stock,
            minStock: input.minStock,
            storageLocation: input.storageLocation,
            expiredDate: input.expiredDate || '2027-08-31',
          },
        ],
        rating: 5.0,
        reviewsCount: 1,
      };

      setProducts((prev) => [newProduct, ...prev]);

      const logEntry: StockLog = {
        id: `log-${Date.now()}-new`,
        timestamp: new Date().toISOString(),
        productId: id,
        variantId,
        sku: newProduct.variants[0].sku,
        productName: newProduct.name,
        variantLabel: newProduct.variants[0].label,
        type: 'restock',
        delta: input.stock,
        stockBefore: 0,
        stockAfter: input.stock,
        reason: 'Penambahan SKU Produk Baru',
        staffName: currentUser?.name ?? 'Admin Gudang',
      };
      setStockLogs((prev) => [logEntry, ...prev]);
    },
    [currentUser]
  );

  const updateProductVariant = useCallback(
    (
      productId: string,
      variantId: string,
      updates: {
        name: string;
        category: Exclude<ProductCategory, 'all'>;
        origin: string;
        description: string;
        imageUrl: string;
        variantLabel: string;
        sku: string;
        price: number;
        costPrice: number;
        minStock: number;
        storageLocation: StorageLocation;
        expiredDate: string;
      }
    ) => {
      setProducts((prev) =>
        prev.map((prod) => {
          if (prod.id !== productId) return prod;
          return {
            ...prod,
            name: updates.name.trim(),
            category: updates.category,
            origin: updates.origin.trim(),
            description: updates.description.trim(),
            imageUrl: updates.imageUrl.trim() || prod.imageUrl,
            variants: prod.variants.map((v) =>
              v.id === variantId
                ? {
                    ...v,
                    label: updates.variantLabel.trim(),
                    sku: updates.sku.trim().toUpperCase(),
                    price: updates.price,
                    costPrice: updates.costPrice,
                    minStock: updates.minStock,
                    storageLocation: updates.storageLocation,
                    expiredDate: updates.expiredDate,
                  }
                : v
            ),
          };
        })
      );
    },
    []
  );

  const deleteProduct = useCallback((productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const resetDemoData = useCallback(() => {
    const fresh = normalizeProducts([...PRODUCTS_DATA, ...PACKAGE_PRODUCTS]);
    setProducts(fresh);
    setTransactions(SEED_TRANSACTIONS);
    setStockLogs(SEED_STOCK_LOGS);
  }, []);

  return (
    <StoreContext.Provider
      value={{
        products,
        transactions,
        stockLogs,
        currentUser,
        login,
        logout,
        updateProfile,
        completeCheckout,
        adjustStock,
        addProduct,
        updateProductVariant,
        deleteProduct,
        resetDemoData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return ctx;
}
