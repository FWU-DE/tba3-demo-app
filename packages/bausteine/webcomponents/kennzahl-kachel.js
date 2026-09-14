// Kennzahl-Kachel als Custom Element — der kleinste Baustein.
//
// Erfunden für die Bibliothek: eine Zahl, ihre Bezugsgröße und ihr Verlauf.
// Bewusst so klein, dass mehrere nebeneinander passen — die Kachel ist das
// Stück, das bisher jede Anwendung selbst gebaut hat, bevor sie zum ersten
// Diagramm kam.
//
//   el.addEventListener('kachel-gewaehlt', (e) => e.detail);

import { STANDARD, kachel } from '../kern/kennzahl-kachel.js';
import { elementKlasse } from './baustein-element.js';
import { h, s } from './svg.js';

const STIL = `
.kachel {
  all: unset; cursor: pointer; display: block;
  border: 1px solid var(--tba3-_farbe-linie);
  border-radius: var(--tba3-_radius);
  padding: calc(var(--tba3-_abstand) * 1.5);
  background: var(--tba3-_farbe-grund);
}
.kachel:hover { border-color: var(--tba3-_farbe-marke); }
.label { font-size: 0.9em; color: var(--tba3-_farbe-text-gedaempft); }
.zeile { display: flex; align-items: flex-end; justify-content: space-between;
  gap: var(--tba3-_abstand); margin-top: 4px; }
.wert { font-size: 2.1em; font-weight: 700; line-height: 1; font-variant-numeric: tabular-nums; }
.einheit { font-size: 0.45em; font-weight: 600; margin-left: 2px; color: var(--tba3-_farbe-text-gedaempft); }

.delta { font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }
.delta-ueber { color: var(--tba3-_farbe-ueber); }
.delta-unter { color: var(--tba3-_farbe-unter); }
.delta-im-rahmen { color: var(--tba3-_farbe-text-gedaempft); }

.messlatte { position: relative; height: 8px; border-radius: 4px;
  background: var(--tba3-_farbe-flaeche); margin-top: calc(var(--tba3-_abstand) * 1.2); }
.messlatte > i { position: absolute; inset: 0 auto 0 0; border-radius: 4px;
  background: var(--tba3-_farbe-marke); }
.messlatte > b { position: absolute; top: -3px; width: 2px; height: 14px;
  background: var(--tba3-_farbe-text); }

.fuss { display: flex; justify-content: space-between; gap: var(--tba3-_abstand);
  margin-top: 6px; font-size: 0.85em; color: var(--tba3-_farbe-text-gedaempft); }
.verlauf { stroke: var(--tba3-_farbe-marke); fill: none; stroke-width: 2; }
.hinweis { font-size: 0.85em; color: var(--tba3-_farbe-text-gedaempft);
  margin-top: var(--tba3-_abstand); }
`;

function aufbauen(wurzel, zustand, el) {
  const k = kachel(zustand);

  const knopf = h('button', {
    class: 'kachel',
    type: 'button',
    'aria-label': `${k.label}: ${k.hatWert ? k.wert + k.einheit : 'kein Wert'}`,
    onclick: () => el.melden('kachel-gewaehlt', { ...k }),
  });

  knopf.append(h('div', { class: 'label', text: k.label }));

  knopf.append(
    h('div', { class: 'zeile' }, [
      h('div', { class: 'wert' }, [
        k.hatWert ? String(k.wert) : '—',
        k.hatWert && k.einheit ? h('span', { class: 'einheit', text: k.einheit }) : null,
      ]),
      k.delta === null
        ? null
        : h('div', { class: `delta delta-${k.bewertung}`, text: `${k.deltaText} ggü. ${k.vergleichLabel}` }),
    ]),
  );

  const latte = h('div', { class: 'messlatte' }, [
    h('i', { style: `width:${Math.round(k.anteil * 100)}%` }),
    k.vergleichAnteil === null
      ? null
      : h('b', { style: `left:calc(${Math.round(k.vergleichAnteil * 100)}% - 1px)`, title: k.vergleichLabel }),
  ]);
  knopf.append(latte);

  if (k.verlaufPfad) {
    knopf.append(
      h('div', { class: 'fuss' }, [
        h('span', { text: 'Verlauf' }),
        s('svg', {
          width: k.verlaufMasse.verlaufBreite,
          height: k.verlaufMasse.verlaufHoehe,
          viewBox: `0 0 ${k.verlaufMasse.verlaufBreite} ${k.verlaufMasse.verlaufHoehe}`,
          role: 'img',
          'aria-label': 'Verlauf der letzten Erhebungen',
        }, [s('path', { class: 'verlauf', d: k.verlaufPfad })]),
      ]),
    );
  }

  if (k.hinweis) knopf.append(h('p', { class: 'hinweis', text: k.hinweis }));

  wurzel.append(knopf);
}

export const BAUPLAN = {
  name: 'kennzahl-kachel',
  titel: 'Kennzahl-Kachel',
  endpunkt: '/groups/{id}/aggregations',
  standard: STANDARD,
  ereignisse: ['kachel-gewaehlt'],
  stil: STIL,
  aufbauen,
};

export const KennzahlKachelElement = elementKlasse(BAUPLAN);
export default BAUPLAN;
