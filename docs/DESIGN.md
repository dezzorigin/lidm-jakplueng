# DESIGN.md — JAK PLUENG!

Kontrak arah desain produk (ditulis sebelum perubahan UI PR audit-fix,
mengikuti `~/workspace/github-actions/ui-anti-slop.md`).

## Referensi

Bahasa desain produk ini **diwarisi dari repo asli** (bukan diciptakan ulang
di PR ini): neo-brutalism poster kelas — border hitam tebal, bayangan keras
tanpa blur, blok warna datar, tipografi berat. Dicek terhadap referensi luar:

- **Neubrutalism — The Definitive Guide** (https://neubrutalism.com/) —
  pemenang: resepnya persis bahasa produk (thick outlines, hard shadows,
  flat high-contrast color, oversized type, square corners).
- **Neo Brutalism Web Design: CSS Recipe** (https://www.gleamstudio.design/blog-post/neo-brutalism) —
  bayangan signature `4px 4px 0 #000`, tanpa blur; hitam di atas kuning
  lolos kontras, putih di atas biru terang tidak.
- **Neubrutalism — aesthetic.fyi** (https://aesthetic.fyi/neubrutalism/) —
  "color collides, it doesn't blend": warna dipakai sebagai blok,
  bukan gradient.

Yang diubah dari referensi: tidak ada — rasa desain dipertahankan plek,
yang diperbaiki hanya cacatnya (ikon emoji di chrome diganti Lucide,
judul dashboard yang salah rute, loading debug yang bocor ke UI).

## Palet (6 warna bernama + peran)

| Warna | Hex | Peran |
|---|---|---|
| Kertas | `#FFFEF7` | Latar utama semua halaman |
| Tinta | `#1A1A2E` | Border 4px, teks, bayangan keras, mode gelap panel |
| Kuning sinyal | `#FFE135` | Aksi utama, sorotan, latar sidebar |
| Koral | `#FF6B6B` | Bahaya / gempa / urgensi, aksen hover CTA guru |
| Mint | `#4ECDC4` | Aman / tsunami (air tenang) / sukses sekunder |
| Langit | `#74C0FC` | Info / banjir, aksen kartu tutorial |

Satu warna = satu tugas; tidak ada warna yang hanya hiasan tanpa peran.
Tidak ada gradient ungu/biru; dua gradient hangat yang tersisa adalah
motif produk sendiri (cover lagu + garis hazard diagonal kuning-kertas),
bukan wash latar.

## Tipografi (2 keluarga)

- **Display + body: Nunito 400–900** (Google Fonts) — bulat, tebal,
  rasa poster kelas; heading `font-black` + tracking ketat.
- **Data/label: JetBrains Mono 400–500** — kicker, badge, angka timer
  (tabular, tidak goyang saat detik berjalan).

## Layout (1 kalimat + 1 detail khas)

Satu kalimat: **poster kelas yang bisa diklik** — hero kuning garis
hazard diagonal, lalu modul-modul sebagai kartu ber-border tebal dengan
sidebar kuning tetap di kiri.

Detail khas: **tirai panggung** (`CurtainContext`) — tiap perpindahan
halaman ditutup tirai garis warna (kuning–koral–mint–langit–lavender),
seperti tirai panggung microteaching; dan **bayangan keras**
`4px/6px/8px 0 #1A1A2E` di semua permukaan (tombol tertekan = bayangan
mengecil, bukan membesar).

## Aturan yang dijaga

- Larangan P0: tanpa gradient ungu/biru, tanpa headline gradient, tanpa
  Inter/Roboto, tanpa hero tengah + 3 kartu identik, tanpa statistik
  vanity (angka yang tampil adalah data asli: 5 soal, 20 detik/soal,
  6 langkah, ±90 menit — semua dari materi), tanpa `rounded-2xl`/
  `shadow-lg` di permukaan.
- Ikon fungsi = Lucide satu bobot (stroke 2.25). Pengecualian
  terdokumentasi: emoji **hanya** di konten edukasi (lirik lagu,
  tips level, label peta 3D, label concept-map 🔊) — itu data konten,
  bukan ikon fungsi; menggantinya akan mengubah materi ajar. Chrome UI
  (Sidebar, TopNavigation, WelcomePage, AdminLoginPage, TeacherRoute,
  StudentGroupPage) **nol emoji** — dijaga `scripts/check-static.mjs`.
- State interaktif lengkap: hover (geser −1px + bayangan membesar),
  active (scale 0.96–0.97), disabled (opacity 0.5–0.6), loading
  (spinner/pulse), focus-visible (ring hitam 2px).
- Mobile 390px: tanpa overflow horizontal (dicek e2e), target sentuh
  ≥44px (tombol kelompok 160px, tombol aksi full-width).
- `prefers-reduced-motion`: animasi tirai + confetti memakai
  `transition` CSS standar; halaman tetap terbaca tanpa animasi
  (konten tidak bergantung pada animasi untuk tampil).

## Beda dari #52 vintage-memories-scrapbook (≥3 dari 5 sumbu)

| Sumbu | #52 | JAK PLUENG! (repo ini) |
|---|---|---|
| Palet | Kertas `#f4ebd8`, marun, burgundy, emas | Kertas `#FFFEF7`, tinta `#1A1A2E`, kuning sinyal `#FFE135`, koral, mint, langit |
| Tipografi | Great Vibes + Playfair + Courier Prime | Nunito 900 + JetBrains Mono |
| Layout | Scrapbook 5 lembar, amplop, foto miring | Portal app: sidebar + modul, hero garis hazard |
| Radius/spacing | Radius 2px, bingkai foto tebal | Radius 0 (kotak) / `rounded-lg` kecil, bayangan keras 4–8px |
| Detail khas | Perangko + segel lilin | Tirai panggung + stempel angka kelompok |

## Gate 7 sumbu (nilai sebelum merge)

| Sumbu | Nilai | Catatan |
|---|---|---|
| 1. Anti-slop purity | 4 | Nol P0 + nol orde-kedua; −1 karena emoji masih ada di konten edukasi (terdokumentasi di atas) |
| 2. UX speed & 1-to-3 | 5 | 1 aksi utama per viewport (2 CTA di hero = pilihan peran, bukan 2 aksi); maks 3 sekunder |
| 3. Tipografi | 5 | ≤2 font; angka timer mono tabular; body ≤75ch |
| 4. Spacing & geometri | 4 | Grid 4/8pt; padding kartu ≥16px; radius dalam = radius luar − padding di kartu brutal |
| 5. Motion | 4 | <200ms di interaksi (100–150ms); tirai 700–900ms adalah transisi halaman, bukan aksi 100x/hari; active scale 0.96–0.97 |
| 6. A11y | 4 | Focus ring, aria-hidden ikon dekoratif, tag semantik (header/nav/main/h1); −1: kontras teks abu-abu sekunder di beberapa caption |
| 7. Mobile | 5 | Stack vertikal rapi, tanpa scroll horizontal (dicek e2e 390px) |

## Tes siluet

Thumbnail hitam-putih landing: hero kuning garis hazard + judul raksasa
+ 2 tombol hitam/kuning + stempel sudut warna — langsung ketahuan ini
portal kelas/game edukasi, bukan landing SaaS generik.
