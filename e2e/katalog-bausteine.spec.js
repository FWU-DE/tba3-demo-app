// Der Katalog zeichnet seine Ansichten seit dem Umzug nicht mehr selbst,
// sondern über `@tba3/bausteine`. Diese Tests prüfen genau diese Naht: steht
// das Custom Element in der Seite, und hat es tatsächlich gezeichnet?
//
// Sie adressieren über den Elementnamen statt über `data-testid`, weil der
// Elementname hier die Zusage ist: `<tba3-aufgaben-tabelle>` ist der Vertrag
// zwischen Katalog und Paket, und eine Kennung daneben würde nur wiederholen,
// was der Tagname schon sagt.
//
// Zwei Fehler, die es vor dem Umzug gab, wären hier aufgefallen: eine Ansicht,
// deren Setup wirft, bleibt weiß — und ein Baustein ohne Daten zeichnet zwar,
// aber der Shadow-Baum bleibt leer.

import { test, expect } from '@playwright/test';

/** Route im Katalog (Hash-Router) → das Element, das dort zeichnen muss. */
const ANSICHTEN = [
  ['/competence-levels', 'tba3-kompetenzstufen-leiste'],
  ['/item-solution-table', 'tba3-aufgaben-tabelle'],
  ['/mean-comparison', 'tba3-mittelwert-vergleich'],
  ['/item-expected-actual', 'tba3-erwartet-tatsaechlich'],
  ['/percentile-band', 'tba3-perzentilbaender'],
  ['/student-solution-table', 'tba3-schueler-tabelle'],
  ['/competency-overview', 'tba3-uebersichtskarten'],
  ['/student-scatter', 'tba3-streudiagramm'],
  ['/bista-distribution', 'tba3-bista-verteilung'],
];

/**
 * Zählt im Licht-DOM der Seite.
 *
 * Playwrights CSS-Selektoren durchdringen offene Shadow Roots: `#zuordnung
 * tbody tr` fände auch die Zeilen, die eine Vorschau in ihrem eigenen Schatten
 * zeichnet. `document.querySelectorAll` tut das nicht — und hier ist genau das
 * gemeint.
 */
const anzahl = (page, auswahl) =>
  page.evaluate((a) => document.querySelectorAll(a).length, auswahl);

/** Hat das Element wirklich gezeichnet — oder steht nur die Hülle da? */
const gezeichnet = (page, tag) =>
  page.evaluate((t) => {
    const elemente = [...document.querySelectorAll(t)];
    return {
      anzahl: elemente.length,
      // Kind 1 ist immer der Stilblock; alles darüber ist Inhalt.
      mitInhalt: elemente.filter((el) => el.shadowRoot?.children.length > 1).length,
    };
  }, tag);

test.describe('Katalog — jede Ansicht zeichnet ihren Baustein', () => {
  for (const [route, element] of ANSICHTEN) {
    test(`${route} rendert ${element}`, async ({ page }) => {
      const fehler = [];
      page.on('pageerror', (e) => fehler.push(e.message));

      await page.goto(`/katalog/?lang=de#${route}`);
      await expect(page.locator(element).first()).toBeAttached();

      const befund = await gezeichnet(page, element);
      expect(befund.anzahl).toBeGreaterThan(0);
      expect(befund.mitInhalt, `${element} steht da, hat aber nichts gezeichnet`)
        .toBe(befund.anzahl);

      // Eine Ansicht, deren Setup wirft, zeigt keinen Fehler — sie zeigt gar
      // nichts. Deshalb ist die leere Konsole hier Teil der Zusage.
      expect(fehler, `${route} wirft`).toEqual([]);
    });
  }
});

test.describe('Bausteine — der Demonstrator', () => {
  test('zeigt jeden Baustein und die Zuordnung zum Katalog', async ({ page }) => {
    const fehler = [];
    page.on('pageerror', (e) => fehler.push(e.message));

    // Dass die Seite unter beiden Formen der Adresse überhaupt lädt, prüft
    // `bausteine.spec.js` nebenan; hier geht es um ihren Inhalt.
    await page.goto('/bausteine?lang=de');

    await expect.poll(() => anzahl(page, 'section.baustein')).toBe(12);
    await expect.poll(() => anzahl(page, '#zuordnung tbody tr')).toBe(9);
    await expect.poll(() => anzahl(page, '#nur-baustein li')).toBe(3);
    await expect(page.locator('#stand')).toContainText('9 von 9');
    expect(fehler).toEqual([]);
  });

  test('zeigt zu jedem Baustein eine Vorschau, die auch etwas zeigt', async ({ page }) => {
    await page.goto('/bausteine?lang=de');

    // Die Zuordnungstabelle und die Liste darunter nennen sonst nur
    // Elementnamen. Eine Vorschau, die leer bleibt, wäre schlimmer als keine.
    await expect.poll(() => anzahl(page, '.vorschau')).toBe(12);

    const gezeichnet = await page.evaluate(() =>
      [...document.querySelectorAll('.vorschau')]
        .filter((k) => k.firstElementChild?.shadowRoot?.children.length > 1).length,
    );
    expect(gezeichnet).toBe(12);
  });

  test('zeigt jeden Baustein in allen drei Fassungen', async ({ page }) => {
    await page.goto('/bausteine?lang=de');

    // Drei Fassungen je Baustein — driftet eine, fehlt hier eine Spalte.
    const abschnitte = page.locator('section.baustein');
    for (const abschnitt of await abschnitte.all()) {
      await expect(abschnitt.locator('.fassung')).toHaveCount(3);
    }
  });
});

test.describe('Katalog — die Naht zwischen Ansicht und Baustein', () => {
  test('ein Klick im Shadow DOM erreicht die Ansicht', async ({ page }) => {
    // Die Auswahl hält die Ansicht, das Element meldet sie nur. Dieser Weg —
    // Kästchen im Shadow DOM, CustomEvent, Vue-Hülle, Zustand der Ansicht —
    // ist beim Umzug neu entstanden und in keinem Unit-Test ganz enthalten.
    await page.goto('/katalog/?lang=de#/student-solution-table');

    const kaestchen = page.locator('tba3-schueler-tabelle input[type="checkbox"]').first();
    await expect(kaestchen).toBeVisible();
    await expect(page.getByTestId('auswahl-hinweis')).toHaveCount(0);

    await kaestchen.check();
    await expect(page.getByTestId('auswahl-hinweis')).toContainText('1');
  });

  test('die gewählte Referenz ändert die Erwartung in der Tabelle', async ({ page }) => {
    await page.goto('/katalog/?lang=de#/item-solution-table');

    const erwartet = page.locator('tba3-aufgaben-tabelle tbody tr').first().locator('td').nth(4);
    await expect(erwartet).toContainText('%');
    const vorher = await erwartet.innerText();

    await page.getByTestId('referenz-wahl').click();
    await page.getByRole('option', { name: 'Bundesland' }).click();

    await expect(erwartet).not.toHaveText(vorher);
  });
});

test.describe('Dunkles System, helle Seite', () => {
  // Der Fall, an dem es einmal schiefging: die Bausteine fragten
  // `prefers-color-scheme`, Katalog und Demonstrator haben aber keinen eigenen
  // Dunkelmodus. Wer sein System dunkel gestellt hatte, bekam dunkle Flächen
  // und hellen Text in eine weiße Seite. Seitdem entscheidet das
  // `color-scheme`, das die Seite vererbt — nimmt jemand die eine Zeile aus
  // `tokens.css` bzw. `katalog/index.html` heraus, schlagen diese beiden
  // Tests fehl.
  test.use({ colorScheme: 'dark' });

  /** Heller Text (Leuchtkraft über 0,5) auf heller Seite wäre der Fehler. */
  const textIstDunkel = (page, auswahl) =>
    page.evaluate((a) => {
      const el = document.querySelector(a);
      const [r, g, b] = getComputedStyle(el).color.match(/\d+/g).map(Number);
      const kanal = (w) => {
        const anteil = w / 255;
        return anteil <= 0.03928 ? anteil / 12.92 : ((anteil + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * kanal(r) + 0.7152 * kanal(g) + 0.0722 * kanal(b);
    }, auswahl);

  test('der Katalog stimmt seine Bausteine hell', async ({ page }) => {
    await page.goto('/katalog/?lang=de#/competence-levels');
    await expect(page.locator('tba3-kompetenzstufen-leiste').first()).toBeAttached();
    expect(await textIstDunkel(page, 'tba3-kompetenzstufen-leiste')).toBeLessThan(0.5);
  });

  test('der Demonstrator folgt seinem eigenen Auswahlfeld', async ({ page }) => {
    await page.goto('/bausteine?lang=de');
    await expect(page.locator('section.baustein').first()).toBeVisible();
    expect(await textIstDunkel(page, '#kompetenzstufen-leiste .buehne > *')).toBeLessThan(0.5);

    // Und andersherum: wählt jemand „dunkel", gilt das auch bei hellem System.
    await page.selectOption('#thema', 'thema-dunkel');
    await expect
      .poll(() => textIstDunkel(page, '#kompetenzstufen-leiste .buehne > *'))
      .toBeGreaterThan(0.5);
  });
});
