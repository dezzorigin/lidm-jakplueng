# DEPLOY.md — JAK PLUENG!

## Cloudflare Pages (production)

- Proyek: `lidm-jakplueng`
- URL: https://lidm-jakplueng.pages.dev
- Cara deploy: `~/workspace/github-actions/cf_pages.py deploy lidm-jakplueng dist/`
  (token Cloudflare dari vault; jangan minta kredensial di chat).
- Yang di-deploy: isi `dist/` hasil `npm run build` (SPA statis).
- SPA fallback: `public/_redirects` berisi `/* /index.html 200`
  (dibawa Vite ke `dist/_redirects` saat build) — deep link seperti
  `/mission` dan `/evaluation` tidak 404.

## Build lokal

```bash
npm ci
npm run build        # tsc && vite build -> dist/
npm run preview      # vite preview di 127.0.0.1:8580
```

## Variabel lingkungan (opsional)

Salin `.env.example` ke `.env` (tidak di-commit):

```bash
VITE_SUPABASE_URL=https://<proyek>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key proyek>
```

Tanpa keduanya, aplikasi tetap jalan sebagai **demo tanpa backend**
(lihat `docs/ARCHITECTURE.md` — mode demo): modul siswa tampil dan
berfungsi lokal; login guru + dashboard realtime + penyimpanan skor/
refleksi butuh proyek Supabase asli dengan tabel `sessions`, `groups`,
`student_presence`, `quiz_results`, `reflections` (skema di
`docs/ARCHITECTURE.md`).

## Verifikasi live

```bash
python3 scripts/verify-live.py https://lidm-jakplueng.pages.dev
```

Yang dicek: `/` 200 + 9 tag og:/twitter: + og:image absolut;
`/og-image.png` 200 + `image/*`; `/compass.svg` 200; `/mission` 200
(SPA fallback); bundle JS 200 + marker `JAK PLUENG!`.

## Catatan

- Proyek ini **bukan** deploy Vercel: `vercel.json` lama sudah dihapus.
- Media `file/` (mp3/mp4 `Step_by_Step_to_Safety` + `tes.mp4`, total
  ±101 MB) **sengaja tidak ada** di repo — tidak ada satu pun kode yang
  merujuknya (lagu ice-break di-host di Supabase Storage proyek, bukan
  file lokal). Backup-nya tersimpan di luar repo (arsip P2).
  Jangan mengembalikan file-file itu ke repo tanpa keputusan koordinator.
