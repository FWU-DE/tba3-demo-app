// Perzentilbänder — das mittlere Band je Teilbereich, links und rechts davon
// die unter- und überdurchschnittliche Zone, dazu optional der Wert eines
// einzelnen Kindes als Raute.
//
// Portiert aus apps/katalog/src/components/PercentileBandChart.vue. Die
// Bezier-Kurven zwischen den Zeilen sind absichtlich übernommen: eine
// Treppenkante liest sich als Sprung zwischen Teilbereichen, den die Daten
// nicht hergeben.

import { SCHRIFT, el, esc, kurz, leer, zusammen } from './svg.js';

export const NAME = 'perzentilbaender';

export const STANDARD = {
  items: [],
  title: '',
  markerLabel: 'einzelne Schüler:in',
  bandLabel: 'mittlerer Bereich',
  xAxisLabel: 'Lösungsquote (%)',
};

const LABEL_W = 190;
const CHART_W = 560;
// Der letzte Legendeneintrag ("einzelne Schüler:in") beginnt bei x=713 und
// brauchte mehr als die 16 aus dem Original.
const PAD_RIGHT = 74;
const PAD_TOP = 32;
const PAD_BOTTOM = 44;
const ROW_H = 22;
const DIAMOND_R = 5;
const SVG_W = LABEL_W + CHART_W + PAD_RIGHT;
const TICKS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

const xPx = (pct) => LABEL_W + (Math.max(0, Math.min(100, pct ?? 0)) / 100) * CHART_W;
const yMid = (i) => PAD_TOP + i * ROW_H + ROW_H / 2;
const f = (n) => Number(n).toFixed(1);

const kurveAb = (pts) => {
  let d = '';
  const dy = ROW_H * 0.45;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    d += ` C ${f(p0.x)} ${f(p0.y + dy)} ${f(p1.x)} ${f(p1.y - dy)} ${f(p1.x)} ${f(p1.y)}`;
  }
  return d;
};

const kurveAuf = (pts) => {
  let d = '';
  const dy = ROW_H * 0.45;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    d += ` C ${f(p0.x)} ${f(p0.y - dy)} ${f(p1.x)} ${f(p1.y + dy)} ${f(p1.x)} ${f(p1.y)}`;
  }
  return d;
};

const raute = (x, y) =>
  `M ${f(x)} ${f(y - DIAMOND_R)} L ${f(x + DIAMOND_R)} ${f(y)} L ${f(x)} ${f(y + DIAMOND_R)} L ${f(x - DIAMOND_R)} ${f(y)} Z`;

export function perzentilbaender(props = {}) {
  const { items, title, markerLabel, bandLabel, xAxisLabel } = { ...STANDARD, ...props };
  const liste = Array.isArray(items) ? items : [];
  const n = liste.length;

  const chartH = n * ROW_H;
  const hoehe = PAD_TOP + chartH + PAD_BOTTOM;
  const oben = PAD_TOP;
  const unten = PAD_TOP + chartH;

  const linkeKante = liste.map((it, i) => ({ x: xPx(it.bandLeft), y: yMid(i) }));
  const rechteKante = liste.map((it, i) => ({ x: xPx(it.bandRight), y: yMid(i) }));

  const bandPfad = (() => {
    if (!n) return '';
    const r = [...rechteKante].reverse();
    return (
      `M ${f(linkeKante[0].x)} ${oben}` +
      ` L ${f(linkeKante[0].x)} ${f(linkeKante[0].y)}` +
      kurveAb(linkeKante) +
      ` L ${f(linkeKante[n - 1].x)} ${unten}` +
      ` L ${f(rechteKante[n - 1].x)} ${unten}` +
      ` L ${f(r[0].x)} ${f(r[0].y)}` +
      kurveAuf(r) +
      ` L ${f(rechteKante[0].x)} ${oben} Z`
    );
  })();

  const linkeFlaeche = (() => {
    if (!n) return '';
    return (
      `M ${LABEL_W} ${oben}` +
      ` L ${f(linkeKante[0].x)} ${oben}` +
      ` L ${f(linkeKante[0].x)} ${f(linkeKante[0].y)}` +
      kurveAb(linkeKante) +
      ` L ${f(linkeKante[n - 1].x)} ${unten}` +
      ` L ${LABEL_W} ${unten} Z`
    );
  })();

  const rechteFlaeche = (() => {
    if (!n) return '';
    const rechts = LABEL_W + CHART_W;
    const r = [...rechteKante].reverse();
    return (
      `M ${f(rechteKante[0].x)} ${oben}` +
      ` L ${rechts} ${oben}` +
      ` L ${rechts} ${unten}` +
      ` L ${f(rechteKante[n - 1].x)} ${unten}` +
      ` L ${f(rechteKante[n - 1].x)} ${f(rechteKante[n - 1].y)}` +
      kurveAuf(r) +
      ` L ${f(rechteKante[0].x)} ${oben} Z`
    );
  })();

  const hintergrund = leer('rect', {
    x: LABEL_W, y: PAD_TOP, width: CHART_W, height: chartH, fill: '#e8f2f9',
  });

  const raster = zusammen(
    leer('line', {
      x1: xPx(0), y1: PAD_TOP - 4, x2: xPx(100), y2: PAD_TOP - 4,
      stroke: '#cbd5e1', 'stroke-width': 1,
    }),
    TICKS.map((t) =>
      zusammen(
        leer('line', {
          x1: xPx(t), y1: PAD_TOP - 4, x2: xPx(t), y2: PAD_TOP + chartH,
          stroke: 'rgba(255,255,255,0.85)', 'stroke-width': 1,
        }),
        el(
          'text',
          {
            x: xPx(t), y: PAD_TOP - 8, 'text-anchor': 'middle',
            'font-size': 10, fill: '#94a3b8', 'font-family': SCHRIFT,
          },
          `${t}%`,
        ),
      ),
    ),
    liste.map((_, i) =>
      leer('line', {
        x1: LABEL_W, y1: PAD_TOP + i * ROW_H, x2: SVG_W - PAD_RIGHT, y2: PAD_TOP + i * ROW_H,
        stroke: 'rgba(255,255,255,0.45)', 'stroke-width': 1,
      }),
    ),
  );

  const flaechen = zusammen(
    linkeFlaeche ? leer('path', { d: linkeFlaeche, fill: 'rgba(251,146,60,0.28)', stroke: 'none' }) : '',
    rechteFlaeche ? leer('path', { d: rechteFlaeche, fill: 'rgba(74,222,128,0.28)', stroke: 'none' }) : '',
    bandPfad
      ? leer('path', {
          d: bandPfad, fill: 'rgba(90,155,210,0.50)',
          stroke: 'rgba(60,125,185,0.70)', 'stroke-width': 1, 'stroke-linejoin': 'round',
        })
      : '',
  );

  const zeilen = liste.map((item, i) =>
    el(
      'g',
      {},
      zusammen(
        el(
          'text',
          {
            x: LABEL_W - 8, y: yMid(i), 'text-anchor': 'end',
            'dominant-baseline': 'middle', 'font-size': 11,
            fill: '#374151', 'font-family': 'ui-monospace, monospace',
          },
          esc(item.label ?? ''),
        ),
        item.studentScore !== null && item.studentScore !== undefined
          ? leer('path', {
              d: raute(xPx(item.studentScore), yMid(i)),
              fill: '#1e3a5f', stroke: 'white', 'stroke-width': 0.8,
            })
          : '',
      ),
    ),
  );

  const legende = el(
    'g',
    { transform: `translate(${LABEL_W + 8}, ${kurz(PAD_TOP + chartH + 10)})` },
    zusammen(
      leer('rect', { x: 0, y: -5, width: 12, height: 10, rx: 2, fill: 'rgba(251,146,60,0.55)' }),
      el(
        'text',
        { x: 16, y: 4, 'font-size': 10, fill: '#64748b', 'font-family': SCHRIFT },
        'unterdurchschnittlich',
      ),
      el(
        'g',
        { transform: 'translate(152,0)' },
        zusammen(
          leer('rect', {
            x: 0, y: -5, width: 12, height: 10, rx: 2,
            fill: 'rgba(90,155,210,0.50)', stroke: 'rgba(60,125,185,0.70)', 'stroke-width': 1,
          }),
          el('text', { x: 16, y: 4, 'font-size': 10, fill: '#64748b', 'font-family': SCHRIFT }, esc(bandLabel)),
        ),
      ),
      el(
        'g',
        { transform: 'translate(350,0)' },
        zusammen(
          leer('rect', { x: 0, y: -5, width: 12, height: 10, rx: 2, fill: 'rgba(74,222,128,0.55)' }),
          el('text', { x: 16, y: 4, 'font-size': 10, fill: '#64748b', 'font-family': SCHRIFT }, 'überdurchschnittlich'),
        ),
      ),
      el(
        'g',
        { transform: 'translate(500,0)' },
        zusammen(
          leer('path', { d: raute(6, 0), fill: '#1e3a5f', stroke: 'white', 'stroke-width': 0.8 }),
          el('text', { x: 15, y: 4, 'font-size': 10, fill: '#64748b', 'font-family': SCHRIFT }, esc(markerLabel)),
        ),
      ),
    ),
  );

  const achse = el(
    'text',
    {
      x: LABEL_W + CHART_W / 2, y: PAD_TOP + chartH + 30, 'text-anchor': 'middle',
      'font-size': 10, fill: '#94a3b8', 'font-style': 'italic', 'font-family': SCHRIFT,
    },
    esc(xAxisLabel),
  );

  const svg = el(
    'svg',
    {
      width: SVG_W, height: hoehe, viewBox: `0 0 ${SVG_W} ${kurz(hoehe)}`,
      xmlns: 'http://www.w3.org/2000/svg', role: 'img',
      'aria-label': esc(title || 'Perzentilbänder'),
    },
    zusammen(hintergrund, raster, flaechen, zeilen, legende, achse),
  );

  return {
    breite: SVG_W,
    hoehe,
    svg,
    html: el(
      'figure',
      { class: 'tba3-figur' },
      zusammen(
        title ? el('figcaption', { class: 'tba3-titel' }, esc(title)) : '',
        el('div', { class: 'tba3-scroll' }, svg),
      ),
    ),
  };
}

export default perzentilbaender;
