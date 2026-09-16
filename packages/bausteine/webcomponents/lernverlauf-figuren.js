// Lernverlauf als Figuren — Custom Element.
//
// Vorbild: die Vögel der Messwiederholung des kompetenztest.de. Jede Person
// eine Marke, die über die Messzeitpunkte steigt oder sinkt; die
// Kompetenzstufen als benannte Zonen im Hintergrund statt als Zahlen an einer
// Achse.
//
//   el.addEventListener('person-gewaehlt', (e) => e.detail);

import { STANDARD, verlauf } from '../kern/lernverlauf-figuren.js';
import { elementKlasse } from './baustein-element.js';
import { h, s } from './svg.js';

const STIL = `
.zone { opacity: .5; }
.zone-name {
  font-size: 0.72em; font-weight: 600;
  fill: var(--tba3-_farbe-text-gedaempft);
}
.zeitpunkt { font-size: 0.78em; fill: var(--tba3-_farbe-text-gedaempft); }
.achse { stroke: var(--tba3-_farbe-raster); stroke-width: 1; }
.y-titel { font-size: 0.75em; fill: var(--tba3-_farbe-text-gedaempft); }

.spur { fill: none; stroke-width: 2; opacity: .45; }
.figur { cursor: pointer; }
.figur:focus-visible { outline: none; }
.figur:focus-visible .marke { stroke: var(--tba3-_farbe-fokus); stroke-width: 3; }
.marke { stroke: var(--tba3-_farbe-grund); stroke-width: 2; }
.figur:hover .marke { stroke: var(--tba3-_farbe-text); }
.zeichen {
  font-size: 0.66em; font-weight: 700; pointer-events: none;
  text-anchor: middle; dominant-baseline: central;
}
.leer { color: var(--tba3-_farbe-text-gedaempft); font-size: 0.9em; }
`;

/** Ohne eigene Farbe färbt die Zone, in der die Figur zuletzt stand. */
const FARBEN = ['var(--tba3-_stufe-1)', 'var(--tba3-_stufe-2)', 'var(--tba3-_stufe-3)',
  'var(--tba3-_stufe-4)', 'var(--tba3-_stufe-5)'];

function aufbauen(wurzel, zustand, el) {
  const v = verlauf(zustand);
  const m = v.masse;

  if (v.leer) {
    wurzel.append(h('p', { class: 'leer', text: 'Keine Messwerte' }));
    return;
  }

  const farbeVon = (figur) =>
    figur.farbe ?? figur.zone?.farbe ?? FARBEN[(figur.zone?.index ?? figur.index) % FARBEN.length];

  const inhalt = [
    // Zonen zuerst — sie sind der Hintergrund, auf dem alles andere liegt.
    v.zonen.map((zone) => [
      s('rect', {
        class: 'zone', x: m.links, y: zone.y, width: m.flaecheBreite, height: zone.hoehe,
        fill: zone.farbe ?? FARBEN[zone.index % FARBEN.length],
      }),
      s('text', {
        class: 'zone-name', x: m.links + m.flaecheBreite + 10, y: zone.mitteY,
        'dominant-baseline': 'central', text: zone.label,
      }),
    ]),

    // Waagerechte Trennlinien der Messzeitpunkte
    v.zeitpunkte.map((z) => [
      s('line', { class: 'achse', x1: z.x, y1: m.oben, x2: z.x, y2: m.oben + m.flaecheHoehe }),
      s('text', {
        class: 'zeitpunkt', x: z.x, y: m.oben + m.flaecheHoehe + 20,
        'text-anchor': 'middle', text: z.label,
      }),
    ]),

    v.yTitel
      ? s('text', {
          class: 'y-titel', x: 12, y: m.oben + m.flaecheHoehe / 2,
          'text-anchor': 'middle', transform: `rotate(-90 12 ${m.oben + m.flaecheHoehe / 2})`,
          text: v.yTitel,
        })
      : null,

    // Spuren unter die Marken, damit sie nicht darüberliegen
    v.figuren.map((f) => (f.pfad ? s('path', { class: 'spur', d: f.pfad, stroke: farbeVon(f) }) : null)),

    v.figuren.map((f) =>
      f.punkte.map((p, i) =>
        s('g', {
          class: 'figur',
          tabindex: i === f.punkte.length - 1 ? '0' : null,
          role: i === f.punkte.length - 1 ? 'button' : null,
          'aria-label': `${f.name}: ${p.wert}`,
          onclick: () => el.melden('person-gewaehlt', { ...f, punkt: p }),
          onkeydown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              el.melden('person-gewaehlt', { ...f, punkt: p });
            }
          },
        }, [
          s('circle', { class: 'marke', cx: p.x, cy: p.y, r: m.radius, fill: farbeVon(f) }),
          s('text', { class: 'zeichen', x: p.x, y: p.y, fill: 'var(--tba3-_farbe-text-invers)', text: f.zeichen }),
        ]))),
  ];

  wurzel.append(
    h('div', { class: 'scroll' }, [
      s('svg', {
        width: m.breite, height: m.hoehe, viewBox: `0 0 ${m.breite} ${m.hoehe}`,
        role: 'img',
        'aria-label': v.title || 'Lernverlauf über mehrere Messzeitpunkte',
      }, inhalt),
    ]),
  );
}

export const BAUPLAN = {
  name: 'lernverlauf-figuren',
  titel: 'Lernverlauf als Figuren',
  endpunkt: 'mehrere Erhebungen je Schüler:in',
  standard: STANDARD,
  ereignisse: ['person-gewaehlt'],
  stil: STIL,
  aufbauen,
};

export const LernverlaufFigurenElement = elementKlasse(BAUPLAN);
export default BAUPLAN;
