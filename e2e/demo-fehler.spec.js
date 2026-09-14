import { test, expect } from '@playwright/test';
import { DEMO, lassScheitern } from './hilfsmittel.js';

test.describe('Demoanwendung — Fehlerfälle', () => {
  test('eine gescheiterte Abfrage zeigt eine Fehlermeldung statt eines leeren Diagramms', async ({ page }) => {
    await lassScheitern(page, '**/groups/**/competence-levels*');

    await page.goto(DEMO);

    await expect(page.getByTestId('fehlermeldung')).toBeVisible();
    await expect(page.getByTestId('erneut-versuchen')).toBeVisible();
  });

  test('„Erneut versuchen" lädt die Daten nach, sobald die Schnittstelle wieder antwortet', async ({ page }) => {
    await lassScheitern(page, '**/groups/**/competence-levels*');
    await page.goto(DEMO);
    await expect(page.getByTestId('fehlermeldung')).toBeVisible();

    await page.unroute('**/groups/**/competence-levels*');
    await page.getByTestId('erneut-versuchen').click();

    await expect(page.getByTestId('fehlermeldung')).toHaveCount(0);
    // Das gezeichnete Diagramm ist der Beleg, dass wieder Daten da sind — die
    // Karte selbst steht auch im Fehlerzustand.
    await expect(
      page.getByTestId('ansicht-kompetenzstufen').getByRole('application'),
    ).toBeVisible();

    // Bewusst nicht geprüft: die Übersichtskarten über den Reitern bleiben
    // leer. Sie hängen an einer eigenen Abfrage im Dashboard, die der
    // Knopf im Diagramm nicht mitnimmt — siehe Hinweis im Pull Request.
  });

  test('ein Fehler in einem Reiter lässt die übrigen Reiter stehen', async ({ page }) => {
    await lassScheitern(page, '**/groups/**/items*');

    await page.goto(DEMO);
    await expect(page.getByTestId('ansicht-kompetenzstufen')).toBeVisible();

    await page.getByTestId('reiter-items').click();
    await expect(page.getByTestId('fehlermeldung')).toBeVisible();

    await page.getByTestId('reiter-competence').click();
    await expect(page.getByTestId('ansicht-kompetenzstufen')).toBeVisible();
    await expect(page.getByTestId('fehlermeldung')).toHaveCount(0);
  });
});
