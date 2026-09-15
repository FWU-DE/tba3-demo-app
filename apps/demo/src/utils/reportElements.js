// Aus den Antworten der Schnittstelle die Eigenschaften der Bausteine machen.
//
// Der Katalog in `apps/shared/konsortium.js` sagt je Baustein, welche Ressource
// ihn speist (`quelle`). Hier steht, wie aus dieser Antwort die Eigenschaften
// werden, die `@tba3/bausteine` erwartet — eine Funktion je Katalogeintrag, in
// `ELEMENT_PROPS` nachschlagbar.
//
// Zwei Regeln, die den Unterschied zwischen ehrlich und hübsch ausmachen:
//
//   1. **Nichts erfinden, was die Antwort nicht hergibt.** Die Schnittstelle
//      liefert kein Konfidenzintervall — also bekommt der Mittelwert-Vergleich
//      keines, statt eines ausgedachten. Sie unterscheidet nicht zwischen
//      „falsch" und „ausgelassen" — also steht der ausgelassene Anteil auf 0,
//      und die Ansicht sagt das dazu.
//   2. **Beschriftungen kommen von außen.** Diese Datei kennt keine Sprache;
//      Domänennamen, Stufenfarben und Hinweistexte reicht die Ansicht herein.

/** Einträge der Antwort, die keine einzelne Schüler:in sind. */
const aggregate = (daten) => (Array.isArray(daten) ? daten.filter((e) => e.type !== 'student') : []);
const schuelerEintraege = (daten) => (Array.isArray(daten) ? daten.filter((e) => e.type === 'student') : []);

const prozent = (anteil) => Math.round((anteil ?? 0) * 100);
const mittel = (zahlen) => (zahlen.length ? zahlen.reduce((s, z) => s + z, 0) / zahlen.length : 0);

/**
 * Die Erwartung zu einer Aufgabe. Die Spezifikation führt je Schulform eine
 * eigene Lösungshäufigkeit; welche gilt, hängt an der Schule und steht in der
 * Antwort nicht. Genommen wird die erste, die überhaupt einen Wert hat — und
 * fehlt jede, bleibt die Erwartung leer statt bei null zu landen, was die
 * Abweichung jeder Aufgabe auf 100 Punkte triebe.
 */
const erwartung = (item) => {
  const p = item.parameters ?? {};
  const wert = [
    p.solutionFrequencyPrimarySchool,
    p.solutionFrequencyGymnasium,
    p.solutionFrequencyNonGymnasium,
  ].find((w) => typeof w === 'number');
  return wert == null ? null : prozent(wert);
};

const stufeVon = (item) => item.parameters?.competenceLevel?.nameShort ?? '';
const aufgabenSchluessel = (item) => item.iqbId ?? item.name ?? '';

/** Die Aufgaben der Aggregatebene, ohne Dopplungen über die Domänen hinweg. */
const aufgabenListe = (daten) => {
  const gesehen = new Map();
  for (const eintrag of aggregate(daten)) {
    for (const item of eintrag.items ?? []) {
      const schluessel = aufgabenSchluessel(item);
      if (!gesehen.has(schluessel)) gesehen.set(schluessel, { item, domaene: eintrag.domain?.name });
    }
  }
  return [...gesehen.values()];
};

/** Je Schüler:in ein Eintrag, die Domänen zusammengeführt. */
const schuelerZusammenfuehren = (daten) => {
  const proSchueler = new Map();
  for (const eintrag of schuelerEintraege(daten)) {
    const vorhanden = proSchueler.get(eintrag.id) ?? {
      id: eintrag.id,
      name: eintrag.name,
      geschlecht: eintrag.covariates?.find((k) => k.type === 'gender')?.value,
      domaenen: new Map(),
    };
    vorhanden.domaenen.set(eintrag.domain?.name ?? 'gesamt', eintrag.items ?? []);
    proSchueler.set(eintrag.id, vorhanden);
  }
  return [...proSchueler.values()];
};

/** Alle Aufgaben einer Schüler:in über alle Domänen. */
const alleAufgaben = (schueler) => [...schueler.domaenen.values()].flat();

/** Der Anteil gelöster Aufgaben in Prozent. */
const quote = (items) => Math.round(mittel(items.map((it) => (it.descriptiveStatistics?.mean ?? 0) * 100)));

/** Perzentil einer sortierten Liste — linear interpoliert, wie üblich. */
const perzentil = (sortiert, anteil) => {
  if (sortiert.length === 0) return 0;
  const pos = (sortiert.length - 1) * anteil;
  const unten = Math.floor(pos);
  const oben = Math.ceil(pos);
  if (unten === oben) return sortiert[unten];
  return sortiert[unten] + (sortiert[oben] - sortiert[unten]) * (pos - unten);
};

// ── Kompetenzstufen ────────────────────────────────────────────────────────

export const leisteZeilen = (daten, { domaene, farbe }) =>
  aggregate(daten)
    .filter((e) => e.competenceLevels?.length)
    .map((e) => ({
      label: domaene(e.domain?.name),
      total: e.competenceLevels[0]?.descriptiveStatistics?.total ?? 0,
      levels: e.competenceLevels.map((stufe) => ({
        nameShort: stufe.nameShort,
        pct: prozent(stufe.descriptiveStatistics?.mean),
        color: farbe(stufe.nameShort),
      })),
    }));

export const uebersichtsKarten = (daten, { domaene, farbe }) =>
  aggregate(daten)
    .filter((e) => e.competenceLevels?.length)
    .map((e) => ({
      id: e.domain?.name ?? e.id,
      label: domaene(e.domain?.name),
      wert: e.competenceLevels[0]?.descriptiveStatistics?.total ?? 0,
      einheit: '',
      anteile: e.competenceLevels.map((stufe) => ({
        label: stufe.nameShort,
        wert: stufe.descriptiveStatistics?.frequency ?? 0,
        farbe: farbe(stufe.nameShort),
      })),
      details: e.competenceLevels.map((stufe) => ({
        label: `${stufe.nameShort} · ${stufe.name}`,
        wert: stufe.descriptiveStatistics?.frequency ?? 0,
      })),
    }));

/**
 * Eine Kachel je Domäne: der Anteil, der den Mindeststandard erreicht.
 * Stufe I ist definitionsgemäß darunter — alles andere darüber.
 */
export const kennzahlen = (daten, { domaene, hinweis }) =>
  aggregate(daten)
    .filter((e) => e.competenceLevels?.length)
    .map((e) => {
      const gesamt = e.competenceLevels.reduce((s, l) => s + (l.descriptiveStatistics?.frequency ?? 0), 0);
      const erreicht = e.competenceLevels
        .filter((l) => l.nameShort !== 'I')
        .reduce((s, l) => s + (l.descriptiveStatistics?.frequency ?? 0), 0);
      return {
        id: e.domain?.name ?? e.id,
        label: domaene(e.domain?.name),
        wert: gesamt ? Math.round((erreicht / gesamt) * 100) : null,
        einheit: '%',
        hinweis,
      };
    });

// ── Aufgaben ───────────────────────────────────────────────────────────────

export const aufgabenZeilen = (daten) =>
  aufgabenListe(daten).map(({ item }) => ({
    label: aufgabenSchluessel(item),
    exercise: item.exercise?.name ?? '',
    level: stufeVon(item),
    actual: prozent(item.descriptiveStatistics?.mean),
    expected: erwartung(item),
  }));

/** Dieselben Aufgaben, aber nur die mit Erwartung — ohne sie zeichnet der Baustein nichts. */
export const erwartungsPunkte = (daten) =>
  aufgabenZeilen(daten).filter((z) => z.expected != null);

/**
 * Eine Zeile je Domäne: die mittlere Lösungsquote der Aufgaben.
 * Ohne Konfidenzintervall — die Schnittstelle liefert keins, und eines zu
 * rechnen hieße, eine Genauigkeit zu behaupten, die die Daten nicht tragen.
 */
export const mittelwertZeilen = (daten, { domaene }) =>
  aggregate(daten)
    .filter((e) => e.items?.length)
    .map((e) => ({
      label: domaene(e.domain?.name),
      mean: Math.round(mittel(e.items.map((it) => (it.descriptiveStatistics?.mean ?? 0) * 100))),
      n: e.items[0]?.descriptiveStatistics?.total ?? null,
    }));

// ── Schüler:innen ──────────────────────────────────────────────────────────

/** Wie viele Aufgaben und Personen die Heatmap höchstens zeigt. */
export const HEATMAP_GRENZE = { aufgaben: 14, personen: 12 };

export const heatmapDaten = (datenSchueler, datenAufgaben) => {
  const schueler = schuelerZusammenfuehren(datenSchueler).slice(0, HEATMAP_GRENZE.personen);
  const erwartungen = new Map(
    aufgabenListe(datenAufgaben).map(({ item }) => [aufgabenSchluessel(item), erwartung(item)]),
  );

  // Die Aufgaben der ersten Person geben die Reihenfolge vor; wer eine andere
  // Zusammenstellung im Testheft hatte, fällt in der Zeile einfach aus.
  const ersteAufgaben = schueler.length ? alleAufgaben(schueler[0]) : [];
  const zeilen = ersteAufgaben.slice(0, HEATMAP_GRENZE.aufgaben).map((item) => ({
    id: aufgabenSchluessel(item),
    label: aufgabenSchluessel(item),
  }));
  const zeilenIds = new Set(zeilen.map((z) => z.id));

  const spalten = schueler.map((s) => ({ id: s.id, label: s.name }));
  const werte = [];
  for (const s of schueler) {
    for (const item of alleAufgaben(s)) {
      const id = aufgabenSchluessel(item);
      if (!zeilenIds.has(id)) continue;
      werte.push({
        zeile: id,
        spalte: s.id,
        wert: prozent(item.descriptiveStatistics?.mean),
        erwartet: erwartungen.get(id) ?? undefined,
      });
    }
  }
  return { zeilen, spalten, werte };
};

export const schuelerTabelle = (datenSchueler, { domaene, gesamt }) => {
  const schueler = schuelerZusammenfuehren(datenSchueler);
  const codes = [...new Set(schueler.flatMap((s) => [...s.domaenen.keys()]))];
  const domains = [
    { key: 'total', label: gesamt },
    ...codes.map((code) => ({ key: code, label: domaene(code) })),
  ];

  const rows = schueler.map((s) => {
    const spalten = { total: alleAufgaben(s) };
    for (const [code, items] of s.domaenen) spalten[code] = items;
    return {
      id: s.id,
      name: s.name,
      gender: s.geschlecht,
      domains: Object.fromEntries(
        Object.entries(spalten).map(([key, items]) => {
          const richtig = quote(items);
          // Die Schnittstelle trennt „falsch" nicht von „ausgelassen" — der
          // ausgelassene Anteil bliebe geraten und steht deshalb auf 0.
          return [key, { pctCorrect: richtig, pctOmitted: 0, pctIncorrect: 100 - richtig }];
        }),
      ),
    };
  });

  return { domains, rows };
};

/**
 * Die Punktwolke braucht zwei Achsen. Die Kompetenzstufe kommt aus der
 * Stufen-Antwort je Schüler:in, die Lösungsquote aus der Aufgaben-Antwort —
 * wer in einer der beiden fehlt, wird nicht gezeichnet statt auf 0 gesetzt.
 */
export const streuPunkte = (datenSchueler, datenStufen, { domaene }) => {
  const stufenRang = { I: 1, II: 2, III: 3, IV: 4, V: 5 };
  const stufeJeSchueler = new Map();
  for (const e of schuelerEintraege(datenStufen)) {
    const stufe = e.competenceLevels?.[0]?.nameShort;
    if (stufe && !stufeJeSchueler.has(e.id)) stufeJeSchueler.set(e.id, stufe);
  }

  return schuelerZusammenfuehren(datenSchueler)
    .filter((s) => stufeJeSchueler.has(s.id))
    .map((s) => ({
      id: s.id,
      name: s.name,
      x: stufenRang[stufeJeSchueler.get(s.id)],
      y: quote(alleAufgaben(s)),
      details: [...s.domaenen].map(([code, items]) => ({ label: domaene(code), wert: quote(items) })),
    }));
};

/** Der mittlere Bereich je Domäne: das 25.- bis 75.-Perzentil der Lösungsquoten. */
export const perzentilBaender = (datenSchueler, { domaene }) => {
  const schueler = schuelerZusammenfuehren(datenSchueler);
  const codes = [...new Set(schueler.flatMap((s) => [...s.domaenen.keys()]))];
  return codes.map((code) => {
    const quoten = schueler
      .filter((s) => s.domaenen.has(code))
      .map((s) => quote(s.domaenen.get(code)))
      .sort((a, b) => a - b);
    return {
      label: domaene(code),
      bandLeft: Math.round(perzentil(quoten, 0.25)),
      bandRight: Math.round(perzentil(quoten, 0.75)),
      studentScore: null,
    };
  });
};

/** Mittlere Lösungsquote über alle Schüler:innen — die Marke im Streudiagramm. */
export const gesamtQuote = (datenSchueler) => {
  const schueler = schuelerZusammenfuehren(datenSchueler);
  if (!schueler.length) return null;
  return Math.round(mittel(schueler.map((s) => quote(alleAufgaben(s)))));
};


/**
 * Eine Zeile für die Kompetenzstufen-Leiste, über alle Domänen einer Ebene
 * zusammengefasst — für den Vergleich zwischen Lerngruppe, Schule und Land,
 * wo die Domäne nicht die Frage ist, sondern die Ebene.
 */
export const gesamtZeile = (daten, { label, farbe, fair = false }) => {
  const eintraege = aggregate(daten).filter((e) => e.competenceLevels?.length);
  if (eintraege.length === 0) return null;

  const summen = new Map();
  let gesamt = 0;
  for (const e of eintraege) {
    for (const stufe of e.competenceLevels) {
      const anzahl = stufe.descriptiveStatistics?.frequency ?? 0;
      summen.set(stufe.nameShort, (summen.get(stufe.nameShort) ?? 0) + anzahl);
      gesamt += anzahl;
    }
  }
  if (gesamt === 0) return null;

  return {
    label,
    fair,
    total: eintraege[0].competenceLevels[0]?.descriptiveStatistics?.total ?? gesamt,
    levels: [...summen].map(([nameShort, anzahl]) => ({
      nameShort,
      pct: Math.round((anzahl / gesamt) * 100),
      color: farbe(nameShort),
    })),
  };
};

export default {
  gesamtZeile,
  leisteZeilen,
  uebersichtsKarten,
  kennzahlen,
  aufgabenZeilen,
  erwartungsPunkte,
  mittelwertZeilen,
  heatmapDaten,
  schuelerTabelle,
  streuPunkte,
  perzentilBaender,
  gesamtQuote,
};
