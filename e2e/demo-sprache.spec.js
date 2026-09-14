import { test, expect } from '@playwright/test';
import { oeffneDemo, sprachknopf } from './hilfsmittel.js';

// Die Sprachwahl gehört dem Besucher und gilt über alle Bereiche hinweg
// (apps/shared/sprache.js). Für die Demoanwendung ist sie heikel, weil die
// Leiste zur Laufzeit nachgeladen wird und der Filterkontext zur selben Zeit
// die Adresszeile umschreibt.
test.describe('Demoanwendung — Sprachwahl', () => {
  test('schaltet die Oberfläche auf Englisch und merkt sich das', async ({ page }) => {
    await oeffneDemo(page);
    await expect(page.getByTestId('reiter-competence')).toContainText('Kompetenzstufen');

    await sprachknopf(page, 'en').click();

    await expect(page.getByTestId('reiter-competence')).toContainText('Competence levels');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    expect(await page.evaluate(() => localStorage.getItem('tba3-sprache'))).toBe('en');
  });

  test('die Wahl überlebt das Neuladen', async ({ page }) => {
    await oeffneDemo(page);
    await sprachknopf(page, 'en').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await page.reload();

    await expect(page.getByTestId('reiter-competence')).toContainText('Competence levels');
    await expect(sprachknopf(page, 'en')).toHaveAttribute('aria-pressed', 'true');
  });

  test('die Wahl gilt auch im Portal nebenan', async ({ page }) => {
    await oeffneDemo(page);
    await sprachknopf(page, 'en').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test.describe('bei englischer Browsersprache', () => {
    test.use({ locale: 'en-US' });

    // Der Regressionsfall: der Filterkontext schrieb die Adresse aus einem
    // frischen URLSearchParams und warf `lang` dabei weg. Die Leiste las eine
    // Adresse ohne `?lang=de`, fiel auf die Browsersprache zurück und stand
    // englisch neben deutschem Inhalt.
    test('überlebt ?lang=de das erste Rendern', async ({ page }) => {
      await oeffneDemo(page, { lang: 'de' });

      await expect(page.locator('html')).toHaveAttribute('lang', 'de');
      await expect(page.getByTestId('reiter-competence')).toContainText('Kompetenzstufen');
      await expect(page).toHaveURL(/[?&]lang=de\b/);
    });
  });
});
