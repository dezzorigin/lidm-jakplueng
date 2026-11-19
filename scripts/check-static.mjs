// check-static.mjs — gate anti-slop P0 + penjaga restructure + link preview,
// dipakai `npm run validate` dan job `static-checks` di CI:
//   1. Tanpa gradient ungu/biru (wash, bukan garis hazard produk),
//      tanpa headline gradient, tanpa font Inter / Roboto,
//      tanpa rounded-2xl/3xl/4xl + shadow-lg/2xl di UI,
//      tanpa statistik vanity palsu, tanpa maximumScale: 1.
//   2. Tanpa emoji mentah di chrome UI (Sidebar/TopNavigation/Drawer/
//      Modal/Button/Card/Badge, WelcomePage, AdminLoginPage,
//      TeacherRoute, StudentGroupPage) — ikon fungsi di sana wajib Lucide.
//      Emoji MASIH BOLEH di konten edukasi (lirik lagu, tips level,
//      label peta 3D, label concept-map): itu data konten, bukan ikon fungsi.
//      Pengecualian ini didokumentasikan di docs/DESIGN.md.
//   3. Tanpa sisa restructure: folder `JAKPLUENG - CODEBASE` di tree;
//      tanpa src/pages/Dashboard.tsx (file mati + embed placeholder);
//      tanpa vercel.json (deploy ke Cloudflare Pages); tanpa file .env
//      yang ter-commit; tanpa secret kasar.
//   4. Link preview (og-preview.md): index.html wajib memuat SEMUA tag
//      og:/twitter: dan public/og-image.png wajib ada (>= 10 KB),
//      plus favicon public/compass.svg wajib ada.
// Keluar 1 bila ada satu saja temuan.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const fail = (msg) => failures.push(msg);

const SRC_FILES = [];
const walk = (dir) => {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'test-results', 'playwright-report', 'docs'].includes(e.name)) walk(p);
    } else if (/\.(tsx?|css|mjs|js|json|html)$/.test(e.name) && !e.name.endsWith('.lock')) {
      SRC_FILES.push(p);
    }
  }
};
walk(join(ROOT, 'src'));
walk(join(ROOT, 'public'));
walk(join(ROOT, 'scripts'));
walk(join(ROOT, 'e2e'));
SRC_FILES.push(join(ROOT, 'package.json'));
SRC_FILES.push(join(ROOT, 'index.html'));
// Checker dikecualikan dari scan sendiri: pola-pola P0 di file ini adalah
// data aturan, bukan UI.
const CHECKER = join(ROOT, 'scripts', 'check-static.mjs');
const SCANNED = SRC_FILES.filter((f) => f !== CHECKER);

// Chrome UI: emoji dilarang (ikon fungsi wajib Lucide, stroke 1.5-2px).
const CHROME_FILES = [
  'src/components/layout/Sidebar.tsx',
  'src/components/layout/TopNavigation.tsx',
  'src/components/layout/Drawer.tsx',
  'src/components/layout/TeacherRoute.tsx',
  'src/components/ui/Button.tsx',
  'src/components/ui/Card.tsx',
  'src/components/ui/Badge.tsx',
  'src/components/ui/Modal.tsx',
  'src/pages/WelcomePage.tsx',
  'src/pages/AdminLoginPage.tsx',
  'src/pages/StudentGroupPage.tsx',
].map((p) => join(ROOT, p));

// linear-gradient() biasa (bukan repeating-*) yang mengandung ungu/biru.
// repeating-linear-gradient adalah motif garis hazard produk (hard-stop
// stripes, bukan wash) dan sengaja dikecualikan.
const P0_CHECKS = [
  [/linear-gradient\((?!.*repeating)[^)]*(violet|purple|indigo|\bblue\b|#6366f1|#818cf8|#7d2ae8|#00c4cc|#4f46e5)/i, 'gradient ungu/biru (wash)'],
  [/bg-clip-text/, 'headline gradient (bg-clip-text)'],
  [/\bfont-family:[^;]*\bInter\b/, 'font Inter'],
  [/\bfont-family:[^;]*\bRoboto\b/, 'font Roboto'],
  [/rounded-2xl|rounded-3xl|rounded-4xl/, 'rounded-2xl/3xl/4xl (radius template)'],
  [/shadow-lg|shadow-2xl/, 'shadow-lg/2xl di permukaan'],
  [/from-(violet|purple|indigo|blue|fuchsia|sky|emerald|teal)-\d+/, 'gradient Tailwind (from-…-…)'],
  [/bg-linear-to-(br|tr|tl|r|b)/, 'gradient linear Tailwind (bg-linear-to-…)'],
  [/\d+x (faster|lebih cepat)|99\.9% uptime|\d+k\+ users/i, 'statistik vanity tanpa sumber'],
  [/maximumScale:\s*1/, 'viewport maximumScale: 1 (melarang zoom)'],
];

for (const f of SCANNED) {
  const raw = readFileSync(f, 'utf-8');
  // Strip komentar (blok + baris penuh) sebelum cek: komentar boleh
  // MENYEBUT pola lama sebagai dokumentasi, bukan menampilkannya.
  const src = raw
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((l) => !l.trim().startsWith('//'))
    .join('\n');
  for (const [re, label] of P0_CHECKS) {
    if (re.test(src)) fail(`${f.replace(ROOT + '/', '')}: ${label}`);
  }
}

// Emoji mentah hanya dilarang di chrome UI (lihat daftar di atas).
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
for (const f of CHROME_FILES) {
  if (!existsSync(f)) continue;
  const raw = readFileSync(f, 'utf-8');
  const src = raw
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((l) => !l.trim().startsWith('//'))
    .join('\n');
  if (EMOJI_RE.test(src)) fail(`${f.replace(ROOT + '/', '')}: emoji mentah di chrome UI (ikon fungsi wajib Lucide)`);
}

// Sisa restructure: subfolder lama + file mati tidak boleh ada di tree.
if (existsSync(join(ROOT, 'JAKPLUENG - CODEBASE'))) fail('JAKPLUENG - CODEBASE/ masih ada — restructure belum bersih');
if (existsSync(join(ROOT, 'src', 'pages', 'Dashboard.tsx'))) fail('src/pages/Dashboard.tsx masih ada — file mati + embed placeholder');
if (existsSync(join(ROOT, 'vercel.json'))) fail('vercel.json masih ada — deploy pindah ke Cloudflare Pages (public/_redirects)');
// Secret kasar di file yang ter-commit.
for (const f of SCANNED) {
  const src = readFileSync(f, 'utf-8');
  if (/(api[_-]?key|secret|password)\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/i.test(src)) {
    fail(`${f.replace(ROOT + '/', '')}: kemungkinan secret ter-commit`);
  }
}
if (existsSync(join(ROOT, '.env'))) fail('.env ter-commit');

// Link preview (og-preview.md): semua tag wajib ada di index.html.
const html = readFileSync(join(ROOT, 'index.html'), 'utf-8');
const OG_TAGS = [
  'og:title', 'og:description', 'og:type', 'og:url', 'og:image',
  'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image',
];
for (const tag of OG_TAGS) {
  if (!html.includes(tag)) fail(`index.html: tag ${tag} tidak ada (og-preview.md)`);
}
if (!html.includes('https://lidm-jakplueng.pages.dev/og-image.png')) {
  fail('index.html: og:image bukan URL absolut lidm-jakplueng.pages.dev/og-image.png');
}
const ogImage = join(ROOT, 'public', 'og-image.png');
if (!existsSync(ogImage)) fail('public/og-image.png tidak ada (og-preview.md)');
else if (statSync(ogImage).size < 10_000) fail('public/og-image.png terlalu kecil — curiga bukan kartu 1200x630');
if (!existsSync(join(ROOT, 'public', 'compass.svg'))) fail('public/compass.svg tidak ada — favicon 404');
if (!html.includes('/compass.svg')) fail('index.html: tidak mereferensikan /compass.svg');
if (!existsSync(join(ROOT, 'public', '_redirects'))) fail('public/_redirects tidak ada — SPA fallback Pages');

if (failures.length > 0) {
  console.error('check-static GAGAL:');
  for (const m of failures) console.error(` - ${m}`);
  process.exit(1);
}
console.log('check-static OK');
