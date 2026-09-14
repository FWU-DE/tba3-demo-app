import { test, expect } from '@playwright/test';
import { oeffneDemo } from './hilfsmittel.js';

// Unter 1024 px stünde die 320 px breite Filterleiste dem Inhalt im Weg —
// dort wird sie zu einem aufklappbaren Block über dem Dashboard.
test.describe('Demoanwendung — schmaler Schirm', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('die Filter stecken hinter einem Umschalter', async ({ page }) => {
    await oeffneDemo(page);

    const umschalter = page.getByTestId('filter-umschalter');
    await expect(umschalter).toBeVisible();
    await expect(umschalter).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByTestId('ebene-group')).toBeHidden();

    await umschalter.click();

    await expect(umschalter).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByTestId('ebene-group')).toBeVisible();
  });

  test('die Filter lassen sich auch schmal bedienen', async ({ page }) => {
    await oeffneDemo(page);
    await page.getByTestId('filter-umschalter').click();

    await page.getByTestId('ebene-school').click();

    await expect(page.getByTestId('auswahl-schule')).toBeVisible();
    await expect(page).toHaveURL(/[?&]level=school\b/);
  });

  test('die Reiter bleiben erreichbar', async ({ page }) => {
    await oeffneDemo(page);

    await page.getByTestId('reiter-students').click();

    await expect(page.getByTestId('ansicht-schueler')).toBeVisible();
  });

  test('die Seite läuft nicht seitlich über', async ({ page }) => {
    await oeffneDemo(page);

    const ueberlauf = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(ueberlauf).toBeLessThanOrEqual(1);
  });
});
