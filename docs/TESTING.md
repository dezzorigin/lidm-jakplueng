# TESTING.md — JAK PLUENG!

## Cara menjalankan

```bash
npm ci
npm run typecheck   # tsc --noEmit (strict)
npm run validate    # gate P0 + tag OG + favicon + SPA fallback
npm run build       # tsc && vite build
npm run smoke       # build + vite preview + cek HTTP lokal (port 8580)
```

E2E Playwright **hanya di CI** (browser tidak bisa jalan di VM dev):

```bash
npm install --no-save @playwright/test@1.55.0   # TIDAK di package.json
npx playwright install --with-deps chromium      # hanya di CI
npx playwright test                              # desktop + Pixel 7
```

## Yang diuji (e2e/app.spec.ts)

Tanpa env Supabase — semua alur memakai fallback lokal:

| Tes | Yang dibuktikan |
|---|---|
| Landing | Hero + 2 CTA + alur 6 langkah tampil |
| Tag OG | 9 tag og:/twitter: + og:image absolut di HTML |
| og-image + favicon | `/og-image.png` 200 + `image/*`, `/compass.svg` 200 |
| Mobile 390px | Tanpa overflow horizontal |
| Alur siswa | Splash → pilih kelompok → misi + sidebar + "Kelompok 1" |
| Kuis | 5 jawaban benar → "Jawaban Terkirim!" (simpan gagal diam-diam, hasil tetap tampil) |
| Team maker | Isi 6 nama → bagi otomatis → "Kelompok 1" tampil |
| Halaman modul | Video, tutorial, vocab, refleksi tampil |
| 404 | Rute tidak dikenal → "Halaman Tidak Ditemukan" |
| Login guru tanpa backend | Submit → tetap di `/admin/login`, tombol bisa diklik lagi (tidak hang, tidak lolos) |

## Tur demo README (e2e/demo.spec.ts)

Satu tes desktop (1280×720, `video: 'on'`) yang menelusuri sambutan →
splash → kelompok → misi → simulator → kuis → team maker, menyimpan
`screenshot` ke `demo/shot-*.png` dan merekam `video.webm`. CI merakit
`demo/demo.mp4` (H.264 via `ffmpeg-static`) dan mengunggahnya sebagai
artifact `readme-demo`. Media final dikomit ke `docs/screenshots/` dan
`docs/demo/` lalu dirujuk README.

Catatan: tirai menutup layar ±1,9 detik tiap navigasi — screenshot
diambil setelah heading tampil + jeda 2 detik.

## Yang TIDAK diuji (dan kenapa)

- **Login guru sungguhan + dashboard realtime**: butuh proyek Supabase
  asli + akun guru; tidak ada kredensial di repo/CI. Diuji manual saat
  demo kelas (lihat `docs/DEPLOY.md`).
- **Lagu "Step by Step to Safety"**: file-nya di-host di Supabase
  Storage proyek (`xvnygipwhrzkjqjhkujt.supabase.co/.../Step_by_Step_to_Safety.mp4`)
  — dari VM dev, host itu tidak menjawab (egress memutus koneksi), jadi
  statusnya **belum terverifikasi**; `<audio>` yang gagal load tidak
  merusak halaman (tombol play menangani error). Verifikasi di browser
  sungguhan sebelum demo kelas.
- **Video YouTube** (tutorial + 2 video bencana): embed eksternal;
  e2e hanya memeriksa kartu/judul tampil, bukan isi iframe.
- **Simulator 3D piksel-demi-piksel**: e2e hanya memeriksa halaman
  termuat + heading; rendering WebGL bergantung GPU runner.

## CI (`.github/workflows/ci.yml`)

| Job | Isi |
|---|---|
| `build` | `npm ci` → typecheck → vite build |
| `static-checks` | `npm run validate` (tanpa install) |
| `advisory-sweep` | OSV batch atas dependensi produksi; HIGH/CRITICAL = gagal |
| `gitleaks` | Scan secret riwayat penuh (fetch-depth 0) |
| `playwright-e2e` | E2E + rakit video demo + upload artifact `readme-demo` |
| `smoke` | Build + `npm run smoke` (cek HTTP dist/) |

## Temuan audit yang diperbaiki PR ini

1. **Pilih kelompok macet tanpa backend** — `fetchGroups` tanpa
   try/catch: query Supabase yang reject membuat `setLoading(false)`
   tidak pernah jalan. Diperbaiki: try/catch/finally + timeout 8 detik.
2. **Kuis macet di soal terakhir tanpa backend** — `saveToSupabase`
   tanpa try/catch: reject membuat fase hasil tidak tampil. Diperbaiki.
3. **Refleksi macet tanpa backend** — `submitReflection` tanpa
   try/catch: kata tidak masuk word cloud. Diperbaiki.
4. **Presence macet tanpa backend** — `MainLayout.setupPresence`
   tanpa try/catch (unhandled rejection). Diperbaiki.
5. **Judul dashboard salah** — `TopNavigation` memetakan `/admin`,
   rute aslinya `/dashboard-guru`. Diperbaiki.
6. **Favicon 404** — `index.html` merujuk `/compass.svg` yang tidak
   ada. Dibuat `public/compass.svg`.
7. **Teks debug bocor ke UI** — `TeacherRoute` menampilkan
   `isLoading/isTeacher/isStudent` mentah saat loading. Dihapus.
8. **File mati + placeholder** — `src/pages/Dashboard.tsx` tidak
   di-route dan berisi embed placeholder. Dihapus.
9. **Ikon emoji di chrome UI** — Sidebar/WelcomePage/AdminLoginPage
   memakai emoji sebagai ikon fungsi; diganti Lucide.
10. **Script `lint` rusak** — ESLint 9 tanpa config flat; dihapus,
    gerbangnya `tsc` strict + `check-static.mjs`.
