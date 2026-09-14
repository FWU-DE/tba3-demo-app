import { test, expect } from '@playwright/test';

// Der Demonstrator ist über beide Formen der Adresse erreichbar: die Leiste
// verweist auf `/bausteine`, der Deep Link aus der Dokumentation auf
// `/bausteine/`. Ein relativer Modul-Import löst im ersten Fall gegen `/` auf
// — die Seite lädt dann mit Kopfzeile, aber ohne Zuordnungstabelle und ohne
// einen einzigen Baustein, und zwar ohne sichtbaren Fehler.
const FORMEN = ['/bausteine', '/bausteine/'];

for (const pfad of FORMEN) {
  test.describe(`Bausteine-Demonstrator unter ${pfad}`, () => {
    test('lädt seine Module und zeigt die Zuordnungstabelle', async ({ page }) => {
      const tot = [];
      page.on('requestfailed', (r) => tot.push(new URL(r.url()).pathname));
      page.on('response', (r) => {
        if (r.status() === 404) tot.push(`${new URL(r.url()).pathname} [404]`);
      });

      await page.goto(pfad);

      const zeilen = page.locator('table tbody tr');
      await expect.poll(() => zeilen.count()).toBeGreaterThan(0);
      expect(tot, 'kein Modul darf ins Leere laufen').toEqual([]);
    });

    test('registriert die Bausteine als Custom Elements', async ({ page }) => {
      await page.goto(pfad);

      // Die Web Component ist die eine echte Implementierung — ist sie nicht
      // registriert, steht auf der Seite nichts als Leerraum.
      await expect
        .poll(() =>
          page.evaluate(() =>
            [...document.querySelectorAll('*')]
              .filter((el) => el.tagName.startsWith('TBA3-') && el.tagName !== 'TBA3-LEISTE')
              .filter((el) => !!el.shadowRoot).length,
          ))
        .toBeGreaterThan(0);
    });
  });
}
