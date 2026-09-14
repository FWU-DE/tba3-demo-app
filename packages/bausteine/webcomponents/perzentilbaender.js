// Perzentilbänder als Custom Element.

import { MASSE, STANDARD, geometrie, raute } from '../kern/perzentilbaender.js';
import { elementKlasse } from './baustein-element.js';
import { h, s } from './svg.js';

const STIL = `
.zeile { cursor: pointer; }
.zeile:focus-visible { outline: 2px solid var(--tba3-farbe-fokus); outline-offset: 1px; }
.leer {
  padding: calc(var(--tba3-abstand) * 3); text-align: center;
  color: var(--tba3-farbe-text-gedaempft);
  border: 1px dashed var(--tba3-farbe-linie); border-radius: var(--tba3-radius);
}
`;

// Eigene Themenvariablen mit zurückhaltenden Vorgaben — das Band ist kein
// Markenelement, es soll die Raute tragen, nicht überstrahlen.
const BAND = 'var(--tba3-band, rgba(90,155,210,0.50))';
const BAND_KANTE = 'var(--tba3-band-kante, rgba(60,125,185,0.70))';
const UNTEN = 'var(--tba3-band-unten, rgba(251,146,60,0.28))';
const OBEN = 'var(--tba3-band-oben, rgba(74,222,128,0.28))';
const GRUND = 'var(--tba3-band-grund, #e8f2f9)';
const MARKER = 'var(--tba3-band-marker, #1e3a5f)';

function aufbauen(wurzel, zustand, el) {
  const g = geometrie(zustand);
  const figur = h('figure');

  if (g.titel) figur.append(h('figcaption', { text: g.titel }));

  if (!g.zeilen.length) {
    figur.append(h('p', { class: 'leer', text: 'Keine Teilbereiche' }));
    wurzel.append(figur);
    return;
  }

  const svg = s('svg', {
    width: g.breite, height: g.hoehe, viewBox: `0 0 ${g.breite} ${g.hoehe}`,
    role: 'img', 'aria-label': g.titel || 'Perzentilbänder',
  });

  svg.append(
    s('rect', {
      x: MASSE.labelBreite, y: MASSE.oben,
      width: MASSE.chartBreite, height: g.chartHoehe, fill: GRUND,
    }),
    s('line', {
      x1: MASSE.labelBreite, y1: MASSE.oben - 4,
      x2: MASSE.labelBreite + MASSE.chartBreite, y2: MASSE.oben - 4,
      stroke: 'var(--tba3-farbe-linie)', 'stroke-width': 1,
    }),
    ...g.teilstriche.flatMap((t) => [
      s('line', {
        x1: t.x, y1: MASSE.oben - 4, x2: t.x, y2: MASSE.oben + g.chartHoehe,
        stroke: 'rgba(255,255,255,0.85)', 'stroke-width': 1,
      }),
      s('text', {
        x: t.x, y: MASSE.oben - 8, 'text-anchor': 'middle', 'font-size': 10,
        fill: 'var(--tba3-farbe-text-gedaempft)', text: `${t.pct}%`,
      }),
    ]),
    ...g.zeilen.map((z) =>
      s('line', {
        x1: MASSE.labelBreite, y1: z.trennlinieY,
        x2: g.breite - MASSE.rechts, y2: z.trennlinieY,
        stroke: 'rgba(255,255,255,0.45)', 'stroke-width': 1,
      }),
    ),
    s('path', { d: g.linkeFlaeche, fill: UNTEN }),
    s('path', { d: g.rechteFlaeche, fill: OBEN }),
    s('path', {
      d: g.bandPfad, fill: BAND, stroke: BAND_KANTE,
      'stroke-width': 1, 'stroke-linejoin': 'round',
    }),
  );

  g.zeilen.forEach((zeile, i) => {
    const gruppe = s('g', {
      class: 'zeile', tabindex: '0', role: 'button',
      'aria-label': zeile.hatWert
        ? `${zeile.label}: ${Math.round(zeile.wert)} Prozent`
        : zeile.label,
    });
    gruppe.append(
      s('text', {
        x: MASSE.labelBreite - 8, y: zeile.y, 'text-anchor': 'end',
        'dominant-baseline': 'middle', 'font-size': 11,
        fill: 'var(--tba3-farbe-text)', 'font-family': 'var(--tba3-schrift-mono)',
        text: zeile.label,
      }),
    );
    if (zeile.hatWert) {
      gruppe.append(
        s('path', {
          d: zeile.rautePfad, fill: MARKER,
          stroke: 'var(--tba3-farbe-text-invers)', 'stroke-width': 0.8,
        }),
        s('title', { text: `${zeile.label}: ${Math.round(zeile.wert)} %` }),
      );
    }
    const detail = { index: i, label: zeile.label, wert: zeile.wert };
    gruppe.addEventListener('click', () => el.melden('bereich-gewaehlt', detail));
    gruppe.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        el.melden('bereich-gewaehlt', detail);
      }
    });
    svg.append(gruppe);
  });

  const eintrag = (x, farbe, text, alsRaute = false) =>
    s('g', { transform: `translate(${x}, 0)` }, [
      alsRaute
        ? s('path', { d: raute(6, 0), fill: MARKER, stroke: 'var(--tba3-farbe-text-invers)', 'stroke-width': 0.8 })
        : s('rect', { x: 0, y: -5, width: 12, height: 10, rx: 2, fill: farbe }),
      s('text', {
        x: alsRaute ? 15 : 16, y: 4, 'font-size': 10,
        fill: 'var(--tba3-farbe-text-gedaempft)', text,
      }),
    ]);

  svg.append(
    s('g', { transform: `translate(${MASSE.labelBreite + 8}, ${g.legendeY})` }, [
      eintrag(0, 'var(--tba3-band-unten, rgba(251,146,60,0.55))', 'unterdurchschnittlich'),
      eintrag(152, BAND, g.bandLabel),
      eintrag(350, 'var(--tba3-band-oben, rgba(74,222,128,0.55))', 'überdurchschnittlich'),
      eintrag(500, null, g.markerLabel, true),
    ]),
    s('text', {
      x: MASSE.labelBreite + MASSE.chartBreite / 2, y: g.achseY,
      'text-anchor': 'middle', 'font-size': 10, 'font-style': 'italic',
      fill: 'var(--tba3-farbe-text-gedaempft)', text: g.xAxisLabel,
    }),
  );

  figur.append(h('div', { class: 'scroll' }, [svg]));
  wurzel.append(figur);
}

export const BAUPLAN = {
  name: 'perzentilbaender',
  titel: 'Perzentilbänder',
  endpunkt: '/groups/{id}/aggregations',
  standard: STANDARD,
  ereignisse: ['bereich-gewaehlt'],
  stil: STIL,
  aufbauen,
};

export const PerzentilbaenderElement = elementKlasse(BAUPLAN);
export default BAUPLAN;
