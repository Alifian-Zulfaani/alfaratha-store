import { supabase } from '../lib/supabase';
import { DEFAULT_SITE_CONTENT } from '../data/cmsDefaults';
import {
  CmsFaqItem,
  CmsPackageBundle,
  CmsTestimonial,
  SiteContentBundle,
  SiteSectionKey,
} from '../types';

interface DbPackageBundleRow {
  id: string;
  name: string;
  subtitle: string;
  box_description: string;
  single_price: number;
  bulk_price: number;
  min_bulk_units: number;
  is_popular: boolean;
  items: string[] | null;
  bonuses: string[] | null;
  target_audience: string;
  is_active: boolean;
  sort_order: number;
}

interface DbTestimonialRow {
  id: string;
  author: string;
  role: string;
  city: string;
  rating: number;
  content: string;
  purchased_product: string;
  initials: string;
  is_published: boolean;
  sort_order: number;
}

interface DbFaqRow {
  id: string;
  question: string;
  answer: string;
  badge: string | null;
  is_published: boolean;
  sort_order: number;
}

interface DbSiteContentRow {
  id: string;
  content: Record<string, unknown>;
}

function makeSlugId(prefix: string, label: string): string {
  const clean = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 28);
  return `${prefix}-${clean || 'item'}-${Date.now().toString().slice(-4)}`;
}

function computeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'AF';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export async function fetchPackageBundlesFromDb(): Promise<CmsPackageBundle[]> {
  const { data, error } = await supabase
    .from('package_bundles')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  return ((data || []) as DbPackageBundleRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    subtitle: row.subtitle,
    boxDescription: row.box_description,
    singlePrice: row.single_price,
    bulkPrice: row.bulk_price,
    minBulkUnits: row.min_bulk_units,
    isPopular: row.is_popular,
    items: row.items ?? [],
    bonuses: row.bonuses ?? [],
    targetAudience: row.target_audience,
    isActive: row.is_active,
    sortOrder: row.sort_order,
  }));
}

export async function savePackageBundleInDb(
  input: Omit<CmsPackageBundle, 'id'> & { id?: string }
): Promise<{ ok: boolean; error?: string }> {
  const id = input.id?.trim() || makeSlugId('paket', input.name);
  const now = new Date().toISOString();

  // Guarantee only 1 featured/popular tier at a time so layout emphasis stays balanced
  if (input.isPopular) {
    await supabase
      .from('package_bundles')
      .update({ is_popular: false, updated_at: now })
      .neq('id', id);
  }

  const { error } = await supabase.from('package_bundles').upsert({
    id,
    name: input.name.trim(),
    subtitle: input.subtitle.trim(),
    box_description: input.boxDescription.trim(),
    single_price: Math.max(0, Math.round(input.singlePrice)),
    bulk_price: Math.max(0, Math.round(input.bulkPrice)),
    min_bulk_units: Math.max(1, Math.round(input.minBulkUnits || 20)),
    is_popular: Boolean(input.isPopular),
    items: input.items.map((s) => s.trim()).filter(Boolean),
    bonuses: input.bonuses.map((s) => s.trim()).filter(Boolean),
    target_audience: input.targetAudience.trim(),
    is_active: input.isActive,
    sort_order: input.sortOrder,
    updated_at: now,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deletePackageBundleInDb(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('package_bundles').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function fetchTestimonialsFromDb(): Promise<CmsTestimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  return ((data || []) as DbTestimonialRow[]).map((row) => ({
    id: row.id,
    author: row.author,
    role: row.role,
    city: row.city,
    rating: row.rating,
    content: row.content,
    purchasedProduct: row.purchased_product,
    initials: row.initials,
    isPublished: row.is_published,
    sortOrder: row.sort_order,
  }));
}

export async function saveTestimonialInDb(
  input: Omit<CmsTestimonial, 'id' | 'initials'> & { id?: string; initials?: string }
): Promise<{ ok: boolean; error?: string }> {
  const id = input.id?.trim() || makeSlugId('testi', input.author);
  const { error } = await supabase.from('testimonials').upsert({
    id,
    author: input.author.trim(),
    role: input.role.trim(),
    city: input.city.trim(),
    rating: Math.min(5, Math.max(1, Math.round(input.rating || 5))),
    content: input.content.trim(),
    purchased_product: input.purchasedProduct.trim(),
    initials: input.initials?.trim() || computeInitials(input.author),
    is_published: input.isPublished,
    sort_order: input.sortOrder,
    updated_at: new Date().toISOString(),
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteTestimonialInDb(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('testimonials').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function fetchFaqsFromDb(): Promise<CmsFaqItem[]> {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  return ((data || []) as DbFaqRow[]).map((row) => ({
    id: row.id,
    question: row.question,
    answer: row.answer,
    badge: row.badge ?? undefined,
    isPublished: row.is_published,
    sortOrder: row.sort_order,
  }));
}

export async function saveFaqInDb(
  input: Omit<CmsFaqItem, 'id'> & { id?: string }
): Promise<{ ok: boolean; error?: string }> {
  const id = input.id?.trim() || makeSlugId('faq', input.question);
  const { error } = await supabase.from('faqs').upsert({
    id,
    question: input.question.trim(),
    answer: input.answer.trim(),
    badge: input.badge?.trim() || null,
    is_published: input.isPublished,
    sort_order: input.sortOrder,
    updated_at: new Date().toISOString(),
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteFaqInDb(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('faqs').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function fetchSiteContentFromDb(): Promise<SiteContentBundle> {
  const { data, error } = await supabase.from('site_contents').select('id, content');

  if (error) throw new Error(error.message);

  const byKey = new Map<string, Record<string, unknown>>();
  for (const row of (data || []) as DbSiteContentRow[]) {
    byKey.set(row.id, row.content || {});
  }

  const mergeSection = <K extends SiteSectionKey>(key: K): SiteContentBundle[K] => {
    const raw = byKey.get(key);
    if (!raw) return DEFAULT_SITE_CONTENT[key];
    return {
      ...DEFAULT_SITE_CONTENT[key],
      ...raw,
    } as SiteContentBundle[K];
  };

  return {
    general: mergeSection('general'),
    hero: mergeSection('hero'),
    trustMetrics: mergeSection('trustMetrics'),
    bentoAdvantages: mergeSection('bentoAdvantages'),
    orderSteps: mergeSection('orderSteps'),
    finalCta: mergeSection('finalCta'),
    catalogHeaders: mergeSection('catalogHeaders'),
  };
}

export async function saveSiteSectionInDb<K extends SiteSectionKey>(
  sectionKey: K,
  content: SiteContentBundle[K]
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('site_contents').upsert({
    id: sectionKey,
    content,
    updated_at: new Date().toISOString(),
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
