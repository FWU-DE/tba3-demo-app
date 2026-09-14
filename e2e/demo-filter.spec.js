import { test, expect } from '@playwright/test';
import { oeffneDemo } from './hilfsmittel.js';

// Was die Filter wert sind, entscheidet sich nicht an der Oberfläche, sondern
// an der Anfrage, die dabei herauskommt. Deshalb wird hier beides geprüft:
// der sichtbare Zustand und die Adresse, die die Anwendung abruft.
const naechsteAbfrage = (page, muster) =>
  page.waitForRequest((anfrage) => muster.test(anfrage.url()), { timeout: 10_000 });

test.describe('Demoanwendung — Filter', () => {
  test('fragt beim Start die gewählte Lerngruppe ab', async ({ page }) => {
    const abfrage = naechsteAbfrage(page, /\/groups\/3a-deutsch\/competence-levels/);
    await oeffneDemo(page);

    const url = new URL((await abfrage).url());
    // 'both' wird für die Schnittstelle zu 'group,students'
    expect(url.searchParams.get('type')).toBe('group,students');
  });

  test('wechselt auf Schulebene und fragt die Schul-Endpunkte ab', async ({ page }) => {
    await oeffneDemo(page);

    const abfrage = naechsteAbfrage(page, /\/schools\/gs-musterstadt\/competence-levels/);
    await page.getByTestId('ebene-school').click();
    await abfrage;

    await expect(page.getByTestId('ebene-school')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('auswahl-schule')).toBeVisible();
    await expect(page.getByTestId('auswahl-gruppe')).toHaveCount(0);
    await expect(page).toHaveURL(/[?&]level=school\b/);
  });

  test('wechselt auf Landesebene', async ({ page }) => {
    await oeffneDemo(page);

    const abfrage = naechsteAbfrage(page, /\/states\/beispielland\/competence-levels/);
    await page.getByTestId('ebene-state').click();
    await abfrage;

    await expect(page.getByTestId('auswahl-bundesland')).toBeVisible();
    await expect(page).toHaveURL(/[?&]level=state\b/);
  });

  test('eine andere Lerngruppe fragt einen anderen Endpunkt ab', async ({ page }) => {
    await oeffneDemo(page);

    const abfrage = naechsteAbfrage(page, /\/groups\/3b-mathe\//);
    await page.getByTestId('auswahl-gruppe').selectOption('3b-mathe');
    await abfrage;

    await expect(page).toHaveURL(/[?&]group=3b-mathe\b/);
  });

  test('das Fach begrenzt die Auswahl der Lerngruppen', async ({ page }) => {
    await oeffneDemo(page);

    await page.getByTestId('auswahl-fach').selectOption('MA');

    const werte = await page
      .getByTestId('auswahl-gruppe')
      .locator('option')
      .evaluateAll((optionen) => optionen.map((o) => o.value));

    expect(werte.length).toBeGreaterThan(0);
    expect(werte.every((wert) => wert.includes('mathe'))).toBe(true);
    // Die vorher gewählte Deutsch-Gruppe passt nicht mehr und wird ersetzt,
    // statt als toter Wert stehen zu bleiben.
    await expect(page.getByTestId('auswahl-gruppe')).toHaveValue(werte[0]);
    await expect(page).toHaveURL(/[?&]subject=MA\b/);
  });

  test('Fach und Klassenstufe greifen zusammen', async ({ page }) => {
    await oeffneDemo(page);

    await page.getByTestId('auswahl-fach').selectOption('DE');
    await page.getByTestId('auswahl-klassenstufe').selectOption('V8');

    const werte = await page
      .getByTestId('auswahl-gruppe')
      .locator('option')
      .evaluateAll((optionen) => optionen.map((o) => o.value));

    expect(werte).toEqual(['8a-deutsch', '8b-deutsch', '8c-deutsch']);
  });

  test('der Datentyp geht als type an die Schnittstelle', async ({ page }) => {
    await oeffneDemo(page);

    const abfrage = naechsteAbfrage(page, /type=students/);
    await page.getByTestId('auswahl-datentyp').selectOption('students');
    const url = new URL((await abfrage).url());

    expect(url.searchParams.get('type')).toBe('students');
    await expect(page).toHaveURL(/[?&]type=students\b/);
  });

  test('die Filter aus der Adresse gelten beim Laden', async ({ page }) => {
    const abfrage = naechsteAbfrage(page, /\/groups\/8b-englisch\/competence-levels/);
    await oeffneDemo(page, { level: 'group', group: '8b-englisch', subject: 'EN', grade: 'V8' });
    await abfrage;

    await expect(page.getByTestId('auswahl-gruppe')).toHaveValue('8b-englisch');
    await expect(page.getByTestId('auswahl-fach')).toHaveValue('EN');
    await expect(page.getByTestId('auswahl-klassenstufe')).toHaveValue('V8');
  });
});
