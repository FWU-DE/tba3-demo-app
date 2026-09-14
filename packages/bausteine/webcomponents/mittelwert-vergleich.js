// Mittelwert-Vergleich als Custom Element.

import { MASSE, STANDARD, geometrie } from '../kern/mittelwert-vergleich.js';
import { elementKlasse } from './baustein-element.js';
import { h, s } from './svg.js';

const STIL = `
.marker { cursor: pointer; }
.marker:hover polygon, .marker:focus-visible polygon { stroke-width: 2.5; }
.marker:focus-visible { outline: 2px solid var(--tba3-_farbe-fokus); outline-offset: 2px; }
.leer {
  padding: calc(var(--tba3-_abstand) * 3); text-align: center;
  color: var(--tba3-_farbe-text-gedaempft);
  border: 1px dashed var(--tba3-_farbe-linie); border-radius: var(--tba3-_radius);
}
`;

const farbe = (fair) => (fair ? 'var(--tba3-_farbe-marke)' : 'var(--tba3-_farbe-marke)');

function aufbauen(wurzel, zustand, el) {
  const g = geometrie(zustand);
  const figur = h('figure');

  if (g.titel) {
    figur.append(
      h('figcaption', {}, [
        document.createTextNode(g.titel),
        g.domain ? h('span', { class: 'gedaempft', text: ` — ${g.domain}` }) : null,
      ]),
    );
  }

  if (!g.zeilen.length) {
    figur.append(h('p', { class: 'leer', text: 'Keine Daten' }));
    wurzel.append(figur);
    return;
  }

  const svg = s('svg', {
    width: g.breite, height: g.hoehe, viewBox: `0 0 ${g.breite} ${g.hoehe}`,
    role: 'img', 'aria-label': g.titel || 'Mittelwert-Vergleich',
  });

  // Zonen
  svg.append(
    s('g', {}, [
      ...g.zonen.map((z) =>
        s('rect', {
          x: z.x, y: MASSE.oben - 20, width: z.breite, height: g.flaeche + 20,
          fill: `var(--tba3-_${z.variable})`,
        }),
      ),
      ...g.zonen.map((z) =>
        s('text', {
          x: z.mitte, y: MASSE.oben - 8, 'text-anchor': 'middle', 'font-size': 8.5,
          fill: 'var(--tba3-_farbe-text-gedaempft)', text: z.text,
        }),
      ),
    ]),
  );

  // Raster
  svg.append(
    s('g', {}, g.teilstriche.flatMap((t) => [
      s('line', {
        x1: t.x, y1: MASSE.oben - 20, x2: t.x, y2: MASSE.oben + g.flaeche,
        stroke: 'var(--tba3-_farbe-raster)', 'stroke-width': 1,
      }),
      s('text', {
        x: t.x, y: MASSE.oben + g.flaeche + 14, 'text-anchor': 'middle',
        'font-size': 10, fill: 'var(--tba3-_farbe-text-gedaempft)', text: `${t.pct}%`,
      }),
    ])),
  );

  // Zeilen
  g.zeilen.forEach((zeile, i) => {
    const gruppe = s('g', {});
    const f = farbe(zeile.fair);

    gruppe.append(
      s('line', {
        x1: MASSE.labelBreite, y1: zeile.y,
        x2: MASSE.labelBreite + MASSE.chartBreite, y2: zeile.y,
        stroke: 'var(--tba3-_farbe-raster)', 'stroke-width': 1,
      }),
      s('text', {
        x: MASSE.labelBreite - 10, y: zeile.y, 'text-anchor': 'end',
        'dominant-baseline': 'middle', 'font-size': 12,
        fill: 'var(--tba3-_farbe-text)', text: zeile.label,
      }),
    );
    if (zeile.fair) {
      gruppe.append(
        s('text', {
          x: MASSE.labelBreite - 2, y: zeile.y, 'text-anchor': 'end',
          'dominant-baseline': 'middle', 'font-size': 11, text: '⚖',
        }),
      );
    }

    if (zeile.intervall) {
      gruppe.append(
        s('line', {
          x1: zeile.intervall.von, y1: zeile.y, x2: zeile.intervall.bis, y2: zeile.y,
          stroke: f, 'stroke-width': 2.5, 'stroke-linecap': 'round',
        }),
        s('line', {
          x1: zeile.intervall.von, y1: zeile.y - 6, x2: zeile.intervall.von, y2: zeile.y + 6,
          stroke: f, 'stroke-width': 1.5,
        }),
        s('line', {
          x1: zeile.intervall.bis, y1: zeile.y - 6, x2: zeile.intervall.bis, y2: zeile.y + 6,
          stroke: f, 'stroke-width': 1.5,
        }),
      );
    }

    const marker = s('g', {
      class: 'marker',
      transform: `translate(${zeile.markerX}, ${zeile.y})`,
      tabindex: '0', role: 'button',
      'aria-label': `${zeile.label}: ${Math.round(zeile.mean)} Prozent`,
    }, [
      s('polygon', {
        points: '0,-9 9,0 0,9 -9,0', fill: f,
        stroke: 'var(--tba3-_farbe-text-invers)', 'stroke-width': 1.5,
      }),
      s('text', {
        y: 1, 'text-anchor': 'middle', 'dominant-baseline': 'middle',
        'font-size': 7, 'font-weight': 700, fill: 'var(--tba3-_farbe-text-invers)',
        'pointer-events': 'none', text: String(Math.round(zeile.mean)),
      }),
      s('title', { text: `${zeile.label}: ${Math.round(zeile.mean)} %` }),
    ]);
    const detail = { zeile: i, label: zeile.label, mean: zeile.mean, fair: zeile.fair };
    marker.addEventListener('click', () => el.melden('zeile-gewaehlt', detail));
    marker.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        el.melden('zeile-gewaehlt', detail);
      }
    });
    gruppe.append(marker);

    if (zeile.n != null) {
      gruppe.append(
        s('text', {
          x: MASSE.labelBreite + MASSE.chartBreite + 8, y: zeile.y,
          'dominant-baseline': 'middle', 'font-size': 10,
          fill: 'var(--tba3-_farbe-text-gedaempft)', text: `n=${zeile.n}`,
        }),
      );
    }

    svg.append(gruppe);
  });

  svg.append(
    s('text', {
      x: MASSE.labelBreite + MASSE.chartBreite / 2, y: g.hoehe - 4,
      'text-anchor': 'middle', 'font-size': 10,
      fill: 'var(--tba3-_farbe-text-gedaempft)', text: g.xLabel,
    }),
  );

  figur.append(h('div', { class: 'scroll' }, [svg]));
  wurzel.append(figur);
}

export const BAUPLAN = {
  name: 'mittelwert-vergleich',
  titel: 'Mittelwert-Vergleich',
  endpunkt: '/groups, /schools, /states (items)',
  standard: STANDARD,
  ereignisse: ['zeile-gewaehlt'],
  stil: STIL,
  aufbauen,
};

export const MittelwertVergleichElement = elementKlasse(BAUPLAN);
export default BAUPLAN;
