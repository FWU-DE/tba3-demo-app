// Die beiden Oberflächen, die aus `apps/shared/konsortium.js` entstehen:
// die Übersicht unter /beispiele und der Reiter „Rückmeldeelemente" der
// Demoanwendung.
//
// Gegen den gebauten Stand geprüft, weil beide an Dingen hängen, die erst dort
// so sind wie im Deployment: /beispiele lädt seine Daten über
// /gemeinsam/konsortium.js (im Dev-Server liefert die Vite-Erweiterung, im
// Build tools/build-site.mjs), und die Bausteine kommen als Custom Elements —
// ein fehlender Registrierungsaufruf fiele in jsdom nicht auf.

import { test, expect } from '@playwright/test';
import { oeffneDemo } from './hilfsmittel.js';
import { BAUSTEINE, RUECKMELDUNGEN, rueckmeldungenZu } from '../apps/shared/konsortium.js';

test.describe('Rückmeldungen des Konsortiums', () => {
  test('führt jede Rückmeldung mit ihren Adressen', async ({ page }) => {
    await page.goto('/beispiele');

    await expect(page.getByTestId('liste').locator('> li')).toHaveCount(RUECKMELDUNGEN.length);

    for (const r of RUECKMELDUNGEN) {
      await expect(page.getByTestId(`rueckmeldung-${r.id}`), r.id).toBeVisible();
      for (const [art, adresse] of [['demo', r.demo], ['code', r.code], ['doku', r.doku]]) {
        const verweis = page.getByTestId(`${art}-${r.id}`);
        if (adresse) {
          await expect(verweis, `${r.id}/${art}`).toHaveAttribute('href', adresse);
        } else {
          await expect(verweis, `${r.id}/${art}`).toHaveCount(0);
        }
      }
    }
  });

  test('filtert über die Adresszeile und behält die fachunabhängigen', async ({ page }) => {
    await page.goto('/beispiele?fach=MA');

    // Wer nach Mathematik filtert, sieht die Mathematik-Rückmeldungen — und die
    // fachunabhängigen, denn „das Fach ist Filter, keine inhaltliche
    // Festlegung". Sie zu verlieren wäre der Fehler, den das offene Feld
    // verhindert.
    await expect(page.getByTestId('rueckmeldung-zepf-ma3')).toBeVisible();
    await expect(page.getByTestId('rueckmeldung-indibit-schulrueckmeldung')).toBeVisible();
    await expect(page.getByTestId('rueckmeldung-zepf-en8')).toHaveCount(0);
  });

  test('wählt eine Einrichtung und schreibt sie in die Adresse', async ({ page }) => {
    await page.goto('/beispiele');
    await page.getByTestId('filter-einrichtung').selectOption('isq');

    await expect(page).toHaveURL(/einrichtung=isq/);
    await expect(page.getByTestId('liste').locator('> li')).toHaveCount(1);
    await expect(page.getByTestId('rueckmeldung-isq-portal')).toBeVisible();
  });
});

test.describe('Demoanwendung — Rückmeldeelemente', () => {
  test('zeichnet die Bausteine des Katalogs als Custom Elements', async ({ page }) => {
    await oeffneDemo(page, { tab: 'elemente' });

    await expect(page.getByTestId('ansicht-elemente')).toBeVisible();

    // Jeder Katalogeintrag bekommt eine Karte; wer einen Datenweg hat, zeichnet
    // auch. Geprüft wird das Custom Element selbst — eine leere Hülle wäre im
    // Bild nicht zu unterscheiden.
    for (const baustein of BAUSTEINE) {
      await expect(page.getByTestId(`baustein-${baustein.id}`), baustein.id).toBeVisible();
    }

    for (const baustein of BAUSTEINE.filter((b) => b.quelle)) {
      const zeichnung = page.getByTestId(`zeichnung-${baustein.id}`);
      await expect(zeichnung, baustein.id).toBeVisible();
      await expect(zeichnung.locator(`tba3-${baustein.element}`).first(), baustein.id).toBeVisible();
    }
  });

  test('sagt bei einem Baustein ohne Datenweg, woran es liegt', async ({ page }) => {
    await oeffneDemo(page, { tab: 'elemente' });

    const verlauf = page.getByTestId('ohne-daten-verlauf-ueber-messzeitpunkte');
    await expect(verlauf).toBeVisible();
    await expect(verlauf).toContainText(/Erhebungen/);
  });

  test('schränkt den Katalog auf eine Einrichtung ein', async ({ page }) => {
    await oeffneDemo(page, { tab: 'elemente' });
    await page.getByTestId('elemente-einrichtung').selectOption('kt');

    const vomKt = BAUSTEINE.filter((b) => rueckmeldungenZu(b.id).some((r) => r.einrichtung === 'kt'));
    await expect(page.getByTestId('elemente-anzahl')).toContainText(String(vomKt.length));
    await expect(page.getByTestId('baustein-gefuehrter-ablauf')).toBeVisible();
    await expect(page.getByTestId('baustein-punktwolke')).toHaveCount(0);
  });
});
