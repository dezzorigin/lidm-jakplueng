import { test, expect } from '@playwright/test';

// E2E JAK PLUENG!: landing → alur siswa (splash → pilih kelompok → misi)
// → kuis 5 soal sampai hasil → team maker → halaman modul → login guru
// tanpa backend (tanpa env Supabase: fallback lokal kelompok 1-5,
// penyimpanan skor/refleksi gagal diam-diam, UI tetap jalan).
// Tirai (curtain) menutup layar ±1,9 detik tiap navigasi — semua ekspektasi
// memakai timeout Playwright, bukan sleep buta.

async function enterAsStudent(page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'JAK PLUENG!' }).first()).toBeVisible();
  await page.getByRole('button', { name: /Masuk sebagai Siswa/ }).click();
  // Splash: klik tengah layar untuk skip (kalau tidak, auto-lanjut di 4,5 detik).
  const vp = page.viewportSize() ?? { width: 1440, height: 900 };
  await page.mouse.click(vp.width / 2, vp.height / 2);
  await expect(page.getByRole('heading', { name: /Pilih Kelompokmu/ })).toBeVisible({ timeout: 20_000 });
  await page.getByRole('button', { name: '1 Kelompok' }).click();
  await expect(page.getByRole('heading', { name: /Peta Konsep/ })).toBeVisible({ timeout: 20_000 });
}

test.describe('landing', () => {
  test('hero + 2 CTA + alur 6 langkah tampil', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'JAK PLUENG!' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Masuk sebagai Guru/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Masuk sebagai Siswa/ })).toBeVisible();
    await expect(page.getByText('Alur Pembelajaran Hari Ini')).toBeVisible();
    await expect(page.getByText('Peta Konsep Pembelajaran')).toBeVisible();
    await expect(page.getByText('6 langkah')).toBeVisible();
  });

  test('tag og:/twitter: ada di HTML yang disajikan', async ({ page }) => {
    const res = await page.goto('/');
    expect(res?.status()).toBe(200);
    const html = await res?.text();
    for (const tag of ['og:title', 'og:description', 'og:type', 'og:url', 'og:image', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
      expect(html).toContain(tag);
    }
    expect(html).toContain('https://lidm-jakplueng.pages.dev/og-image.png');
  });

  test('og-image.png 200 + image/*, compass.svg 200', async ({ request }) => {
    const og = await request.get('/og-image.png');
    expect(og.status()).toBe(200);
    expect(og.headers()['content-type']).toMatch(/^image\//);
    const fav = await request.get('/compass.svg');
    expect(fav.status()).toBe(200);
  });

  test('mobile 390px: tanpa overflow horizontal', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForTimeout(1500);
    const overflow = await page.evaluate(() => ({
      vw: document.documentElement.clientWidth,
      scrollW: document.documentElement.scrollWidth,
    }));
    expect(overflow.scrollW).toBeLessThanOrEqual(overflow.vw + 1);
  });
});

test.describe('alur siswa', () => {
  test('splash → pilih kelompok → misi + sidebar tampil', async ({ page }) => {
    await enterAsStudent(page);
    await expect(page.getByRole('link', { name: /Evacuation 3D/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Game Quiz/ })).toBeVisible();
    await expect(page.getByText('Kelompok 1')).toBeVisible();
  });

  test('kuis: 5 jawaban benar → hasil terkirim (tanpa backend)', async ({ page }) => {
    await enterAsStudent(page);
    await page.goto('/evaluation');
    await expect(page.getByRole('heading', { name: 'Game Quiz!' })).toBeVisible();
    await page.getByRole('button', { name: /Mulai Quiz/ }).click();
    const answers = [
      'Drop, Cover, and Hold On',
      'Walk to the school field',
      'Turn right and go to the safe zone!',
      'Next to the wall',
      'Move to higher ground immediately!',
    ];
    // Penjelasan unik tiap soal (tidak muncul di teks soal — 'Go straight'
    // saja juga ada di pertanyaan soal 2, jadi pakai kutipan penjelasannya).
    const explanations = [
      /take cover under a desk/,
      /"Go straight" means/,
      /clear, safe evacuation instruction/,
      /"Beside" means/,
      /Always move to higher ground/,
    ];
    for (let i = 0; i < answers.length; i++) {
      await expect(page.getByText(`Soal ${i + 1} / 5`)).toBeVisible();
      await page.getByRole('button', { name: answers[i] }).click();
      // Penjelasan tampil setelah menjawab.
      await expect(page.getByText(explanations[i])).toBeVisible();
      await page.getByRole('button', { name: i < 4 ? /Soal Berikutnya/ : /Lihat Hasil/ }).click();
    }
    // Hasil tampil walau penyimpanan Supabase gagal (fallback lokal).
    await expect(page.getByRole('heading', { name: 'Jawaban Terkirim!' })).toBeVisible({ timeout: 20_000 });
  });

  test('team maker: isi nama → bagi otomatis → kelompok tampil', async ({ page }) => {
    await enterAsStudent(page);
    await page.goto('/teammaker');
    await expect(page.getByRole('heading', { name: /Spin Wheel/ })).toBeVisible();
    await page.locator('textarea').fill('Ahmad\nBella\nChandra\nDewi\nEko\nFajar');
    await page.getByRole('button', { name: /Muat & Bagi Otomatis/ }).click();
    // 'Kelompok 1' juga ada di strip sidebar — scope ke konten utama.
    await expect(page.locator('#main-content').getByText('Kelompok 1')).toBeVisible({ timeout: 20_000 });
  });

  test('halaman modul: video, tutorial, vocab, refleksi tampil', async ({ page }) => {
    await enterAsStudent(page);
    await page.goto('/video');
    await expect(page.getByRole('heading', { name: 'Kepanikan Tsunami Aceh 2004' })).toBeVisible();
    // 'Evakuasi Terstruktur' (tanpa aksen) juga muncul di subjudul TopNav —
    // pakai heading eksak kartu videonya.
    await expect(page.getByRole('heading', { name: 'Evakuasi Terstruktur — Latihan Bencana Jepang' })).toBeVisible();
    await page.goto('/tutorial');
    await expect(page.getByRole('heading', { name: /Tutorial Simulasi Evakuasi 3D/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Step by Step to Safety', level: 1 })).toBeVisible();
    await page.goto('/vocabulary');
    // TopNav juga punya h1 'Vocabulary Lab' — pakai h1 halaman (emoji 📚).
    await expect(page.getByRole('heading', { name: '📚 Vocabulary Lab', exact: true })).toBeVisible();
    await page.goto('/reflection');
    await expect(page.locator('#main-content').getByRole('heading', { name: /Apa pelajaran yang kamu dapat hari ini/ })).toBeVisible();
  });

  test('rute tidak dikenal → 404', async ({ page }) => {
    await enterAsStudent(page);
    await page.goto('/rute-tidak-ada');
    await expect(page.getByText('Halaman Tidak Ditemukan')).toBeVisible();
  });
});

test.describe('login guru tanpa backend', () => {
  test('submit tanpa env → tetap di /admin/login (tidak nyangkut, tidak lolos)', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByRole('heading', { name: /Login Guru/ })).toBeVisible();
    await page.locator('input[type="email"]').fill('guru@contoh.id');
    await page.locator('input[type="password"]').fill('rahasia-salah');
    await page.locator('#admin-login-submit').click();
    // Gagal login harus kembali ke keadaan bisa-coba-lagi, bukan hang.
    await expect(page.getByRole('button', { name: 'Masuk →' })).toBeVisible({ timeout: 30_000 });
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
