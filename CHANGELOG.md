# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangerot.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> Catatan: CHANGELOG lama berisi klaim yang tidak sesuai kode (mis.
> "Initial Next.js project setup" — aplikasi ini Vite + React, bukan
> Next.js). Riwayat di bawah ditulis ulang dari keadaan repo yang
> sebenarnya per 19 Nov 2026.

## [Unreleased]

### Added
- CI GitHub Actions: build (typecheck + Vite), static-checks (gate P0 +
  tag OG), advisory-sweep OSV (produksi saja), gitleaks riwayat penuh,
  Playwright e2e (desktop + Pixel 7) + tur demo README, smoke dist/.
- `docs/`: DESIGN.md (kontrak arah neo-brutalist + skor gate 7 sumbu),
  ARCHITECTURE.md, TESTING.md, DEPLOY.md, diagrams.html (HTML+SVG).
- `public/compass.svg` (favicon — sebelumnya 404), `public/_redirects`
  (SPA fallback Cloudflare Pages), `public/og-image.png` 1200x630
  (kartu preview PIL, bukan screenshot), `.env.example`.
- Tag Open Graph / Twitter di `index.html` + `lang="id"`.
- README proper + PRD v2.0 (ditulis dari kode aktual, bukan template).
- E2E: alur siswa lengkap, kuis 5 soal sampai hasil, team maker,
  modul, 404, login guru tanpa backend; tur demo (video + screenshot).

### Changed
- **Restructure:** isi `JAKPLUENG - CODEBASE/` (nama ber-spasi) dipindah
  ke root repo; import (`@/`) tidak berubah. `vercel.json` diganti
  `public/_redirects` (deploy ke Cloudflare Pages).
- Nama paket `navigator` → `lidm-jakplueng` (lockfile diselaraskan).
- Ikon emoji di chrome UI (Sidebar, WelcomePage, AdminLoginPage)
  diganti Lucide; emoji tersisa hanya di konten edukasi (lirik, tips,
  label peta 3D) — lihat `docs/DESIGN.md`.
- Script `lint` dihapus — repo tidak pernah punya config ESLint flat
  (ESLint 9), script itu selalu error; gerbangnya `tsc` strict +
  `scripts/check-static.mjs`.

### Fixed
- Pilih kelompok macet selamanya ("Memuat kelompok...") saat Supabase
  tak terjangkau: `fetchGroups` kini try/catch/finally + timeout 8 detik
  + fallback 5 kelompok default.
- Kuis macet di soal terakhir saat simpan gagal: `saveToSupabase` kini
  try/catch; hasil tetap tampil.
- Refleksi macet saat simpan gagal: `submitReflection` kini try/catch;
  kata tetap masuk word cloud lokal.
- Presence realtime macet tanpa backend: `MainLayout.setupPresence`
  kini try/catch; halaman tetap jalan.
- Judul dashboard salah: `TopNavigation` memetakan `/admin`, rute
  aslinya `/dashboard-guru`.
- Teks debug (`isLoading/isTeacher/isStudent`) bocor ke UI loading
  `TeacherRoute`; dihapus.

### Removed
- `src/pages/Dashboard.tsx` — file mati (tidak di-route), berisi embed
  placeholder (`genial.ly/placeholder`, `assemblrworld.com/placeholder`,
  `play.blooket.com/placeholder`).
- `vercel.json`, `.claude/settings.local.json` (pengaturan lokal).
- Media `file/` (mp3/mp4 ±101 MB) **tetap tidak ada** di repo — tidak
  ada kode yang merujuknya (lagu ice-break di-host di Supabase Storage
  proyek); backup tersimpan di luar repo (arsip P2).

## [0.1.0] - 2026-11-04

### Added
- Aplikasi awal: portal microteaching JAK PLUENG! (React 18 + Vite +
  TypeScript + Tailwind, simulator evakuasi 3D, kuis, refleksi,
  dashboard guru Supabase) di subfolder `JAKPLUENG - CODEBASE/`.
- README + PRD template, LICENSE MIT.
