# ARCHITECTURE.md — JAK PLUENG!

## Ringkasan

JAK PLUENG! adalah portal microteaching Bahasa Inggris (LIDM 2025) untuk
materi **Giving & Following Instructions** dalam konteks bencana alam
(gempa, banjir, tsunami). Dua peran: **guru** (login Supabase, dashboard
realtime) dan **siswa** (tanpa akun — pilih kelompok 1–5, sesi di
`sessionStorage`).

## Stack

| Lapisan | Teknologi |
|---|---|
| Build | Vite 5 + plugin React |
| UI | React 18 + TypeScript (strict) + Tailwind CSS 3 + PostCSS |
| Routing | React Router DOM 6 (BrowserRouter) |
| State | Zustand (simulator 3D), React Context (Auth, Curtain) |
| 3D | React Three Fiber 8 + Drei 9 + Three.js 0.169 |
| Animasi | Framer Motion 11 + animasi CSS |
| Backend | Supabase (Auth, Postgres, Realtime broadcast) — **opsional** |
| Ekspor | `docx` + `file-saver` (TeamMaker), `jspdf` + autotable (laporan) |

## Rute

| Path | Halaman | Keterangan |
|---|---|---|
| `/` | WelcomePage | Pilih peran (guru/siswa) + peta konsep + alur 6 langkah |
| `/admin/login` | AdminLoginPage | Login/daftar guru (Supabase Auth) |
| `/student/login` | StudentLoginPage | Splash + tirai, auto-lanjut 4,5 detik / ketuk untuk skip |
| `/student/group` | StudentGroupPage | Pilih kelompok 1–5 |
| `/dashboard-guru` | AdminDashboard | **Guru saja** (`TeacherRoute`); monitoring realtime |
| `/mission` (+`/:toolId`) | MissionBriefing | Peta konsep + tujuan pembelajaran |
| `/vocabulary` | VocabularyLab | Iframe Assemblr AR + kosakata |
| `/simulator` | Simulator | Simulator evakuasi 3D (gempa/banjir/tsunami) |
| `/evaluation` | Evaluation | Kuis 5 soal, 20 detik/soal, simpan ke `quiz_results` |
| `/teammaker` | TeamMaker | Spin wheel + bagi kelompok + simpan ke `groups` |
| `/video` | DisasterVideo | 2 video YouTube (Aceh 2004 vs Jepang) + overlay zoom |
| `/tutorial` | TutorialIceBreak | Video tutorial YouTube + lagu "Step by Step to Safety" |
| `/reflection` | ReflectionPage | Refleksi 2 pertanyaan + word cloud fisika realtime |
| `*` | 404 | Halaman tidak ditemukan (dalam MainLayout) |

Catatan: rute dashboard guru adalah `/dashboard-guru` (bukan `/admin` —
dokumen lama yang menyebut `/admin` sudah basi; `TopNavigation` sudah
diperbaiki di PR ini).

## Auth & sesi

- `AuthContext`: `supabase.auth.getSession()` + `onAuthStateChange`.
  `isTeacher = !!user`. `isStudent = !user && studentGroup !== null`.
- `studentGroup` disimpan di `sessionStorage` (`studentSession.ts`).
- `TeacherRoute`: loading → "Memuat Dashboard..."; bukan guru → alihkan
  ke `/admin/login`; siswa → alihkan ke `/student/group`.

## Supabase (tabel + channel)

| Tabel | Dipakai oleh |
|---|---|
| `sessions` (`id`, `teacher_id`, `is_active`, `groups_locked`) | Login guru, semua simpan |
| `groups` (`session_id`, `group_number`, `members`, `is_locked`) | TeamMaker, AdminDashboard |
| `student_presence` (`session_id`, `group_number`, `current_page`, `last_seen`) | MainLayout (presence), AdminDashboard |
| `quiz_results` (`session_id`, `group_number`, `score`, `answers`, `percentage`, `completed_at`) | Evaluation → AdminDashboard |
| `reflections` (`session_id`, `group_number`, `q1_answer`, `q2_word`, `submitted_at`) | ReflectionPage → AdminDashboard |

Channel realtime: `presence-session-<id>` (presence), `tracking-channel`
(broadcast `simulation_update` dari Simulator), `reflection-channel`
(broadcast `word_submit`), plus channel admin `admin-presence`,
`admin-groups`, `admin-quiz`, `admin-reflections` (postgres changes).

## Tanpa backend (mode demo)

Tanpa `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, client memakai
placeholder (`supabaseClient.ts`) dan semua tulis/baca Supabase
**gagal diam-diam dengan fallback lokal** — ini perilaku yang dijaga
PR ini (lihat `docs/TESTING.md`):

- Pilih kelompok: fallback 5 kelompok default (timeout 8 detik).
- Kuis: skor tetap tampil di layar hasil walau `quiz_results` gagal simpan.
- Refleksi: kata tetap masuk word cloud lokal walau `reflections` gagal.
- Presence: channel gagal setup, halaman tetap jalan.
- Login guru: gagal dengan pesan error Supabase, tetap di `/admin/login`.

Fitur guru (dashboard realtime, spin wheel tersimpan, rekap skor) butuh
proyek Supabase asli — lihat `.env.example` + `docs/DEPLOY.md`.

## Struktur direktori

```
index.html            shell SPA + tag OG/Twitter
public/
  compass.svg         favicon (dibuat PR ini — sebelumnya 404)
  og-image.png        kartu preview 1200x630 (PIL, bukan screenshot)
  _redirects          SPA fallback Cloudflare Pages
src/
  main.tsx            entry React
  App.tsx             router + provider (Curtain, Auth)
  index.css           Tailwind + token brutalist + keyframes
  components/
    3d/               Avatar, Environment, MapGrid (peta 3D per level)
    layout/           MainLayout, Sidebar, TopNavigation, Drawer, TeacherRoute
    ui/               Badge, Button, Card, ConceptMap, InstructionPanel,
                      LevelLoadingScreen, LoadingSpinner,
                      MastermindsCarousel, Modal, PhysicsWordCloud
  context/            AuthContext, CurtainContext (tirai panggung)
  lib/                supabaseClient, studentSession
  pages/              13 halaman (lihat tabel rute)
  store/              useSimulationStore (Zustand)
  types/              tipe bersama
e2e/                  Playwright (app + tur demo README)
scripts/              advisory-sweep, check-static, make-og-image,
                      smoke, verify-live
docs/                 DESIGN, ARCHITECTURE, TESTING, DEPLOY, diagrams
```

## Keputusan restructure (PR ini)

- Subfolder `JAKPLUENG - CODEBASE/` (nama ber-spasi) dipindah ke root
  repo; isi file + import tidak berubah (`@/` tetap menunjuk `src/`).
  GitHub menampilkan perpindahan sebagai rename (deteksi kemiripan).
- Dihapus: `src/pages/Dashboard.tsx` (file mati, tidak di-route, berisi
  embed placeholder `genial.ly/placeholder`, `assemblrworld.com/placeholder`,
  `blooket.com/placeholder`), `vercel.json` (diganti `public/_redirects`),
  `.claude/settings.local.json` (pengaturan lokal).
- `package.json`: nama paket `navigator` → `lidm-jakplueng` (lockfile
  diselaraskan); script `lint` dihapus — repo tidak pernah punya config
  ESLint flat (ESLint 9), script itu selalu error; gerbangnya `tsc`
  strict + `check-static.mjs`.
- Lihat `diagrams.html` untuk diagram arsitektur + alur.
