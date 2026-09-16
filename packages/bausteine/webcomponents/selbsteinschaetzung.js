// Selbsteinschätzung gegen Ergebnis — Custom Element.
//
// Vorbild: die Selbsteinschätzung des Lernstand-Barometers
// (`SelfEvaluationPage.vue` mit vier Druckansichten).
//
// Zwei Marken je Zeile auf gemeinsamer Skala, dazwischen die Lücke als Strecke.
// Die Strecke ist der Punkt — nicht die beiden Werte.
//
//   el.addEventListener('zeile-gewaehlt', (e) => e.detail);

import { STANDARD, einschaetzung } from '../kern/selbsteinschaetzung.js';
import { elementKlasse } from './baustein-element.js';
import { h, s } from './svg.js';

const STIL = `
.zeile-label { font-size: 0.85em; fill: var(--tba3-_farbe-text); }
.raster { stroke: var(--tba3-_farbe-raster); stroke-width: 1; }
.raster-text { font-size: 0.72em; fill: var(--tba3-_farbe-text-gedaempft); }

.luecke { stroke-width: 3; stroke-linecap: round; }
.luecke-stimmig { stroke: var(--tba3-_farbe-raster); }
.luecke-darueber { stroke: var(--tba3-_farbe-ueber); }
.luecke-darunter { stroke: var(--tba3-_farbe-unter); }

.selbst { fill: var(--tba3-_farbe-grund); stroke: var(--tba3-_farbe-marke); stroke-width: 2.5; }
.gemessen { fill: var(--tba3-_farbe-marke); }
.delta { font-size: 0.78em; font-weight: 700; fill: var(--tba3-_farbe-text-gedaempft); }

.zeile { cursor: pointer; }
.zeile:hover .zeile-label { fill: var(--tba3-_farbe-marke); }
.zeile:focus-visible .zeile-label { fill: var(--tba3-_farbe-marke); }

.legende {
  display: flex; flex-wrap: wrap; gap: var(--tba3-_abstand);
  font-size: 0.85em; color: var(--tba3-_farbe-text-gedaempft);
  margin-top: var(--tba3-_abstand);
}
.legende span { display: inline-flex; align-items: center; gap: 6px; }
.punkt-selbst, .punkt-gemessen { width: 11px; height: 11px; border-radius: 50%; }
.punkt-selbst { background: var(--tba3-_farbe-grund); border: 2.5px solid var(--tba3-_farbe-marke); }
.punkt-gemessen { background: var(--tba3-_farbe-marke); }
.bilanz { font-size: 0.85em; color: var(--tba3-_farbe-text-gedaempft); margin-top: 4px; }
.leer { color: var(--tba3-_farbe-text-gedaempft); font-size: 0.9em; }
`;

const TEILSTRICHE = [0, 25, 50, 75, 100];

function aufbauen(wurzel, zustand, el) {
  const e = einschaetzung(zustand);
  const m = e.masse;

  if (e.leer) {
    wurzel.append(h('p', { class: 'leer', text: 'Keine Selbsteinschätzung erhoben' }));
    return;
  }

  const x = (wert) => m.labelBreite + (wert / 100) * m.chartBreite;

  const inhalt = [
    TEILSTRICHE.map((t) => [
      s('line', { class: 'raster', x1: x(t), y1: m.oben - 8, x2: x(t), y2: e.hoehe - m.unten + 4 }),
      s('text', { class: 'raster-text', x: x(t), y: m.oben - 14, 'text-anchor': 'middle', text: `${t}%` }),
    ]),

    e.zeilen.map((z) =>
      s('g', {
        class: 'zeile',
        tabindex: '0',
        role: 'button',
        'aria-label': `${z.label}: Selbsteinschätzung ${z.selbst}, gemessen ${z.gemessen}`,
        onclick: () => el.melden('zeile-gewaehlt', { ...z }),
        onkeydown: (ev) => {
          if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); el.melden('zeile-gewaehlt', { ...z }); }
        },
      }, [
        s('text', {
          class: 'zeile-label', x: m.labelBreite - 12, y: z.y,
          'text-anchor': 'end', 'dominant-baseline': 'central', text: z.label,
        }),
        s('line', {
          class: `luecke luecke-${z.lage}`,
          x1: z.xSelbst, y1: z.y, x2: z.xGemessen, y2: z.y,
        }),
        s('circle', { class: 'gemessen', cx: z.xGemessen, cy: z.y, r: m.radius }),
        s('circle', { class: 'selbst', cx: z.xSelbst, cy: z.y, r: m.radius }),
        s('text', {
          class: 'delta', x: m.labelBreite + m.chartBreite + 14, y: z.y,
          'dominant-baseline': 'central', text: z.deltaText,
        }),
      ])),

    e.xTitel
      ? s('text', {
          class: 'raster-text', x: m.labelBreite + m.chartBreite / 2, y: e.hoehe - 10,
          'text-anchor': 'middle', text: e.xTitel,
        })
      : null,
  ];

  wurzel.append(
    h('div', { class: 'scroll' }, [
      s('svg', {
        width: m.breite, height: e.hoehe, viewBox: `0 0 ${m.breite} ${e.hoehe}`,
        role: 'img', 'aria-label': e.title || 'Selbsteinschätzung gegen Ergebnis',
      }, inhalt),
    ]),
    h('div', { class: 'legende' }, [
      h('span', {}, [h('i', { class: 'punkt-selbst' }), e.selbstLabel]),
      h('span', {}, [h('i', { class: 'punkt-gemessen' }), e.gemessenLabel]),
    ]),
    h('p', {
      class: 'bilanz',
      text: e.auffaellig === 0
        ? 'Selbsteinschätzung und Messung liegen überall nah beieinander.'
        : `${e.auffaellig} von ${e.zeilen.length} Merkmalen liegen weit auseinander.`,
    }),
  );
}

export const BAUPLAN = {
  name: 'selbsteinschaetzung',
  titel: 'Selbsteinschätzung gegen Ergebnis',
  endpunkt: 'erhobene Selbsteinschätzung, nicht Teil der Schnittstelle',
  standard: STANDARD,
  ereignisse: ['zeile-gewaehlt'],
  stil: STIL,
  aufbauen,
};

export const SelbsteinschaetzungElement = elementKlasse(BAUPLAN);
export default BAUPLAN;
