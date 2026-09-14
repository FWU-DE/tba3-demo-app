// Perzentilbänder — Berechnung.
//
// Das mittlere Band je Teilbereich, links und rechts davon die unter- und
// überdurchschnittliche Zone, dazu optional der Wert eines einzelnen Kindes
// als Raute.
//
// Die Bezier-Kurven zwischen den Zeilen sind Absicht: eine Treppenkante liest
// sich als Sprung zwischen Teilbereichen, den die Daten nicht hergeben.

export const NAME = 'perzentilbaender';

export const STANDARD = {
  /** [{ label, bandLeft, bandRight, studentScore? }] */
  items: [],
  title: '',
  markerLabel: 'einzelne Schüler:in',
  bandLabel: 'mittlerer Bereich',
  xAxisLabel: 'Lösungsquote (%)',
};

export const MASSE = {
  labelBreite: 190,
  chartBreite: 560,
  zeilenHoehe: 22,
  oben: 32,
  unten: 44,
  rechts: 74,
  rautenRadius: 5,
  get breite() {
    return this.labelBreite + this.chartBreite + this.rechts;
  },
};

export const TEILSTRICHE = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

const f = (n) => Number(n).toFixed(1);

function kurve(punkte, richtung) {
  const dy = MASSE.zeilenHoehe * 0.45 * richtung;
  let d = '';
  for (let i = 1; i < punkte.length; i++) {
    const p0 = punkte[i - 1];
    const p1 = punkte[i];
    d += ` C ${f(p0.x)} ${f(p0.y + dy)} ${f(p1.x)} ${f(p1.y - dy)} ${f(p1.x)} ${f(p1.y)}`;
  }
  return d;
}

export function raute(x, y, r = MASSE.rautenRadius) {
  return `M ${f(x)} ${f(y - r)} L ${f(x + r)} ${f(y)} L ${f(x)} ${f(y + r)} L ${f(x - r)} ${f(y)} Z`;
}

export function geometrie(props = {}) {
  const { items, title, markerLabel, bandLabel, xAxisLabel } = { ...STANDARD, ...props };
  const liste = Array.isArray(items) ? items : [];
  const m = MASSE;
  const n = liste.length;

  const chartHoehe = n * m.zeilenHoehe;
  const hoehe = m.oben + chartHoehe + m.unten;
  const oben = m.oben;
  const unten = m.oben + chartHoehe;
  const x = (pct) => m.labelBreite + (Math.max(0, Math.min(100, pct ?? 0)) / 100) * m.chartBreite;
  const yMitte = (i) => m.oben + i * m.zeilenHoehe + m.zeilenHoehe / 2;

  const links = liste.map((it, i) => ({ x: x(it.bandLeft), y: yMitte(i) }));
  const rechts = liste.map((it, i) => ({ x: x(it.bandRight), y: yMitte(i) }));
  const rechtsUmgekehrt = [...rechts].reverse();

  const bandPfad = n
    ? `M ${f(links[0].x)} ${oben} L ${f(links[0].x)} ${f(links[0].y)}` +
      kurve(links, 1) +
      ` L ${f(links[n - 1].x)} ${unten} L ${f(rechts[n - 1].x)} ${unten}` +
      ` L ${f(rechtsUmgekehrt[0].x)} ${f(rechtsUmgekehrt[0].y)}` +
      kurve(rechtsUmgekehrt, -1) +
      ` L ${f(rechts[0].x)} ${oben} Z`
    : '';

  const linkeFlaeche = n
    ? `M ${m.labelBreite} ${oben} L ${f(links[0].x)} ${oben} L ${f(links[0].x)} ${f(links[0].y)}` +
      kurve(links, 1) +
      ` L ${f(links[n - 1].x)} ${unten} L ${m.labelBreite} ${unten} Z`
    : '';

  const rechteFlaeche = n
    ? `M ${f(rechts[0].x)} ${oben} L ${m.labelBreite + m.chartBreite} ${oben}` +
      ` L ${m.labelBreite + m.chartBreite} ${unten} L ${f(rechts[n - 1].x)} ${unten}` +
      ` L ${f(rechts[n - 1].x)} ${f(rechts[n - 1].y)}` +
      kurve(rechtsUmgekehrt, -1) +
      ` L ${f(rechts[0].x)} ${oben} Z`
    : '';

  return {
    breite: m.breite,
    hoehe,
    chartHoehe,
    titel: title,
    markerLabel,
    bandLabel,
    xAxisLabel,
    bandPfad,
    linkeFlaeche,
    rechteFlaeche,
    teilstriche: TEILSTRICHE.map((pct) => ({ pct, x: x(pct) })),
    zeilen: liste.map((it, i) => ({
      label: it.label ?? '',
      y: yMitte(i),
      trennlinieY: m.oben + i * m.zeilenHoehe,
      hatWert: it.studentScore !== null && it.studentScore !== undefined,
      wert: it.studentScore,
      rautePfad: raute(x(it.studentScore), yMitte(i)),
    })),
    legendeY: m.oben + chartHoehe + 10,
    achseY: m.oben + chartHoehe + 30,
  };
}

export default geometrie;
