export type ProductCategory =
  | 'all'
  | 'kurma'
  | 'kismis-kacang'
  | 'cokelat-gift'
  | 'zamzam-herbal'
  | 'paket';

export type ProductBadgeType = 'best-seller' | 'favorit' | 'terbatas' | 'premium';

export interface ProductVariant {
  id: string;
  label: string; // e.g. "250g", "500g", "1kg", "Dus (5kg)"
  price: number; // in IDR
  originalPrice?: number;
  inStock: boolean;
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

export interface PackageBundle {
  id: string;
  name: string;
  subtitle: string;
  isPopular?: boolean;
  boxDescription: string;
  singlePrice: number; // Harga eceran / per dus
  bulkPrice: number;   // Harga grosir jamaah (hemat 20%)
  minBulkUnits: number; // misal 20 dus
  items: string[];
  bonuses: string[];
  targetAudience: string;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string; // e.g. "Jamaah Umroh Reguler 2024", "Pembeli Kurma Harian", "Koordinator Pengajian"
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
