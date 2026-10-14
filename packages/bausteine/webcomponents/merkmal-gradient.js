// Lösungsquote nach Merkmal als Custom Element.
//
// Aus den Rückmeldungen von indibit herausgezogen: je Ausprägung eines
// Hintergrundmerkmals eine Zeile, je Bezugsgruppe ein Punkt.
//
//   el.addEventListener('auspraegung-gewaehlt', (e) => e.detail);

import { STANDARD, gradient } from '../kern/merkmal-gradient.js';
import { elementKlasse } from './baustein-element.js';
import { h, s } from './svg.js';

const STIL = `
svg { display: block; max-width: 100%; height: auto; overflow: visible; }
.titel { font-weight: 600; margin-bottom: 4px; }
.merkmal { font-size: 0.9em; color: var(--tba3-_farbe-text-gedaempft); margin-bottom: 6px; }
.raster { stroke: var(--tba3-_farbe-raster); }
.raster-text { fill: var(--tba3-_farbe-text-gedaempft); font-size: 10px; }
.zeile { cursor: pointer; outline: none; }
.zeile:hover .hinter, .zeile:focus-visible .hinter { fill: var(--tba3-_farbe-hervorhebung); }
.hinter { fill: transparent; }
.label { fill: var(--tba3-_farbe-text); font-size: 12px; }
.spanne { stroke: var(--tba3-_farbe-linie); stroke-width: 3; stroke-linecap: round; }
.punkt { stroke-width: 2; }
.reihe-0 { fill: var(--tba3-_farbe-marke); stroke: var(--tba3-_farbe-marke); }
.reihe-1 { fill: var(--tba3-_farbe-grund); stroke: var(--tba3-_farbe-text-gedaempft); }
.reihe-2 { fill: var(--tba3-_farbe-text); stroke: var(--tba3-_farbe-text); }
.reihe-3 { fill: var(--tba3-_farbe-grund); stroke: var(--tba3-_farbe-text); }
.legende { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 6px; font-size: 0.85em;
  color: var(--tba3-_farbe-text-gedaempft); }
.legende span { display: inline-flex; align-items: center; gap: 5px; }
.legende svg { display: inline; }
`;

const marke = (index, x, y, r = 5) => s('circle', { class: `punkt reihe-${index % 4}`, cx: x, cy: y, r });

function aufbauen(wurzel, zustand, el) {
  const g = gradient(zustand);
  if (g.titel) wurzel.append(h('div', { class: 'titel', text: g.titel }));
  if (g.merkmal) wurzel.append(h('div', { class: 'merkmal', text: g.merkmal }));

  const svg = s('svg', {
    viewBox: `0 0 ${g.breite} ${g.hoehe}`, width: g.breite, height: g.hoehe,
    role: 'img', 'aria-label': `${g.titel || 'Lösungsquote nach Merkmal'}${g.merkmal ? `: ${g.merkmal}` : ''}`,
  });
  const m = g.masse;

  for (const t of g.ticks) {
    svg.append(
      s('line', { class: 'raster', x1: t.x, y1: m.oben - 6, x2: t.x, y2: g.hoehe - m.unten + 4 }),
      s('text', { class: 'raster-text', x: t.x, y: m.oben - 12, 'text-anchor': 'middle', text: t.text }),
    );
  }

  for (const z of g.zeilen) {
    const gruppe = s('g', {
      class: 'zeile', tabindex: 0, role: 'button',
      'aria-label': `${z.label}: ${z.punkte.map((p) => `${p.label} ${p.wertText}`).join(', ')}`,
      onclick: null,
    });
    gruppe.addEventListener('click', () => el.melden('auspraegung-gewaehlt', { id: z.id, label: z.label, punkte: z.punkte }));
    gruppe.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); el.melden('auspraegung-gewaehlt', { id: z.id, label: z.label, punkte: z.punkte }); }
    });
    gruppe.append(
      s('rect', { class: 'hinter', x: 0, y: z.y - m.zeile / 2, width: g.breite, height: m.zeile }),
      s('text', { class: 'label', x: 4, y: z.y, 'dominant-baseline': 'central', 'text-anchor': 'start', text: z.label }),
    );
    if (z.von !== null && z.bis !== null && z.bis > z.von) {
      gruppe.append(s('line', { class: 'spanne', x1: z.von, y1: z.y, x2: z.bis, y2: z.y }));
    }
    for (const p of z.punkte) {
      const k = marke(p.index, p.x, p.y);
      k.append(s('title', { text: `${p.label}: ${p.wertText}${p.n ? ` (n=${p.n})` : ''}` }));
      gruppe.append(k);
    }
    svg.append(gruppe);
  }
  wurzel.append(svg);

  wurzel.append(h('div', { class: 'legende' }, g.legende.map((l) => h('span', {}, [
    s('svg', { width: 12, height: 12, viewBox: '0 0 12 12' }, [marke(l.index, 6, 6, 4.5)]),
    l.label,
  ]))));
}

export const BAUPLAN = {
  name: 'merkmal-gradient',
  titel: 'Lösungsquote nach Merkmal',
  endpunkt: '/groups/{id}/aggregations?aggregation=gender',
  standard: STANDARD,
  ereignisse: ['auspraegung-gewaehlt'],
  stil: STIL,
  aufbauen,
};

export const MerkmalGradientElement = elementKlasse(BAUPLAN);
export default BAUPLAN;
