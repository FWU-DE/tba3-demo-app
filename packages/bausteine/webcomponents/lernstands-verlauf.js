// Lernstands-Verlauf als Custom Element — mehrere Erhebungen auf einer Achse.
//
// Erfunden für die Bibliothek. Das Unsicherheitsband ist nicht Dekoration:
// unter jedem Punkt steht, ob die Veränderung zum vorigen Zeitpunkt belegt ist
// oder im Rauschen liegt. Ohne das liest jede Bewegung sich als Fortschritt.
//
//   el.addEventListener('zeitpunkt-gewaehlt', (e) => e.detail);

import { STANDARD, geometrie } from '../kern/lernstands-verlauf.js';
import { elementKlasse } from './baustein-element.js';
import { h, s } from './svg.js';

const STIL = `
.band { fill: var(--tba3-_farbe-marke); opacity: 0.14; }
.linie { fill: none; stroke: var(--tba3-_farbe-marke); stroke-width: 2.5; stroke-linejoin: round; }
.vergleichslinie { fill: none; stroke: var(--tba3-_farbe-text-gedaempft);
  stroke-width: 2; stroke-dasharray: 6 4; }
.punkt { cursor: pointer; }
.punkt circle { fill: var(--tba3-_farbe-marke); stroke: var(--tba3-_farbe-grund); stroke-width: 2; }
.punkt:hover circle, .punkt:focus-visible circle { stroke: var(--tba3-_farbe-text); }
.wertschrift { font-size: 11px; font-weight: 600; fill: var(--tba3-_farbe-text); }
.achsenschrift { font-size: 11px; fill: var(--tba3-_farbe-text-gedaempft); }
.raster { stroke: var(--tba3-_farbe-linie); stroke-dasharray: 3 3; opacity: 0.6; }
.achse { stroke: var(--tba3-_farbe-linie); }

.legende { display: flex; gap: calc(var(--tba3-_abstand) * 2); flex-wrap: wrap;
  font-size: 0.9em; color: var(--tba3-_farbe-text-gedaempft); margin-top: var(--tba3-_abstand); }
.legende .strich { width: 22px; height: 0; border-top: 2px solid var(--tba3-_farbe-marke);
  display: inline-block; vertical-align: 4px; margin-right: 6px; }
.legende .gestrichelt { border-top-style: dashed; border-color: var(--tba3-_farbe-text-gedaempft); }

.veraenderung { display: flex; gap: var(--tba3-_abstand); flex-wrap: wrap;
  margin-top: var(--tba3-_abstand); font-size: 0.9em; }
.veraenderung span { border: 1px solid var(--tba3-_farbe-linie); border-radius: var(--tba3-_radius);
  padding: 2px calc(var(--tba3-_abstand) * 0.75); }
.belegt { border-color: var(--tba3-_farbe-marke); color: var(--tba3-_farbe-marke); font-weight: 600; }

.leer {
  padding: calc(var(--tba3-_abstand) * 3); text-align: center;
  color: var(--tba3-_farbe-text-gedaempft);
  border: 1px dashed var(--tba3-_farbe-linie); border-radius: var(--tba3-_radius);
}
`;

function aufbauen(wurzel, zustand, el) {
  const g = geometrie(zustand);

  if (!g.punkte.length) {
    wurzel.append(h('p', { class: 'leer', text: 'Keine Erhebungen' }));
    return;
  }

  const svg = s('svg', {
    width: '100%',
    viewBox: `0 0 ${g.breite} ${g.hoehe}`,
    role: 'group',
    'aria-label': g.titel || 'Verlauf über mehrere Erhebungen',
  });

  for (const strich of g.teilstriche) {
    svg.append(
      s('line', { class: 'raster', x1: g.feld.x, x2: g.feld.x + g.feld.breite, y1: strich.y, y2: strich.y }),
      s('text', {
        class: 'achsenschrift', x: g.feld.x - 8, y: strich.y + 4, 'text-anchor': 'end',
        text: String(strich.wert),
      }),
    );
  }

  if (g.bandPfad) svg.append(s('path', { class: 'band', d: g.bandPfad }));
  if (g.vergleichLinie) svg.append(s('path', { class: 'vergleichslinie', d: g.vergleichLinie }));
  svg.append(s('path', { class: 'linie', d: g.linie }));

  svg.append(
    s('line', {
      class: 'achse', x1: g.feld.x, x2: g.feld.x + g.feld.breite,
      y1: g.feld.y + g.feld.hoehe, y2: g.feld.y + g.feld.hoehe,
    }),
  );

  for (const punkt of g.punkte) {
    svg.append(
      s('text', {
        class: 'achsenschrift', x: punkt.x, y: g.feld.y + g.feld.hoehe + 18,
        'text-anchor': 'middle', text: punkt.label,
      }),
    );

    const gruppe = s('g', {
      class: 'punkt',
      tabindex: '0',
      role: 'button',
      'aria-label': `${punkt.label}: ${punkt.wert ?? '—'}`,
    }, [
      s('circle', { cx: punkt.x, cy: punkt.y, r: g.punktRadius }),
      s('text', {
        class: 'wertschrift', x: punkt.x, y: punkt.y - 12, 'text-anchor': 'middle',
        text: punkt.wert === null ? '' : String(Math.round(punkt.wert)),
      }),
    ]);
    gruppe.addEventListener('click', () => el.melden('zeitpunkt-gewaehlt', { ...punkt }));
    gruppe.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        el.melden('zeitpunkt-gewaehlt', { ...punkt });
      }
    });
    svg.append(gruppe);
  }

  const legende = h('div', { class: 'legende' }, [
    h('span', {}, [h('i', { class: 'strich' }), 'Gruppe']),
    g.vergleichLinie
      ? h('span', {}, [h('i', { class: 'strich gestrichelt' }), g.vergleichLabel])
      : null,
    g.bandPfad ? h('span', { text: 'Band: Konfidenzintervall' }) : null,
  ]);

  // Die Veränderungen ausgeschrieben: „+13, belegt" ist die Aussage, wegen der
  // dieser Baustein existiert.
  const veraenderungen = h('div', { class: 'veraenderung' },
    g.punkte
      .filter((p) => p.delta !== null)
      .map((p) =>
        h('span', {
          class: p.belegt ? 'belegt' : '',
          text: `${p.label}: ${p.delta > 0 ? '+' : ''}${p.delta} ${p.belegt ? '· belegt' : '· nicht belegt'}`,
        }),
      ),
  );

  wurzel.append(
    h('figure', {}, [
      zustand.title ? h('figcaption', { text: zustand.title }) : null,
      h('div', { class: 'scroll' }, [svg]),
      legende,
      veraenderungen,
    ]),
  );
}

export const BAUPLAN = {
  name: 'lernstands-verlauf',
  titel: 'Lernstands-Verlauf',
  endpunkt: '/groups/{id}/aggregations',
  standard: STANDARD,
  ereignisse: ['zeitpunkt-gewaehlt'],
  stil: STIL,
  aufbauen,
};

export const LernstandsVerlaufElement = elementKlasse(BAUPLAN);
export default BAUPLAN;
