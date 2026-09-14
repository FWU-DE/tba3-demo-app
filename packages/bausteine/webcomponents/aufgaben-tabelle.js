// Aufgaben-Tabelle als Custom Element — HTML-Tabelle, sortierbar, mit Zustand.
//
// Der Baustein, der mit dem alten SVG-Ansatz nicht zu bauen war. Er zeigt,
// dass die Bibliothek mehr kann als Diagramme: echte Tabellensemantik
// (<table>, <th scope>, aria-sort), Tastaturbedienung und Zustand.
//
//   el.addEventListener('sortiert', (e) => e.detail); // { sortierung, richtung }
//   el.addEventListener('aufgabe-gewaehlt', (e) => e.detail);

import { SPALTEN, STANDARD, naechsteSortierung, zeilen } from '../kern/aufgaben-tabelle.js';
import { elementKlasse } from './baustein-element.js';
import { h } from './svg.js';

const STIL = `
table { border-collapse: collapse; width: 100%; font-variant-numeric: tabular-nums; }
caption { text-align: left; padding-bottom: var(--tba3-_abstand); }
th, td {
  padding: calc(var(--tba3-_abstand) * 0.75) var(--tba3-_abstand);
  border-bottom: 1px solid var(--tba3-_farbe-linie);
  text-align: left;
}
th { font-weight: 600; white-space: nowrap; }
td.zahl, th.zahl { text-align: right; }
tbody tr { cursor: pointer; }
tbody tr:hover, tbody tr:focus-within { background: var(--tba3-_farbe-hervorhebung); }
thead th { border-bottom: 2px solid var(--tba3-_farbe-linie); }

.sortknopf {
  all: unset;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font: inherit;
  font-weight: 600;
}
.sortknopf:hover { color: var(--tba3-_farbe-marke); }
.pfeil { opacity: 0.35; font-size: 0.85em; }
th[aria-sort] .pfeil { opacity: 1; color: var(--tba3-_farbe-marke); }

.kennung { font-family: var(--tba3-_schrift-mono); }
.stufe {
  display: inline-block; min-width: 26px; text-align: center;
  padding: 1px 6px; border-radius: var(--tba3-_radius);
  color: var(--tba3-_farbe-text-invers); font-size: 0.85em; font-weight: 700;
}
.balken { position: relative; display: block; height: 14px; border-radius: 2px;
  background: var(--tba3-_farbe-flaeche); min-width: 60px; }
.balken > i { position: absolute; inset: 0 auto 0 0; border-radius: 2px; }
.quote { display: flex; align-items: center; gap: var(--tba3-_abstand); justify-content: flex-end; }

.delta-ueber { color: var(--tba3-_farbe-ueber); font-weight: 600; }
.delta-unter { color: var(--tba3-_farbe-unter); font-weight: 600; }
.delta-im-rahmen { color: var(--tba3-_farbe-text-gedaempft); }

.leer {
  padding: calc(var(--tba3-_abstand) * 3); text-align: center;
  color: var(--tba3-_farbe-text-gedaempft);
  border: 1px dashed var(--tba3-_farbe-linie); border-radius: var(--tba3-_radius);
}
`;

const STUFENFARBE = (stufe) => {
  const nr = { I: 1, II: 2, III: 3, IV: 4, V: 5 }[stufe];
  return nr ? `var(--tba3-_stufe-${nr})` : 'var(--tba3-_farbe-text-gedaempft)';
};

function aufbauen(wurzel, zustand, el) {
  const daten = zeilen(zustand);

  if (!daten.length) {
    wurzel.append(h('p', { class: 'leer', text: 'Keine Aufgaben' }));
    return;
  }

  const kopfZellen = SPALTEN.map((sp) => {
    const aktiv = zustand.sortierung === sp.id;
    const zelle = h('th', {
      scope: 'col',
      class: sp.zahl ? 'zahl' : '',
      ...(aktiv ? { 'aria-sort': zustand.richtung === 'auf' ? 'ascending' : 'descending' } : {}),
    });
    const knopf = h('button', {
      class: 'sortknopf',
      type: 'button',
      onclick: () => {
        const neu = naechsteSortierung(zustand.sortierung, zustand.richtung, sp.id);
        el.props = neu;
        el.melden('sortiert', neu);
      },
    }, [
      sp.titel,
      h('span', { class: 'pfeil', text: aktiv ? (zustand.richtung === 'auf' ? '▲' : '▼') : '↕' }),
    ]);
    zelle.append(knopf);
    return zelle;
  });

  const koerper = daten.map((zeile) => {
    const tr = h('tr', {
      tabindex: '0',
      onclick: () => el.melden('aufgabe-gewaehlt', { ...zeile }),
      onkeydown: (ev) => {
        if (ev.key === 'Enter') el.melden('aufgabe-gewaehlt', { ...zeile });
      },
    });

    tr.append(h('td', { class: 'kennung', text: zeile.label }));
    tr.append(h('td', { text: zeile.exercise ?? '' }));
    tr.append(
      h('td', {}, [
        h('span', { class: 'stufe', text: zeile.level ?? '—' , style: `background:${STUFENFARBE(zeile.level)}` }),
      ]),
    );

    const quote = Math.round(zeile.actual ?? 0);
    tr.append(
      h('td', { class: 'zahl' }, [
        h('span', { class: 'quote' }, [
          h('span', { class: 'balken' }, [
            h('i', { style: `width:${Math.max(0, Math.min(100, quote))}%;background:${STUFENFARBE(zeile.level)}` }),
          ]),
          h('span', { text: `${quote} %` }),
        ]),
      ]),
    );

    tr.append(h('td', { class: 'zahl', text: zeile.expected == null ? '—' : `${Math.round(zeile.expected)} %` }));
    tr.append(
      h('td', {
        class: `zahl delta-${zeile.bewertung}`,
        text: zeile.delta === null ? '—' : `${zeile.delta > 0 ? '+' : ''}${zeile.delta}`,
      }),
    );
    return tr;
  });

  const tabelle = h('table', {}, [
    zustand.title ? h('caption', { class: 'titel', text: zustand.title }) : null,
    h('thead', {}, [h('tr', {}, kopfZellen)]),
    h('tbody', {}, koerper),
  ]);

  wurzel.append(h('div', { class: 'scroll' }, [tabelle]));
}

export const BAUPLAN = {
  name: 'aufgaben-tabelle',
  titel: 'Aufgaben-Tabelle',
  endpunkt: '/groups/{id}/items',
  standard: STANDARD,
  ereignisse: ['sortiert', 'aufgabe-gewaehlt'],
  stil: STIL,
  aufbauen,
};

export const AufgabenTabelleElement = elementKlasse(BAUPLAN);
export default BAUPLAN;
