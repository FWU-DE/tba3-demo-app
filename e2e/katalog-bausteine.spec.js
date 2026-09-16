// Der Katalog zeichnet seine Ansichten seit dem Umzug nicht mehr selbst,
import { NUR_BAUSTEIN, ZUORDNUNG } from '../apps/portal/bausteine/zuordnung.js';
import { BAUSTEINE } from '../apps/shared/konsortium.js';
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
  // Aus den Rückmeldungen des Konsortiums herausgezogen — hier steht, dass sie
  // nicht nur im Demonstrator mit Beispieldaten zeichnen, sondern auch mit den
  // Antworten der Schnittstelle.
  ['/context-ring', 'tba3-kontextmerkmal-ring'],
  ['/standard-attainment', 'tba3-standard-erreichung'],
  ['/report-sentences', 'tba3-zeugnissaetze'],
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

    // Die Zahlen kommen aus den Daten, nicht aus diesem Test. Als sie hier
    // standen, mussten sie bei jedem neuen Baustein an drei Stellen
    // nachgezogen werden — und wer das vergisst, bekommt einen roten Test, der
    // nichts über die Seite sagt.
    // `webcomponents/index.js` ließe sich hier nicht laden — die Elementklassen
    // brauchen HTMLElement, und dieser Test läuft in Node. Die Zahl steht aber
    // ohnehin in der Zuordnung: `zuordnung.test.mjs` prüft, dass jeder Baustein
    // in genau einer der beiden Listen steht.
    const bausteine = ZUORDNUNG.length + NUR_BAUSTEIN.length;
    const umgezogen = ZUORDNUNG.filter((z) => z.stand === 'umgezogen').length;
    await expect.poll(() => anzahl(page, 'section.baustein')).toBe(bausteine);
    await expect.poll(() => anzahl(page, '#zuordnung tbody tr')).toBe(ZUORDNUNG.length);
    await expect.poll(() => anzahl(page, '#nur-baustein li')).toBe(NUR_BAUSTEIN.length);
    await expect(page.locator('#stand')).toContainText(`${umgezogen} von ${ZUORDNUNG.length}`);
    expect(fehler).toEqual([]);
  });

  test('zeigt zu jedem Baustein eine Vorschau, die auch etwas zeigt', async ({ page }) => {
    await page.goto('/bausteine?lang=de');

    // Die Zuordnungstabelle und die Liste darunter nennen sonst nur
    // Elementnamen. Eine Vorschau, die leer bleibt, wäre schlimmer als keine.
    const bausteine = ZUORDNUNG.length + NUR_BAUSTEIN.length;
    await expect.poll(() => anzahl(page, '.vorschau')).toBe(bausteine);

    const gezeichnet = await page.evaluate(() =>
      [...document.querySelectorAll('.vorschau')]
        .filter((k) => k.firstElementChild?.shadowRoot?.children.length > 1).length,
    );
    expect(gezeichnet).toBe(bausteine);
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

test.describe('Bausteine auf dem Telefon', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  // Ein Diagramm, das breiter ist als sein Platz, wurde früher nur gescrollt.
  // Von einem gestapelten Balken waren damit 42 Prozent zu sehen — und ein
  // abgeschnittener Stapelbalken sieht aus wie ein vollständiger. Wer die
  // Kompetenzstufen-Leiste überflog, las das Gegenteil der Daten.
  //
  // Geprüft wird deshalb nicht „die Seite läuft nicht über" (das tat sie auch
  // vorher nicht), sondern: jedes Bild passt in seinen Wirt.
  for (const [route, element] of ANSICHTEN) {
    test(`${route} zeichnet vollständig in 390 px`, async ({ page }) => {
      await page.goto(`/katalog/#${route}`);

      // Kein strikter Locator: mehrere Ansichten zeichnen ihren Baustein
      // mehrfach, eine Leiste je Domäne. Genau die müssen alle passen — und
      // `page.locator(tag)` wirft bei mehr als einem Treffer.
      await expect.poll(async () => (await gezeichnet(page, element)).mitInhalt)
        .toBeGreaterThan(0);

      const masse = await page.evaluate((tag) =>
        [...document.querySelectorAll(tag)].map((el) => {
          const svg = el.shadowRoot?.querySelector('svg');
          if (!svg) return null; // Tabellen-Bausteine zeichnen kein SVG
          return {
            svg: Math.round(svg.getBoundingClientRect().width),
            wirt: Math.round(svg.parentElement.clientWidth),
          };
        }).filter(Boolean), element);

      for (const [i, m] of masse.entries()) {
        expect(m.svg, `${route} [${i}]: ${m.svg} px Bild in ${m.wirt} px Platz`)
          .toBeLessThanOrEqual(m.wirt + 1);
      }

      // Und die Seite selbst schiebt nichts seitwärts.
      const seite = await page.evaluate(() => ({
        breite: document.documentElement.scrollWidth, fenster: window.innerWidth,
      }));
      expect(seite.breite, route).toBeLessThanOrEqual(seite.fenster);
    });
  }
});

test.describe('Woher ein Baustein stammt', () => {
  // Drei der fünfzehn Bausteine sind nicht aus dieser Schau gewachsen, sondern
  // aus den Rückmeldungen des Konsortiums herausgezogen. Das stand lange nur
  // in den Daten und in der Dokumentation — also nirgends, wo jemand Bausteine
  // durchsieht. Wer den Katalog öffnet, konnte nicht erkennen, welche
  // Komponenten von wo kommen, und genau das war die Rückmeldung des Nutzers.
  const ausRueckmeldungen = BAUSTEINE.filter((b) => b.beleg === 'artefakt' && b.element);

  test('der Demonstrator nennt sie bei jedem betroffenen Baustein', async ({ page }) => {
    await page.goto('/bausteine?lang=de');

    expect(ausRueckmeldungen.length, 'keine Bausteine aus den Rückmeldungen?').toBeGreaterThan(0);
    for (const b of ausRueckmeldungen) {
      const zeile = page.locator(`[data-herkunft="${b.id}"]`);
      await expect(zeile, b.id).toBeVisible();
      await expect(zeile).toContainText('Rückmeldungen des Konsortiums');
    }

    // Und nur dort: eine Herkunftszeile an jedem Abschnitt wäre Rauschen.
    await expect.poll(() => anzahl(page, '.herkunft')).toBe(ausRueckmeldungen.length);

    // Sichtbar heißt nicht gestaltet. Die Stilregeln für diese Zeile landeten
    // beim ersten Anlauf außerhalb des <style>-Blocks — die Zeile stand da,
    // unformatiert, und der Test war trotzdem grün. Deshalb wird hier eine
    // Eigenschaft geprüft, die nur aus dem Stilblock kommen kann.
    const hintergrund = await page.locator('.herkunft').first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(hintergrund, 'Herkunftszeile ohne Hintergrund — Stilblock nicht angekommen?')
      .not.toBe('rgba(0, 0, 0, 0)');
  });

  test('die Katalog-Übersicht markiert die, die dort eine Ansicht haben', async ({ page }) => {
    await page.goto('/katalog/');

    // Nicht jeder Baustein aus den Rückmeldungen hat eine Katalog-Ansicht:
    // drei von ihnen speist die Schnittstelle nicht und stehen deshalb nur im
    // Demonstrator (`NUR_BAUSTEIN`, je mit Grund). Erwartet wird deshalb der
    // Schnitt mit der Zuordnung, nicht die ganze Liste — sonst verlangt der
    // Test eine Karte, die es aus gutem Grund nicht gibt.
    const mitAnsicht = ausRueckmeldungen
      .filter((b) => ZUORDNUNG.some((z) => z.baustein === b.element));
    expect(mitAnsicht.length, 'keine mit Katalog-Ansicht?').toBeGreaterThan(0);

    for (const b of mitAnsicht) {
      await expect(page.getByTestId(`herkunft-${b.element}`), b.element).toBeVisible();
    }
    await expect.poll(() => anzahl(page, '[data-testid^="herkunft-"]')).toBe(mitAnsicht.length);
  });
});

test.describe('Bausteine nachnutzen', () => {
  // Diese Seite heißt „die Bibliothek" und soll zum Einbauen taugen. Bis
  // September 2026 zeigte sie nur, wie ein Baustein **aussieht** — in drei
  // Fassungen nebeneinander. Wer ihn mitnehmen wollte, musste in die README
  // oder in den Quelltext. Für eine Seite mit diesem Zweck war das die Hälfte.
  test('jeder Baustein zeigt Eigenschaften, Einbau und Quelltext', async ({ page }) => {
    await page.goto('/bausteine?lang=de');

    const bausteine = ZUORDNUNG.length + NUR_BAUSTEIN.length;
    await expect.poll(() => anzahl(page, '.nachnutzung')).toBe(bausteine);

    // Drei Fassungen je Baustein, jede mit einem Ausschnitt zum Kopieren.
    await expect.poll(() => anzahl(page, '.nachnutzung pre.schnipsel')).toBe(bausteine * 3);
    await expect.poll(() => anzahl(page, '.nachnutzung .kopieren')).toBe(bausteine * 3);

    // Und die Eigenschaften kommen aus dem Bauplan, nicht aus einer Liste
    // daneben: jeder Baustein hat mindestens eine.
    const ohneEigenschaften = await page.evaluate(() =>
      [...document.querySelectorAll('.nachnutzung')]
        .filter((b) => b.querySelectorAll('table.eigenschaften tbody tr').length === 0)
        .map((b) => b.dataset.nachnutzung));
    expect(ohneEigenschaften).toEqual([]);
  });

  test('der Ausschnitt nennt das Element, seine Daten und sein Ereignis', async ({ page }) => {
    await page.goto('/bausteine?lang=de');

    // `textContent` statt `innerText`: der Block ist ein zugeklapptes
    // <details>, und was nicht sichtbar ist, hat keinen innerText.
    const schnipsel = await page.locator('[data-nachnutzung="kompetenzstufen-leiste"] pre.schnipsel')
      .first().evaluate((el) => el.textContent);

    // Kein Platzhaltertext: der Ausschnitt muss sich einsetzen lassen.
    expect(schnipsel).toContain('<tba3-kompetenzstufen-leiste');
    expect(schnipsel).toContain('el.rows =');
    expect(schnipsel).toContain("addEventListener('stufe-gewaehlt'");
  });
});
