# PRD — Modul POS & Inventory Terintegrasi (Alfaratha Store)

## 1. Tujuan & Arsitektur Sistem

Mengintegrasikan Landing Page publik (`/`), halaman Login (`/login`), dan Dashboard Internal (`/admin/pos`, `/admin/inventory`, `/admin/transactions`) dalam satu aplikasi React + TypeScript menggunakan `react-router-dom`[cite: 1, 2].

## 2. Alur Autentikasi & Navigasi

- **Akses Publik (`/`):** Tetap menampilkan Landing Page Alfaratha Store[cite: 2]. Tambahkan tombol/ikon kecil _"Staff Login"_ di area Footer (atau pojok kanan atas yang tidak mengganggu konversi pembeli) menuju `/login`.
- **Halaman Login (`/login`):**
  - Desain kartu minimalis di tengah layar dengan latar `#F8FAF9` dan tombol `#3A6B5C`[cite: 3].
  - Input Email/Username & Password + tombol _"Masuk Demo Kasir"_ (untuk kemudahan testing lokal sebelum dihubungkan ke backend/Supabase).
  - Proteksi route (`ProtectedRoute`): Mengarahkan user yang belum login kembali ke `/login` jika mengakses `/admin/*`.

## 3. Fitur Utama Modul POS (Kasir) — `/admin/pos`

1. **Katalog Kasir Real-Time:**
   - Mengambil sumber data produk yang sama dengan Landing Page (sehingga jika stok habis di POS, status di Landing Page otomatis berubah menjadi _"Stok Habis"_).
   - Pencarian cepat berdasarkan nama produk/SKU dan filter kategori[cite: 2].
2. **Keranjang & Perhitungan Otomatis:**
   - Tambah produk ke keranjang, atur jumlah (`+` / `-`), dan validasi agar jumlah beli tidak melebihi sisa stok di gudang.
   - **Mode Harga:** Toggle cepat antara harga **Eceran** dan **Harga Jamaah/Grosir** (otomatis diskon 15–20% untuk paket dus minimal 20 pcs)[cite: 2].
   - **Kalkulasi Pembayaran:** Pilihan metode (`Tunai`, `QRIS`, `Transfer`), input uang diterima (khusus Tunai) dengan perhitungan **Uang Kembalian** otomatis.
3. **Checkout & Cetak Struk Digital:**
   - Saat klik _"Selesaikan Transaksi"_:
     1. Stok masing-masing produk otomatis berkurang.
     2. Riwayat transaksi tersimpan ke log transaksi.
     3. Muncul modal **Struk Digital (Receipt)** yang siap dicetak (`window.print()`) atau dikirim ke WhatsApp pelanggan.

## 4. Fitur Utama Modul Inventory — `/admin/inventory`

1. **Ringkasan KPI Stok:** Total SKU, Total Unit Tersedia, Indikator Stok Menipis (`stok <= 5`), dan Estimasi Nilai Aset Stok.
2. **Manajemen Produk & Varian:**
   - Tambah produk baru, edit harga/kategori, dan hapus produk.
   - Atribut khusus Alfaratha Store: **Kategori**, **Varian Kemasan** (`250g`, `500g`, `1kg`, `1 Dus`, `Galon 5L`), **Lokasi Penyimpanan** (`Cold-Storage` vs `Gudang Kering`), dan **Tanggal Kadaluarsa (Expired Date)**[cite: 2].
3. **Stock Adjustment (Stok Masuk / Keluar):**
   - Modal cepat untuk mencatat _Restock Supplier_ (menambah stok) atau _Stok Rusak/Retur_ (mengurangi stok) lengkap dengan catatan riwayat perubahan stok.

## 5. Riwayat Transaksi — `/admin/transactions`

- Tabel daftar penjualan harian/bulanan (No. Invoice, Waktu, Kasir, Daftar Item, Metode Bayar, Total Nominal) dengan tombol lihat ulang struk dan export CSV.

## 6. Persistensi Data (State Management)

- Gunakan `React Context` (`StoreContext`) yang tersinkronisasi dengan `localStorage` (dan siap dihubungkan ke Supabase) agar seluruh perubahan stok dari POS langsung ter-update di halaman Inventory maupun Landing Page meskipun halaman di-refresh.
