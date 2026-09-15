// Der dritte Modus im Reiter „Lernmaterialien": die Materialien, die aus
// `/materials` kommen statt aus dem lokalen Pool.
//
// Geprüft wird die Naht, nicht die Rechnung — die steht in
// `apps/demo/src/utils/__tests__/materialien.test.js` und läuft ohne Browser.
// Hier geht es um das, was nur im Ganzen schiefgehen kann: stellt die Ansicht
// die richtige Abfrage, und kommt eine automatische Zuweisung tatsächlich im
// Modus nebenan an?

import { test, expect } from '@playwright/test';

test.describe('Demoanwendung — Materialien aus der Schnittstelle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/?lang=de');
    await page.getByTestId('reiter-materials').click();
  });

  test('fragt /materials ab und ordnet die Antwort nach Zuordnungsart', async ({ page }) => {
    const abfrage = page.waitForRequest((r) => new URL(r.url()).pathname === '/materials');
    await page.getByTestId('materialien-modus-api').click();
    await abfrage;

    // Der Entwurf kennt sechs Arten; die Beispieldaten belegen nicht alle,
    // leere Gruppen bleiben weg. Mehr als eine muss es sein, sonst zeigt die
    // Gruppierung nichts, was der lokale Pool nicht auch könnte.
    const gruppen = page.locator('[data-testid^="schnittstellen-scope-"]');
    await expect.poll(() => gruppen.count()).toBeGreaterThan(1);
    await expect(page.getByTestId('schnittstellen-scope-competence-level')).toBeVisible();
    await expect(page.getByTestId('schnittstellen-scope-general')).toBeVisible();
  });

  test('die Vorschau sagt, was zugeordnet wird — und was nicht', async ({ page }) => {
    await page.getByTestId('materialien-modus-api').click();
    await page.getByTestId('auto-zuweisung-aufklappen').click();

    const vorschau = page.getByTestId('auto-zuweisung-vorschau');
    await expect(vorschau).toBeVisible();

    // „Ia" gehört zu Stufe I. Stünde hier 0, hätte die Auflösung der Anhänge
    // versagt — und die Zuweisung meldete trotzdem Erfolg.
    await expect(page.getByTestId('auto-zuweisung-zeile-I')).toContainText('Stufe Ia');

    // Was Kontext braucht, bleibt liegen und wird benannt.
    await expect(page.getByTestId('auto-zuweisung-offen')).toBeVisible();
  });

  test('eine Zuweisung kommt im Modus nach Kompetenzstufe an', async ({ page }) => {
    await page.getByTestId('materialien-modus-api').click();
    await page.getByTestId('auto-zuweisung-aufklappen').click();

    const titel = await page
      .getByTestId('auto-zuweisung-zeile-I')
      .locator('td')
      .nth(1)
      .innerText();
    expect(titel).not.toBe('—');

    await page.getByTestId('auto-zuweisung-anwenden').click();
    await expect(page.getByTestId('auto-zuweisung-fertig')).toBeVisible();

    // Hinüber in den Stufenmodus: dort muss das Material jetzt an Stufe I hängen.
    await page.getByTestId('materialien-modus-level').click();
    await page.getByTestId('materialien-stufe-I').click();
    await expect(page.getByText(titel.split(',')[0].trim(), { exact: false }).first()).toBeVisible();
  });

  test('die Zuweisung überlebt das Neuladen', async ({ page }) => {
    await page.getByTestId('materialien-modus-api').click();
    await page.getByTestId('auto-zuweisung-aufklappen').click();
    await page.getByTestId('auto-zuweisung-anwenden').click();
    await expect(page.getByTestId('auto-zuweisung-fertig')).toBeVisible();
    await page.getByTestId('materialien-modus-level').click();

    // Stufe I bekommt ihr eigenes Material und die beiden ohne festes Ziel.
    await expect(page.getByTestId('materialien-stufe-I-zugewiesen')).toHaveText('3');

    await page.reload();
    await page.getByTestId('reiter-materials').click();

    // Die Zuweisung liegt in localStorage wie die aus MUNDO auch.
    await expect(page.getByTestId('materialien-stufe-I-zugewiesen')).toHaveText('3');
  });
});
