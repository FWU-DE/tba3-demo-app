// BISTA-Verteilung als Custom Element — Avatare über der Punkteskala.
//
// Dieselbe Überlagerung wie beim Streudiagramm, aus demselben Grund: der
// Hinweis zu einem Kind gehört über das Bild, nicht hinein.
//
//   el.addEventListener('schueler-gewaehlt', (e) => e.detail);
//   el.addEventListener('zone-gewaehlt', (e) => e.detail);

import { STANDARD, geometrie } from '../kern/bista-verteilung.js';
import { elementKlasse } from './baustein-element.js';
import { h, s } from './svg.js';
import { stufenFlaeche, stufenSchrift } from '../kern/thema.js';

const STIL = `
.buehne { position: relative; }
.zone { cursor: pointer; }
.zone rect { opacity: 0.16; }
.zone:hover rect { opacity: 0.3; }
.zonenschrift { font-size: 11px; font-weight: 600; fill: var(--tba3-_farbe-text-gedaempft); }

.kopf { cursor: pointer; }
.kopf circle { stroke: var(--tba3-_farbe-grund); stroke-width: 2; }
.kopf:hover circle, .kopf:focus-visible circle { stroke: var(--tba3-_farbe-text); }
.initialen { font-size: 10px; font-weight: 700; pointer-events: none; }

.achse { stroke: var(--tba3-_farbe-linie); }
.achsenschrift { font-size: 11px; fill: var(--tba3-_farbe-text-gedaempft); }
.mittelwert { stroke: var(--tba3-_farbe-marke); stroke-dasharray: 5 4; }
.mittelwertschrift { font-size: 11px; font-weight: 600; fill: var(--tba3-_farbe-marke); }

.hinweis {
  position: absolute; z-index: 2; pointer-events: none;
  transform: translate(-50%, -120%);
  background: var(--tba3-_farbe-grund); color: var(--tba3-_farbe-text);
  border: 1px solid var(--tba3-_farbe-linie); border-radius: var(--tba3-_radius);
  box-shadow: 0 4px 16px rgb(0 0 0 / 0.18);
  padding: calc(var(--tba3-_abstand) * 0.6) var(--tba3-_abstand); font-size: 0.9em;
}

.leer {
  padding: calc(var(--tba3-_abstand) * 3); text-align: center;
  color: var(--tba3-_farbe-text-gedaempft);
  border: 1px dashed var(--tba3-_farbe-linie); border-radius: var(--tba3-_radius);
}
`;

/** Die Avatare wechseln reihenweise den Ton, damit ein Stapel lesbar bleibt. */
const stufe = (schueler) => Math.min(5, 2 + (schueler.reihe % 3));

function aufbauen(wurzel, zustand, el) {
  const g = geometrie(zustand);

  if (!g.schueler.length) {
    wurzel.append(h('p', { class: 'leer', text: 'Keine Schüler:innen' }));
    return;
  }

  const buehne = h('div', { class: 'buehne' });
  const hinweis = h('div', { class: 'hinweis', hidden: true });

  const svg = s('svg', {
    width: '100%',
    viewBox: `0 0 ${g.breite} ${g.hoehe}`,
    role: 'group',
    'aria-label': g.titel || 'Verteilung auf der Punkteskala',
  });

  for (const zone of g.zonen) {
    const gruppe = s('g', {
      class: 'zone',
      tabindex: '0',
      role: 'button',
      'aria-label': `Zone ${zone.label}`,
    }, [
      s('rect', {
        x: zone.x, y: g.feld.y, width: zone.breite, height: g.feld.hoehe, fill: zone.farbe,
      }),
      s('text', {
        class: 'zonenschrift', x: zone.mitte, y: g.feld.y - 8, 'text-anchor': 'middle',
        text: zone.label,
      }),
    ]);
    gruppe.addEventListener('click', () => el.melden('zone-gewaehlt', { ...zone }));
    gruppe.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        el.melden('zone-gewaehlt', { ...zone });
      }
    });
    svg.append(gruppe);
  }

  svg.append(
    s('line', {
      class: 'achse', x1: g.feld.x, x2: g.feld.x + g.feld.breite,
      y1: g.grundlinie, y2: g.grundlinie,
    }),
  );

  for (const marke of g.achse) {
    svg.append(
      s('line', { class: 'achse', x1: marke.x, x2: marke.x, y1: g.grundlinie, y2: g.grundlinie + 5 }),
      s('text', {
        class: 'achsenschrift', x: marke.x, y: g.grundlinie + 20, 'text-anchor': 'middle',
        text: String(marke.wert),
      }),
    );
  }

  if (g.mittelwert) {
    svg.append(
      s('line', {
        class: 'mittelwert', x1: g.mittelwert.x, x2: g.mittelwert.x,
        y1: g.feld.y, y2: g.grundlinie,
      }),
      s('text', {
        class: 'mittelwertschrift', x: g.mittelwert.x, y: g.hoehe - 8, 'text-anchor': 'middle',
        text: `Mittelwert ${Math.round(g.mittelwert.wert)}`,
      }),
    );
  }

  for (const schueler of g.schueler) {
    const gruppe = s('g', {
      class: 'kopf',
      tabindex: '0',
      role: 'button',
      'aria-label': `${schueler.name}, ${schueler.punkte ?? '—'} Punkte`,
    }, [
      s('circle', {
        cx: schueler.x, cy: schueler.y, r: g.radius,
        fill: stufenFlaeche(stufe(schueler)),
      }),
      s('text', {
        class: 'initialen', x: schueler.x, y: schueler.y + 3.5, 'text-anchor': 'middle',
        fill: stufenSchrift(stufe(schueler)), text: schueler.initialen,
      }),
    ]);

    const zeigen = () => {
      hinweis.replaceChildren(
        h('strong', { text: schueler.name }),
        h('span', { text: ` · ${schueler.punkte ?? '—'} Punkte` }),
      );
      hinweis.style.left = `${(schueler.x / g.breite) * 100}%`;
      hinweis.style.top = `${(schueler.y / g.hoehe) * 100}%`;
      hinweis.hidden = false;
    };
    const verbergen = () => {
      hinweis.hidden = true;
    };

    gruppe.addEventListener('pointerenter', zeigen);
    gruppe.addEventListener('pointerleave', verbergen);
    gruppe.addEventListener('focus', zeigen);
    gruppe.addEventListener('blur', verbergen);
    gruppe.addEventListener('click', () => el.melden('schueler-gewaehlt', { ...schueler }));
    gruppe.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        el.melden('schueler-gewaehlt', { ...schueler });
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
  name: 'bista-verteilung',
  titel: 'BISTA-Verteilung',
  endpunkt: '/groups/{id}/aggregations',
  standard: STANDARD,
  ereignisse: ['schueler-gewaehlt', 'zone-gewaehlt'],
  stil: STIL,
  aufbauen,
};

export const BistaVerteilungElement = elementKlasse(BAUPLAN);
export default BAUPLAN;
