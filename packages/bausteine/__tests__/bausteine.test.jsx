// Der Anspruch des Pakets: jede Visualisierung gibt es als Web Component,
// Vue- und React-Komponente, alle drei zeigen dasselbe und reagieren gleich.
//
// Gegenüber dem ersten Entwurf prüfen diese Tests nicht mehr Zeichenketten,
// sondern **gerendertes DOM und Verhalten** — Klicks, Tastatur, Sortierung,
// Ereignisse. Genau das war der Grund für den Umbau.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import { createApp, h } from 'vue';

import { BAUPLAENE, ELEMENTE, PRAEFIX, registrieren } from '../webcomponents/index.js';
import { KOMPONENTEN as VUE, bausteine } from '../vue/index.js';
import { KOMPONENTEN as REACT } from '../react/index.js';
import { THEMA } from '../kern/thema.js';
import { naechsteSortierung, zeilen as tabellenZeilen } from '../kern/aufgaben-tabelle.js';
import { geometrie as leisteGeometrie } from '../kern/kompetenzstufen-leiste.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const STUFEN = [
  { nameShort: 'I', pct: 8 }, { nameShort: 'II', pct: 22 }, { nameShort: 'III', pct: 34 },
  { nameShort: 'IV', pct: 24 }, { nameShort: 'V', pct: 12 },
];

const DATEN = {
  'kompetenzstufen-leiste': {
    title: '3a Deutsch',
    rows: [
      { label: 'Klasse 3a', total: 25, levels: STUFEN },
      { label: 'Fairer Vergleich', total: 480, fair: true, levels: STUFEN },
    ],
  },
  'aufgaben-tabelle': {
    title: 'Aufgaben',
    items: [
      { label: 'LE-026', exercise: 'Geheimsache', level: 'II', actual: 41, expected: 63 },
      { label: 'LE-027', exercise: 'Ausflug', level: 'IV', actual: 88, expected: 72 },
      { label: 'LE-028', exercise: 'Brief', level: 'III', actual: 60, expected: 58 },
    ],
  },
  'mittelwert-vergleich': {
    title: 'Mittelwerte',
    rows: [
      { label: 'Klasse 3a', mean: 62, ciLow: 55, ciHigh: 69, n: 25 },
      { label: 'Fairer Vergleich', mean: 58, fair: true, n: 480 },
    ],
  },
  'erwartet-tatsaechlich': {
    title: 'Erwartung',
    items: [
      { label: 'LE-026', level: 'II', actual: 41, expected: 63 },
      { label: 'LE-027', level: 'IV', actual: 88, expected: 72 },
    ],
  },
  perzentilbaender: {
    title: 'Teilbereiche',
    items: [
      { label: 'Lesen', bandLeft: 35, bandRight: 70, studentScore: 52 },
      { label: 'Zuhören', bandLeft: 40, bandRight: 75, studentScore: null },
    ],
  },
};

const pascal = (name) => name.replace(/(^|-)([a-zäöü])/g, (_, __, c) => c.toUpperCase());

/** Ein Element anlegen, in den Baum hängen und Eigenschaften setzen. */
function element(name, props) {
  registrieren();
  const el = document.createElement(PRAEFIX + name);
  document.body.append(el);
  if (props) el.props = props;
  return el;
}

/** Klick auslösen. SVG-Elemente haben in jsdom kein .click(); im Browser
 *  schon — deshalb hier immer das echte Ereignis. */
const klicken = (el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));

/** Auf das zusammengefasste Neuzeichnen warten (queueMicrotask). */
const gezeichnet = () => new Promise((r) => queueMicrotask(r));

/** Vergleichbares Abbild: Struktur und sichtbarer Text, ohne Schreibweisen. */
function abbild(wurzel) {
  const ziel = wurzel.querySelector('figure, table, div');
  const knoten = ziel ?? wurzel;
  return knoten.outerHTML.replace(/\s+/g, ' ').trim();
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('Verzeichnis', () => {
  it('führt jeden Baustein mit Namen, Titel, Endpunkt, Standard und Bauplan', () => {
    expect(BAUPLAENE.length).toBeGreaterThanOrEqual(5);
    for (const b of BAUPLAENE) {
      expect(b.name).toMatch(/^[a-zäöüß]+(-[a-zäöüß]+)*$/);
      expect(b.titel).toBeTruthy();
      expect(b.endpunkt).toBeTruthy();
      expect(b.standard).toBeTypeOf('object');
      expect(b.aufbauen).toBeTypeOf('function');
      expect(Array.isArray(b.ereignisse)).toBe(true);
    }
  });

  it('hat für jeden Baustein alle drei Fassungen', () => {
    for (const b of BAUPLAENE) {
      const name = pascal(b.name);
      expect(VUE[name], `Vue: ${b.name}`).toBeTypeOf('object');
      expect(REACT[name], `React: ${b.name}`).toBeTypeOf('function');
      expect(ELEMENTE[PRAEFIX + b.name], `Web Component: ${b.name}`).toBeTypeOf('function');
    }
  });

  it('hat für jeden Baustein Beispieldaten im Test', () => {
    for (const b of BAUPLAENE) expect(DATEN[b.name], b.name).toBeDefined();
  });
});

describe('Kern — reine Berechnung', () => {
  it('liefert Geometrie, keine Zeichenkette', () => {
    const g = leisteGeometrie(DATEN['kompetenzstufen-leiste']);
    expect(g.breite).toBeGreaterThan(0);
    expect(g.zeilen).toHaveLength(2);
    expect(g.zeilen[0].segmente).toHaveLength(5);
    // Segmente liegen lückenlos nebeneinander
    const s = g.zeilen[0].segmente;
    for (let i = 1; i < s.length; i++) {
      expect(s[i].x).toBeCloseTo(s[i - 1].x + s[i - 1].breite, 5);
    }
  });

  it('sortiert stabil und schiebt leere Werte ans Ende', () => {
    const daten = {
      items: [
        { label: 'A', actual: 50, expected: 50 },
        { label: 'B', actual: 90 },
        { label: 'C', actual: 50, expected: 30 },
      ],
      sortierung: 'delta', richtung: 'ab',
    };
    const z = tabellenZeilen(daten);
    expect(z.map((r) => r.label)).toEqual(['C', 'A', 'B']);
    expect(z.at(-1).delta).toBeNull();
  });

  it('schaltet die Sortierrichtung sinnvoll um', () => {
    // Zahlen zuerst absteigend — „die auffälligsten zuerst" ist beim Klick
    // auf eine Kennzahl fast immer gemeint.
    expect(naechsteSortierung('position', 'auf', 'actual')).toEqual({ sortierung: 'actual', richtung: 'ab' });
    expect(naechsteSortierung('position', 'auf', 'exercise')).toEqual({ sortierung: 'exercise', richtung: 'auf' });
    expect(naechsteSortierung('actual', 'ab', 'actual')).toEqual({ sortierung: 'actual', richtung: 'auf' });
  });

  it('kommt ohne Daten aus, statt zu werfen', () => {
    for (const b of BAUPLAENE) {
      const el = element(b.name);
      expect(el.shadowRoot.textContent).toBeTruthy();
      el.remove();
    }
  });
});

describe('Web Component — echtes DOM statt Zeichenkette', () => {
  it('baut echte Knoten, an denen Ereignisse hängen können', async () => {
    const el = element('kompetenzstufen-leiste', DATEN['kompetenzstufen-leiste']);
    await gezeichnet();
    const segmente = el.shadowRoot.querySelectorAll('.balken-segment');
    expect(segmente.length).toBe(10); // 2 Zeilen × 5 Stufen
    expect(segmente[0].namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(segmente[0].getAttribute('tabindex')).toBe('0');
  });

  it('meldet einen Klick auf ein Segment nach außen', async () => {
    const el = element('kompetenzstufen-leiste', DATEN['kompetenzstufen-leiste']);
    await gezeichnet();
    const gehoert = vi.fn();
    el.addEventListener('stufe-gewaehlt', (e) => gehoert(e.detail));
    klicken(el.shadowRoot.querySelectorAll('.balken-segment')[2]);
    expect(gehoert).toHaveBeenCalledOnce();
    expect(gehoert.mock.calls[0][0]).toMatchObject({ zeile: 0, index: 2, nameShort: 'III' });
  });

  it('lässt sich mit der Tastatur bedienen', async () => {
    const el = element('kompetenzstufen-leiste', DATEN['kompetenzstufen-leiste']);
    await gezeichnet();
    const gehoert = vi.fn();
    el.addEventListener('stufe-gewaehlt', gehoert);
    el.shadowRoot.querySelector('.balken-segment')
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(gehoert).toHaveBeenCalledOnce();
  });

  it('sortiert die Tabelle beim Klick auf eine Spalte', async () => {
    const el = element('aufgaben-tabelle', DATEN['aufgaben-tabelle']);
    await gezeichnet();
    const kennungen = () =>
      [...el.shadowRoot.querySelectorAll('tbody .kennung')].map((td) => td.textContent);

    expect(kennungen()).toEqual(['LE-026', 'LE-027', 'LE-028']);

    const gehoert = vi.fn();
    el.addEventListener('sortiert', (e) => gehoert(e.detail));
    // Spalte „Lösungsquote" — Index 3
    el.shadowRoot.querySelectorAll('thead .sortknopf')[3].click();
    await gezeichnet();

    expect(gehoert).toHaveBeenCalledWith({ sortierung: 'actual', richtung: 'ab' });
    expect(kennungen()).toEqual(['LE-027', 'LE-028', 'LE-026']);

    el.shadowRoot.querySelectorAll('thead .sortknopf')[3].click();
    await gezeichnet();
    expect(kennungen()).toEqual(['LE-026', 'LE-028', 'LE-027']);
  });

  it('gibt der Tabelle echte Tabellensemantik', async () => {
    const el = element('aufgaben-tabelle', { ...DATEN['aufgaben-tabelle'], sortierung: 'actual' });
    await gezeichnet();
    expect(el.shadowRoot.querySelector('table')).toBeTruthy();
    expect(el.shadowRoot.querySelectorAll('th[scope="col"]').length).toBeGreaterThan(0);
    expect(el.shadowRoot.querySelector('th[aria-sort]')).toBeTruthy();
  });

  it('fasst mehrere Zuweisungen zu einem Zeichnen zusammen', async () => {
    const el = element('kompetenzstufen-leiste');
    await gezeichnet();
    const vorher = el.shadowRoot.querySelector('figure');
    el.rows = DATEN['kompetenzstufen-leiste'].rows;
    el.title = 'Neu';
    el.domain = 'Lesen';
    // Noch nicht neu gezeichnet — erst im Microtask
    expect(el.shadowRoot.querySelector('figure')).toBe(vorher);
    await gezeichnet();
    expect(el.shadowRoot.querySelector('figcaption').textContent).toContain('Neu');
  });

  it('nimmt Daten als JSON im Attribut, für Seiten ohne eigenes Skript', () => {
    registrieren();
    const el = document.createElement('tba3-perzentilbaender');
    el.setAttribute('items', JSON.stringify([{ label: 'Lesen', bandLeft: 10, bandRight: 90 }]));
    document.body.append(el);
    expect(el.shadowRoot.textContent).toContain('Lesen');
  });

  it('überlebt ungültiges JSON im Attribut', () => {
    registrieren();
    const el = document.createElement('tba3-perzentilbaender');
    el.setAttribute('items', '{kaputt');
    expect(() => document.body.append(el)).not.toThrow();
    expect(el.shadowRoot.querySelector('svg, .leer')).toBeTruthy();
  });

  it('setzt Text als Text, nicht als Markup', async () => {
    const el = element('kompetenzstufen-leiste', {
      rows: [{ label: '<script>böse()</script>', total: 1, levels: [] }],
    });
    await gezeichnet();
    expect(el.shadowRoot.querySelector('script')).toBeNull();
    expect(el.shadowRoot.textContent).toContain('<script>');
  });

  it('lässt sich mehrfach registrieren, ohne zu werfen', () => {
    registrieren();
    expect(() => registrieren()).not.toThrow();
    expect(registrieren()).toEqual([]);
  });
});

describe('Thema — neutral und überschreibbar', () => {
  it('bringt für jede Variable einen Rückfallwert mit', () => {
    for (const [name, wert] of Object.entries(THEMA)) {
      expect(name.startsWith('--tba3-'), name).toBe(true);
      expect(String(wert).length).toBeGreaterThan(0);
    }
  });

  it('enthält keine Markenfarbe einer bestimmten Seite', () => {
    // Die Bausteine sollen überall einsetzbar sein — VIDIS-Blau gehört in die
    // umgebende Seite, nicht in die Bibliothek.
    const werte = Object.values(THEMA).join(' ').toLowerCase();
    expect(werte).not.toContain('#0000c4');
  });

  it('schreibt die Rückfallwerte ins Shadow DOM, wo die Seite sie überschreiben kann', async () => {
    const el = element('kompetenzstufen-leiste', DATEN['kompetenzstufen-leiste']);
    await gezeichnet();
    const stil = el.shadowRoot.querySelector('style').textContent;
    expect(stil).toContain('--tba3-stufe-1');
    expect(stil).toContain(':host');
  });
});

describe('Die drei Fassungen zeigen dasselbe', () => {
  for (const bauplan of BAUPLAENE) {
    it(`${bauplan.name}: Web Component, Vue und React rendern gleich`, async () => {
      const daten = DATEN[bauplan.name];
      const name = pascal(bauplan.name);

      // Web Component
      const direkt = element(bauplan.name, daten);
      await gezeichnet();
      const erwartet = abbild(direkt.shadowRoot);
      expect(erwartet.length).toBeGreaterThan(50);

      // Vue
      const vueHost = document.createElement('div');
      document.body.append(vueHost);
      const app = createApp({ render: () => h(VUE[name], daten) });
      app.use(bausteine);
      app.mount(vueHost);
      await gezeichnet();
      const vueEl = vueHost.querySelector(PRAEFIX + bauplan.name);
      expect(abbild(vueEl.shadowRoot), 'Vue weicht ab').toBe(erwartet);

      // React
      const reactHost = document.createElement('div');
      document.body.append(reactHost);
      const root = createRoot(reactHost);
      await act(async () => {
        root.render(createElement(REACT[name], daten));
      });
      await gezeichnet();
      const reactEl = reactHost.querySelector(PRAEFIX + bauplan.name);
      expect(abbild(reactEl.shadowRoot), 'React weicht ab').toBe(erwartet);

      app.unmount();
      await act(async () => root.unmount());
    });
  }
});

describe('Die Hüllen reichen Ereignisse durch', () => {
  it('Vue: @stufe-gewaehlt kommt an', async () => {
    const gehoert = vi.fn();
    const host = document.createElement('div');
    document.body.append(host);
    const app = createApp({
      render: () =>
        h(VUE.KompetenzstufenLeiste, {
          ...DATEN['kompetenzstufen-leiste'],
          onStufeGewaehlt: gehoert,
        }),
    });
    app.use(bausteine);
    app.mount(host);
    await gezeichnet();

    klicken(host.querySelector('tba3-kompetenzstufen-leiste')
      .shadowRoot.querySelector('.balken-segment'));

    expect(gehoert).toHaveBeenCalledOnce();
    expect(gehoert.mock.calls[0][0]).toMatchObject({ nameShort: 'I' });
    app.unmount();
  });

  it('React: onAufgabeGewaehlt kommt an', async () => {
    const gehoert = vi.fn();
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    await act(async () => {
      root.render(
        createElement(REACT.AufgabenTabelle, {
          ...DATEN['aufgaben-tabelle'],
          onAufgabeGewaehlt: gehoert,
        }),
      );
    });
    await gezeichnet();

    host.querySelector('tba3-aufgaben-tabelle')
      .shadowRoot.querySelector('tbody tr').click();

    expect(gehoert).toHaveBeenCalledOnce();
    expect(gehoert.mock.calls[0][0]).toMatchObject({ label: 'LE-026' });
    await act(async () => root.unmount());
  });

  it('Vue: geänderte Daten erreichen das Element als Eigenschaft, nicht als Attribut', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const zustand = { rows: DATEN['kompetenzstufen-leiste'].rows };
    const app = createApp({
      data: () => zustand,
      render() {
        return h(VUE.KompetenzstufenLeiste, { rows: this.rows });
      },
    });
    app.use(bausteine);
    app.mount(host);
    await gezeichnet();

    const el = host.querySelector('tba3-kompetenzstufen-leiste');
    // Als Attribut wäre daraus "[object Object]" geworden
    expect(el.getAttribute('rows')).toBeNull();
    expect(Array.isArray(el.rows)).toBe(true);
    expect(el.shadowRoot.querySelectorAll('.balken-segment').length).toBe(10);
    app.unmount();
  });
});
