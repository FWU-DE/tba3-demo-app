import { test, expect } from '@playwright/test';
import { oeffneDemo } from './hilfsmittel.js';

// Die Schülerliste arbeitet auf erzeugten Beispieldaten (utils/studentData.js),
// nicht auf der Schnittstelle — die Kennungen sind deshalb stabil:
// `st-{gruppe}-{laufende Nummer}`.
const ERSTE = 'st-3a-deutsch-0';

const oeffneSchueler = async (page) => {
  await oeffneDemo(page, { tab: 'students' });
  await expect(page.getByTestId('ansicht-schueler')).toBeVisible();
};

test.describe('Demoanwendung — Schüler:innen', () => {
  test('die Suche verkleinert die Liste auf den gesuchten Namen', async ({ page }) => {
    await oeffneSchueler(page);

    const zeilen = page.getByTestId(/^schueler-zeile-/);
    const vorher = await zeilen.count();
    expect(vorher).toBeGreaterThan(1);

    const name = (await page.getByTestId(`schueler-zeile-${ERSTE}`).innerText()).split(' ')[0];
    await page.getByTestId('schueler-suche').fill(name);

    await expect.poll(() => zeilen.count()).toBeLessThan(vorher);
    for (const text of await zeilen.allInnerTexts()) {
      expect(text.toLowerCase()).toContain(name.toLowerCase());
    }
  });

  test('eine Suche ohne Treffer lässt keine Zeile stehen', async ({ page }) => {
    await oeffneSchueler(page);

    await page.getByTestId('schueler-suche').fill('Zzzznicht vorhanden');

    await expect(page.getByTestId(/^schueler-zeile-/)).toHaveCount(0);
  });

  test('der Klassenfilter zeigt nur Schüler:innen dieser Klasse', async ({ page }) => {
    await oeffneSchueler(page);

    await page.getByTestId('schueler-filter-klasse').selectOption('8a-mathe');

    const zeilen = page.getByTestId(/^schueler-zeile-/);
    await expect.poll(() => zeilen.count()).toBeGreaterThan(0);
    for (const text of await zeilen.allInnerTexts()) {
      expect(text).toContain('8a Mathematik');
    }
  });

  test('das Datenblatt öffnet sich und führt zurück zur Liste', async ({ page }) => {
    await oeffneSchueler(page);

    const name = (await page.getByTestId(`schueler-zeile-${ERSTE}`).innerText()).split('\n')[0];
    await page.getByTestId(`schueler-datenblatt-${ERSTE}`).click();

    const datenblatt = page.getByTestId('schueler-datenblatt');
    await expect(datenblatt).toBeVisible();
    await expect(datenblatt).toContainText(name.split(' ')[0]);
    // Das offene Datenblatt steht in der Adresse — damit lässt es sich teilen.
    await expect(page).toHaveURL(new RegExp(`[?&]student=${ERSTE}\\b`));

    await page.getByTestId('datenblatt-zurueck').click();

    await expect(page.getByTestId('schueler-liste')).toBeVisible();
    await expect(page).not.toHaveURL(/[?&]student=/);
  });

  test('eine eigene Gruppe entsteht aus der Auswahl und überlebt das Neuladen', async ({ page }) => {
    await oeffneSchueler(page);

    await page.getByTestId(`schueler-auswahl-${ERSTE}`).check();
    await page.getByTestId('neue-gruppe').click();
    await page.getByTestId('neue-gruppe-name').fill('Förderband Lesen');
    await page.getByTestId('neue-gruppe-anlegen').click();

    const gruppen = page.getByTestId('eigene-gruppen');
    await expect(gruppen).toContainText('Förderband Lesen');
    await expect(gruppen).toContainText('1');

    // Eigene Gruppen liegen im localStorage — die Demo hat dafür kein Backend.
    const gespeichert = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('tba3_custom_groups') || '[]'),
    );
    expect(gespeichert).toHaveLength(1);
    expect(gespeichert[0].name).toBe('Förderband Lesen');
    expect(gespeichert[0].studentIds).toContain(ERSTE);

    await page.reload();
    await expect(page.getByTestId('eigene-gruppen')).toContainText('Förderband Lesen');
  });

  test('eine eigene Gruppe lässt sich wieder löschen', async ({ page }) => {
    await oeffneSchueler(page);

    await page.getByTestId(`schueler-auswahl-${ERSTE}`).check();
    await page.getByTestId('neue-gruppe').click();
    await page.getByTestId('neue-gruppe-name').fill('Kurzlebig');
    await page.getByTestId('neue-gruppe-anlegen').click();

    const gespeichert = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('tba3_custom_groups') || '[]'),
    );
    const kennung = gespeichert[0].id;

    page.on('dialog', (dialog) => dialog.accept());
    await page.getByTestId(`gruppe-loeschen-${kennung}`).click();

    await expect(page.getByTestId('eigene-gruppen')).not.toContainText('Kurzlebig');
  });

  test('aus einer eigenen Gruppe führt der Weg zu den Materialien', async ({ page }) => {
    await oeffneSchueler(page);

    await page.getByTestId(`schueler-auswahl-${ERSTE}`).check();
    await page.getByTestId('neue-gruppe').click();
    await page.getByTestId('neue-gruppe-name').fill('Lesegruppe');
    await page.getByTestId('neue-gruppe-anlegen').click();

    const gespeichert = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('tba3_custom_groups') || '[]'),
    );
    await page.getByTestId(`gruppe-materialien-${gespeichert[0].id}`).click();

    await expect(page.getByTestId('ansicht-materialien')).toBeVisible();
    await expect(page.getByTestId('reiter-materials')).toHaveAttribute('aria-current', 'page');
  });
});
