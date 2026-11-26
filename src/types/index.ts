export type ProductCategory =
  | 'all'
  | 'kurma'
  | 'kismis-kacang'
  | 'cokelat-gift'
  | 'zamzam-herbal'
  | 'paket';

export type ProductBadgeType = 'best-seller' | 'favorit' | 'terbatas' | 'premium';

export type StorageLocation =
  | 'Ruang Pendingin'
  | 'Gudang Kering'
  | 'Gudang Palet'
  | 'Etalase Toko';

export interface ProductVariant {
  id: string;
  sku?: string;
  label: string; // e.g. "250g", "500g", "1kg", "Dus (5kg)"
  price: number; // in IDR (Harga Retail)
  costPrice?: number; // in IDR (Harga Modal)
  originalPrice?: number;
  inStock: boolean;
  stock?: number;
  minStock?: number;
  storageLocation?: StorageLocation;
  expiredDate?: string; // e.g. "2027-06-30"
}

export interface NormalizedProductVariant extends ProductVariant {
  sku: string;
  costPrice: number;
  stock: number;
  minStock: number;
  storageLocation: StorageLocation;
  expiredDate: string;
}

export interface Product {
  id: string;
  name: string;
  category: Exclude<ProductCategory, 'all'>;
  origin: string; // e.g. "Madinah Al-Munawwarah", "Al-Qassim", "California"
  description: string;
  badge?: ProductBadgeType;
  badgeText?: string;
  imageUrl: string;
  variants: ProductVariant[];
  defaultVariantIndex: number;
  features: string[];
  rating: number;
  reviewsCount: number;
}

export interface NormalizedProduct extends Omit<Product, 'variants'> {
  variants: NormalizedProductVariant[];
}

export interface PackageBundle {
  id: string;
  name: string;
  subtitle: string;
  isPopular?: boolean;
  boxDescription: string;
  singlePrice: number; // Harga eceran / per dus
  bulkPrice: number; // Harga grosir jamaah (hemat 20%)
  minBulkUnits: number; // misal 20 dus
  items: string[];
  bonuses: string[];
  targetAudience: string;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  city: string;
  rating: number;
  content: string;
  purchasedProduct: string;
  initials: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  badge?: string;
}

export interface TrustMetric {
  id: string;
  title: string;
  description: string;
  highlight: string;
  iconName: string;
}

// ==========================================
// POS, INVENTORY & AUTH TYPES
// ==========================================

export type PricingMode = 'eceran' | 'jamaah';

export type PaymentMethod = 'cash' | 'qris' | 'transfer' | 'edc';

export interface CartItem {
  productId: string;
  variantId: string;
  sku: string;
  productName: string;
  variantLabel: string;
  category: Exclude<ProductCategory, 'all'>;
  imageUrl: string;
  unitPrice: number;
  costPrice: number;
  quantity: number;
  maxStock: number;
}

export interface TransactionItemSnapshot {
  productId: string;
  variantId: string;
  sku: string;
  productName: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface TransactionRecord {
  id: string;
  invoiceNumber: string;
  timestamp: string;
  cashierName: string;
  customerName: string;
  customerPhone?: string;
  pricingMode: PricingMode;
  items: TransactionItemSnapshot[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived: number;
  changeAmount: number;
  notes?: string;
}

export type StockAdjustmentType = 'restock' | 'rusak' | 'retur' | 'koreksi' | 'penjualan';

export interface StockLog {
  id: string;
  timestamp: string;
  productId: string;
  variantId: string;
  sku: string;
  productName: string;
  variantLabel: string;
  type: StockAdjustmentType;
  delta: number;
  stockBefore: number;
  stockAfter: number;
  reason: string;
  staffName: string;
}

export interface StaffUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'Kasir' | 'Supervisor' | 'Admin Gudang';
  branch: string;
}

export interface NewProductInput {
  name: string;
  category: Exclude<ProductCategory, 'all'>;
  origin: string;
  description: string;
  imageUrl: string;
  badgeText?: string;
  variantLabel: string;
  sku: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  storageLocation: StorageLocation;
  expiredDate: string;
}
