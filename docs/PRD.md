# Product Requirements Document (PRD) — Alfaratha Store Landing Page

## 1. Ringkasan Produk & Identitas Brand

- **Nama Brand:** Alfaratha Store
- **Bidang Usaha:** Pusat Kurma Premium, Kismis, Kacang Arab, Air Zamzam, dan Perlengkapan/Oleh-Oleh Haji & Umroh Lengkap.
- **Tagline Utama:** _"Keberkahan Tanah Suci, Hadir Hangat di Setiap Sajian & Buah Tangan Anda."_
- **Target Audiens:**
  1. Jamaah Haji & Umroh (dan keluarga jamaah) yang mencari paket oleh-oleh praktis tanpa repot membawa beban berlebih di bagasi.
  2. Konsumen harian & keluarga Muslim yang mencari kurma premium (Ajwa, Sukkari, Medjool, Khalas) untuk konsumsi sehat maupun stok bulan Ramadhan.
  3. Reseller / pembeli grosir paket hampers & suvenir pengajian/syukuran.
- **Tujuan Utama (Primary Goal):** Mengonversi pengunjung menjadi pembeli langsung melalui **Pemesanan via WhatsApp (dengan format order otomatis)** serta pengunduhan **Katalog Harga Grosir & Eceran**.

## 2. Arsitektur Halaman & Section (Top-to-Bottom)

### 1. Sticky Glassmorphic Navbar

- **Kiri:** Logo & Wordmark **Alfaratha Store** (dengan ikon aksen bulan sabit/kurma minimalis).
- **Tengah:** Link navigasi halus: `Katalog Produk`, `Paket Oleh-Oleh`, `Keunggulan`, `Testimoni`, `FAQ`.
- **Kanan:** Tombol CTA utama _"Pesan via WhatsApp"_ (dengan ikon WhatsApp + indikator status _Fast Response_).
- **Mobile:** Hamburger menu dengan slide-down drawer yang rapi dan tombol CTA tetap mudah dijangkau jempol.

### 2. Hero Section (Above the Fold)

- **Badge Pengumuman:** _"100% Asli Timur Tengah • Siap Kirim Seluruh Indonesia"_
- **Headline (H1):** _"Sedia Kurma Pilihan & Oleh-Oleh Haji Umroh Lengkap Tanpa Repot."_
- **Sub-headline:** _"Dari Kurma Ajwa Madinah, Kismis Golden, Air Zamzam asli, hingga paket dus oleh-oleh siap bagi. Dikemas higienis, segar dari penyimpanan cold-storage, dan siap antar ke rumah Anda."_
- **Dual CTA:**
  - **Primary CTA:** _"Lihat Katalog & Harga"_ (scroll halus ke section katalog).
  - **Secondary CTA:** _"Konsultasi Paket via WA"_ (membuka modal/link WhatsApp dengan pesan sapaan otomatis).
- **Hero Visual:** Kartu showcase produk unggulan (Kurma Ajwa & Paket Oleh-Oleh Eksklusif) dilengkapi floating trust badges (_"Garansi Keaslian"_, _"Pengiriman Aman & Cepat"_, _"Bisa Grosir & Eceran"_).

### 3. Trust Metrics / Social Proof Bar

- Deretan 4 indikator kepercayaan dalam grid rapi:
  - **100% Produk Original** (Impor resmi dari Madinah, Makkah & Timur Tengah)
  - **10.000+ Paket Terkirim** (Dipercaya jamaah & keluarga di seluruh Indonesia)
  - **Penyimpanan Cold-Storage** (Menjaga kesegaran, kelembutan & rasa alami kurma)
  - **Layanan Packing Siap Bagi** (Praktis untuk suvenir jamaah haji & umroh)

### 4. Katalog Kategori Produk (Interactive Filter Tabs)

- Filter kategori interaktif: `Semua Produk`, `Kurma Premium`, `Kismis & Kacang`, `Air Zamzam & Herbal`, `Paket Oleh-Oleh`.
- Grid kartu produk modern (3 kolom di Desktop, 2 kolom di Tablet, 1 kolom di Mobile). Setiap kartu memuat:
  - Visual/ilustrasi produk + Badge status (_Best Seller_, _Favorit Jamaah_, _Stok Terbatas_).
  - Nama produk (misal: _Kurma Ajwa Aliyah Madinah_, _Kurma Sukkari Al-Qassim_, _Kismis Golden Jumbo_, _Kacang Arab Panggang_, _Air Zamzam Galon 5L_, _Tasbih & Sajadah Travel_).
  - Pilihan kemasan/berat (misal: `250g`, `500g`, `1kg`, `1 Dus`) & estimasi harga.
  - Tombol langsung _"Pesan Produk Ini"_ yang otomatis mengisi nama produk ke dalam format chat WhatsApp.

### 5. Keunggulan Alfaratha Store (Bento Grid Layout)

- Layout **Bento Grid** asimetris (4 kartu) yang menjelaskan alasan memilih Alfaratha Store:
  1. **Kualitas Kurma Terjaga (Cold Storage):** Kurma disimpan pada suhu ideal sehingga daging buah tetap lembut, tidak kering, dan bebas kutu.
  2. **Praktis Tanpa Beban Bagasi:** Jamaah bisa fokus beribadah di Tanah Suci; urusan oleh-oleh kami siapkan dan kirim tepat waktu saat kepulangan.
  3. **Custom Paket Sesuai Budget:** Bebas pilih kombinasi isi dus oleh-oleh (kurma, kismis, kacang arab, cokelat kerikil, air zamzam botol mini).
  4. **Pengiriman Aman Bergaransi:** Menggunakan kardus tebal, bubble wrap berlapis, dan garansi ganti baru jika kemasan rusak saat pengiriman.

### 6. Paket Oleh-Oleh Haji & Umroh (Bundling Tiers)

- Toggle interaktif: **Paket Satuan (Eceran)** vs **Paket Jamaah (Min. 20 Dus — Hemat s/d 20%)**.
- 3 Pilihan Paket Bundling siap bagi:
  - **Paket Barokah (Ekonomis):** Dus tenteng eksklusif berisi Kurma Khalas, Kismis Kuning, Kacang Arab, dan Air Zamzam 80ml.
  - **Paket Madinah (Best Seller — Highlighted):** Box premium motif Islami berisi Kurma Sukkari/Ajwa, Kismis Golden, Cokelat Kerikil, Kacang Pistachio, dan Air Zamzam 80ml + kartu ucapan custom nama jamaah.
  - **Paket Sultan / VIP:** Hampers eksklusif berisi Kurma Ajwa VIP, Kacang Almond/Pistachio, Madu Yaman/Kashmir, Sajadah Travel, dan Tasbih Kayu Kokka.

### 7. Cara Pemesanan Mudah (3-Step Flow)

- **Langkah 1 — Pilih Produk atau Paket:** Tentukan jenis kurma, camilan Timur Tengah, atau paket dus oleh-oleh sesuai kebutuhan.
- **Langkah 2 — Konfirmasi via WhatsApp:** Tim admin kami membantu menghitung total pesanan, opsi kartu ucapan custom, dan ongkos kirim termurah.
- **Langkah 3 — Dikemas & Dikirim ke Rumah:** Pesanan dikemas rapi secara higienis dan dikirim langsung ke alamat Anda atau keluarga.

### 8. Testimoni Pelanggan & Jamaah

- Grid 3 kolom berisi ulasan autentik dari pembeli kurma harian, keluarga jamaah umroh, hingga panitia pengajian yang memesan paket dalam jumlah besar.

### 9. FAQ Accordion

- Pertanyaan yang sering diajukan:
  1. _Apakah Air Zamzam dan Kurma Ajwa di Alfaratha Store dijamin asli?_
  2. _Berapa minimal pemesanan untuk paket dus oleh-oleh haji/umroh?_
  3. _Apakah bisa request kartu ucapan dengan nama jamaah di dalam paket?_
  4. _Bagaimana sistem pengiriman agar kurma tidak rusak atau meleleh di jalan?_
  5. _Apakah melayani pembelian grosir untuk reseller atau acara Ramadhan?_

### 10. Final CTA Banner & Footer

- **CTA Banner:** Ajakan hangat untuk konsultasi stok & pemesanan sebelum keberangkatan/kepulangan ibadah atau menyambut Ramadhan.
- **Footer:** Informasi toko Alfaratha Store, jam operasional admin, alamat/area pengiriman, tautan cepat katalog, dan tombol WhatsApp langsung.

## 3. Non-Functional Requirements

- **Interaktivitas WhatsApp Dinamis:** Buat helper function `generateWhatsAppUrl(productName, variant)` dengan nomor placeholder yang mudah diganti (`6281234567890`) dan pesan terformat rapi dalam Bahasa Indonesia.
- **Performa & Responsivitas:** Optimal di semua ukuran layar (`375px` hingga `1440px`), gambar/ilustrasi menggunakan aspect-ratio tetap agar tidak terjadi Cumulative Layout Shift (CLS).
- **Aksesibilitas:** Semantic HTML5, kontras teks tajam, dan dukungan navigasi keyboard.
