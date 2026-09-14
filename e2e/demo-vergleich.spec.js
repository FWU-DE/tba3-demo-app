import { test, expect } from '@playwright/test';
import { oeffneDemo } from './hilfsmittel.js';

const oeffneVergleich = async (page) => {
  await oeffneDemo(page, { tab: 'delta' });
  await expect(page.getByTestId('ansicht-vergleich')).toBeVisible();
};

test.describe('Demoanwendung — Vergleichsauswertung', () => {
  test('zeigt die gewählte Lerngruppe und ihre Teilbereiche', async ({ page }) => {
    await oeffneVergleich(page);

    await expect(page.getByTestId('group-label')).toContainText('3a Deutsch');
    await expect(page.getByTestId(/^domain-tab-/).first()).toBeVisible();
    await expect(page.getByTestId('delta-bar-chart')).toBeVisible();
  });

  test('ein anderer Teilbereich zeichnet das Diagramm neu', async ({ page }) => {
    await oeffneVergleich(page);

    const reiter = page.getByTestId(/^domain-tab-/);
    const anzahl = await reiter.count();
    test.skip(anzahl < 2, 'Diese Lerngruppe hat nur einen Teilbereich');

    const zweiter = reiter.nth(1);
    const beschriftung = await zweiter.innerText();
    await zweiter.click();

    await expect(page.getByTestId('ansicht-vergleich').getByRole('heading', { level: 2 }))
      .toHaveText(beschriftung);
    await expect(page.getByTestId('delta-bar-chart')).toBeVisible();
  });

  test('ein weiterer Vergleich kommt über das Auswahlfeld dazu', async ({ page }) => {
    await oeffneVergleich(page);

    await page.getByTestId('comparison-panel-toggle').click();
    const panel = page.getByTestId('comparison-panel');
    await expect(panel).toBeVisible();

    const kaesten = page.getByTestId(/^comparison-box-/);
    const vorher = await kaesten.count();

    // Der erste nicht gewählte und nicht gesperrte Vergleich
    const felder = panel.getByTestId(/^comparison-checkbox-/);
    const freies = felder.filter({ hasNot: page.locator('[disabled]') });
    let geklickt = false;
    for (let i = 0; i < (await freies.count()); i += 1) {
      const feld = freies.nth(i);
      if (await feld.isDisabled()) continue;
      if (await feld.isChecked()) continue;
      await feld.check();
      geklickt = true;
      break;
    }
    test.skip(!geklickt, 'Für diese Gruppe sind alle Vergleiche schon gewählt');

    await expect.poll(() => kaesten.count()).toBeGreaterThan(vorher);
  });

  test('gesperrte Vergleiche bleiben unwählbar', async ({ page }) => {
    await oeffneVergleich(page);

    await page.getByTestId('comparison-panel-toggle').click();

    // Testheft-, Vergleichsschul- und Vorjahresvergleich sind im Entwurf
    // vorgesehen, aber noch nicht hinterlegt — sie stehen sichtbar da und
    // lassen sich nicht anhaken.
    await expect(page.getByTestId('comparison-checkbox-testheft')).toBeDisabled();
  });
});
