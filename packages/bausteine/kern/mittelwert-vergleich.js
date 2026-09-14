// Mittelwert-Vergleich — Berechnung.
//
// Diamant-Marker auf gemeinsamer Skala, optional mit Konfidenzintervall.
// Liefert Geometrie, kein Markup.

export const NAME = 'mittelwert-vergleich';

export const STANDARD = {
  /** [{ label, mean, ciLow?, ciHigh?, n?, fair? }] */
  rows: [],
  title: '',
  domain: '',
  xLabel: 'Mittlere Lösungsquote',
};

export const MASSE = {
  labelBreite: 170,
  chartBreite: 480,
  zeilenHoehe: 36,
  luecke: 8,
  oben: 32,
  unten: 36,
  rechts: 60,
  get breite() {
    return this.labelBreite + this.chartBreite + this.rechts;
  },
};

export const TEILSTRICHE = [0, 25, 50, 75, 100];

// Hintergrundbänder für die Kompetenzzonen — blass, sie sollen den Marker
// einordnen, nicht mit ihm konkurrieren.
export const ZONEN = [
  { von: 0, bis: 30, variable: 'zone-unten', text: 'KS I–II' },
  { von: 30, bis: 60, variable: 'zone-mitte', text: 'KS III' },
  { von: 60, bis: 100, variable: 'zone-oben', text: 'KS IV–V' },
];

export function geometrie(props = {}) {
  const { rows, title, domain, xLabel } = { ...STANDARD, ...props };
  const daten = Array.isArray(rows) ? rows : [];
  const m = MASSE;

  const flaeche = Math.max(daten.length * (m.zeilenHoehe + m.luecke) - m.luecke, 0);
  const hoehe = m.oben + flaeche + m.unten;
  const x = (pct) => m.labelBreite + (Math.max(0, Math.min(100, pct ?? 0)) / 100) * m.chartBreite;

  return {
    breite: m.breite,
    hoehe,
    flaeche,
    titel: title,
    domain,
    xLabel,
    zonen: ZONEN.map((z) => ({
      ...z,
      x: x(z.von),
      breite: ((z.bis - z.von) / 100) * m.chartBreite,
      mitte: x((z.von + z.bis) / 2),
    })),
    teilstriche: TEILSTRICHE.map((pct) => ({ pct, x: x(pct) })),
    zeilen: daten.map((row, i) => {
      const mitte = m.oben + i * (m.zeilenHoehe + m.luecke) + m.zeilenHoehe / 2;
      const hatIntervall = row.ciLow != null && row.ciHigh != null;
      return {
        label: row.label ?? '',
        fair: Boolean(row.fair),
        n: row.n ?? null,
        mean: row.mean ?? 0,
        y: mitte,
        markerX: x(row.mean ?? 0),
        intervall: hatIntervall ? { von: x(row.ciLow), bis: x(row.ciHigh) } : null,
      };
    }),
  };
}

export default geometrie;
