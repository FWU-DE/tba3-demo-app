// Netzdiagramm der Teilkompetenzen als Custom Element.
//
// Aus der Englisch-Rückmeldung des zepf herausgezogen: eine Achse je
// Teilkompetenz, die erste Reihe hervorgehoben, die übrigen als Bezug.
//
//   el.addEventListener('reihe-gewaehlt', (e) => e.detail);

import { STANDARD, netz } from '../kern/netzdiagramm.js';
import { elementKlasse } from './baustein-element.js';
import { h, s } from './svg.js';
import { TITEL_EN } from '../kern/texte.js';

const STIL = `
svg { display: block; max-width: 100%; height: auto; overflow: visible; }
.titel { font-weight: 600; margin-bottom: 6px; }
.ring { fill: none; stroke: var(--tba3-_farbe-raster); }
.ring-text { fill: var(--tba3-_farbe-text-gedaempft); font-size: 9px; }
.achse { stroke: var(--tba3-_farbe-linie); }
.achsen-text { fill: var(--tba3-_farbe-text); font-size: 11px; }
.reihe { cursor: pointer; }
.reihe path { stroke-width: 2; }
.reihe-0 path { fill: var(--tba3-_farbe-marke); fill-opacity: 0.18; stroke: var(--tba3-_farbe-marke); }
.reihe-0 circle { fill: var(--tba3-_farbe-marke); }
.reihe-1 path { fill: none; stroke: var(--tba3-_farbe-text-gedaempft); stroke-dasharray: 5 4; }
.reihe-1 circle { fill: var(--tba3-_farbe-text-gedaempft); }
.reihe-2 path { fill: none; stroke: var(--tba3-_farbe-text); stroke-dasharray: 2 3; }
.reihe-2 circle { fill: var(--tba3-_farbe-text); }
.reihe:hover path { stroke-width: 3; }
.legende { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 6px; font-size: 0.85em;
  color: var(--tba3-_farbe-text-gedaempft); }
.legende button { all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
.legende button:focus-visible { outline: 2px solid var(--tba3-_farbe-fokus); outline-offset: 2px; }
.leer { color: var(--tba3-_farbe-text-gedaempft); font-size: 0.9em; padding: var(--tba3-_abstand) 0; }
`;

function aufbauen(wurzel, zustand, el, t) {
  const n = netz(zustand);
  if (n.titel) wurzel.append(h('div', { class: 'titel', text: n.titel }));
  if (n.zuWenigAchsen) {
    wurzel.append(h('p', { class: 'leer', text: t('netz.zu-wenig') }));
    return;
  }
  const svg = s('svg', {
    viewBox: `0 ${n.obenRand} ${n.breite} ${n.hoehe - 2 * n.obenRand}`, width: n.breite, height: n.hoehe - 2 * n.obenRand,
    role: 'img', 'aria-label': `${n.titel || t('netz.aria')}: ${n.reihen.map((r) => r.label).join(', ')}`,
  });
  for (const r of n.ringe) svg.append(s('path', { class: 'ring', d: r.pfad }));
  for (const r of n.ringe) svg.append(s('text', { class: 'ring-text', x: n.mitte + 3, y: r.y - 2, text: r.text }));
  for (const a of n.achsen) {
    svg.append(
      s('line', { class: 'achse', x1: n.mitte, y1: n.mitte, x2: a.x2, y2: a.y2 }),
      s('text', { class: 'achsen-text', x: a.lx, y: a.ly, 'text-anchor': a.anker, 'dominant-baseline': 'central', text: a.label }),
    );
  }
  // Die hervorgehobene Reihe zuletzt, damit sie oben liegt.
  for (const r of [...n.reihen].reverse()) {
    const g = s('g', { class: `reihe reihe-${r.index % 3}` }, [
      s('path', { d: r.pfad }),
      ...r.punkte.map((p) => {
        const c = s('circle', { cx: p.x, cy: p.y, r: 3 });
        c.append(s('title', { text: `${r.label} · ${p.label}: ${p.text}` }));
        return c;
      }),
    ]);
    g.addEventListener('click', () => el.melden('reihe-gewaehlt', { id: r.id, label: r.label, punkte: r.punkte }));
    svg.append(g);
  }
  wurzel.append(svg);
  wurzel.append(h('div', { class: 'legende' }, n.reihen.map((r) => h('button', {
    type: 'button',
    onclick: () => el.melden('reihe-gewaehlt', { id: r.id, label: r.label, punkte: r.punkte }),
  }, [
    s('svg', { width: 22, height: 10, viewBox: '0 0 22 10', class: `reihe-${r.index % 3}` }, [s('path', { d: 'M 1 5 L 21 5' })]),
    r.label,
  ]))));
}

export const BAUPLAN = {
  name: 'netzdiagramm',
  titel: 'Netzdiagramm der Teilkompetenzen',
  titelEn: TITEL_EN.netzdiagramm,
  endpunkt: '/groups/{id}/items?type=students',
  standard: STANDARD,
  ereignisse: ['reihe-gewaehlt'],
  stil: STIL,
  aufbauen,
};

export const NetzdiagrammElement = elementKlasse(BAUPLAN);
export default BAUPLAN;
