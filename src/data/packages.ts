import { PackageBundle } from '../types';

export const PACKAGE_BUNDLES_DATA: PackageBundle[] = [
  {
    id: 'paket-barokah',
    name: 'Paket Barokah',
    subtitle: 'Solusi Praktis & Ekonomis Suvenir Jamaah',
    isPopular: false,
    boxDescription: 'Dus jinjing eksklusif bermotif ornamen kaligrafi hijau sage & emas lembut.',
    singlePrice: 32000,
    bulkPrice: 25000, // Diskon 22% untuk min 20 dus
    minBulkUnits: 20,
    items: [
      'Kurma Khalas Premium (± 60 gram)',
      'Kismis Kuning Manis (± 30 gram)',
      'Kacang Arab Panggang Gurih (± 30 gram)',
      'Air Zamzam Murni Botol Segel (80 ml)',
    ],
    bonuses: [
      'Box jinjing tebal anti penyok',
      'Plastik pembungkus higienis kedap udara',
    ],
    targetAudience: 'Sangat cocok untuk pembagian suvenir pengajian tasyakuran kepulangan & tetangga perumahan.',
  },
  {
    id: 'paket-madinah',
    name: 'Paket Madinah',
    subtitle: 'Paling Diminati Jamaah — Komposisi Lengkap & Mewah',
    isPopular: true,
    boxDescription: 'Hardbox magnetik / box tenteng mewah berlapis foil emas dengan sekat elegan.',
    singlePrice: 58000,
    bulkPrice: 46000, // Diskon 20.6%
    minBulkUnits: 20,
    items: [
      'Kurma Sukkari Al-Qassim / Ajwa Madinah (± 70 gram)',
      'Kismis Golden Jumbo Pilihan (± 35 gram)',
      'Kacang Pistachio Fandoghi (± 30 gram)',
      'Cokelat Kerikil Khas Makkah (± 35 gram)',
      'Air Zamzam Murni Botol Segel (80 ml)',
    ],
    bonuses: [
      'GRATIS Custom Kartu Ucapan Nama Jamaah Haji/Umroh',
      'Pita satin eksklusif & tag "Haji Mabrur"',
      'Garansi kemasan ganti baru jika rusak di ekspedisi',
    ],
    targetAudience: 'Pilihan utama keluarga jamaah untuk kerabat dekat, rekan kerja, dan tamu kehormatan.',
  },
  {
    id: 'paket-sultan',
    name: 'Paket Sultan VIP',
    subtitle: 'Hampers Premium Buah Tangan Eksekutif & Tokoh',
    isPopular: false,
    boxDescription: 'Box hampers kayu / rigid box beludru eksklusif dengan ornamen laser-cut premium.',
    singlePrice: 165000,
    bulkPrice: 132000, // Diskon 20%
    minBulkUnits: 20,
    items: [
      'Kurma Ajwa Aliyah Madinah VIP Grade A (± 150 gram)',
      'Kacang Almond Panggang & Pistachio Jumbo (± 100 gram)',
      'Madu Asli Habbats / Yaman Khas Arab (100 ml)',
      'Air Zamzam Murni Botol Eksklusif (150 ml)',
      'Sajadah Travel Turkey Premium & Pouch',
      'Tasbih Kayu Kokka Asli 33 Butir',
    ],
    bonuses: [
      'Hardbox mewah dengan pita beludru emas',
      'Kartu ucapan kaligrafi nama & doa pribadi',
      'Paperbag eksklusif Alfaratha Store',
    ],
    targetAudience: 'Dirancang khusus untuk cinderamata pejabat, pimpinan kantor, dan keluarga inti jamaah.',
  },
];
