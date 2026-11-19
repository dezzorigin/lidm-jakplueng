// smoke.mjs — verifikasi build produksi (persis yang di-deploy):
// `vite preview` di port 8583 (jatah worker lidm-jakplueng), lalu cek
// / (200 + tag og:), /og-image.png (200 + image/*), /compass.svg (200),
// /assets/*.js hasil build termuat (200 + marker produk asli).
// Hanya GET lokal. Pola #29: curl -o file lalu grep file (tanpa pipefail).
// Prasyarat: `npm run build` sudah jalan (dist/ ada).
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

if (!existsSync(join(ROOT, 'dist', 'index.html'))) {
  console.error('smoke: dist/index.html tidak ada — jalankan `npm run build` dulu.');
  process.exit(1);
}

const PORT = 8583;
const srv = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'], {
  cwd: ROOT,
  stdio: 'ignore',
});

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const tmp = mkdtempSync(join(tmpdir(), 'lidmjakplueng-smoke-'));

async function get(path, label) {
  const out = join(tmp, label.replace(/\W+/g, '_'));
  const code = execFileSync('curl', ['-sS', '-o', out, '-w', '%{http_code}', '--max-time', '60', `http://127.0.0.1:${PORT}${path}`], { stdio: 'pipe' }).toString().trim();
  return { code, body: readFileSync(out, 'utf-8') };
}

async function head(path, label) {
  const out = execFileSync('curl', ['-sS', '-I', '--max-time', '60', `http://127.0.0.1:${PORT}${path}`], { stdio: 'pipe' }).toString();
  return out;
}

const check = (cond, msg) => { if (!cond) failures.push(msg); };

try {
  await wait(4000);
  const home = await get('/', 'home');
  check(home.code === '200', `/ -> HTTP ${home.code}`);
  // dist/index.html adalah shell SPA: headline tinggal di bundle JS
  // (render client-side), bukan di HTML. Cek tag OG di HTML + marker di bundle.
  for (const tag of ['og:title', 'og:description', 'og:type', 'og:url', 'og:image', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
    check(home.body.includes(tag), `/ tidak mengandung tag ${tag} (og-preview.md)`);
  }
  check(home.body.includes('https://lidm-jakplueng.pages.dev/og-image.png'), '/ og:image bukan URL absolut lidm-jakplueng.pages.dev/og-image.png');
  check(home.body.includes('/compass.svg'), '/ tidak mereferensikan favicon compass.svg');

  const ogHead = await head('/og-image.png', 'og');
  check(/HTTP\/[\d.]+ 200/.test(ogHead), `/og-image.png -> bukan 200:\n${ogHead.slice(0, 300)}`);
  check(/content-type: image\//i.test(ogHead), `/og-image.png -> content-type bukan image/*:\n${ogHead.slice(0, 300)}`);

  const fav = await get('/compass.svg', 'favicon');
  check(fav.code === '200', `/compass.svg -> HTTP ${fav.code}`);

  const js = home.body.match(/\/assets\/index-[^"']+\.js/);
  check(!!js, '/ tidak mereferensikan bundle JS hasil build');
  if (js) {
    const bundle = await get(js[0], 'bundle');
    check(bundle.code === '200', `${js[0]} -> HTTP ${bundle.code}`);
    check(bundle.body.includes('JAK PLUENG!'), 'bundle JS tidak mengandung marker produk JAK PLUENG!');
    check(bundle.body.includes('Peta Konsep'), 'bundle JS tidak mengandung marker modul Peta Konsep');
  }
} finally {
  // Matikan server via PID, BUKAN pkill -f (pelajaran #36: pola pkill
  // bisa membunuh shell exec sendiri).
  srv.kill('SIGTERM');
}

if (failures.length > 0) {
  console.error('smoke GAGAL:');
  for (const m of failures) console.error(` - ${m}`);
  process.exit(1);
}
console.log('smoke OK');
