import { test, expect } from '@playwright/test';
import { oeffneDemo } from './hilfsmittel.js';

test.describe('Demoanwendung — Grundgerüst', () => {
  test('lädt mit Leiste, Filtern und Kompetenzstufen', async ({ page }) => {
    await oeffneDemo(page);

    // Die gemeinsame Leiste steht im HTML-Dokument, nicht im React-Baum —
    // sie muss auch im gebauten Stand ankommen.
    await expect(page.locator('tba3-leiste')).toHaveAttribute('aktiv', 'demo');
    await expect(page.locator('tba3-leiste nav a[aria-current="page"]')).toBeVisible();

    await expect(page.getByTestId('ebene-group')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('reiter-competence')).toHaveAttribute('aria-current', 'page');
    await expect(page.getByTestId('ansicht-kompetenzstufen')).toBeVisible();
  });

  test('zeigt die Übersichtskarten mit Zahlen aus der Schnittstelle', async ({ page }) => {
    await oeffneDemo(page);

    const gesamt = page.getByTestId('competency-total');
    await expect(gesamt).toBeVisible();
    await expect(gesamt).toHaveText(/\d+/);

    // Die beiden Anteile ergänzen sich zu 100 % — sonst rechnet die
    // Aufbereitung an der Antwort vorbei. Gelesen wird nur die erste Zeile der
    // Kachel: darunter steht die Zahl der Schüler:innen, die sonst mit in den
    // Prozentwert liefe.
    const anteil = async (kennung) => {
      const text = await page.getByTestId(kennung).innerText();
      return Number(text.split('\n')[0].replace(/[^\d,.]/g, '').replace(',', '.'));
    };
    const erreicht = await anteil('stat-at-or-above');
    const darunter = await anteil('stat-below-standard');
    expect(erreicht + darunter).toBeGreaterThanOrEqual(99);
    expect(erreicht + darunter).toBeLessThanOrEqual(101);
  });

  const reiter = [
    ['competence', 'ansicht-kompetenzstufen'],
    ['delta', 'ansicht-vergleich'],
    ['items', 'ansicht-aufgaben'],
    ['aggregations', 'ansicht-aggregationen'],
    ['students', 'ansicht-schueler'],
    ['materials', 'ansicht-materialien'],
    ['help', 'ansicht-hilfe'],
  ];

  for (const [id, ansicht] of reiter) {
    test(`Reiter „${id}" öffnet seine Ansicht und steht in der Adresse`, async ({ page }) => {
      await oeffneDemo(page);

      await page.getByTestId(`reiter-${id}`).click();

      await expect(page.getByTestId(`reiter-${id}`)).toHaveAttribute('aria-current', 'page');
      await expect(page.getByTestId(ansicht)).toBeVisible();
      await expect(page).toHaveURL(new RegExp(`[?&]tab=${id}\\b`));
    });
  }

  test('ein Reiter lässt sich direkt über die Adresse öffnen', async ({ page }) => {
    await oeffneDemo(page, { tab: 'aggregations' });

    await expect(page.getByTestId('reiter-aggregations')).toHaveAttribute('aria-current', 'page');
    await expect(page.getByTestId('ansicht-aggregationen')).toBeVisible();
  });

  test('ein Datenblatt lässt sich direkt über die Adresse öffnen', async ({ page }) => {
    await oeffneDemo(page, { tab: 'students', student: 'st-3a-deutsch-0' });

    await expect(page.getByTestId('schueler-datenblatt')).toBeVisible();
  });
});
