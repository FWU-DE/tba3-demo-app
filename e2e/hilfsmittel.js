import { expect } from '@playwright/test';

/** Die Demoanwendung liegt im Unterpfad `/demo/`. */
export const DEMO = '/demo/';

/**
 * Öffnet die Demoanwendung und wartet, bis die erste Antwort da ist.
 *
 * Ohne dieses Warten prüft der erste `expect` gegen das Ladegerüst, und der
 * Test wird davon abhängig, wie schnell der Mock antwortet.
 */
export async function oeffneDemo(page, parameter = {}) {
  const suche = new URLSearchParams(parameter).toString();
  await page.goto(suche ? `${DEMO}?${suche}` : DEMO);
  await expect(page.getByTestId('dashboard')).toBeVisible();
  await expect(page.getByTestId('laden')).toHaveCount(0);
  return page;
}

/**
 * Lässt den Mock für einen Pfad scheitern.
 *
 * Die Anwendung spricht über denselben Host wie die Seite, deshalb genügt ein
 * Glob auf den Pfad — `page.route` greift vor dem Netz.
 */
export async function lassScheitern(page, muster, status = 500) {
  await page.route(muster, (route) =>
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Testfehler' }),
    }),
  );
}

/** Die Sprachwahl sitzt im Shadow DOM der gemeinsamen Leiste. */
export function sprachknopf(page, kuerzel) {
  return page.locator(`tba3-leiste [data-sprache="${kuerzel}"]`);
}
