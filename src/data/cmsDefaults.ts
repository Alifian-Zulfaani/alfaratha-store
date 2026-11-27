import {
  CmsFaqItem,
  CmsPackageBundle,
  CmsTestimonial,
  SiteContentBundle,
} from '../types';
import { PACKAGE_BUNDLES_DATA } from './packages';
import { TESTIMONIALS_DATA } from './testimonials';
import { FAQS_DATA } from './faqs';

export const DEFAULT_PACKAGE_BUNDLES: CmsPackageBundle[] = PACKAGE_BUNDLES_DATA.map(
  (pkg, index) => ({
    ...pkg,
    isActive: true,
    sortOrder: index,
  })
);

export const DEFAULT_TESTIMONIALS: CmsTestimonial[] = TESTIMONIALS_DATA.map(
  (rev, index) => ({
    ...rev,
    isPublished: true,
    sortOrder: index,
  })
);

export const DEFAULT_FAQS: CmsFaqItem[] = FAQS_DATA.map((faq, index) => ({
  ...faq,
  isPublished: true,
  sortOrder: index,
}));

export const DEFAULT_SITE_CONTENT: SiteContentBundle = {
  general: {
    storeName: 'Alfaratha Store',
    tagline:
      'Kurma pilihan kualitas super dan oleh-oleh khas Tanah Suci yang dikemas rapi dan higienis.',
    whatsappNumber: '6281554431137',
    whatsappDisplay: '+62 815-5443-1137',
    email: 'admin@alfaratha.store',
    operatingHours: 'Senin – Minggu: 07:30 – 22:00 WIB',
    operatingHoursShort: '07.30 - 22.00 WIB',
    googleMapsUrl: 'https://maps.app.goo.gl/mFNWPrfMV3TEtqqV8',
    googleMapsEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.9308063519093!2d110.63708807390003!3d-7.690575276149168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a41ca94925ae9%3A0xb527c0ee117b4d15!2sAlfaratha%20Kurma!5e0!3m2!1sen!2sid!4v1795354979337!5m2!1sen!2sid',
    footerBadge: '100% Asli Garansi Madinah & Makkah',
    footerStorageNote:
      'Penyimpanan sejuk dan higienis agar kurma tetap empuk, segar, dan tidak berkutu.',
    floatingTooltip: 'Butuh bantuan? Chat kami',
    copyrightText: '© 2025 Alfaratha Store. Seluruh Hak Cipta Dilindungi.',
  },
  hero: {
    badgeText: '100% Impor Resmi Madinah • Siap Kirim Seluruh Indonesia',
    titlePrefix: 'Sedia Kurma Pilihan & Oleh-Oleh Haji Umroh',
    titleHighlight: 'Lengkap Tanpa Repot',
    description:
      'Dari Kurma Ajwa Aliyah Madinah, Kismis Golden Jumbo, hingga dus paket souvenir siap bagi. Penyimpanan sejuk dan higienis menjaga buah tetap lembut, manis alami, dan bebas kutu hingga tiba di rumah Anda.',
    primaryCtaLabel: 'Lihat Katalog & Harga',
    secondaryCtaLabel: 'Konsultasi Paket via WA',
    secondaryCtaMessage:
      'Halo Admin Alfaratha, saya ingin konsultasi paket oleh-oleh Haji/Umroh.',
    proofItems: [
      'Penyimpanan Sejuk',
      'Garansi Kemasan Aman',
      'Pengiriman Pulau Jawa',
    ],
    showcaseBadge: 'PILIHAN JAMAAH',
    showcaseStatus: 'STOK SEGAR',
    showcaseImageUrl: '/images/ajwa.webp',
    showcaseLocation: 'Madinah Al-Munawwarah',
    showcaseTitle: 'Kurma Ajwa Aliyah Madinah',
    showcaseRating: '4.95',
    showcaseReviewCount: '(1.2k)',
    showcaseDescription:
      'Daging buah tebal, serat halus dengan rona kehitaman pekat alami. Dipetik langsung dari kebun dataran tinggi Al-Aliyah Madinah.',
    showcasePriceLabel: 'Mulai Dari',
    showcasePriceValue: 'Rp 32.000',
    showcasePriceUnit: '/ Dus Paket',
    showcaseCtaLabel: 'Lihat Opsi Dus',
  },
  trustMetrics: {
    items: [
      {
        iconName: 'shield',
        badge: 'KEASLIAN TERUJI',
        title: '100% Impor Resmi',
        desc: 'Langsung dari perkebunan kurma Madinah & Makkah berizin resmi.',
      },
      {
        iconName: 'package',
        badge: 'REKAM JEJAK',
        title: '10.000+ Paket',
        desc: 'Dipercaya ribuan jamaah, KBIHU, dan travel umroh terkemuka.',
      },
      {
        iconName: 'snowflake',
        badge: 'PENYIMPANAN SEJUK',
        title: 'Kualitas Terjaga',
        desc: 'Daging buah tetap empuk lembab, tidak asam atau berulat.',
      },
      {
        iconName: 'plane',
        badge: 'BEBAS BAGASI',
        title: '0 kg Beban Koper',
        desc: 'Dus tiba di alamat Anda sebelum jadwal kepulangan dari Tanah Suci.',
      },
    ],
  },
  bentoAdvantages: {
    eyebrow: 'Standar Mutu Alfaratha',
    heading: 'Kualitas Segar & Ketenangan Ibadah',
    subtitle: 'Penanganan rapi dan higienis dari penyimpanan hingga sampai di rumah Anda.',
    cards: [
      {
        tag: 'PENYIMPANAN SEJUK',
        title: 'Kualitas Kurma Tetap Segar & Empuk',
        desc: 'Disimpan di ruangan sejuk berkelembapan terjaga agar gula alami tidak mengkristal, daging buah tetap empuk, dan bebas hama gudang.',
        footerLeft: 'Empuk & legit',
        footerRight: 'Higienis teruji',
      },
      {
        tag: '0 KG KOPER',
        title: 'Fokus Ibadah, Tanpa Repot Bagasi',
        desc: 'Hindari denda kelebihan bagasi bandara dan risiko pecah di koper. Pesanan diantar langsung ke rumah sebelum Anda mendarat.',
        footerLeft: 'Tiba Tepat Waktu',
        footerRight: 'Jadwal Fleksibel',
      },
      {
        tag: 'FLEKSIBEL BUDGET',
        title: 'Custom Paket Sesuai Anggaran',
        desc: 'Bebas padu-padan isian dus: kurma Sukkari/Ajwa, kismis, kacang pistachio, cokelat kerikil, tasbih, hingga botol Zamzam.',
        footerLeft: 'Mulai Rp 25.000/dus',
        footerRight: 'Konsultasi WA',
        waMessage: 'Halo Admin, saya ingin custom isian dus oleh-oleh sesuai budget.',
      },
      {
        tag: 'GARANSI GANTI BARU',
        title: 'Pengiriman Berlapis & Bergaransi 100%',
        desc: 'Dikemas dengan kardus double-wall dan segel plastik kedap. Apabila terdapat botol rembes atau penyok dalam ekspedisi, kami ganti baru gratis.',
        footerLeft: 'Kardus Double Wall',
        footerRight: 'Asuransi Ekspedisi',
      },
    ],
  },
  orderSteps: {
    eyebrow: 'Tata Cara Pemesanan',
    heading: 'Mudah Dalam 3 Langkah Sederhana',
    hoursBadge: 'Layanan Admin Aktif: 07.30 - 22.00 WIB',
    steps: [
      {
        step: '01',
        num: '1',
        title: 'Pilih Katalog atau Paket Dus',
        desc: 'Tentukan jenis kurma, jumlah dus paket oleh-oleh, atau isian custom sesuai rencana jumlah tamu Anda.',
        isHighlight: false,
      },
      {
        step: '02',
        num: '2',
        title: 'Konfirmasi Jadwal via WhatsApp',
        desc: 'Admin menghitung total diskon paket, ongkir termurah, dan konfirmasi cetak nama jamaah pada kartu ucapan gratis.',
        isHighlight: false,
      },
      {
        step: '03',
        num: '3',
        title: 'Pengiriman Aman ke Rumah Anda',
        desc: 'Paket dipacking rapi berlapis bubble wrap dan kardus tebal, siap sampai di kediaman sebelum jadwal kepulangan jamaah.',
        isHighlight: true,
      },
    ],
  },
  finalCta: {
    badge: 'Pusat Oleh-Oleh Haji & Umroh',
    heading: 'Sambut Hangat Keluarga & Tamu dengan Buah Tangan Terbaik.',
    description:
      'Tidak perlu tergesa-gesa berbelanja di pasar Tanah Suci di sela ibadah Anda. Kunjungi toko kami langsung atau pesan antar dengan jaminan kurma segar sampai ke rumah.',
    primaryBtnLabel: 'Pesan Sekarang via WhatsApp',
    primaryWaMessage: 'Halo Alfaratha, saya ingin pesan paket oleh-oleh sekarang.',
    secondaryBtnLabel: 'Buka di Google Maps ↗',
    guarantees: [
      'Respon Kilat CS',
      'Garansi 100% Produk Asli',
      'Invoice Resmi & Kwitansi KBIH',
    ],
    mapTitle: 'Alfaratha Kurma',
    mapBadge: 'Toko Alfaratha',
    mapCardTitle: 'Kunjungi Toko Alfaratha',
    mapCardDesc:
      'Tersedia display kurma segar, sampel rasa gratis, dan konsultasi paket langsung di lokasi.',
    mapActionLabel: 'Tampilkan Peta Interaktif',
  },
  catalogHeaders: {
    productEyebrow: 'Pilihan Panen Segar & Oleh-Oleh',
    productHeading: 'Katalog Produk Pilihan Alfaratha',
    productSubtitle:
      'Tersedia dalam kemasan pouch higienis, box retail, hingga kartonan grosir.',
    wholesaleTitle: 'Butuh Pembelian Kartonan / Grosir Masjid & KBIH?',
    wholesaleSubtitle:
      'Dapatkan daftar harga khusus partai besar untuk pengajian, pondok pesantren, dan majelis taklim.',
    wholesaleBtnLabel: 'Minta Pricelist via WA',
    wholesaleWaMessage:
      'Halo Admin Alfaratha, saya minta Pricelist Grosir Kartonan Kurma & Oleh-oleh Alfaratha.',
    bundleEyebrow: 'Solusi Praktis Siap Bagi',
    bundleHeading: 'Paket Oleh-Oleh Haji & Umroh',
    bundleSubtitle:
      'Dus eksklusif siap dibagikan ke sanak keluarga & tetangga. Sudah termasuk air Zamzam segel dan gratis custom kartu nama kepulangan jamaah.',
    bundleScheduleNote:
      'Pesanan dapat dijadwalkan tiba H-2 sebelum kepulangan jamaah ke tanah air.',
    bundleScheduleLabel: 'Atur Jadwal Kirim',
    bundleScheduleMessage:
      'Halo Admin Alfaratha, saya ingin jadwalkan kirim paket oleh-oleh Haji/Umroh.',
    testimonialEyebrow: 'Pengalaman Jamaah',
    testimonialHeading: 'Apa Kata Mereka?',
    testimonialSubtitle:
      'Ulasan nyata dari jamaah haji, umroh, dan koordinator rombongan.',
    faqEyebrow: 'Pertanyaan Umum',
    faqHeading: 'Klarifikasi & Informasi Mutu',
    faqSubtitle: 'Jawaban transparan seputar keaslian kurma, kemasan, dan pengiriman.',
    faqCtaPrompt: 'Punya pertanyaan seputar kurasi jenis kurma lainnya?',
    faqCtaLabel: 'Tanya Admin WA',
    faqWaMessage:
      'Halo Admin Alfaratha, saya punya pertanyaan spesifik seputar kurma & paket oleh-oleh.',
  },
};
