// Zeugnissätze — Custom Element.
//
// Vorbild: der Reiter „Zeugnissätze" der Messwiederholung des
// kompetenztest.de (`ReportCardHelper.vue`).
//
// Der einzige Baustein, dessen Ausgabe Text ist. Jeder Satz lässt sich
// kopieren; darunter steht, woraus er abgeleitet ist — ein Satz ohne seine
// Grundlage wäre eine Behauptung.
//
//   el.addEventListener('satz-kopiert', (e) => e.detail);

import { STANDARD, saetze } from '../kern/zeugnissaetze.js';
import { elementKlasse } from './baustein-element.js';
import { h } from './svg.js';

const STIL = `
.block { display: flex; flex-direction: column; gap: var(--tba3-_abstand); }
.titel { font-weight: 600; }
.liste { list-style: none; margin: 0; padding: 0; display: flex;
  flex-direction: column; gap: 10px; }
.satz { border: 1px solid var(--tba3-_farbe-linie); border-radius: var(--tba3-_radius);
  padding: calc(var(--tba3-_abstand) * 1.2); background: var(--tba3-_farbe-grund);
  display: flex; gap: var(--tba3-_abstand); align-items: flex-start; }
.satz:hover { border-color: var(--tba3-_farbe-marke); }
.text { flex: 1; }
.grundlage { display: block; margin-top: 5px; font-size: 0.82em;
  color: var(--tba3-_farbe-text-gedaempft); }
.stufe { flex: none; font-size: 0.78em; font-weight: 700; border-radius: 999px;
  padding: 2px 9px; background: var(--tba3-_farbe-flaeche); }
.kopieren { all: unset; cursor: pointer; flex: none; font-size: 0.85em;
  font-weight: 600; color: var(--tba3-_farbe-marke); padding: 2px 4px; }
.kopieren:hover { text-decoration: underline; }
.kopieren:focus-visible { outline: 2px solid var(--tba3-_farbe-fokus); outline-offset: 2px; }
.leer { color: var(--tba3-_farbe-text-gedaempft); font-size: 0.9em; }
`;

function aufbauen(wurzel, zustand, el) {
  const z = saetze(zustand);
  const block = h('div', { class: 'block' });

  if (z.titel) block.append(h('div', { class: 'titel', text: z.titel }));

  if (z.leer) {
    block.append(h('p', { class: 'leer', text: z.leerHinweis }));
    wurzel.append(block);
    return;
  }

  block.append(
    h('ul', { class: 'liste' }, z.saetze.map((satz) => {
      const knopf = h('button', {
        class: 'kopieren',
        type: 'button',
        'aria-label': `Satz kopieren: ${satz.text}`,
        onclick: () => {
          // Die Zwischenablage darf fehlen (kein sicherer Kontext, kein Recht).
          // Der Baustein meldet den Satz trotzdem — die Seite kann ihn dann
          // auf ihrem Weg übernehmen, statt dass der Klick ins Leere geht.
          navigator.clipboard?.writeText?.(satz.text).catch(() => {});
          el.melden('satz-kopiert', { ...satz });
        },
      }, ['kopieren']);

      return h('li', {}, [
        h('div', { class: 'satz' }, [
          satz.stufe ? h('span', { class: 'stufe', text: satz.stufe }) : null,
          h('div', { class: 'text' }, [
            satz.text,
            satz.grundlage ? h('span', { class: 'grundlage', text: satz.grundlage }) : null,
          ]),
          knopf,
        ]),
      ]);
    })),
  );

  wurzel.append(block);
}

export const BAUPLAN = {
  name: 'zeugnissaetze',
  titel: 'Zeugnissätze',
  endpunkt: '/groups/{id}/competence-levels',
  standard: STANDARD,
  ereignisse: ['satz-kopiert'],
  stil: STIL,
  aufbauen,
};

export const ZeugnissaetzeElement = elementKlasse(BAUPLAN);
export default BAUPLAN;
