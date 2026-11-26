import { supabase } from '../lib/supabase';
import {
  CartItem,
  NewProductInput,
  NormalizedProduct,
  NormalizedProductVariant,
  PaymentMethod,
  PricingMode,
  ProductBadgeType,
  ProductCategory,
  StaffUser,
  StockAdjustmentType,
  StockLog,
  StorageLocation,
  TransactionItemSnapshot,
  TransactionRecord,
} from '../types';

interface DbProductVariantRow {
  id: string;
  product_id: string;
  sku: string;
  label: string;
  price: number;
  cost_price: number;
  original_price: number | null;
  stock: number;
  min_stock: number;
  storage_location: StorageLocation;
  expired_date: string;
  sort_order: number;
}

interface DbProductRow {
  id: string;
  name: string;
  category: Exclude<ProductCategory, 'all'>;
  origin: string;
  description: string;
  badge: ProductBadgeType | null;
  badge_text: string | null;
  image_url: string;
  default_variant_index: number;
  features: string[] | null;
  rating: number | string;
  reviews_count: number;
  sort_order: number;
  product_variants: DbProductVariantRow[] | null;
}

interface DbTransactionItemRow {
  product_id: string;
  variant_id: string;
  sku: string;
  product_name: string;
  variant_label: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

interface DbTransactionRow {
  id: string;
  invoice_number: string;
  created_at: string;
  cashier_name: string;
  customer_name: string;
  customer_phone: string | null;
  pricing_mode: PricingMode;
  subtotal: number;
  discount: number;
  total: number;
  payment_method: PaymentMethod;
  cash_received: number;
  change_amount: number;
  notes: string | null;
  transaction_items: DbTransactionItemRow[] | null;
}

interface DbStockLogRow {
  id: string;
  created_at: string;
  product_id: string;
  variant_id: string;
  sku: string;
  product_name: string;
  variant_label: string;
  type: StockAdjustmentType;
  delta: number;
  stock_before: number;
  stock_after: number;
  reason: string;
  staff_name: string;
}

interface DbStaffProfileRow {
  id: string;
  username: string;
  email: string;
  name: string;
  role: StaffUser['role'];
  branch: string;
}

function mapVariantRow(v: DbProductVariantRow): NormalizedProductVariant {
  return {
    id: v.id,
    sku: v.sku,
    label: v.label,
    price: v.price,
    costPrice: v.cost_price,
    originalPrice: v.original_price ?? undefined,
    inStock: v.stock > 0,
    stock: v.stock,
    minStock: v.min_stock,
    storageLocation: v.storage_location,
    expiredDate: v.expired_date,
  };
}

function mapProductRow(row: DbProductRow): NormalizedProduct {
  const sortedVariants = [...(row.product_variants || [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    origin: row.origin,
    description: row.description,
    badge: row.badge ?? undefined,
    badgeText: row.badge_text ?? undefined,
    imageUrl: row.image_url,
    defaultVariantIndex: row.default_variant_index,
    features: row.features ?? [],
    rating: Number(row.rating),
    reviewsCount: row.reviews_count,
    variants: sortedVariants.map(mapVariantRow),
  };
}

function mapTransactionRow(row: DbTransactionRow): TransactionRecord {
  const items: TransactionItemSnapshot[] = (row.transaction_items || []).map((item) => ({
    productId: item.product_id,
    variantId: item.variant_id,
    sku: item.sku,
    productName: item.product_name,
    variantLabel: item.variant_label,
    unitPrice: item.unit_price,
    quantity: item.quantity,
    lineTotal: item.line_total,
  }));

  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    timestamp: row.created_at,
    cashierName: row.cashier_name,
    customerName: row.customer_name,
    customerPhone: row.customer_phone ?? undefined,
    pricingMode: row.pricing_mode,
    items,
    subtotal: row.subtotal,
    discount: row.discount,
    total: row.total,
    paymentMethod: row.payment_method,
    cashReceived: row.cash_received,
    changeAmount: row.change_amount,
    notes: row.notes ?? undefined,
  };
}

function mapStockLogRow(row: DbStockLogRow): StockLog {
  return {
    id: row.id,
    timestamp: row.created_at,
    productId: row.product_id,
    variantId: row.variant_id,
    sku: row.sku,
    productName: row.product_name,
    variantLabel: row.variant_label,
    type: row.type,
    delta: row.delta,
    stockBefore: row.stock_before,
    stockAfter: row.stock_after,
    reason: row.reason,
    staffName: row.staff_name,
  };
}

function mapStaffRow(row: DbStaffProfileRow): StaffUser {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    name: row.name,
    role: row.role,
    branch: row.branch,
  };
}

export function resolveStaffEmail(identifier: string): string {
  const normalized = identifier.trim().toLowerCase();
  if (!normalized) return '';
  return normalized.includes('@') ? normalized : `${normalized}@alfaratha.store`;
}

export async function fetchProductsFromDb(): Promise<NormalizedProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data || []) as DbProductRow[]).map(mapProductRow);
}

export async function fetchTransactionsFromDb(): Promise<TransactionRecord[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, transaction_items(*)')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    throw new Error(error.message);
  }

  return ((data || []) as DbTransactionRow[]).map(mapTransactionRow);
}

export async function fetchStockLogsFromDb(): Promise<StockLog[]> {
  const { data, error } = await supabase
    .from('stock_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    throw new Error(error.message);
  }

  return ((data || []) as DbStockLogRow[]).map(mapStockLogRow);
}

export async function fetchStaffProfileById(userId: string): Promise<StaffUser | null> {
  const { data, error } = await supabase
    .from('staff_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapStaffRow(data as DbStaffProfileRow);
}

export async function updateStaffProfileInDb(
  userId: string,
  updates: { name: string; branch: string }
): Promise<{ ok: boolean; user?: StaffUser; error?: string }> {
  const { data, error } = await supabase
    .from('staff_profiles')
    .update({
      name: updates.name.trim(),
      branch: updates.branch.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select('*')
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: error?.message || 'Gagal menyimpan perubahan profil.',
    };
  }

  return { ok: true, user: mapStaffRow(data as DbStaffProfileRow) };
}

export async function processPosCheckoutInDb(payload: {
  items: CartItem[];
  customerName: string;
  customerPhone?: string;
  pricingMode: PricingMode;
  paymentMethod: PaymentMethod;
  cashReceived: number;
  notes?: string;
}): Promise<{ ok: boolean; transaction?: TransactionRecord; error?: string }> {
  const rpcItems = payload.items.map((item) => ({
    product_id: item.productId,
    variant_id: item.variantId,
    quantity: item.quantity,
  }));

  const { data, error } = await supabase.rpc('process_pos_checkout', {
    p_customer_name: payload.customerName,
    p_customer_phone: payload.customerPhone || null,
    p_pricing_mode: payload.pricingMode,
    p_payment_method: payload.paymentMethod,
    p_cash_received: payload.cashReceived,
    p_notes: payload.notes || null,
    p_items: rpcItems,
  });

  if (error || !data) {
    return {
      ok: false,
      error: error?.message || 'Gagal memproses transaksi POS di database.',
    };
  }

  return {
    ok: true,
    transaction: data as TransactionRecord,
  };
}

export async function adjustVariantStockInDb(
  productId: string,
  variantId: string,
  delta: number,
  type: Exclude<StockAdjustmentType, 'penjualan'>,
  reason: string
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.rpc('adjust_variant_stock', {
    p_product_id: productId,
    p_variant_id: variantId,
    p_delta: delta,
    p_type: type,
    p_reason: reason,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function createProductInDb(
  input: NewProductInput
): Promise<{ ok: boolean; error?: string }> {
  const slug = input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const id = `${slug || 'produk'}-${Date.now().toString().slice(-4)}`;
  const variantId = `${id}-v1`;

  const { error } = await supabase.rpc('create_product_with_variant', {
    p_id: id,
    p_name: input.name,
    p_category: input.category,
    p_origin: input.origin,
    p_description: input.description,
    p_badge_text: input.badgeText || 'Produk Baru',
    p_image_url: input.imageUrl,
    p_variant_id: variantId,
    p_sku: input.sku,
    p_variant_label: input.variantLabel,
    p_price: input.price,
    p_cost_price: input.costPrice,
    p_stock: input.stock,
    p_min_stock: input.minStock,
    p_storage_location: input.storageLocation,
    p_expired_date: input.expiredDate || '2027-08-31',
  });

  if (error) {
    if (error.message.toLowerCase().includes('product_variants_sku_key')) {
      return { ok: false, error: `Kode SKU "${input.sku.toUpperCase()}" sudah digunakan.` };
    }
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function updateProductVariantInDb(
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
): Promise<{ ok: boolean; error?: string }> {
  const now = new Date().toISOString();

  const { error: prodErr } = await supabase
    .from('products')
    .update({
      name: updates.name.trim(),
      category: updates.category,
      origin: updates.origin.trim(),
      description: updates.description.trim(),
      image_url: updates.imageUrl.trim() || '/images/ajwa.webp',
      updated_at: now,
    })
    .eq('id', productId);

  if (prodErr) {
    return { ok: false, error: prodErr.message };
  }

  const { error: varErr } = await supabase
    .from('product_variants')
    .update({
      label: updates.variantLabel.trim(),
      sku: updates.sku.trim().toUpperCase(),
      price: updates.price,
      cost_price: updates.costPrice,
      min_stock: updates.minStock,
      storage_location: updates.storageLocation,
      expired_date: updates.expiredDate,
      updated_at: now,
    })
    .eq('id', variantId)
    .eq('product_id', productId);

  if (varErr) {
    if (varErr.message.toLowerCase().includes('product_variants_sku_key')) {
      return { ok: false, error: `Kode SKU "${updates.sku.toUpperCase()}" sudah digunakan varian lain.` };
    }
    return { ok: false, error: varErr.message };
  }

  return { ok: true };
}

export async function deleteProductInDb(
  productId: string
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
