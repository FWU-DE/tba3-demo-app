// Der Anspruch des Pakets ist, dass es jede Visualisierung in drei Fassungen
// gibt und alle drei dasselbe zeigen. Genau das prüfen diese Tests — sonst
// driften die Fassungen auseinander und niemand merkt es.

import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { renderToString } from 'vue/server-renderer';
import { createSSRApp, h } from 'vue';

import { BAUSTEINE, baustein } from '../kern/index.js';
import { KOMPONENTEN as VUE } from '../vue/index.js';
import { KOMPONENTEN as REACT } from '../react/index.js';
import { ELEMENTE, registrieren } from '../webcomponents/index.js';

// Beispieldaten je Baustein — genug, um jeden Zweig einmal zu treffen
// (faire Vergleiche, Konfidenzintervalle, Abweichungen über der Schwelle).
const DATEN = {
  'kompetenzstufen-leiste': {
    title: '3a Deutsch',
    domain: 'Lesen',
    rows: [
      {
        label: 'Klasse 3a',
        total: 25,
        levels: [
          { nameShort: 'I', pct: 8, color: '#ef4444' },
          { nameShort: 'II', pct: 22, color: '#f97316' },
          { nameShort: 'III', pct: 34, color: '#eab308' },
          { nameShort: 'IV', pct: 24, color: '#22c55e' },
          { nameShort: 'V', pct: 12, color: '#15803d' },
        ],
      },
      {
        label: 'Fairer Vergleich',
        total: 480,
        fair: true,
        levels: [
          { nameShort: 'I', pct: 10, color: '#ef4444' },
          { nameShort: 'II', pct: 20, color: '#f97316' },
          { nameShort: 'III', pct: 35, color: '#eab308' },
          { nameShort: 'IV', pct: 25, color: '#22c55e' },
          { nameShort: 'V', pct: 10, color: '#15803d' },
        ],
      },
    ],
  },
  'mittelwert-vergleich': {
    title: 'Mittlere Lösungsquote',
    rows: [
      { label: 'Klasse 3a', mean: 62, ciLow: 55, ciHigh: 69, n: 25 },
      { label: 'Fairer Vergleich', mean: 58, fair: true, n: 480 },
    ],
  },
  'erwartet-tatsaechlich': {
    title: 'Aufgaben im Vergleich zur Erwartung',
    items: [
      { label: 'LE-026', level: 'II', actual: 41, expected: 63 },
      { label: 'LE-027', level: 'IV', actual: 88, expected: 72 },
      { label: 'LE-028', level: 'III', actual: 60, expected: 58 },
    ],
  },
  perzentilbaender: {
    title: 'Teilbereiche',
    items: [
      { label: 'Lesen', bandLeft: 35, bandRight: 70, studentScore: 52 },
      { label: 'Zuhören', bandLeft: 40, bandRight: 75, studentScore: null },
      { label: 'Orthografie', bandLeft: 30, bandRight: 65, studentScore: 81 },
    ],
  },
};

/**
 * Nur das SVG vergleichen: die Umhüllung unterscheidet sich je Adapter.
 *
 * Alle drei Fassungen laufen durch dieselbe DOM-Normalisierung. Ohne das
 * vergliche man Schreibweisen statt Inhalt: der Weg über innerHTML (Web
 * Component) macht aus `<rect/>` ein `<rect></rect>`, Vue setzt
 * Kommentaranker, React lässt Leerzeichen anders stehen — alles Unterschiede,
 * die im gerenderten Bild nicht vorkommen.
 */
const nurSvg = (markup) => {
  const treffer = String(markup).match(/<svg[\s\S]*<\/svg>/);
  if (!treffer) return '';
  const huelle = document.createElement('div');
  huelle.innerHTML = treffer[0].replace(/<!--[\s\S]*?-->/g, '');
  return huelle.innerHTML.replace(/\s+/g, ' ').trim();
};

describe('Bausteine — Verzeichnis', () => {
  it('führt jeden Baustein mit Namen, Titel, Endpunkt und Bauplan', () => {
    expect(BAUSTEINE.length).toBeGreaterThan(0);
    for (const b of BAUSTEINE) {
      expect(b.name).toMatch(/^[a-zäöüß]+(-[a-zäöüß]+)*$/);
      expect(b.titel).toBeTruthy();
      expect(b.endpunkt).toBeTruthy();
      expect(typeof b.bauen).toBe('function');
      expect(b.standard).toBeTypeOf('object');
    }
  });

  it('meldet einen unbekannten Namen, statt undefined zurückzugeben', () => {
    expect(() => baustein('gibt-es-nicht')).toThrow(/Unbekannter Baustein/);
  });

  it('hat für jeden Baustein alle drei Fassungen', () => {
    for (const b of BAUSTEINE) {
      const pascal = b.name.replace(/(^|-)([a-zäöü])/g, (_, __, c) => c.toUpperCase());
      expect(VUE[pascal], `Vue: ${b.name}`).toBeTypeOf('object');
      expect(REACT[pascal], `React: ${b.name}`).toBeTypeOf('function');
      expect(ELEMENTE[`tba3-${b.name}`], `Web Component: ${b.name}`).toBeTypeOf('function');
    }
  });
});

describe('Bausteine — Kern', () => {
  for (const b of BAUSTEINE) {
    it(`${b.name}: liefert Maße und wohlgeformtes SVG`, () => {
      const { breite, hoehe, svg, html } = b.bauen(DATEN[b.name]);
      expect(breite).toBeGreaterThan(0);
      expect(hoehe).toBeGreaterThan(0);
      expect(svg.startsWith('<svg ')).toBe(true);
      expect(svg.endsWith('</svg>')).toBe(true);
      expect(html).toContain('<figure');
      // Keine offenen Platzhalter, keine NaN-Koordinaten
      expect(svg).not.toMatch(/NaN|undefined|\[object/);
    });

    it(`${b.name}: kommt ohne Daten aus, statt zu werfen`, () => {
      expect(() => b.bauen()).not.toThrow();
      expect(() => b.bauen({})).not.toThrow();
      const { svg } = b.bauen({});
      expect(svg).not.toMatch(/NaN|undefined/);
    });
  }

  it('entschärft Text aus den Daten, statt ihn als Markup zu setzen', () => {
    const { svg } = baustein('kompetenzstufen-leiste').bauen({
      rows: [{ label: '<script>böse()</script>', total: 1, levels: [] }],
    });
    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&lt;script&gt;');
  });
});

describe('Bausteine — die drei Fassungen zeigen dasselbe', () => {
  for (const b of BAUSTEINE) {
    const pascal = b.name.replace(/(^|-)([a-zäöü])/g, (_, __, c) => c.toUpperCase());

    it(`${b.name}: Vue, React und Web Component rendern dasselbe SVG`, async () => {
      const daten = DATEN[b.name];
      const erwartet = nurSvg(b.bauen(daten).html);
      expect(erwartet).not.toBe('');

      // React
      const react = nurSvg(renderToStaticMarkup(createElement(REACT[pascal], daten)));

      // Vue
      const app = createSSRApp({ render: () => h(VUE[pascal], daten) });
      const vue = nurSvg(await renderToString(app));

      // Web Component
      registrieren();
      const el = document.createElement(`tba3-${b.name}`);
      document.body.appendChild(el);
      el.props = daten;
      const web = nurSvg(el.shadowRoot.innerHTML);
      el.remove();

      expect(react, 'React weicht ab').toBe(erwartet);
      expect(vue, 'Vue weicht ab').toBe(erwartet);
      expect(web, 'Web Component weicht ab').toBe(erwartet);
    });
  }
});

describe('Bausteine — Web Component', () => {
  it('nimmt Daten über Eigenschaften entgegen und zeichnet neu', () => {
    registrieren();
    const el = document.createElement('tba3-kompetenzstufen-leiste');
    document.body.appendChild(el);

    expect(el.shadowRoot.innerHTML).toContain('<svg');

    el.rows = DATEN['kompetenzstufen-leiste'].rows;
    expect(el.shadowRoot.innerHTML).toContain('n=25');

    el.rows = [{ label: 'Andere', total: 7, levels: [] }];
    expect(el.shadowRoot.innerHTML).toContain('n=7');
    expect(el.shadowRoot.innerHTML).not.toContain('n=25');

    el.remove();
  });

  it('liest einfache Angaben auch aus Attributen', () => {
    registrieren();
    const el = document.createElement('tba3-kompetenzstufen-leiste');
    el.setAttribute('title', 'Aus dem Attribut');
    document.body.appendChild(el);
    expect(el.shadowRoot.innerHTML).toContain('Aus dem Attribut');
    el.remove();
  });

  it('nimmt Daten als JSON im Attribut, für Seiten ohne eigenes Skript', () => {
    registrieren();
    const el = document.createElement('tba3-perzentilbaender');
    el.setAttribute('items', JSON.stringify([{ label: 'Lesen', bandLeft: 10, bandRight: 90 }]));
    document.body.appendChild(el);
    expect(el.shadowRoot.innerHTML).toContain('Lesen');
    el.remove();
  });

  it('überlebt ungültiges JSON im Attribut', () => {
    registrieren();
    const el = document.createElement('tba3-perzentilbaender');
    el.setAttribute('items', '{kaputt');
    expect(() => document.body.appendChild(el)).not.toThrow();
    expect(el.shadowRoot.innerHTML).toContain('<svg');
    el.remove();
  });

  it('lässt sich mehrfach registrieren, ohne zu werfen', () => {
    registrieren();
    expect(() => registrieren()).not.toThrow();
    expect(registrieren()).toEqual([]);
  });
});
