// Kompetenzstufen in einer Schreibweise.
//
// Die Schnittstelle führt die Stufen nicht einheitlich: mal römisch mit
// geteilter unterster Stufe (`Ia`, `Ib`, `II` … `V`), in Mathematik Klasse 8
// arabisch (`1a`, `1b`, `2` … `5`). Die Anwendung kennt fünf Stufen, I bis V —
// Farben, Namen und Rechnungen hängen daran. Ohne Abgleich fielen in Mathe 8
// alle Stufen durch: schwarze Balken, Kennzahlen bei 0 %.
//
// Abgeglichen wird einmal, in der API-Schicht — in der Demoanwendung in
// services/tba3Api.js, im Katalog über einen axios-Interceptor —, damit jede
// Ansicht dieselbe Schreibweise bekommt. Die Datei ist reine Logik ohne
// Abhängigkeit und wird deshalb von beiden Bereichen eingebunden.

export const STUFEN = ['I', 'II', 'III', 'IV', 'V'];

// Englisch und Französisch messen nach dem Gemeinsamen Europäischen
// Referenzrahmen (A1.1 … C1). Diese Stufen werden nicht auf I–V umgerechnet:
// welche GER-Stufe dem Mindeststandard entspricht, hängt am Bildungsgang. Sie
// behalten ihr Kürzel und bekommen eine eigene, geordnete Farbskala.
export const GER = ['A1', 'A1.1', 'A1.2', 'A2', 'A2.1', 'A2.2', 'B1', 'B1.1', 'B1.2', 'B2', 'B2.1', 'B2.2', 'C1', 'C2'];

export const istIqbStufe = (kuerzel) => STUFEN.includes(kuerzel);

/** Position in der jeweiligen Skala — zum Sortieren. Unbekanntes ans Ende. */
export const stufenOrdnung = (kuerzel) => {
  if (STUFEN.includes(kuerzel)) return STUFEN.indexOf(kuerzel);
  if (GER.includes(kuerzel)) return 100 + GER.indexOf(kuerzel);
  return 1000;
};

const ZUORDNUNG = {
  i: 'I', ia: 'I', ib: 'I', 1: 'I', '1a': 'I', '1b': 'I',
  ii: 'II', 2: 'II',
  iii: 'III', 3: 'III',
  iv: 'IV', 4: 'IV',
  v: 'V', 5: 'V',
};

/** `1a` → `I`, `3` → `III`, `Ib` → `I`; Unbekanntes bleibt, wie es ist. */
export const stufeNormal = (kuerzel) => {
  const roh = String(kuerzel ?? '').trim();
  return ZUORDNUNG[roh.toLowerCase()] ?? roh;
};

/**
 * Stufen einer Antwort auf I–V zusammenführen. Häufigkeiten und Anteile werden
 * addiert (Ia + Ib = I), die Gesamtzahl bleibt.
 */
export const stufenZusammenfassen = (stufen) => {
  if (!Array.isArray(stufen)) return stufen;
  const nachStufe = new Map();
  for (const s of stufen) {
    const kurz = stufeNormal(s.nameShort);
    const da = nachStufe.get(kurz);
    const statistik = s.descriptiveStatistics ?? {};
    if (!da) {
      nachStufe.set(kurz, { ...s, nameShort: kurz, descriptiveStatistics: { ...statistik } });
      continue;
    }
    const summe = da.descriptiveStatistics;
    summe.frequency = (summe.frequency ?? 0) + (statistik.frequency ?? 0);
    summe.mean = (summe.mean ?? 0) + (statistik.mean ?? 0);
  }
  return [...nachStufe.values()].sort((a, b) => stufenOrdnung(a.nameShort) - stufenOrdnung(b.nameShort));
};

/** Eine Antwort von `…/competence-levels`: jeden Eintrag abgleichen. */
export const stufenAntwortAbgleichen = (daten) => (Array.isArray(daten)
  ? daten.map((e) => (e?.competenceLevels ? { ...e, competenceLevels: stufenZusammenfassen(e.competenceLevels) } : e))
  : daten);

/** Eine Antwort von `…/items`: die Stufe jeder Aufgabe abgleichen. */
export const aufgabenAntwortAbgleichen = (daten) => (Array.isArray(daten)
  ? daten.map((e) => (Array.isArray(e?.items)
    ? {
      ...e,
      items: e.items.map((it) => (it?.parameters?.competenceLevel?.nameShort
        ? {
          ...it,
          parameters: {
            ...it.parameters,
            competenceLevel: { ...it.parameters.competenceLevel, nameShort: stufeNormal(it.parameters.competenceLevel.nameShort) },
          },
        }
        : it)),
    }
    : e))
  : daten);
