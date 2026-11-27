import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
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
  CmsPackageBundle,
  CmsTestimonial,
  CmsFaqItem,
  SiteContentBundle,
  SiteSectionKey,
} from '../types';
import { PRODUCTS_DATA } from '../data/products';
import {
  DEFAULT_FAQS,
  DEFAULT_PACKAGE_BUNDLES,
  DEFAULT_SITE_CONTENT,
  DEFAULT_TESTIMONIALS,
} from '../data/cmsDefaults';
import { supabase } from '../lib/supabase';
import {
  adjustVariantStockInDb,
  createProductInDb,
  deleteProductInDb,
  fetchProductsFromDb,
  fetchStaffProfileById,
  fetchStockLogsFromDb,
  fetchTransactionsFromDb,
  processPosCheckoutInDb,
  resolveStaffEmail,
  updateProductVariantInDb,
  updateStaffProfileInDb,
} from '../services/storeApi';
import {
  deleteFaqInDb,
  deletePackageBundleInDb,
  deleteTestimonialInDb,
  fetchFaqsFromDb,
  fetchPackageBundlesFromDb,
  fetchSiteContentFromDb,
  fetchTestimonialsFromDb,
  saveFaqInDb,
  savePackageBundleInDb,
  saveSiteSectionInDb,
  saveTestimonialInDb,
} from '../services/cmsApi';

export const DEMO_CREDENTIALS = {
  email: 'kasir@alfaratha.store',
  password: 'alfaratha2025',
} as const;

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
  'bam-550g': { stock: 5, minStock: 8, sku: 'KRM-BAM-550' },
  'medjool-500g': { stock: 24, minStock: 8, sku: 'KRM-MDJ-500' },
  'pistachio-500g': { stock: 38, minStock: 10, sku: 'KCG-PST-500' },
  'kismis-1kg': { stock: 29, minStock: 10, sku: 'KCG-KSM-1000' },
  'truffle-1kg-pouch': { stock: 32, minStock: 10, sku: 'CKL-TRF-1000' },
  'sekat-1pcs': { stock: 4, minStock: 10, sku: 'CKL-SKT-01' },
  'hampers-1pcs': { stock: 150, minStock: 30, sku: 'CKL-HMP-01' },
  'hampers-100pcs': { stock: 8, minStock: 3, sku: 'CKL-HMP-100' },
  'zamzam-galon-5l': { stock: 4, minStock: 8, sku: 'ZAM-GLN-005' },
  'zamzam-botol-1pcs': { stock: 350, minStock: 50, sku: 'ZAM-BTL-050' },
  'zamzam-botol-100pcs': { stock: 12, minStock: 4, sku: 'ZAM-BTL-100' },
  'himsalt-500g': { stock: 44, minStock: 10, sku: 'HRB-HMS-500' },
};

function generateSku(productId: string, variantId: string, index: number): string {
  const prefixMap: Record<string, string> = {
    kurma: 'KRM',
    'kismis-kacang': 'KCG',
    'cokelat-gift': 'CKL',
    'zamzam-herbal': 'ZAM',
    paket: 'PKT',
  };
  const code = variantId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
  const pPrefix = prefixMap[productId.split('-')[0]] || productId.slice(0, 3).toUpperCase();
  return `${pPrefix}-${code}-${String(index + 1).padStart(2, '0')}`;
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

function buildOptimisticProducts(): NormalizedProduct[] {
  return PRODUCTS_DATA.map((product: Product) => ({
    ...product,
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
        storageLocation: v.storageLocation ?? inferStorageLocation(product.category, v.id),
        expiredDate: v.expiredDate ?? '2027-08-31',
      };
    }),
  }));
}

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

export interface ActionResult {
  ok: boolean;
  error?: string;
}

interface StoreContextValue {
  products: NormalizedProduct[];
  transactions: TransactionRecord[];
  stockLogs: StockLog[];
  packageBundles: CmsPackageBundle[];
  testimonials: CmsTestimonial[];
  faqs: CmsFaqItem[];
  siteContent: SiteContentBundle;
  currentUser: StaffUser | null;
  isAuthLoading: boolean;
  isCatalogLoading: boolean;
  login: (identifier: string, password: string) => Promise<ActionResult>;
  logout: () => Promise<void>;
  updateProfile: (updates: { name: string; branch: string }) => Promise<ActionResult>;
  completeCheckout: (payload: CheckoutPayload) => Promise<CheckoutResult>;
  adjustStock: (
    productId: string,
    variantId: string,
    delta: number,
    type: Exclude<StockAdjustmentType, 'penjualan'>,
    reason: string
  ) => Promise<ActionResult>;
  addProduct: (input: NewProductInput) => Promise<ActionResult>;
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
  ) => Promise<ActionResult>;
  deleteProduct: (productId: string) => Promise<ActionResult>;
  savePackageBundle: (
    input: Omit<CmsPackageBundle, 'id'> & { id?: string }
  ) => Promise<ActionResult>;
  deletePackageBundle: (id: string) => Promise<ActionResult>;
  saveTestimonial: (
    input: Omit<CmsTestimonial, 'id' | 'initials'> & { id?: string; initials?: string }
  ) => Promise<ActionResult>;
  deleteTestimonial: (id: string) => Promise<ActionResult>;
  saveFaq: (input: Omit<CmsFaqItem, 'id'> & { id?: string }) => Promise<ActionResult>;
  deleteFaq: (id: string) => Promise<ActionResult>;
  saveSiteSection: <K extends SiteSectionKey>(
    key: K,
    content: SiteContentBundle[K]
  ) => Promise<ActionResult>;
  refreshStoreData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<NormalizedProduct[]>(buildOptimisticProducts);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [packageBundles, setPackageBundles] = useState<CmsPackageBundle[]>(DEFAULT_PACKAGE_BUNDLES);
  const [testimonials, setTestimonials] = useState<CmsTestimonial[]>(DEFAULT_TESTIMONIALS);
  const [faqs, setFaqs] = useState<CmsFaqItem[]>(DEFAULT_FAQS);
  const [siteContent, setSiteContent] = useState<SiteContentBundle>(DEFAULT_SITE_CONTENT);
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isCatalogLoading, setIsCatalogLoading] = useState<boolean>(true);

  const realtimeTimerRef = useRef<number | null>(null);

  const refreshProducts = useCallback(async () => {
    try {
      const dbProducts = await fetchProductsFromDb();
      setProducts(dbProducts);
    } catch (err) {
      console.error('Gagal memuat katalog produk dari Supabase:', err);
    } finally {
      setIsCatalogLoading(false);
    }
  }, []);

  const refreshCmsContent = useCallback(async () => {
    try {
      const [dbBundles, dbTestimonials, dbFaqs, dbSiteContent] = await Promise.all([
        fetchPackageBundlesFromDb(),
        fetchTestimonialsFromDb(),
        fetchFaqsFromDb(),
        fetchSiteContentFromDb(),
      ]);
      setPackageBundles(dbBundles);
      setTestimonials(dbTestimonials);
      setFaqs(dbFaqs);
      setSiteContent(dbSiteContent);
    } catch (err) {
      console.error('Gagal memuat konten CMS etalase dari Supabase:', err);
    }
  }, []);

  const refreshAdminRecords = useCallback(async () => {
    try {
      const [dbTransactions, dbLogs] = await Promise.all([
        fetchTransactionsFromDb(),
        fetchStockLogsFromDb(),
      ]);
      setTransactions(dbTransactions);
      setStockLogs(dbLogs);
    } catch (err) {
      console.error('Gagal memuat transaksi & mutasi stok:', err);
    }
  }, []);

  const refreshStoreData = useCallback(async () => {
    await Promise.all([refreshProducts(), refreshCmsContent()]);
    if (currentUser) {
      await refreshAdminRecords();
    }
  }, [refreshProducts, refreshCmsContent, refreshAdminRecords, currentUser]);

  // Hydrate initial public catalog & CMS + restore active Supabase Auth session
  useEffect(() => {
    let active = true;

    void refreshProducts();
    void refreshCmsContent();

    const loadSessionAndProfile = async (userId: string | null) => {
      if (!active) return;
      if (!userId) {
        setCurrentUser(null);
        setTransactions([]);
        setStockLogs([]);
        setIsAuthLoading(false);
        return;
      }

      const profile = await fetchStaffProfileById(userId);
      if (!active) return;

      if (profile) {
        setCurrentUser(profile);
        await refreshAdminRecords();
      } else {
        setCurrentUser(null);
        setTransactions([]);
        setStockLogs([]);
      }
      if (active) {
        setIsAuthLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      void loadSessionAndProfile(session?.user?.id ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        if (!active) return;
        setCurrentUser(null);
        setTransactions([]);
        setStockLogs([]);
        setIsAuthLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        const uid = session?.user?.id ?? null;
        window.setTimeout(() => {
          void loadSessionAndProfile(uid);
        }, 0);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [refreshProducts, refreshCmsContent, refreshAdminRecords]);

  // Realtime DB sync for catalog, CMS landing content & admin records
  useEffect(() => {
    const triggerSync = (scope: 'catalog' | 'cms' | 'admin') => {
      if (realtimeTimerRef.current) {
        window.clearTimeout(realtimeTimerRef.current);
      }
      realtimeTimerRef.current = window.setTimeout(() => {
        if (scope === 'catalog') {
          void refreshProducts();
        } else if (scope === 'cms') {
          void refreshCmsContent();
        } else {
          void refreshProducts();
          if (currentUser) {
            void refreshAdminRecords();
          }
        }
      }, 250);
    };

    const channel = supabase
      .channel('alfaratha-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () =>
        triggerSync('catalog')
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_variants' }, () =>
        triggerSync('catalog')
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'package_bundles' }, () =>
        triggerSync('cms')
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, () =>
        triggerSync('cms')
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faqs' }, () =>
        triggerSync('cms')
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_contents' }, () =>
        triggerSync('cms')
      );

    if (currentUser) {
      channel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () =>
          triggerSync('admin')
        )
        .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_logs' }, () =>
          triggerSync('admin')
        );
    }

    channel.subscribe();

    return () => {
      if (realtimeTimerRef.current) {
        window.clearTimeout(realtimeTimerRef.current);
      }
      void supabase.removeChannel(channel);
    };
  }, [currentUser, refreshProducts, refreshCmsContent, refreshAdminRecords]);

  const login = useCallback(
    async (identifier: string, password: string): Promise<ActionResult> => {
      const email = resolveStaffEmail(identifier);
      if (!email || !password) {
        return { ok: false, error: 'Masukkan email/username dan kata sandi staff.' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        return {
          ok: false,
          error:
            error?.message === 'Invalid login credentials'
              ? 'Email/username atau kata sandi salah. Gunakan tombol "Isi Akun Demo" untuk akses cepat.'
              : error?.message || 'Gagal masuk ke sistem.',
        };
      }

      const profile = await fetchStaffProfileById(data.user.id);
      if (!profile) {
        await supabase.auth.signOut();
        return {
          ok: false,
          error: 'Akun berhasil login namun profil staff belum terdaftar di database.',
        };
      }

      setCurrentUser(profile);
      await refreshAdminRecords();
      return { ok: true };
    },
    [refreshAdminRecords]
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setTransactions([]);
    setStockLogs([]);
  }, []);

  const updateProfile = useCallback(
    async (updates: { name: string; branch: string }): Promise<ActionResult> => {
      if (!currentUser) {
        return { ok: false, error: 'Sesi staff tidak ditemukan.' };
      }

      const res = await updateStaffProfileInDb(currentUser.id, updates);
      if (!res.ok || !res.user) {
        return { ok: false, error: res.error || 'Gagal memperbarui profil.' };
      }

      setCurrentUser(res.user);
      return { ok: true };
    },
    [currentUser]
  );

  const completeCheckout = useCallback(
    async (payload: CheckoutPayload): Promise<CheckoutResult> => {
      if (payload.items.length === 0) {
        return { ok: false, error: 'Keranjang belanja masih kosong.' };
      }

      const subtotal = payload.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
      const totalQty = payload.items.reduce((sum, i) => sum + i.quantity, 0);
      const discountRate =
        payload.pricingMode === 'jamaah' && totalQty >= 1
          ? totalQty >= 20
            ? 0.2
            : 0.15
          : 0;
      const discount = Math.round(subtotal * discountRate);
      const total = Math.max(0, subtotal - discount);

      if (payload.paymentMethod === 'cash' && payload.cashReceived < total) {
        return {
          ok: false,
          error: `Uang tunai diterima kurang dari total tagihan (Kurang Rp ${(
            total - payload.cashReceived
          ).toLocaleString('id-ID')}).`,
        };
      }

      const res = await processPosCheckoutInDb(payload);
      if (!res.ok || !res.transaction) {
        return { ok: false, error: res.error || 'Transaksi gagal diproses.' };
      }

      await Promise.all([refreshProducts(), refreshAdminRecords()]);
      return { ok: true, transaction: res.transaction };
    },
    [refreshProducts, refreshAdminRecords]
  );

  const adjustStock = useCallback(
    async (
      productId: string,
      variantId: string,
      delta: number,
      type: Exclude<StockAdjustmentType, 'penjualan'>,
      reason: string
    ): Promise<ActionResult> => {
      const res = await adjustVariantStockInDb(productId, variantId, delta, type, reason);
      if (!res.ok) {
        return res;
      }
      await Promise.all([refreshProducts(), refreshAdminRecords()]);
      return { ok: true };
    },
    [refreshProducts, refreshAdminRecords]
  );

  const addProduct = useCallback(
    async (input: NewProductInput): Promise<ActionResult> => {
      const res = await createProductInDb(input);
      if (!res.ok) {
        return res;
      }
      await Promise.all([refreshProducts(), refreshAdminRecords()]);
      return { ok: true };
    },
    [refreshProducts, refreshAdminRecords]
  );

  const updateProductVariant = useCallback(
    async (
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
    ): Promise<ActionResult> => {
      const res = await updateProductVariantInDb(productId, variantId, updates);
      if (!res.ok) {
        return res;
      }
      await refreshProducts();
      return { ok: true };
    },
    [refreshProducts]
  );

  const deleteProduct = useCallback(
    async (productId: string): Promise<ActionResult> => {
      const res = await deleteProductInDb(productId);
      if (!res.ok) {
        return res;
      }
      await refreshProducts();
      return { ok: true };
    },
    [refreshProducts]
  );

  const savePackageBundle = useCallback(
    async (input: Omit<CmsPackageBundle, 'id'> & { id?: string }): Promise<ActionResult> => {
      const res = await savePackageBundleInDb(input);
      if (res.ok) await refreshCmsContent();
      return res;
    },
    [refreshCmsContent]
  );

  const deletePackageBundle = useCallback(
    async (id: string): Promise<ActionResult> => {
      const res = await deletePackageBundleInDb(id);
      if (res.ok) await refreshCmsContent();
      return res;
    },
    [refreshCmsContent]
  );

  const saveTestimonial = useCallback(
    async (
      input: Omit<CmsTestimonial, 'id' | 'initials'> & { id?: string; initials?: string }
    ): Promise<ActionResult> => {
      const res = await saveTestimonialInDb(input);
      if (res.ok) await refreshCmsContent();
      return res;
    },
    [refreshCmsContent]
  );

  const deleteTestimonial = useCallback(
    async (id: string): Promise<ActionResult> => {
      const res = await deleteTestimonialInDb(id);
      if (res.ok) await refreshCmsContent();
      return res;
    },
    [refreshCmsContent]
  );

  const saveFaq = useCallback(
    async (input: Omit<CmsFaqItem, 'id'> & { id?: string }): Promise<ActionResult> => {
      const res = await saveFaqInDb(input);
      if (res.ok) await refreshCmsContent();
      return res;
    },
    [refreshCmsContent]
  );

  const deleteFaq = useCallback(
    async (id: string): Promise<ActionResult> => {
      const res = await deleteFaqInDb(id);
      if (res.ok) await refreshCmsContent();
      return res;
    },
    [refreshCmsContent]
  );

  const saveSiteSection = useCallback(
    async <K extends SiteSectionKey>(
      key: K,
      content: SiteContentBundle[K]
    ): Promise<ActionResult> => {
      const res = await saveSiteSectionInDb(key, content);
      if (res.ok) await refreshCmsContent();
      return res;
    },
    [refreshCmsContent]
  );

  return (
    <StoreContext.Provider
      value={{
        products,
        transactions,
        stockLogs,
        packageBundles,
        testimonials,
        faqs,
        siteContent,
        currentUser,
        isAuthLoading,
        isCatalogLoading,
        login,
        logout,
        updateProfile,
        completeCheckout,
        adjustStock,
        addProduct,
        updateProductVariant,
        deleteProduct,
        savePackageBundle,
        deletePackageBundle,
        saveTestimonial,
        deleteTestimonial,
        saveFaq,
        deleteFaq,
        saveSiteSection,
        refreshStoreData,
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
