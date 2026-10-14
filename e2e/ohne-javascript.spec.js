// Demo und Katalog bekommen beim Build Inhalt in ihren leeren Container, für
// Werkzeuge, die die Seite lesen statt sie auszuführen. Zwei Dinge müssen
// stimmen: ohne Skript steht er da, mit Skript ist er weg.

import { test, expect } from '@playwright/test';

test.describe('ohne JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const [pfad, verweis] of [['/demo/', '/demo/?tab=students'], ['/katalog/', '/katalog/#/mean-comparison']]) {
    test(`${pfad} nennt, was die App zeigt`, async ({ page }) => {
      await page.goto(pfad);
      await expect(page.locator(`.ohne-js a[href="${verweis}"]`).first()).toBeVisible();
      await expect(page.locator('.ohne-js a[href="/gemeinsam/konsortium.json"]').first()).toBeVisible();
    });
  }
});

test.describe('mit JavaScript', () => {
  for (const [pfad, ansicht] of [['/demo/', 'ansicht-kompetenzstufen'], ['/katalog/', 'katalog-zielgruppe']]) {
    test(`${pfad} ersetzt die Fassung ohne Skript`, async ({ page }) => {
      await page.goto(pfad);
      await expect(page.getByTestId(ansicht)).toBeVisible();
      await expect(page.locator('.ohne-js')).toHaveCount(0);
    });
  }
});
