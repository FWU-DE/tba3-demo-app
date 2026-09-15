// Kontextmerkmal als Ring — Custom Element.
//
// Vorbild: die vier Ringe auf der Übersicht der indibit-Schulrückmeldung.
//
//   el.addEventListener('segment-gewaehlt', (e) => e.detail);

import { STANDARD, ring } from '../kern/kontextmerkmal-ring.js';
import { elementKlasse } from './baustein-element.js';
import { h, s } from './svg.js';

const STIL = `
.block { display: flex; flex-direction: column; align-items: center;
  gap: var(--tba3-_abstand); }
.titel { font-weight: 600; text-align: center; }
.mitte-wert { font-size: 1.6em; font-weight: 700; fill: var(--tba3-_farbe-text); }
.mitte-label { font-size: 0.78em; fill: var(--tba3-_farbe-text-gedaempft); }
.segment { cursor: pointer; transition: opacity .12s; }
.segment:hover { opacity: .75; }
.segment:focus-visible { outline: 2px solid var(--tba3-_farbe-fokus); outline-offset: 2px; }
.legende { list-style: none; margin: 0; padding: 0; display: flex;
  flex-direction: column; gap: 3px; font-size: 0.86em; }
.legende li { display: flex; align-items: center; gap: 6px; }
.punkt { width: 9px; height: 9px; border-radius: 50%; flex: none; }
.anteil { margin-left: auto; color: var(--tba3-_farbe-text-gedaempft);
  font-variant-numeric: tabular-nums; }
.leer { color: var(--tba3-_farbe-text-gedaempft); font-size: 0.9em; }
.fuss { font-size: 0.85em; color: var(--tba3-_farbe-text-gedaempft); text-align: center; }
`;

// Ohne eigene Farbe läuft es durch die Stufenfarben — eine geordnete Reihe,
// die zu geordneten Kategorien passt (A–E, Stufen). Bei ungeordneten
// Kategorien gehört die Farbe in die Daten.
const RUECKFALL = [
  'var(--tba3-_stufe-1)', 'var(--tba3-_stufe-2)', 'var(--tba3-_stufe-3)',
  'var(--tba3-_stufe-4)', 'var(--tba3-_stufe-5)',
];

function aufbauen(wurzel, zustand, el) {
  const r = ring(zustand);
  const block = h('div', { class: 'block' });

  if (r.label) block.append(h('div', { class: 'titel', text: r.label }));

  if (r.leer) {
    block.append(h('p', { class: 'leer', text: 'Keine Angaben' }));
    wurzel.append(block);
    return;
  }

  const { groesse } = r.masse;
  const farbe = (seg) => seg.farbe ?? RUECKFALL[seg.index % RUECKFALL.length];

  const bogen = r.segmente.map((seg) =>
    s('path', {
      class: 'segment',
      d: seg.pfad,
      fill: farbe(seg),
      tabindex: '0',
      role: 'button',
      'aria-label': `${seg.label}: ${seg.prozent} Prozent`,
      onclick: () => el.melden('segment-gewaehlt', { ...seg }),
      onkeydown: (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.melden('segment-gewaehlt', { ...seg }); }
      },
    }));

  block.append(
    s('svg', {
      width: groesse, height: groesse, viewBox: `0 0 ${groesse} ${groesse}`,
      role: 'img', 'aria-label': `${r.label}: ${r.segmente.map((x) => `${x.label} ${x.prozent} Prozent`).join(', ')}`,
    }, [
      bogen,
      s('text', {
        class: 'mitte-wert', x: groesse / 2, y: groesse / 2 + (r.mitteLabel ? 0 : 6),
        'text-anchor': 'middle', text: r.mitte,
      }),
      r.mitteLabel
        ? s('text', {
            class: 'mitte-label', x: groesse / 2, y: groesse / 2 + 16,
            'text-anchor': 'middle', text: r.mitteLabel,
          })
        : null,
    ]),
  );

  block.append(
    h('ul', { class: 'legende' }, r.segmente.map((seg) =>
      h('li', {}, [
        h('span', { class: 'punkt', style: `background:${farbe(seg)}` }),
        h('span', { text: seg.label }),
        h('span', { class: 'anteil', text: `${seg.prozent} %` }),
      ]))),
  );

  if (r.median) {
    block.append(h('p', { class: 'fuss', text: `Median: ${r.median.label}` }));
  }

  wurzel.append(block);
}

export const BAUPLAN = {
  name: 'kontextmerkmal-ring',
  titel: 'Kontextmerkmal als Ring',
  endpunkt: '/groups/{id}/items?type=students',
  standard: STANDARD,
  ereignisse: ['segment-gewaehlt'],
  stil: STIL,
  aufbauen,
};

export const KontextmerkmalRingElement = elementKlasse(BAUPLAN);
export default BAUPLAN;
