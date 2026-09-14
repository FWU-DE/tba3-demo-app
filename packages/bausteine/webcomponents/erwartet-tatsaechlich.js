// Erwartete gegen tatsächliche Lösungsquote als Custom Element.

import { MASSE, STANDARD, geometrie } from '../kern/erwartet-tatsaechlich.js';
import { elementKlasse } from './baustein-element.js';
import { h, s } from './svg.js';

const STIL = `
.legende { display: flex; flex-wrap: wrap; gap: 4px 16px; margin-bottom: 10px;
  color: var(--tba3-farbe-text-gedaempft); font-size: 0.9em; }
.legende-eintrag { display: flex; align-items: center; gap: 5px; }
.punkt { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.linie { width: 16px; height: 0; flex-shrink: 0;
  border-top: 2px dashed var(--tba3-farbe-text); }
.zeile { cursor: pointer; }
.zeile:hover rect.balken, .zeile:focus-visible rect.balken { opacity: 1; }
.zeile:focus-visible { outline: 2px solid var(--tba3-farbe-fokus); outline-offset: 1px; }
.leer {
  padding: calc(var(--tba3-abstand) * 3); text-align: center;
  color: var(--tba3-farbe-text-gedaempft);
  border: 1px dashed var(--tba3-farbe-linie); border-radius: var(--tba3-radius);
}
`;

const BEWERTUNGSFARBE = {
  ueber: 'var(--tba3-farbe-ueber)',
  unter: 'var(--tba3-farbe-unter)',
  'im-rahmen': 'var(--tba3-farbe-im-rahmen)',
};

const STUFENFARBE = (stufe) => {
  const nr = { I: 1, II: 2, III: 3, IV: 4, V: 5 }[stufe];
  return nr ? `var(--tba3-stufe-${nr})` : 'var(--tba3-farbe-text-gedaempft)';
};

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

  figur.append(
    h('div', { class: 'legende' },
      g.legende.map((l) =>
        h('span', { class: 'legende-eintrag' }, [
          l.art === 'punkt'
            ? h('span', { class: 'punkt', style: `background:${BEWERTUNGSFARBE[l.bewertung]}` })
            : h('span', { class: 'linie' }),
          l.text,
        ]),
      ),
    ),
  );

  if (!g.zeilen.length) {
    figur.append(h('p', { class: 'leer', text: 'Keine Aufgaben' }));
    wurzel.append(figur);
    return;
  }

  const svg = s('svg', {
    width: g.breite, height: g.hoehe, viewBox: `0 0 ${g.breite} ${g.hoehe}`,
    role: 'img', 'aria-label': g.titel || 'Erwartete und tatsächliche Lösungsquote',
  });

  svg.append(
    s('g', {}, g.teilstriche.flatMap((t) => [
      s('line', {
        x1: t.x, y1: MASSE.oben - 10, x2: t.x, y2: MASSE.oben + g.flaeche,
        stroke: 'var(--tba3-farbe-raster)', 'stroke-width': 1,
      }),
      s('text', {
        x: t.x, y: MASSE.oben - 13, 'text-anchor': 'middle', 'font-size': 9.5,
        fill: 'var(--tba3-farbe-text-gedaempft)', text: `${t.pct}%`,
      }),
    ])),
  );

  g.zeilen.forEach((zeile, i) => {
    const f = BEWERTUNGSFARBE[zeile.bewertung];
    const gruppe = s('g', {
      class: 'zeile', tabindex: '0', role: 'button',
      'aria-label': `${zeile.label}: ${Math.round(zeile.actual)} Prozent, erwartet ${Math.round(zeile.expected)} Prozent`,
    });

    gruppe.append(
      s('text', {
        x: MASSE.labelBreite - 4, y: zeile.y + 11, 'text-anchor': 'end',
        'dominant-baseline': 'middle', 'font-size': 10.5,
        fill: 'var(--tba3-farbe-text)', 'font-family': 'var(--tba3-schrift-mono)',
        text: zeile.label,
      }),
      s('rect', {
        x: MASSE.labelBreite, y: zeile.y + 4, width: MASSE.abzeichen, height: 14,
        rx: 3, fill: STUFENFARBE(zeile.level),
      }),
      s('text', {
        x: MASSE.labelBreite + 11, y: zeile.y + 11, 'text-anchor': 'middle',
        'dominant-baseline': 'middle', 'font-size': 8.5, 'font-weight': 700,
        fill: 'var(--tba3-farbe-text-invers)', text: zeile.level,
      }),
      s('rect', {
        x: MASSE.chartX, y: zeile.y, width: MASSE.chartBreite, height: MASSE.zeilenHoehe,
        fill: 'var(--tba3-farbe-flaeche)', rx: 2,
      }),
      s('rect', {
        class: 'balken', x: MASSE.chartX, y: zeile.y + 4,
        width: zeile.balkenBreite, height: MASSE.zeilenHoehe - 8,
        fill: f, rx: 2, opacity: 0.85,
      }),
    );

    // Die Lücke nur hinterlegen, wenn sie auffällt — sonst ist jede Zeile
    // eingefärbt und keine sticht heraus.
    if (zeile.auffaellig) {
      gruppe.append(
        s('rect', {
          x: zeile.luecke.x, y: zeile.y + 4, width: zeile.luecke.breite,
          height: MASSE.zeilenHoehe - 8, fill: f, opacity: 0.15,
        }),
      );
    }

    gruppe.append(
      s('line', {
        x1: zeile.erwartungX, y1: zeile.y + 1, x2: zeile.erwartungX, y2: zeile.y + MASSE.zeilenHoehe - 1,
        stroke: 'var(--tba3-farbe-text)', 'stroke-width': 2, 'stroke-dasharray': '3,2',
      }),
      s('text', {
        x: MASSE.chartX + MASSE.chartBreite + 5, y: zeile.y + 7,
        'dominant-baseline': 'middle', 'font-size': 9, 'font-weight': 600,
        fill: 'var(--tba3-farbe-text)', text: `${Math.round(zeile.actual)}%`,
      }),
      s('text', {
        x: MASSE.chartX + MASSE.chartBreite + 5, y: zeile.y + 17,
        'dominant-baseline': 'middle', 'font-size': 8.5,
        fill: 'var(--tba3-farbe-text-gedaempft)', text: `erw. ${Math.round(zeile.expected)}%`,
      }),
      s('title', { text: `${zeile.label}: ${Math.round(zeile.actual)} % (erwartet ${Math.round(zeile.expected)} %)` }),
    );

    const detail = { index: i, ...zeile };
    gruppe.addEventListener('click', () => el.melden('aufgabe-gewaehlt', detail));
    gruppe.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        el.melden('aufgabe-gewaehlt', detail);
      }
    });

    svg.append(gruppe);
  });

  svg.append(
    s('text', {
      x: MASSE.chartX + MASSE.chartBreite / 2, y: g.hoehe - 6,
      'text-anchor': 'middle', 'font-size': 9.5,
      fill: 'var(--tba3-farbe-text-gedaempft)', text: 'Lösungsquote (%)',
    }),
  );

  figur.append(h('div', { class: 'scroll' }, [svg]));
  wurzel.append(figur);
}

export const BAUPLAN = {
  name: 'erwartet-tatsaechlich',
  titel: 'Erwartete und tatsächliche Lösungsquote',
  endpunkt: '/groups/{id}/items',
  standard: STANDARD,
  ereignisse: ['aufgabe-gewaehlt'],
  stil: STIL,
  aufbauen,
};

export const ErwartetTatsaechlichElement = elementKlasse(BAUPLAN);
export default BAUPLAN;
