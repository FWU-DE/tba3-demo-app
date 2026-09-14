// Schüler-Tabelle als Custom Element — Tabelle mit Auswahl.
//
// Der Baustein, der in der Zuordnung als „braucht noch eine
// Auswahl-Schnittstelle" stand. Auswahl heißt hier: Kontrollkästchen je Zeile,
// Zustand in `auswahl`, und ein Ereignis, das die ganze Auswahl mitgibt statt
// nur das zuletzt Angeklickte — sonst muss jede Anwendung selbst mitzählen.
//
//   el.addEventListener('auswahl-geaendert', (e) => e.detail); // { auswahl }
//   el.addEventListener('schueler-gewaehlt', (e) => e.detail);
//   el.addEventListener('sortiert', (e) => e.detail);

import {
  ANTEILE,
  BALKEN,
  STANDARD,
  auswahlUmschalten,
  naechsteSortierung,
  spalten,
  zeilen,
} from '../kern/schueler-tabelle.js';
import { elementKlasse } from './baustein-element.js';
import { h, s } from './svg.js';

const STIL = `
table { border-collapse: collapse; width: 100%; font-variant-numeric: tabular-nums; }
caption { text-align: left; padding-bottom: var(--tba3-_abstand); }
th, td {
  padding: calc(var(--tba3-_abstand) * 0.75) var(--tba3-_abstand);
  border-bottom: 1px solid var(--tba3-_farbe-linie);
  text-align: left;
  vertical-align: middle;
}
thead th { border-bottom: 2px solid var(--tba3-_farbe-linie); font-weight: 600; white-space: nowrap; }
tbody tr:hover, tbody tr:focus-within { background: var(--tba3-_farbe-hervorhebung); }
tbody tr[aria-selected='true'] { background: var(--tba3-_farbe-hervorhebung); }

.sortknopf {
  all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;
  font: inherit; font-weight: 600;
}
.sortknopf:hover { color: var(--tba3-_farbe-marke); }
.pfeil { opacity: 0.35; font-size: 0.85em; }
th[aria-sort] .pfeil { opacity: 1; color: var(--tba3-_farbe-marke); }

.wahl { width: 1%; }
.wahl input { width: 16px; height: 16px; accent-color: var(--tba3-_farbe-marke); cursor: pointer; }

.name { display: flex; align-items: center; gap: calc(var(--tba3-_abstand) * 0.75); }
.name button {
  all: unset; cursor: pointer; font: inherit; font-weight: 600;
}
.name button:hover { color: var(--tba3-_farbe-marke); text-decoration: underline; }
.geschlecht { color: var(--tba3-_farbe-text-gedaempft); font-size: 0.9em; }

.balken { display: flex; align-items: center; gap: var(--tba3-_abstand); }
.balken .quote { min-width: 3.5em; text-align: right; }
.abwesend { color: var(--tba3-_farbe-text-gedaempft); font-style: italic; }

.legende { display: flex; gap: calc(var(--tba3-_abstand) * 2); margin-bottom: var(--tba3-_abstand);
  font-size: 0.9em; color: var(--tba3-_farbe-text-gedaempft); flex-wrap: wrap; }
.legende span.punkt { width: 10px; height: 10px; border-radius: 2px; display: inline-block;
  margin-right: 6px; vertical-align: -1px; }

.leer {
  padding: calc(var(--tba3-_abstand) * 3); text-align: center;
  color: var(--tba3-_farbe-text-gedaempft);
  border: 1px dashed var(--tba3-_farbe-linie); border-radius: var(--tba3-_radius);
}
`;

/** Die Anteile bekommen Farben aus dem Thema, keine eigenen. */
const ANTEILFARBE = {
  richtig: 'var(--tba3-_farbe-marke)',
  ausgelassen: 'var(--tba3-_farbe-flaeche-stark)',
  falsch: 'var(--tba3-_farbe-unter)',
};

const GESCHLECHT = { f: '♀', m: '♂' };

function balken(bereich) {
  if (!bereich.vorhanden) return h('span', { class: 'gedaempft', text: '—' });
  const breite = BALKEN.breite;
  const svg = s('svg', {
    width: breite,
    height: BALKEN.hoehe,
    viewBox: `0 0 ${breite} ${BALKEN.hoehe}`,
    role: 'presentation',
  }, [
    s('rect', { x: 0, y: 0, width: breite, height: BALKEN.hoehe, rx: 2, fill: 'var(--tba3-_farbe-flaeche)' }),
    ...bereich.segmente.map((seg) =>
      s('rect', {
        x: seg.x,
        y: 0,
        width: seg.breite,
        height: BALKEN.hoehe,
        fill: ANTEILFARBE[seg.id],
      }),
    ),
  ]);
  return h('span', { class: 'balken' }, [
    svg,
    h('span', { class: 'quote', text: `${Math.round(bereich.wert)} %` }),
  ]);
}

function aufbauen(wurzel, zustand, el) {
  const daten = zeilen(zustand);
  const kopf = spalten(zustand);

  if (!daten.length) {
    wurzel.append(h('p', { class: 'leer', text: 'Keine Schüler:innen' }));
    return;
  }

  wurzel.append(
    h('div', { class: 'legende' },
      ANTEILE.map((anteil) =>
        h('span', {}, [
          h('span', { class: 'punkt', style: `background:${ANTEILFARBE[anteil.id]}` }),
          anteil.label,
        ]),
      ),
    ),
  );

  const kopfZellen = kopf.map((sp) => {
    const zelle = h('th', {
      scope: 'col',
      class: sp.zahl ? 'zahl' : '',
      ...(sp.aktiv ? { 'aria-sort': sp.richtung === 'auf' ? 'ascending' : 'descending' } : {}),
    });
    zelle.append(
      h('button', {
        class: 'sortknopf',
        type: 'button',
        onclick: () => {
          const neu = naechsteSortierung(zustand.sortierung, zustand.richtung, sp.key);
          el.props = neu;
          el.melden('sortiert', neu);
        },
      }, [
        sp.label,
        h('span', { class: 'pfeil', text: sp.aktiv ? (sp.richtung === 'auf' ? '▲' : '▼') : '↕' }),
      ]),
    );
    return zelle;
  });

  if (zustand.auswaehlbar) {
    kopfZellen.unshift(h('th', { scope: 'col', class: 'wahl', 'aria-label': 'Auswahl' }));
  }

  const koerper = daten.map((zeile) => {
    const tr = h('tr', { 'aria-selected': zeile.gewaehlt ? 'true' : 'false' });

    if (zustand.auswaehlbar) {
      const kasten = h('input', {
        type: 'checkbox',
        'aria-label': `${zeile.name} auswählen`,
        onchange: () => {
          const auswahl = auswahlUmschalten(zustand.auswahl, zeile.id);
          el.props = { auswahl };
          el.melden('auswahl-geaendert', { auswahl, zuletzt: zeile.id });
        },
      });
      kasten.checked = zeile.gewaehlt;
      tr.append(h('td', { class: 'wahl' }, [kasten]));
    }

    tr.append(
      h('td', {}, [
        h('div', { class: 'name' }, [
          h('button', {
            type: 'button',
            text: zeile.name,
            onclick: () => el.melden('schueler-gewaehlt', { ...zeile }),
          }),
          zeile.gender
            ? h('span', { class: 'geschlecht', text: GESCHLECHT[zeile.gender] ?? '⚧' })
            : null,
        ]),
      ]),
    );

    if (zeile.abwesend) {
      tr.append(
        h('td', {
          class: 'abwesend',
          colspan: String(kopf.length - 1),
          text: zeile.absentMessage ?? 'nicht teilgenommen',
        }),
      );
    } else {
      for (const bereich of zeile.bereiche) {
        tr.append(h('td', {}, [balken(bereich)]));
      }
    }
    return tr;
  });

  wurzel.append(
    h('div', { class: 'scroll' }, [
      h('table', {}, [
        zustand.title ? h('caption', { text: zustand.title }) : null,
        h('thead', {}, [h('tr', {}, kopfZellen)]),
        h('tbody', {}, koerper),
      ]),
    ]),
  );
}

export const BAUPLAN = {
  name: 'schueler-tabelle',
  titel: 'Schüler-Tabelle',
  endpunkt: '/groups/{id}/items?type=students',
  standard: STANDARD,
  ereignisse: ['sortiert', 'schueler-gewaehlt', 'auswahl-geaendert'],
  stil: STIL,
  aufbauen,
};

export const SchuelerTabelleElement = elementKlasse(BAUPLAN);
export default BAUPLAN;
