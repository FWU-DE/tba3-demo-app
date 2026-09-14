// Streudiagramm als Custom Element — Punkte mit Überlagerung.
//
// Der Baustein, an dem der Tooltip hängt. Er liegt bewusst **außerhalb** des
// SVG: ein Tooltip im SVG wird am Rand des viewBox abgeschnitten, und genau
// daran ist die Katalog-Ansicht hängen geblieben. Hier ist das SVG in einem
// positionierten Behälter, und die Überlagerung ist ein HTML-Knoten darüber.
//
//   el.addEventListener('punkt-gewaehlt', (e) => e.detail);
//   el.addEventListener('punkt-betreten', (e) => e.detail);

import { MASSE, STANDARD, geometrie } from '../kern/streudiagramm.js';
import { stufenFlaeche, stufenSchrift } from '../kern/thema.js';
import { elementKlasse } from './baustein-element.js';
import { h, s } from './svg.js';

const STIL = `
.buehne { position: relative; }
.punkt { cursor: pointer; }
.punkt circle { transition: r 90ms ease; }
.punkt:hover circle, .punkt:focus-visible circle { stroke: var(--tba3-_farbe-text); stroke-width: 2; }
.initialen { font-size: 10px; font-weight: 700; pointer-events: none; }

.hinweis {
  position: absolute; z-index: 2; pointer-events: none;
  transform: translate(-50%, -115%);
  background: var(--tba3-_farbe-grund);
  color: var(--tba3-_farbe-text);
  border: 1px solid var(--tba3-_farbe-linie);
  border-radius: var(--tba3-_radius);
  box-shadow: 0 4px 16px rgb(0 0 0 / 0.18);
  padding: calc(var(--tba3-_abstand) * 0.75) var(--tba3-_abstand);
  font-size: 0.9em; min-width: 140px;
}
.hinweis .name { font-weight: 600; margin-bottom: 4px; }
.hinweis dl { margin: 0; display: grid; grid-template-columns: 1fr auto; gap: 2px var(--tba3-_abstand); }
.hinweis dt { color: var(--tba3-_farbe-text-gedaempft); }
.hinweis dd { margin: 0; text-align: right; font-variant-numeric: tabular-nums; }

.achse { stroke: var(--tba3-_farbe-linie); }
.raster { stroke: var(--tba3-_farbe-linie); stroke-dasharray: 3 3; opacity: 0.6; }
.achsenschrift { font-size: 11px; fill: var(--tba3-_farbe-text-gedaempft); }
.mittelwert { stroke: var(--tba3-_farbe-marke); stroke-dasharray: 5 4; }

.leer {
  padding: calc(var(--tba3-_abstand) * 3); text-align: center;
  color: var(--tba3-_farbe-text-gedaempft);
  border: 1px dashed var(--tba3-_farbe-linie); border-radius: var(--tba3-_radius);
}
`;

const stufe = (wertX) => Math.max(1, Math.min(5, Math.round(wertX ?? 1)));
const STUFENFARBE = (wertX) => stufenFlaeche(stufe(wertX));
const STUFENSCHRIFT = (wertX) => stufenSchrift(stufe(wertX));

function aufbauen(wurzel, zustand, el) {
  const g = geometrie(zustand);

  if (!g.punkte.length) {
    wurzel.append(h('p', { class: 'leer', text: 'Keine Schüler:innen' }));
    return;
  }

  const buehne = h('div', { class: 'buehne' });
  const hinweis = h('div', { class: 'hinweis', hidden: true });

  const zeigen = (punkt) => {
    hinweis.replaceChildren(
      h('div', { class: 'name', text: punkt.name }),
      h('dl', {}, [
        h('dt', { text: 'Lösungsquote' }),
        h('dd', { text: `${Math.round(punkt.wertY ?? 0)} %` }),
        h('dt', { text: 'Stufe' }),
        h('dd', { text: String(punkt.wertX ?? '—') }),
        ...punkt.details.flatMap((d) => [
          h('dt', { text: d.label ?? d.domain ?? '' }),
          h('dd', { text: `${Math.round(d.wert ?? d.pct ?? 0)} %` }),
        ]),
      ]),
    );
    hinweis.style.left = `${punkt.tooltipLinks}%`;
    hinweis.style.top = `${punkt.tooltipOben}%`;
    hinweis.hidden = false;
  };

  const verbergen = () => {
    hinweis.hidden = true;
  };

  const svg = s('svg', {
    width: '100%',
    viewBox: `0 0 ${g.breite} ${g.hoehe}`,
    role: 'group',
    'aria-label': g.titel || 'Streudiagramm',
  });

  for (const strich of g.teilstriche) {
    svg.append(
      s('line', {
        class: 'raster', x1: g.feld.x, x2: g.feld.x + g.feld.breite, y1: strich.y, y2: strich.y,
      }),
      s('text', {
        class: 'achsenschrift', x: g.feld.x - 8, y: strich.y + 4, 'text-anchor': 'end',
        text: `${strich.pct}`,
      }),
    );
  }

  for (const stufe of g.stufen) {
    svg.append(
      s('text', {
        class: 'achsenschrift', x: stufe.x, y: g.feld.y + g.feld.hoehe + 18, 'text-anchor': 'middle',
        text: stufe.label,
      }),
    );
  }

  svg.append(
    s('line', {
      class: 'achse', x1: g.feld.x, x2: g.feld.x + g.feld.breite,
      y1: g.feld.y + g.feld.hoehe, y2: g.feld.y + g.feld.hoehe,
    }),
    s('text', {
      class: 'achsenschrift', x: g.feld.x + g.feld.breite / 2, y: g.hoehe - 6,
      'text-anchor': 'middle', text: g.xTitel,
    }),
    s('text', {
      class: 'achsenschrift', x: 12, y: g.feld.y + g.feld.hoehe / 2,
      'text-anchor': 'middle', transform: `rotate(-90 12 ${g.feld.y + g.feld.hoehe / 2})`,
      text: g.yTitel,
    }),
  );

  if (g.mittelwert) {
    svg.append(
      s('line', {
        class: 'mittelwert', x1: g.feld.x, x2: g.feld.x + g.feld.breite,
        y1: g.mittelwert.y, y2: g.mittelwert.y,
      }),
    );
  }

  for (const punkt of g.punkte) {
    const gruppe = s('g', {
      class: 'punkt',
      tabindex: '0',
      role: 'button',
      'aria-label': `${punkt.name}, ${Math.round(punkt.wertY ?? 0)} Prozent`,
    }, [
      s('circle', { cx: punkt.x, cy: punkt.y, r: g.radius, fill: STUFENFARBE(punkt.wertX) }),
      s('text', {
        class: 'initialen', x: punkt.x, y: punkt.y + 3.5, 'text-anchor': 'middle',
        fill: STUFENSCHRIFT(punkt.wertX), text: punkt.initialen,
      }),
    ]);

    gruppe.addEventListener('pointerenter', () => {
      zeigen(punkt);
      el.melden('punkt-betreten', { ...punkt });
    });
    gruppe.addEventListener('pointerleave', () => {
      verbergen();
      el.melden('punkt-verlassen', { ...punkt });
    });
    gruppe.addEventListener('focus', () => zeigen(punkt));
    gruppe.addEventListener('blur', verbergen);
    gruppe.addEventListener('click', () => el.melden('punkt-gewaehlt', { ...punkt }));
    gruppe.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        el.melden('punkt-gewaehlt', { ...punkt });
      }
    });

    svg.append(gruppe);
  }

  buehne.append(svg, hinweis);
  wurzel.append(
    h('figure', {}, [
      zustand.title ? h('figcaption', { text: zustand.title }) : null,
      buehne,
    ]),
  );
}

export const BAUPLAN = {
  name: 'streudiagramm',
  titel: 'Streudiagramm der Schüler:innen',
  endpunkt: '/groups/{id}/items?type=students',
  standard: STANDARD,
  ereignisse: ['punkt-gewaehlt', 'punkt-betreten', 'punkt-verlassen'],
  stil: STIL,
  aufbauen,
};

export const StreudiagrammElement = elementKlasse(BAUPLAN);
export default BAUPLAN;
