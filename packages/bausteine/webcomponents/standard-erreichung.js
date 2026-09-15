// Standard-Erreichung — Custom Element.
//
// Vorbild: „Mindeststandard erreicht 80 %" mit den Fachbalken darunter, aus
// der Schulrückmeldung von indibit.
//
//   el.addEventListener('zeile-gewaehlt', (e) => e.detail);

import { STANDARD, erreichung } from '../kern/standard-erreichung.js';
import { elementKlasse } from './baustein-element.js';
import { h } from './svg.js';

const STIL = `
.block { display: flex; flex-direction: column; gap: var(--tba3-_abstand); }
.kopf { display: flex; align-items: baseline; gap: var(--tba3-_abstand); flex-wrap: wrap; }
.gross { font-size: 2.6em; font-weight: 700; line-height: 1;
  color: var(--tba3-_farbe-marke); font-variant-numeric: tabular-nums; }
.einheit { font-size: 0.42em; font-weight: 600; margin-left: 2px; }
.kopf-label { color: var(--tba3-_farbe-text-gedaempft); }

.zeilen { list-style: none; margin: 0; padding: 0; display: flex;
  flex-direction: column; gap: 10px; }
.zeile { all: unset; cursor: pointer; display: block; }
.zeile:focus-visible { outline: 2px solid var(--tba3-_farbe-fokus); outline-offset: 2px; }
.zeile-kopf { display: flex; justify-content: space-between; gap: var(--tba3-_abstand);
  font-size: 0.92em; margin-bottom: 3px; }
.zahl { font-variant-numeric: tabular-nums; font-weight: 600; }
.balken { height: 9px; border-radius: 5px; background: var(--tba3-_farbe-flaeche);
  overflow: hidden; }
.balken > i { display: block; height: 100%; border-radius: 5px;
  background: var(--tba3-_farbe-marke); }
.zeile:hover .balken > i { filter: brightness(0.92); }
.ueber > i { background: var(--tba3-_farbe-ueber); }
.unter > i { background: var(--tba3-_farbe-unter); }
.hinweis { font-size: 0.85em; color: var(--tba3-_farbe-text-gedaempft); }
.leer { color: var(--tba3-_farbe-text-gedaempft); font-size: 0.9em; }
`;

function aufbauen(wurzel, zustand, el) {
  const e = erreichung(zustand);
  const block = h('div', { class: 'block' });

  block.append(
    h('div', { class: 'kopf' }, [
      h('div', { class: 'gross' }, [
        e.hatWert ? String(e.wert) : '—',
        e.hatWert && e.einheit ? h('span', { class: 'einheit', text: e.einheit }) : null,
      ]),
      h('div', { class: 'kopf-label', text: e.label }),
    ]),
  );

  if (e.zeilen.length === 0) {
    block.append(h('p', { class: 'leer', text: 'Keine Aufschlüsselung vorhanden' }));
    wurzel.append(block);
    return;
  }

  block.append(
    h('ul', { class: 'zeilen' }, e.zeilen.map((z) =>
      h('li', {}, [
        h('button', {
          class: 'zeile',
          type: 'button',
          'aria-label': `${z.label}: ${z.wert} ${e.einheit}`,
          onclick: () => el.melden('zeile-gewaehlt', { ...z }),
        }, [
          h('div', { class: 'zeile-kopf' }, [
            h('span', { text: z.label }),
            h('span', { class: 'zahl', text: `${z.wert} ${e.einheit}` }),
          ]),
          h('div', { class: `balken ${z.bewertung === 'im-rahmen' ? '' : z.bewertung}`.trim() }, [
            h('i', { style: `width:${Math.round(z.anteil * 100)}%` }),
          ]),
        ]),
      ]))),
  );

  if (e.hinweis) block.append(h('p', { class: 'hinweis', text: e.hinweis }));

  wurzel.append(block);
}

export const BAUPLAN = {
  name: 'standard-erreichung',
  titel: 'Standard-Erreichung',
  endpunkt: '/groups/{id}/competence-levels',
  standard: STANDARD,
  ereignisse: ['zeile-gewaehlt'],
  stil: STIL,
  aufbauen,
};

export const StandardErreichungElement = elementKlasse(BAUPLAN);
export default BAUPLAN;
