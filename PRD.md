# PRD — JAK PLUENG! (LIDM 2025)

## 1. Informasi Proyek

| Field | Nilai |
|---|---|
| Nama Proyek | JAK PLUENG! — Portal Microteaching Bahasa Inggris |
| Arti nama | "Jak plueng" (Bahasa Aceh): lari / run / scamper |
| Tech Stack | Vite 5 + React 18 + TypeScript + Tailwind 3 + Supabase |
| Status | Live di Cloudflare Pages (mode demo tanpa backend + mode guru dengan Supabase) |
| Penanggung Jawab | Nabil Aulia Dika (dezzorigin) |
| Versi Dokumen | 2.0 (ditulis ulang dari kode aktual, 19 Nov 2026) |
| Repo | https://github.com/dezzorigin/lidm-jakplueng |
| Live | https://lidm-jakplueng.pages.dev |

## 2. Latar Belakang

LIDM (Lomba Inovasi Digital Mahasiswa) 2025, kategori microteaching:
satu sesi mengajar Bahasa Inggris (±90 menit) untuk materi **Giving &
Following Instructions** dalam konteks bencana alam — gempa, banjir,
tsunami. Kelas butuh media yang membuat siswa *melakukan* instruksi,
bukan hanya membaca: simulasi rute evakuasi 3D, kuis berwaktu, dan
refleksi bersama. Guru butuh kendali sesi (kelompok, kehadiran, skor)
secara realtime dari satu dashboard.

## 3. Masalah yang Diselesaikan

- Instruksi evakuasi dalam Bahasa Inggris terasa abstrak kalau hanya
  dibaca — siswa butuh mempraktikkannya lewat perintah bergerak
  (maju/mundur/belok) di peta 3D.
- Pembagian kelompok manual lambat dan ribut — spin wheel digital
  membaginya dalam hitungan detik dan menyimpannya.
- Guru tidak bisa melihat siapa yang sudah sampai mana — dashboard
  realtime menampilkan kehadiran, progres simulator, skor kuis, dan
  kata refleksi per kelompok.

## 4. Pengguna

| Peran | Cara masuk | Yang dilakukan |
|---|---|---|
| Siswa | Tanpa akun; pilih kelompok 1–5 | 6 langkah belajar + kuis + refleksi |
| Guru | Login Supabase (`/admin/login`) | Buat sesi, spin wheel, pantau live, ekspor |

## 5. Ruang Lingkup

### In Scope
- Alur siswa lengkap (splash → kelompok → 6 modul → refleksi).
- Mode guru: login, sesi, spin wheel, dashboard realtime, ekspor.
- Simulator evakuasi 3D 3 level (gempa, banjir, tsunami).
- Kuis 5 soal berwaktu + penyimpanan hasil.
- Word cloud refleksi realtime.
- Mode demo tanpa backend (semua modul siswa jalan lokal).

### Out of Scope
- Akun siswa / progres antar-sesi (sesi bersifat per pertemuan).
- Pembayaran, notifikasi, atau integrasi LMS.
- Aplikasi mobile native (web responsif saja).

## 6. Fitur & Persyaratan Fungsional

| # | Fitur | Kriteria terima |
|---|---|---|
| F1 | Sambutan + pilih peran | 2 CTA jelas; peta konsep + alur 6 langkah tampil |
| F2 | Splash siswa | Auto-lanjut 4,5 detik atau ketuk untuk skip |
| F3 | Pilih kelompok | 5 kelompok; tanpa backend fallback ke 1–5 (tidak boleh macet loading) |
| F4 | Mission briefing | Peta konsep SVG + tujuan pembelajaran tampil |
| F5 | Spin wheel (guru) | Isi nama → bagi otomatis → hasil tampil + tersimpan |
| F6 | Evacuation video | 2 video (Aceh 2004 vs Jepang) + overlay zoom (Esc menutup) |
| F7 | Tutorial + ice break | Video tutorial YouTube + lagu "Step by Step to Safety" + lirik |
| F8 | Vocabulary lab | Iframe Assemblr AR tampil |
| F9 | Simulator 3D | 3 level; perintah gerak; jebakan; zona aman; posisi terkirim live ke dashboard |
| F10 | Kuis | 5 soal, 20 detik/soal, penjelasan tiap jawaban; hasil tampil walau simpan gagal |
| F11 | Refleksi | 2 pertanyaan; kata masuk word cloud lokal + (kalau tersambung) broadcast ke guru |
| F12 | Dashboard guru | Kehadiran, skor, kata, progres simulator realtime; kunci grup; ekspor docx/pdf |
| F13 | 404 | Rute tak dikenal menampilkan "Halaman Tidak Ditemukan" |

## 7. Persyaratan Non-Fungsional

- **Performa:** build Vite statis; halaman sambutan interaktif < 3 detik
  di koneksi kelas; simulator 3D jalan di laptop standar (SwiftShader
  di CI membuktikan fallback software).
- **Ketahanan offline-backend:** tanpa Supabase, modul siswa tetap jalan
  (fallback lokal + timeout 8 detik di pemuatan kelompok).
- **Keamanan:** rahasia hanya lewat env (`.env` tidak di-commit);
  tidak ada secret di repo (dijaga gitleaks riwayat penuh).
- **Aksesibilitas:** target sentuh ≥44px; tanpa overflow horizontal di
  390px; kontras teks AA di pasangan warna utama.
- **Desain:** neo-brutalist (lihat `docs/DESIGN.md`); ikon fungsi Lucide.

## 8. Arsitektur & Tech Stack

Lihat `docs/ARCHITECTURE.md` (rute, auth, tabel Supabase, diagram di
`docs/diagrams.html`).

## 9. Milestone

| Fase | Status |
|---|---|
| Aplikasi inti (13 rute, simulator 3D, kuis, refleksi) | ✅ Selesai (sebelum Nov 2026) |
| Audit-fix: restructure + fallback tanpa backend + CI + deploy | ✅ 19 Nov 2026 (PR ini) |
| README media asli (screenshot + video demo CI) | ✅ 19 Nov 2026 |
| Verifikasi lagu ice-break di browser sungguhan | ⏳ Follow-up (host Supabase Storage tak menjawab dari VM) |
| Uji kelas live dengan Supabase asli | ⏳ Menunggu jadwal demo |

## 10. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Supabase proyek tidak tersambung saat demo | Mode demo: modul siswa jalan lokal; guru menyiapkan env sebelum kelas |
| Lagu ice-break tidak ter-load (host Storage) | `<audio>` gagal dengan aman; lirik tetap tampil; verifikasi manual sebelum demo |
| Jaringan kelas lambat (YouTube/Assemblr) | Video + AR adalah embed; materi inti (misi, simulator, kuis) lokal |
| Secret ter-commit | `.gitignore` + gitleaks riwayat penuh di CI |

## 11. Kriteria Keberhasilan

- Alur siswa lengkap bisa diselesaikan tanpa backend (dibuktikan e2e CI).
- Kuis 5 soal selesai dan hasil tampil walau penyimpanan gagal.
- CI hijau penuh (build, static-checks, OSV, gitleaks, e2e, smoke).
- Live di Cloudflare Pages: root 200, tag OG lengkap, og-image 200.
- README berisi screenshot + video demo asli.

## 12. Lampiran

- Struktur: lihat README.md · Arsitektur: `docs/ARCHITECTURE.md`
- Desain: `docs/DESIGN.md` · Tes: `docs/TESTING.md` · Deploy: `docs/DEPLOY.md`
- Lisensi: MIT (LICENSE)
