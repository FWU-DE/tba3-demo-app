import { test, expect } from '@playwright/test';
import { oeffneDemo } from './hilfsmittel.js';

const oeffneMaterialien = async (page) => {
  await oeffneDemo(page, { tab: 'materials' });
  await expect(page.getByTestId('ansicht-materialien')).toBeVisible();
};

test.describe('Demoanwendung — Lernmaterialien', () => {
  test('eine Kompetenzstufe öffnet die passenden Materialien', async ({ page }) => {
    await oeffneMaterialien(page);

    await page.getByTestId('materialien-stufe-II').click();

    await expect(page.getByTestId(/^material-/).first()).toBeVisible();
    // Ohne Auswahl bleibt der Zuweisen-Knopf gesperrt.
    await expect(page.getByTestId('materialien-zuweisen')).toBeDisabled();
  });

  test('ein gewähltes Material lässt sich der Stufe zuweisen', async ({ page }) => {
    await oeffneMaterialien(page);
    await page.getByTestId('materialien-stufe-II').click();

    const ersteKarte = page.getByTestId(/^material-/).first();
    const titel = (await ersteKarte.innerText()).split('\n')[0];
    await ersteKarte.click();

    const zuweisen = page.getByTestId('materialien-zuweisen');
    await expect(zuweisen).toBeEnabled();
    await zuweisen.click();

    await expect(page.getByTestId('ansicht-materialien')).toContainText(titel);
    // Erst mit einer Zuweisung ist etwas da, das sich ausgeben lässt.
    await expect(page.getByTestId('export-imscc')).toBeEnabled();
    await expect(page.getByTestId('export-pdf')).toBeEnabled();
  });

  test('ohne Zuweisung ist kein Export möglich', async ({ page }) => {
    await oeffneMaterialien(page);

    await expect(page.getByTestId('export-imscc')).toBeDisabled();
    await expect(page.getByTestId('export-pdf')).toBeDisabled();
  });

  test('der Export liefert eine Common-Cartridge-Datei aus', async ({ page }) => {
    await oeffneMaterialien(page);
    await page.getByTestId('materialien-stufe-II').click();
    await page.getByTestId(/^material-/).first().click();
    await page.getByTestId('materialien-zuweisen').click();

    // JSZip wird erst im Moment des Exports geladen — der Download ist damit
    // auch der Nachweis, dass der nachgeladene Brocken im Build ankommt.
    const download = page.waitForEvent('download', { timeout: 20_000 });
    await page.getByTestId('export-imscc').click();

    const datei = await download;
    expect(datei.suggestedFilename()).toMatch(/\.imscc$/);
  });

  test('der PDF-Export liefert eine PDF-Datei aus', async ({ page }) => {
    await oeffneMaterialien(page);
    await page.getByTestId('materialien-stufe-II').click();
    await page.getByTestId(/^material-/).first().click();
    await page.getByTestId('materialien-zuweisen').click();

    const download = page.waitForEvent('download', { timeout: 20_000 });
    await page.getByTestId('export-pdf').click();

    const datei = await download;
    expect(datei.suggestedFilename()).toMatch(/\.pdf$/);
  });

  test('der Modus „nach Gruppe" braucht eine eigene Gruppe', async ({ page }) => {
    await oeffneMaterialien(page);

    await page.getByTestId('materialien-modus-group').click();

    await expect(page.getByTestId('ansicht-materialien')).toBeVisible();
    await expect(page.getByTestId(/^materialien-stufe-/)).toHaveCount(0);
  });
});
