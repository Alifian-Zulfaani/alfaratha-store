# Design System & Visual Guidelines (DESIGN_SYSTEM.md)

## 1. Aesthetic Direction

- **Tema Utama:** Calm Organic Modernism (_Cool & Quiet Luxury_).
- **Aturan Warna Ketat:** DILARANG menggunakan warna hijau neon/cerah standar seperti `green-500` atau `emerald-500`. Gunakan selalu kode hex custom (`#3A6B5C`, `#F8FAF9`, `#E6EFEA`) atau kelas Tailwind `stone`/`slate` netral dengan saturasi rendah agar tampilan tetap tenang, dewasa, dan premium.
- **Shadow & Depth:** Hindari drop-shadow hitam pekat. Gunakan shadow sangat halus (`shadow-[0_4px_20px_-2px_rgba(24,34,30,0.05)]`) dipadukan dengan border tipis `1px solid #E2E8E5`.

## 2. Color Palette (Cool, Calm & Modern Sage)

- **Background Primary:** `bg-[#F8FAF9]` (Cool Off-White / Mist White — bersih, adem, dan tidak menyilaukan mata)
- **Background Secondary / Surface:** `bg-white` dan `bg-[#F1F5F3]` (Soft Sage Tint untuk kartu atau section selang-seling)
- **Border Subtle:** `border-[#E2E8E5]` (Garis batas tipis bernuansa abu-kehijauan yang halus)
- **Text Primary:** `text-[#18221E]` (Deep Charcoal-Forest — lebih lembut dan modern dibanding hitam pekat `#000000`)
- **Text Secondary:** `text-[#52605A]` (Muted Slate-Sage untuk deskripsi dan sub-headline)
- **Brand Primary (Calm Sage / Eucalyptus):**
  - Default Button / Highlight: `bg-[#3A6B5C]` (Muted Eucalyptus Green — tenang, elegan, dan tidak mencolok)
  - Hover State: `hover:bg-[#2E5649]`
  - Soft Badge / Pill Surface: `bg-[#E6EFEA]` dengan teks `text-[#2C5246]`
- **Brand Secondary / Accent (Soft Sand / Muted Gold):**
  - Aksen halus untuk badge _Best Seller_ atau detail kurma: `bg-[#F5EFE6]` dengan teks `text-[#8C6D46]` (Muted Sand/Champagne — menjaga kesan hangat produk Timur Tengah tanpa merusak ketenangan palet hijau).
- **Gradient Highlight:** `bg-gradient-to-r from-[#2E5649] via-[#3A6B5C] to-[#5B8A7B] bg-clip-text text-transparent`

## 3. Typography

- **Font Family:** `Plus Jakarta Sans` atau `Inter` (import via Google Fonts di `index.html`).
- **Scale & Hierarchy:**
  - Hero H1: `text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]`
  - Section H2: `text-3xl sm:text-4xl font-bold tracking-tight`
  - Card Title H3: `text-lg sm:text-xl font-semibold`
  - Body Text: `text-base sm:text-lg text-[#52605A] leading-relaxed`

## 4. Spacing & Layout Grid

- **Max Container Width:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Vertical Section Padding:** `py-20 lg:py-28`
- **Border Radius:**
  - Buttons & Inputs: `rounded-xl`
  - Cards & Bento Boxes: `rounded-2xl`
  - Badges/Pills: `rounded-full`

## 5. Micro-Interactions & Motion

- Gunakan `framer-motion` dengan prinsip _subtle & snappy_:
  - Entrance reveal: `initial={{ opacity: 0, y: 16 }}` -> `whileInView={{ opacity: 1, y: 0 }}` dengan `viewport={{ once: true, amount: 0.2 }}`.
  - Hover state pada kartu: transisi border halus (`hover:border-[#3A6B5C]/40 transition-colors duration-200`).
  - Hindari animasi berlebih yang membuat layar terasa berat atau lambat.
