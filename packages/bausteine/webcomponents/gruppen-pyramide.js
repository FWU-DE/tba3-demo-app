// Zwei Gruppen gespiegelt als Custom Element.
//
// Aus der Schulleitungsrückmeldung des zepf herausgezogen: links die eine,
// rechts die andere Gruppe, je Kompetenzstufe ein Balken.
//
//   el.addEventListener('stufe-gewaehlt', (e) => e.detail);

import { STANDARD, pyramide } from '../kern/gruppen-pyramide.js';
import { elementKlasse } from './baustein-element.js';
import { h, s } from './svg.js';
import { TITEL_EN } from '../kern/texte.js';

const STIL = `
svg { display: block; max-width: 100%; height: auto; overflow: visible; }
.titel { font-weight: 600; margin-bottom: 6px; }
.kopf { fill: var(--tba3-_farbe-text); font-size: 12px; font-weight: 600; }
.zeile { cursor: pointer; outline: none; }
.zeile:hover .hinter, .zeile:focus-visible .hinter { fill: var(--tba3-_farbe-hervorhebung); }
.hinter { fill: transparent; }
.stufe { fill: var(--tba3-_farbe-text); font-size: 12px; font-weight: 600; }
.anteil { fill: var(--tba3-_farbe-text-gedaempft); font-size: 11px; font-variant-numeric: tabular-nums; }
${[1, 2, 3, 4, 5].map((n) => `.stufe-${n} { fill: var(--tba3-_stufe-${n}); }`).join('\n')}
.rechts { opacity: 0.85; }
`;

function aufbauen(wurzel, zustand, el, t) {
  const p = pyramide(zustand);
  if (p.titel) wurzel.append(h('div', { class: 'titel', text: p.titel }));
  const m = p.masse;
  const svg = s('svg', {
    viewBox: `0 0 ${p.breite} ${p.hoehe}`, width: p.breite, height: p.hoehe,
    role: 'img', 'aria-label': t('pyramide.aria', { titel: p.titel || t('pyramide.titel'), links: p.linksLabel, rechts: p.rechtsLabel }),
  });
  svg.append(
    s('text', { class: 'kopf', x: p.achseLinks - 4, y: m.oben - 14, 'text-anchor': 'end', text: p.linksLabel }),
    s('text', { class: 'kopf', x: p.achseRechts + 4, y: m.oben - 14, 'text-anchor': 'start', text: p.rechtsLabel }),
  );

  for (const z of p.zeilen) {
    const melden = () => el.melden('stufe-gewaehlt', { stufe: z.stufe, links: z.links.anteil, rechts: z.rechts.anteil, differenz: z.differenz });
    const gruppe = s('g', {
      class: 'zeile', tabindex: 0, role: 'button',
      'aria-label': t('pyramide.zeile', {
        stufe: z.stufe, links: p.linksLabel, linksWert: z.links.text, rechts: p.rechtsLabel, rechtsWert: z.rechts.text,
      }),
    });
    gruppe.addEventListener('click', melden);
    gruppe.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); melden(); } });
    const mitteY = z.y + m.zeile / 2;
    gruppe.append(
      s('rect', { class: 'hinter', x: 0, y: z.y, width: p.breite, height: m.zeile }),
      s('rect', { class: `stufe-${z.nummer}`, x: z.links.x, y: z.y + 4, width: Math.max(0.5, z.links.breite), height: m.zeile - 8, rx: 2 }),
      s('rect', { class: `stufe-${z.nummer} rechts`, x: z.rechts.x, y: z.y + 4, width: Math.max(0.5, z.rechts.breite), height: m.zeile - 8, rx: 2 }),
      s('text', { class: 'stufe', x: p.achseLinks + m.mitte / 2, y: mitteY, 'text-anchor': 'middle', 'dominant-baseline': 'central', text: z.stufe }),
      s('text', { class: 'anteil', x: z.links.x - 4, y: mitteY, 'text-anchor': 'end', 'dominant-baseline': 'central', text: z.links.text }),
      s('text', { class: 'anteil', x: z.rechts.x + z.rechts.breite + 4, y: mitteY, 'text-anchor': 'start', 'dominant-baseline': 'central', text: z.rechts.text }),
    );
    svg.append(gruppe);
  }
  wurzel.append(svg);
}

export const BAUPLAN = {
  name: 'gruppen-pyramide',
  titel: 'Zwei Gruppen gespiegelt',
  titelEn: TITEL_EN['gruppen-pyramide'],
  endpunkt: '/groups/{id}/competence-levels',
  standard: STANDARD,
  ereignisse: ['stufe-gewaehlt'],
  stil: STIL,
  aufbauen,
};

export const GruppenPyramideElement = elementKlasse(BAUPLAN);
export default BAUPLAN;
