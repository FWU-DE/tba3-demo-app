// Abweichung je Lerngruppe als Custom Element.
//
// Aus der Schulleitungsrückmeldung des zepf herausgezogen: ein Balken je
// Klasse um die Nulllinie des Schulwerts.
//
//   el.addEventListener('gruppe-gewaehlt', (e) => e.detail);

import { STANDARD, abweichung } from '../kern/abweichung-je-gruppe.js';
import { elementKlasse } from './baustein-element.js';
import { h, s } from './svg.js';

const STIL = `
svg { display: block; max-width: 100%; height: auto; overflow: visible; }
.titel { font-weight: 600; margin-bottom: 6px; }
.raster { stroke: var(--tba3-_farbe-raster); }
.null { stroke: var(--tba3-_farbe-text); stroke-width: 1.5; }
.raster-text { fill: var(--tba3-_farbe-text-gedaempft); font-size: 10px; }
.bezug { fill: var(--tba3-_farbe-text-gedaempft); font-size: 11px; }
.zeile { cursor: pointer; outline: none; }
.zeile:hover .hinter, .zeile:focus-visible .hinter { fill: var(--tba3-_farbe-hervorhebung); }
.hinter { fill: transparent; }
.label { fill: var(--tba3-_farbe-text); font-size: 12px; }
.balken-ueber { fill: var(--tba3-_farbe-ueber); }
.balken-unter { fill: var(--tba3-_farbe-unter); }
.balken-im-rahmen { fill: var(--tba3-_farbe-im-rahmen); opacity: 0.6; }
.wert { fill: var(--tba3-_farbe-text-gedaempft); font-size: 11px; font-variant-numeric: tabular-nums; }
.delta { font-size: 11px; font-weight: 600; font-variant-numeric: tabular-nums; }
.delta-ueber { fill: var(--tba3-_farbe-ueber); }
.delta-unter { fill: var(--tba3-_farbe-unter); }
.delta-im-rahmen { fill: var(--tba3-_farbe-text-gedaempft); }
`;

function aufbauen(wurzel, zustand, el) {
  const a = abweichung(zustand);
  if (a.titel) wurzel.append(h('div', { class: 'titel', text: a.titel }));
  const m = a.masse;
  const svg = s('svg', {
    viewBox: `0 0 ${a.breite} ${a.hoehe}`, width: a.breite, height: a.hoehe,
    role: 'img', 'aria-label': `${a.titel || 'Abweichung je Lerngruppe'}${a.bezug ? ` gegenüber ${a.bezug.label} (${a.bezug.wertText})` : ''}`,
  });

  for (const t of a.ticks) {
    svg.append(
      s('line', { class: t.wert === 0 ? 'null' : 'raster', x1: t.x, y1: m.oben - 6, x2: t.x, y2: a.hoehe - m.unten + 4 }),
      s('text', { class: 'raster-text', x: t.x, y: a.hoehe - m.unten + 18, 'text-anchor': 'middle', text: t.text }),
    );
  }
  if (a.bezug) {
    svg.append(s('text', { class: 'bezug', x: a.mitte, y: m.oben - 12, 'text-anchor': 'middle', text: `${a.bezug.label}: ${a.bezug.wertText}` }));
  }

  for (const z of a.zeilen) {
    const melden = () => el.melden('gruppe-gewaehlt', { id: z.id, label: z.label, wert: z.wert, delta: z.delta });
    const gruppe = s('g', {
      class: 'zeile', tabindex: 0, role: 'button',
      'aria-label': `${z.label}: ${z.wertText}, ${z.deltaText} Prozentpunkte`,
    });
    gruppe.addEventListener('click', melden);
    gruppe.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); melden(); } });
    const mitteY = z.y + m.zeile / 2;
    gruppe.append(
      s('rect', { class: 'hinter', x: 0, y: z.y, width: a.breite, height: m.zeile }),
      s('text', { class: 'label', x: 4, y: mitteY, 'dominant-baseline': 'central', 'text-anchor': 'start', text: z.label }),
      s('rect', { class: `balken-${z.bewertung}`, x: z.x, y: z.y + 7, width: Math.max(1, z.breite), height: m.zeile - 14, rx: 2 }),
      s('text', {
        class: `delta delta-${z.bewertung}`,
        x: m.labelBreite + m.chartBreite + 8, y: mitteY, 'dominant-baseline': 'central', text: z.deltaText,
      }),
      s('text', {
        class: 'wert', x: m.labelBreite + m.chartBreite + 44, y: mitteY, 'dominant-baseline': 'central', text: z.wertText,
      }),
    );
    svg.append(gruppe);
  }
  wurzel.append(svg);
}

export const BAUPLAN = {
  name: 'abweichung-je-gruppe',
  titel: 'Abweichung je Lerngruppe',
  endpunkt: '/groups/{id}/competence-levels · /schools/{id}/competence-levels',
  standard: STANDARD,
  ereignisse: ['gruppe-gewaehlt'],
  stil: STIL,
  aufbauen,
};

export const AbweichungJeGruppeElement = elementKlasse(BAUPLAN);
export default BAUPLAN;
