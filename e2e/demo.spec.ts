import { test, expect } from '@playwright/test';

// Tur demo README (gate merge): merekam video + screenshot asli aplikasi.
// Hanya proyek desktop — video 1280x720 (viewport eksplisit; default
// Playwright 800x500). Mobile tidak merekam tur ini.
// test.use WAJIB top-level file (di dalam describe, Playwright menolak
// `video` karena memaksa worker baru — run 44534063901).
// Tirai (curtain) menutup layar ±1,9 detik tiap navigasi: screenshot
// diambil SETELAH heading tampil + jeda 2 detik supaya tirai benar-benar
// terbuka (pelajaran #52).
// File: demo/shot-*.png + video.webm (di test-results, dirakit CI jadi
// demo/demo.mp4 dengan ffmpeg-static).
test.use({ viewport: { width: 1280, height: 720 }, video: 'on' });

test.describe('tur demo README', () => {
  test.skip(({ isMobile }) => isMobile, 'tur demo hanya desktop');

  test('sambutan → siswa → misi → simulator → kuis → team maker', async ({ page }) => {
    // 1. Sambutan
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'JAK PLUENG!' }).first()).toBeVisible();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'demo/shot-welcome.png' });

    // 2. Splash siswa
    await page.getByRole('button', { name: /Masuk sebagai Siswa/ }).click();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: 'demo/shot-splash.png' });
    const vp = page.viewportSize() ?? { width: 1280, height: 720 };
    await page.mouse.click(vp.width / 2, vp.height / 2);

    // 3. Pilih kelompok
    await expect(page.getByRole('heading', { name: /Pilih Kelompokmu/ })).toBeVisible({ timeout: 20_000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'demo/shot-groups.png' });
    await page.getByRole('button', { name: '1 Kelompok' }).click();

    // 4. Misi (peta konsep)
    await expect(page.getByRole('heading', { name: /Peta Konsep/ })).toBeVisible({ timeout: 20_000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'demo/shot-mission.png' });

    // 5. Simulator 3D (tunggu canvas termuat)
    await page.goto('/simulator');
    await expect(page.getByRole('heading', { name: /EVACUATION 3D/ })).toBeVisible({ timeout: 20_000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'demo/shot-simulator.png' });

    // 6. Kuis (intro + 1 soal terjawab)
    await page.goto('/evaluation');
    await expect(page.getByRole('heading', { name: 'Game Quiz!' })).toBeVisible();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'demo/shot-quiz-intro.png' });
    await page.getByRole('button', { name: /Mulai Quiz/ }).click();
    await expect(page.getByText('Soal 1 / 5')).toBeVisible();
    await page.getByRole('button', { name: 'Drop, Cover, and Hold On' }).click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'demo/shot-quiz.png' });

    // 7. Team maker
    await page.goto('/teammaker');
    await expect(page.getByRole('heading', { name: /Spin Wheel/ })).toBeVisible();
    await page.locator('textarea').fill('Ahmad\nBella\nChandra\nDewi\nEko\nFajar');
    await page.getByRole('button', { name: /Muat & Bagi Otomatis/ }).click();
    await expect(page.locator('#main-content').getByText('Kelompok 1')).toBeVisible({ timeout: 20_000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'demo/shot-teammaker.png' });
  });
});
