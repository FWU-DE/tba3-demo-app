// Kompetenzstufen-Leiste als Custom Element — echtes DOM, echte Ereignisse.
//
// Jedes Segment ist ein eigener Knoten mit Fokus und Tastaturbedienung und
// meldet Klick und Überfahren nach außen:
//
//   el.addEventListener('stufe-gewaehlt', (e) => {
//     e.detail  // { zeile, label, nameShort, pct, index }
//   });
//
// Genau das ging mit der SVG-Zeichenkette des ersten Entwurfs nicht.

import { STANDARD, geometrie } from '../kern/kompetenzstufen-leiste.js';
import { elementKlasse } from './baustein-element.js';
import { h, s } from './svg.js';

const STIL = `
.balken-segment { cursor: pointer; transition: opacity var(--tba3-dauer, 150ms); }
.balken-segment:hover, .balken-segment:focus-visible { opacity: 0.78; }
.balken-segment:focus-visible { outline: 2px solid var(--tba3-farbe-fokus); outline-offset: 1px; }
.zeile-fair .balken-segment { opacity: 0.8; }
.leer {
  padding: calc(var(--tba3-abstand) * 3);
  text-align: center;
  color: var(--tba3-farbe-text-gedaempft);
  border: 1px dashed var(--tba3-farbe-linie);
  border-radius: var(--tba3-radius);
}
`;

function aufbauen(wurzel, zustand, el) {
  const g = geometrie(zustand);
  const figur = h('figure');

  if (zustand.title) {
    figur.append(
      h('figcaption', {}, [
        document.createTextNode(zustand.title),
        zustand.domain ? h('span', { class: 'gedaempft', text: ` — ${zustand.domain}` }) : null,
      ]),
    );
  }

  if (!g.zeilen.length) {
    figur.append(h('p', { class: 'leer', text: 'Keine Daten' }));
    wurzel.append(figur);
    return;
  }

  const svg = s('svg', {
    width: g.breite,
    height: g.hoehe,
    viewBox: `0 0 ${g.breite} ${g.hoehe}`,
    role: 'img',
    'aria-label': zustand.title || 'Kompetenzstufenverteilung',
  });

  // Raster
  svg.append(
    s(
      'g',
      {},
      g.teilstriche.flatMap((t) => [
        s('line', {
          x1: t.x, y1: 20, x2: t.x, y2: 28 + g.balkenBlock,
          stroke: 'var(--tba3-farbe-raster)', 'stroke-width': 1,
        }),
        s('text', {
          x: t.x, y: 17, 'text-anchor': 'middle', 'font-size': 10,
          fill: 'var(--tba3-farbe-text-gedaempft)', text: `${t.pct}%`,
        }),
      ]),
    ),
  );

  // Zeilen
  g.zeilen.forEach((zeile, i) => {
    const gruppe = s('g', { class: zeile.fair ? 'zeile-fair' : '' });

    gruppe.append(
      s('text', {
        x: zeile.fair ? 138 : 152, y: zeile.y + 14,
        'text-anchor': 'end', 'dominant-baseline': 'middle', 'font-size': 12,
        fill: zeile.fair ? 'var(--tba3-farbe-marke)' : 'var(--tba3-farbe-text)',
        text: zeile.label,
      }),
    );
    if (zeile.fair) {
      gruppe.append(
        s('text', {
          x: 152, y: zeile.y + 14, 'text-anchor': 'end',
          'dominant-baseline': 'middle', 'font-size': 11, text: '⚖',
        }),
      );
    }

    zeile.segmente.forEach((seg, j) => {
      const feld = s('rect', {
        class: 'balken-segment',
        x: seg.x, y: zeile.y, width: seg.breite, height: 28,
        fill: seg.farbe, rx: 0,
        tabindex: '0', role: 'button',
        'aria-label': `${zeile.label}, Stufe ${seg.nameShort}: ${Math.round(seg.pct)} Prozent`,
      });

      const detail = {
        zeile: i, label: zeile.label, index: j,
        nameShort: seg.nameShort, pct: seg.pct,
      };
      feld.addEventListener('click', () => el.melden('stufe-gewaehlt', detail));
      feld.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          el.melden('stufe-gewaehlt', detail);
        }
      });
      feld.addEventListener('pointerenter', () => el.melden('stufe-betreten', detail));
      feld.addEventListener('pointerleave', () => el.melden('stufe-verlassen', detail));

      gruppe.append(feld);
      // Ein <title> im SVG ist der Tooltip, den der Browser selbst zeigt —
      // ohne Skript, ohne Bibliothek, und für Vorleseprogramme lesbar.
      feld.append(s('title', { text: `Stufe ${seg.nameShort}: ${Math.round(seg.pct)} %` }));

      if (seg.beschriftbar) {
        gruppe.append(
          s('text', {
            x: seg.x + seg.breite / 2, y: zeile.y + 14,
            'text-anchor': 'middle', 'dominant-baseline': 'middle',
            'font-size': 10, 'font-weight': 600, fill: 'var(--tba3-farbe-text-invers)',
            'pointer-events': 'none', text: seg.nameShort,
          }),
        );
      }
    });

    if (zeile.fair) {
      gruppe.append(
        s('rect', {
          x: 160, y: zeile.y, width: 560, height: 28, fill: 'none',
          stroke: 'var(--tba3-farbe-marke)', 'stroke-width': 2,
          'stroke-dasharray': '6,3', 'pointer-events': 'none',
        }),
      );
    }

    gruppe.append(
      s('text', {
        x: 725, y: zeile.y + 14, 'dominant-baseline': 'middle', 'font-size': 10,
        fill: 'var(--tba3-farbe-text-gedaempft)', text: `n=${zeile.total}`,
      }),
    );

    svg.append(gruppe);
  });

  // Legende
  svg.append(
    s(
      'g',
      { transform: `translate(160, ${g.legendeY})` },
      g.legende.map((l) =>
        s('g', { transform: `translate(${l.x}, 0)` }, [
          s('rect', { x: 0, y: 0, width: 12, height: 12, fill: l.farbe, rx: 2 }),
          s('text', {
            x: 15, y: 10, 'font-size': 10,
            fill: 'var(--tba3-farbe-text-gedaempft)', text: `Stufe ${l.nameShort}`,
          }),
        ]),
      ),
    ),
  );

  figur.append(h('div', { class: 'scroll' }, [svg]));
  wurzel.append(figur);
}

export const BAUPLAN = {
  name: 'kompetenzstufen-leiste',
  titel: 'Kompetenzstufen-Leiste',
  endpunkt: '/groups/{id}/competence-levels',
  standard: STANDARD,
  ereignisse: ['stufe-gewaehlt', 'stufe-betreten', 'stufe-verlassen'],
  stil: STIL,
  aufbauen,
};

export const KompetenzstufenLeisteElement = elementKlasse(BAUPLAN);
export default BAUPLAN;
