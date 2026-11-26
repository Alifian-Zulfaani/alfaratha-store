export const DEFAULT_WHATSAPP_NUMBER = '6281554431137';

export interface WhatsAppOrderParams {
  productName?: string;
  variantLabel?: string;
  price?: number;
  packageTier?: string;
  isBulk?: boolean;
  quantity?: number;
  customMessage?: string;
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Menghasilkan URL resmi WhatsApp dengan teks terformat ramah dan profesional dalam Bahasa Indonesia.
 */
export function generateWhatsAppUrl(params?: WhatsAppOrderParams): string {
  const phone = DEFAULT_WHATSAPP_NUMBER;
  let text = '';

  if (params?.customMessage) {
    text = params.customMessage;
  } else if (params?.packageTier) {
    const typeStr = params.isBulk ? 'Paket Jamaah (Min. 20 Dus / Grosir)' : 'Paket Satuan (Eceran)';
    const priceStr = params.price ? ` (${formatIDR(params.price)}/dus)` : '';
    text = `Halo Alfaratha Store, saya tertarik berkonsultasi & memesan:\n\n` +
      `📦 *${params.packageTier}*\n` +
      `🔖 Tipe Pemesanan: ${typeStr}${priceStr}\n` +
      (params.quantity ? `🔢 Perkiraan Jumlah: ${params.quantity} Dus\n` : '') +
      `\nMohon info ketersediaan stok, opsi custom kartu ucapan jamaah, dan estimasi ongkir ke kota saya. Terima kasih!`;
  } else if (params?.productName) {
    const variantStr = params.variantLabel ? ` - Varian: ${params.variantLabel}` : '';
    const priceStr = params.price ? ` [${formatIDR(params.price)}]` : '';
    text = `Halo Alfaratha Store, saya ingin memesan:\n\n` +
      `🛒 *${params.productName}*${variantStr}${priceStr}\n` +
      `\nApakah stok ini ready dan bisa langsung dikirim? Terima kasih!`;
  } else {
    text = `Halo Alfaratha Store, saya ingin konsultasi mengenai kurma premium & paket oleh-oleh haji/umroh. Mohon info pricelist dan rekomendasinya. Terima kasih!`;
  }

  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${phone}?text=${encodedText}`;
}
