// Aufgaben-Heatmap — Berechnung.
//
// Erfunden für die Bibliothek: Aufgaben mal Gruppen (oder Klassen mal
// Teilbereiche) als Raster. Eine Tabelle mit dreißig Zahlen liest niemand
// quer; dieselben dreißig Zahlen als Farbfeld zeigen in einem Blick, ob eine
// Aufgabe überall hakt oder nur in einer Gruppe.
//
// Die Farbe kodiert die Abweichung von der Erwartung, nicht die Quote selbst:
// 40 % sind bei einer schweren Aufgabe gut und bei einer leichten schlecht,
// und eine Skala, die das nicht trennt, färbt vor allem die Schwierigkeit.

export const NAME = 'aufgaben-heatmap';

export const STANDARD = {
  /** [{ id?, label }] — die Zeilen, etwa Aufgaben. */
  zeilen: [],
  /** [{ id?, label }] — die Spalten, etwa Gruppen. */
  spalten: [],
  /** [{ zeile, spalte, wert, erwartet? }] — wert und erwartet in Prozent. */
  werte: [],
  title: '',
  /** Ab welcher Abweichung in Punkten die Farbe voll ausschlägt. */
  spanne: 20,
  /** 'abweichung' färbt nach Erwartung, 'wert' nach roher Quote. */
  skala: 'abweichung',
};

export const MASSE = {
  zelle: 40,
  zeilenkopf: 132,
  spaltenkopf: 78,
  luecke: 2,
};

/**
 * Ein Wert zwischen -1 und 1: wie weit die Zelle von der Mitte abweicht.
 * Bei 'wert' ist die Mitte 50 %, bei 'abweichung' die Erwartung.
 */
export function ausschlag(zelle, skala, spanne) {
  if (!zelle || zelle.wert === null || zelle.wert === undefined) return null;
  if (skala === 'wert') return Math.max(-1, Math.min(1, (zelle.wert - 50) / 50));
  if (zelle.erwartet === null || zelle.erwartet === undefined) return null;
  return Math.max(-1, Math.min(1, (zelle.wert - zelle.erwartet) / Math.max(1, spanne)));
}

/** Die Farbe einer Zelle. Zwei Töne aus dem Thema, keine Ampel. */
export function farbe(wert) {
  if (wert === null) return 'var(--tba3-_farbe-flaeche)';
  const staerke = Math.min(1, Math.abs(wert));
  const ton = wert >= 0 ? 'var(--tba3-_farbe-ueber)' : 'var(--tba3-_farbe-unter)';
  return `color-mix(in srgb, ${ton} ${Math.round(staerke * 100)}%, var(--tba3-_farbe-flaeche))`;
}

export function raster(props = {}) {
  const { zeilen, spalten, werte, skala, spanne } = { ...STANDARD, ...props };
  const zeilenListe = Array.isArray(zeilen) ? zeilen : [];
  const spaltenListe = Array.isArray(spalten) ? spalten : [];
  const nachOrt = new Map();
  for (const w of Array.isArray(werte) ? werte : []) {
    nachOrt.set(`${w.zeile}::${w.spalte}`, w);
  }

  const m = MASSE;
  const zellen = zeilenListe.map((zeile, zi) => {
    const zeilenId = zeile.id ?? zeile.label ?? String(zi);
    return {
      id: zeilenId,
      label: zeile.label ?? String(zeilenId),
      zellen: spaltenListe.map((spalte, si) => {
        const spaltenId = spalte.id ?? spalte.label ?? String(si);
        const eintrag = nachOrt.get(`${zeilenId}::${spaltenId}`) ?? null;
        const aus = ausschlag(eintrag, skala, spanne);
        return {
          zeile: zeilenId,
          spalte: spaltenId,
          spaltenLabel: spalte.label ?? String(spaltenId),
          wert: eintrag?.wert ?? null,
          erwartet: eintrag?.erwartet ?? null,
          ausschlag: aus,
          farbe: farbe(aus),
          leer: eintrag === null,
          x: m.zeilenkopf + si * m.zelle,
          y: m.spaltenkopf + zi * m.zelle,
        };
      }),
    };
  });

  return {
    breite: m.zeilenkopf + spaltenListe.length * m.zelle,
    hoehe: m.spaltenkopf + zeilenListe.length * m.zelle,
    zellgroesse: m.zelle,
    luecke: m.luecke,
    zeilenkopf: m.zeilenkopf,
    spaltenkopf: m.spaltenkopf,
    spalten: spaltenListe.map((spalte, si) => ({
      id: spalte.id ?? spalte.label ?? String(si),
      label: spalte.label ?? '',
      x: m.zeilenkopf + si * m.zelle + m.zelle / 2,
    })),
    zeilen: zellen,
    skala,
  };
}

export default raster;
