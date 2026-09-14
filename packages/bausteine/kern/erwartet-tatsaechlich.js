// Erwartete und tatsächliche Lösungsquote je Aufgabe.
//
// Portiert aus apps/katalog/src/components/ItemExpectedActualChart.vue. Der
// Erwartungswert stammt aus dem Rasch-Modell (BISTA-Parameter); die Abweichung
// ist der eigentliche didaktische Hinweis, deshalb trägt sie die Farbe.

import { SCHRIFT, el, esc, kurz, leer, zusammen } from './svg.js';

export const NAME = 'erwartet-tatsaechlich';

export const STANDARD = {
  items: [],
  title: '',
  domain: '',
  /** Ab welcher Abweichung in Prozentpunkten eine Aufgabe auffällt. */
  schwelle: 7,
};

const LABEL_W = 80;
const BADGE_W = 22;
const CHART_W = 440;
const ROW_H = 22;
const GAP = 6;
const PAD_TOP = 28;
const PAD_BOT = 28;
const PAD_R = 72;
const CHART_X = LABEL_W + BADGE_W + 8;
const SVG_W = CHART_X + CHART_W + PAD_R;
const TICKS = [0, 25, 50, 75, 100];

const STUFENFARBEN = {
  I: '#ef4444', II: '#f97316', III: '#eab308', IV: '#22c55e', V: '#15803d',
};

const cx = (pct) => CHART_X + (pct / 100) * CHART_W;

/** Grün über Erwartung, rot darunter, neutral im Rahmen. */
function abweichungsfarbe(actual, expected, schwelle) {
  const d = (actual ?? 0) - (expected ?? 0);
  if (d > schwelle) return '#16a34a';
  if (d < -schwelle) return '#dc2626';
  return '#64748b';
}

/** Die Legende als Klartext — die Adapter setzen sie über das SVG. */
export function legende(schwelle = STANDARD.schwelle) {
  return [
    { art: 'punkt', farbe: '#16a34a', text: `mehr als ${schwelle} Punkte über Erwartung` },
    { art: 'punkt', farbe: '#64748b', text: 'im erwarteten Bereich' },
    { art: 'punkt', farbe: '#dc2626', text: `mehr als ${schwelle} Punkte unter Erwartung` },
    { art: 'linie', farbe: '#0f172a', text: 'Erwartungswert' },
  ];
}

export function erwartetTatsaechlich(props = {}) {
  const { items, title, domain, schwelle } = { ...STANDARD, ...props };
  const liste = Array.isArray(items) ? items : [];

  const flaeche = Math.max(liste.length * (ROW_H + GAP) - GAP, 0);
  const hoehe = PAD_TOP + flaeche + PAD_BOT;
  const rowY = (i) => PAD_TOP + i * (ROW_H + GAP);

  const raster = el(
    'g',
    {},
    zusammen(
      TICKS.map((t) =>
        zusammen(
          leer('line', {
            x1: cx(t), y1: PAD_TOP - 10, x2: cx(t), y2: PAD_TOP + flaeche,
            stroke: '#e2e8f0', 'stroke-width': 1,
          }),
          el(
            'text',
            {
              x: cx(t), y: PAD_TOP - 13, 'text-anchor': 'middle',
              'font-size': 9.5, fill: '#94a3b8', 'font-family': SCHRIFT,
            },
            `${t}%`,
          ),
        ),
      ),
    ),
  );

  const zeilen = liste.map((it, i) => {
    const y = rowY(i);
    const actual = it.actual ?? 0;
    const expected = it.expected ?? 0;
    const farbe = abweichungsfarbe(actual, expected, schwelle);
    const delta = Math.round(actual - expected);

    return el(
      'g',
      {},
      zusammen(
        el(
          'text',
          {
            x: LABEL_W - 4, y: y + ROW_H / 2, 'text-anchor': 'end',
            'dominant-baseline': 'middle', 'font-size': 10.5,
            fill: '#374151', 'font-family': 'ui-monospace,monospace',
          },
          esc(it.label ?? ''),
        ),
        leer('rect', {
          x: LABEL_W, y: y + (ROW_H - 14) / 2, width: BADGE_W, height: 14, rx: 3,
          fill: STUFENFARBEN[it.level] ?? '#94a3b8',
        }),
        el(
          'text',
          {
            x: LABEL_W + 11, y: y + ROW_H / 2, 'text-anchor': 'middle',
            'dominant-baseline': 'middle', 'font-size': 8.5,
            'font-weight': 700, fill: 'white', 'font-family': SCHRIFT,
          },
          esc(it.level ?? ''),
        ),
        leer('rect', { x: CHART_X, y, width: CHART_W, height: ROW_H, fill: '#f8fafc', rx: 2 }),
        leer('rect', {
          x: CHART_X, y: y + 4, width: (actual / 100) * CHART_W, height: ROW_H - 8,
          fill: farbe, rx: 2, opacity: 0.85,
        }),
        leer('line', {
          x1: cx(expected), y1: y + 1, x2: cx(expected), y2: y + ROW_H - 1,
          stroke: '#0f172a', 'stroke-width': 2, 'stroke-dasharray': '3,2',
        }),
        // Die Lücke zwischen erwartet und tatsächlich nur dann hinterlegen,
        // wenn sie auffällt — sonst ist jede Zeile eingefärbt und keine sticht heraus.
        Math.abs(delta) > schwelle
          ? leer('rect', {
              x: Math.min(cx(actual), cx(expected)), y: y + 4,
              width: (Math.abs(actual - expected) / 100) * CHART_W, height: ROW_H - 8,
              fill: farbe, rx: 0, opacity: 0.15,
            })
          : '',
        el(
          'text',
          {
            x: CHART_X + CHART_W + 5, y: y + ROW_H / 2 - 4, 'dominant-baseline': 'middle',
            'font-size': 9, fill: '#374151', 'font-weight': 600, 'font-family': SCHRIFT,
          },
          `${Math.round(actual)}%`,
        ),
        el(
          'text',
          {
            x: CHART_X + CHART_W + 5, y: y + ROW_H / 2 + 6, 'dominant-baseline': 'middle',
            'font-size': 8.5, fill: '#94a3b8', 'font-family': SCHRIFT,
          },
          `erw. ${Math.round(expected)}%`,
        ),
      ),
    );
  });

  const achse = el(
    'text',
    {
      x: CHART_X + CHART_W / 2, y: hoehe - 6, 'text-anchor': 'middle',
      'font-size': 9.5, fill: '#64748b', 'font-family': SCHRIFT,
    },
    'Lösungsquote (%)',
  );

  const svg = el(
    'svg',
    {
      width: SVG_W, height: hoehe, viewBox: `0 0 ${SVG_W} ${kurz(hoehe)}`,
      xmlns: 'http://www.w3.org/2000/svg', role: 'img',
      'aria-label': esc(title || 'Erwartete und tatsächliche Lösungsquote'),
    },
    zusammen(raster, zeilen, achse),
  );

  const kopf = title
    ? el(
        'figcaption',
        { class: 'tba3-titel' },
        zusammen(esc(title), domain ? el('span', { class: 'tba3-domain' }, ` — ${esc(domain)}`) : ''),
      )
    : '';

  const legendeHtml = el(
    'div',
    { class: 'tba3-legende' },
    zusammen(
      legende(schwelle).map((l) =>
        el(
          'span',
          { class: 'tba3-legende-eintrag' },
          zusammen(
            l.art === 'punkt'
              ? el('span', { class: 'tba3-legende-punkt', style: `background:${l.farbe}` }, '')
              : el('span', { class: 'tba3-legende-linie' }, ''),
            esc(l.text),
          ),
        ),
      ),
    ),
  );

  return {
    breite: SVG_W,
    hoehe,
    svg,
    html: el(
      'figure',
      { class: 'tba3-figur' },
      zusammen(kopf, legendeHtml, el('div', { class: 'tba3-scroll' }, svg)),
    ),
  };
}

export default erwartetTatsaechlich;
