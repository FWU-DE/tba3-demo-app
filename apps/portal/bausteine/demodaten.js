// Beispieldaten für den Demonstrator.
//
// Zwei Lerngruppen mit unterschiedlichem Profil — die zweite hat einen
// deutlichen Schwerpunkt im unteren Bereich, damit sich sehen lässt, wie die
// Bausteine auf andere Daten reagieren und nicht nur ein Bild zeigen.
//
// Die Zahlen sind erfunden und folgen dem Zuschnitt der TBA3-Beispieldaten;
// echte Auswertungen kommen im Betrieb aus der Schnittstelle.

/** Rot nach Grün — dieselbe Ordnung, die auch die Leiste zeigt. */
const STUFENFARBEN = {
  I: '#ef4444', II: '#f97316', III: '#eab308', IV: '#22c55e', V: '#15803d',
};

const stufen = (...anteile) =>
  ['I', 'II', 'III', 'IV', 'V'].map((nameShort, i) => ({ nameShort, pct: anteile[i] }));

export const DEMODATEN = [
  {
    'kompetenzstufen-leiste': {
      title: '3a Deutsch',
      domain: 'Leseverstehen',
      rows: [
        { label: '3a Deutsch', total: 25, levels: stufen(8, 22, 34, 24, 12) },
        { label: 'Schule', total: 78, levels: stufen(10, 24, 33, 22, 11) },
        { label: 'Fairer Vergleich', total: 480, fair: true, levels: stufen(11, 23, 34, 22, 10) },
        { label: 'Bundesland', total: 12400, levels: stufen(12, 25, 33, 20, 10) },
      ],
    },
    'aufgaben-tabelle': {
      title: 'Aufgaben der Lerngruppe',
      items: [
        { label: 'LE-026', exercise: 'Geheimsache', level: 'II', actual: 41, expected: 63 },
        { label: 'LE-027', exercise: 'Der Ausflug', level: 'IV', actual: 88, expected: 72 },
        { label: 'LE-028', exercise: 'Brief an Mia', level: 'III', actual: 60, expected: 58 },
        { label: 'LE-031', exercise: 'Im Museum', level: 'I', actual: 34, expected: 38 },
        { label: 'LE-034', exercise: 'Wetterbericht', level: 'V', actual: 91, expected: 84 },
        { label: 'LE-037', exercise: 'Das Rezept', level: 'III', actual: 47, expected: 61 },
      ],
    },
    'mittelwert-vergleich': {
      title: 'Mittlere Lösungsquote im Vergleich',
      domain: 'Leseverstehen',
      rows: [
        { label: '3a Deutsch', mean: 62, ciLow: 55, ciHigh: 69, n: 25 },
        { label: 'Schule', mean: 60, ciLow: 56, ciHigh: 64, n: 78 },
        { label: 'Fairer Vergleich', mean: 58, ciLow: 56, ciHigh: 60, fair: true, n: 480 },
        { label: 'Bundesland', mean: 57, n: 12400 },
      ],
    },
    'erwartet-tatsaechlich': {
      title: 'Erwartete und tatsächliche Lösungsquote',
      domain: '3a Deutsch',
      items: [
        { label: 'LE-026', level: 'II', actual: 41, expected: 63 },
        { label: 'LE-027', level: 'IV', actual: 88, expected: 72 },
        { label: 'LE-028', level: 'III', actual: 60, expected: 58 },
        { label: 'LE-031', level: 'I', actual: 34, expected: 38 },
        { label: 'LE-034', level: 'V', actual: 91, expected: 84 },
      ],
    },
    perzentilbaender: {
      title: 'Teilbereiche der Lerngruppe',
      items: [
        { label: 'Lesen', bandLeft: 35, bandRight: 70, studentScore: 52 },
        { label: 'Zuhören', bandLeft: 40, bandRight: 75, studentScore: 61 },
        { label: 'Orthografie', bandLeft: 30, bandRight: 65, studentScore: null },
        { label: 'Sprachgebrauch', bandLeft: 38, bandRight: 72, studentScore: 44 },
      ],
    },
    'schueler-tabelle': {
      title: 'Lösungen je Schüler:in',
      domains: [
        { key: 'total', label: 'Insgesamt' },
        { key: 'reading', label: 'Lesen' },
        { key: 'listening', label: 'Zuhören' },
      ],
      rows: [
        { id: 's1', name: 'Anna B.', gender: 'f', domains: {
          total: { pctCorrect: 78, pctOmitted: 2, pctIncorrect: 20 },
          reading: { pctCorrect: 84, pctOmitted: 0, pctIncorrect: 16 },
          listening: { pctCorrect: 72, pctOmitted: 4, pctIncorrect: 24 },
        } },
        { id: 's2', name: 'Ben C.', gender: 'm', domains: {
          total: { pctCorrect: 61, pctOmitted: 7, pctIncorrect: 32 },
          reading: { pctCorrect: 66, pctOmitted: 4, pctIncorrect: 30 },
          listening: { pctCorrect: 56, pctOmitted: 10, pctIncorrect: 34 },
        } },
        { id: 's3', name: 'Cem D.', gender: 'm', domains: {
          total: { pctCorrect: 44, pctOmitted: 14, pctIncorrect: 42 },
          reading: { pctCorrect: 48, pctOmitted: 12, pctIncorrect: 40 },
          listening: { pctCorrect: 40, pctOmitted: 16, pctIncorrect: 44 },
        } },
        { id: 's4', name: 'Dilara E.', gender: 'f', domains: {
          total: { pctCorrect: 88, pctOmitted: 0, pctIncorrect: 12 },
          reading: { pctCorrect: 91, pctOmitted: 0, pctIncorrect: 9 },
          listening: { pctCorrect: 85, pctOmitted: 0, pctIncorrect: 15 },
        } },
        // Abwesend: steht am Ende, mit Grund statt mit Balken
        { id: 's5', name: 'Emre F.', gender: 'm', absent: true,
          absentMessage: 'Am Testtag entschuldigt gefehlt.', domains: {} },
      ],
    },
    uebersichtskarten: {
      title: 'Kompetenzübersicht 3a Deutsch',
      karten: [
        { id: 'verteilung', label: 'Kompetenzstufen', wert: 25, einheit: '',
          // Die Stufen tragen eine Ordnung: I ist die schwächste. Ohne eigene
          // Farben liefe die Vorgabe des Bausteins genau andersherum.
          anteile: [
            { label: 'I', wert: 2, farbe: STUFENFARBEN.I },
            { label: 'II', wert: 5, farbe: STUFENFARBEN.II },
            { label: 'III', wert: 9, farbe: STUFENFARBEN.III },
            { label: 'IV', wert: 6, farbe: STUFENFARBEN.IV },
            { label: 'V', wert: 3, farbe: STUFENFARBEN.V },
          ],
          details: [
            { label: 'I · Unter Mindeststandard', wert: 2 },
            { label: 'II · Mindeststandard', wert: 5 },
            { label: 'III · Regelstandard', wert: 9 },
            { label: 'IV · Regelstandard plus', wert: 6 },
            { label: 'V · Optimalstandard', wert: 3 },
          ] },
        // Zwei Aussagen, zwei Farben: die Vorgabe des Bausteins läuft von Grün
        // nach Rot durch die Kompetenzstufen und würde hier „nicht erreicht"
        // grün einfärben. Farben, die etwas behaupten, gehören zu den Daten.
        { id: 'ab-mindest', label: 'Mindeststandard und darüber', wert: 92, einheit: '%',
          anteile: [
            { label: 'erreicht', wert: 23, farbe: '#16a34a' },
            { label: 'nicht erreicht', wert: 2, farbe: '#94a3b8' },
          ],
          details: [{ label: 'Schüler:innen', wert: 23 }] },
        { id: 'unter-mindest', label: 'Unter Mindeststandard', wert: 8, einheit: '%',
          anteile: [
            { label: 'betroffen', wert: 2, farbe: '#dc2626' },
            { label: 'übrige', wert: 23, farbe: '#94a3b8' },
          ],
          details: [{ label: 'Schüler:innen', wert: 2 }] },
      ],
    },
    streudiagramm: {
      title: 'Schüler:innen nach Stufe und Lösungsquote',
      mittelwert: 62,
      punkte: [
        { id: 's1', name: 'Anna B.', x: 4.2, y: 78, details: [{ label: 'Lesen', wert: 84 }, { label: 'Zuhören', wert: 72 }] },
        { id: 's2', name: 'Ben C.', x: 3.1, y: 61, details: [{ label: 'Lesen', wert: 66 }, { label: 'Zuhören', wert: 56 }] },
        { id: 's3', name: 'Cem D.', x: 2.4, y: 44, details: [{ label: 'Lesen', wert: 48 }, { label: 'Zuhören', wert: 40 }] },
        { id: 's4', name: 'Dilara E.', x: 4.8, y: 88, details: [{ label: 'Lesen', wert: 91 }, { label: 'Zuhören', wert: 85 }] },
        { id: 's6', name: 'Frieda G.', x: 3.1, y: 61, details: [{ label: 'Lesen', wert: 60 }, { label: 'Zuhören', wert: 62 }] },
        { id: 's7', name: 'Gero H.', x: 1.8, y: 33, details: [{ label: 'Lesen', wert: 36 }, { label: 'Zuhören', wert: 30 }] },
      ],
    },
    'bista-verteilung': {
      title: 'BISTA-Punkte der 3a Deutsch',
      mittelwert: 468,
      schueler: [
        { id: 's1', name: 'Anna B.', punkte: 512 },
        { id: 's2', name: 'Ben C.', punkte: 470 },
        { id: 's3', name: 'Cem D.', punkte: 421 },
        { id: 's4', name: 'Dilara E.', punkte: 534 },
        { id: 's6', name: 'Frieda G.', punkte: 470 },
        { id: 's7', name: 'Gero H.', punkte: 398 },
        { id: 's8', name: 'Hanna I.', punkte: 470 },
      ],
    },
    'lernstands-verlauf': {
      title: 'Lernstand über drei Erhebungen',
      punkte: [
        { label: 'Herbst', mean: 54, ciLow: 47, ciHigh: 61, n: 25 },
        { label: 'Winter', mean: 61, ciLow: 55, ciHigh: 67, n: 25 },
        { label: 'Frühjahr', mean: 66, ciLow: 60, ciHigh: 72, n: 24 },
      ],
      vergleich: [{ mean: 52 }, { mean: 56 }, { mean: 59 }],
    },
    'aufgaben-heatmap': {
      title: 'Aufgaben über die Lerngruppen',
      zeilen: [
        { id: 'le-026', label: 'LE-026' },
        { id: 'le-027', label: 'LE-027' },
        { id: 'le-028', label: 'LE-028' },
        { id: 'le-031', label: 'LE-031' },
      ],
      spalten: [
        { id: '3a', label: '3a' },
        { id: '3b', label: '3b' },
        { id: '3c', label: '3c' },
      ],
      werte: [
        { zeile: 'le-026', spalte: '3a', wert: 41, erwartet: 63 },
        { zeile: 'le-026', spalte: '3b', wert: 66, erwartet: 63 },
        { zeile: 'le-026', spalte: '3c', wert: 59, erwartet: 63 },
        { zeile: 'le-027', spalte: '3a', wert: 88, erwartet: 72 },
        { zeile: 'le-027', spalte: '3b', wert: 74, erwartet: 72 },
        { zeile: 'le-027', spalte: '3c', wert: 70, erwartet: 72 },
        { zeile: 'le-028', spalte: '3a', wert: 60, erwartet: 58 },
        { zeile: 'le-028', spalte: '3b', wert: 44, erwartet: 58 },
        // 3c fehlt bei LE-028: die Aufgabe war dort nicht im Testheft
        { zeile: 'le-031', spalte: '3a', wert: 34, erwartet: 38 },
        { zeile: 'le-031', spalte: '3b', wert: 39, erwartet: 38 },
        { zeile: 'le-031', spalte: '3c', wert: 52, erwartet: 38 },
      ],
    },
    'kennzahl-kachel': {
      label: 'Mittlere Lösungsquote',
      wert: 62,
      einheit: '%',
      vergleich: 58,
      verlauf: [54, 57, 59, 62],
      hinweis: '25 Schüler:innen · Leseverstehen',
    },
    'kontextmerkmal-ring': {
      label: 'Sprache zuhause',
      segmente: [
        { label: 'Deutsch', wert: 17, farbe: '#2563eb' },
        { label: 'andere', wert: 8, farbe: '#eab308' },
      ],
    },
    'standard-erreichung': {
      label: 'Mindeststandard erreicht',
      zeilen: [
        { label: 'Lesen', wert: 84, gesamt: 25 },
        { label: 'Zuhören', wert: 76, gesamt: 25 },
        { label: 'Orthografie', wert: 62, gesamt: 25 },
      ],
    },
    zeugnissaetze: {
      titel: 'Vorschläge für das Zeugnis',
      werte: { name: 'Anna B.', stufe: 'IV', domaene: 'Leseverstehen', quote: '78' },
      saetze: [
        { id: 'stufe', stufe: 'IV', vorlage: '{name} erreicht im {domaene} die Kompetenzstufe {stufe} und liegt damit über dem Regelstandard.',
          grundlage: 'Kompetenzstufe {stufe}, Lösungsquote {quote} %' },
        { id: 'arbeit', vorlage: '{name} erschließt sich auch längere Texte selbstständig.',
          grundlage: 'Lösungsquote {quote} % im {domaene}' },
      ],
    },
    'lernverlauf-figuren': {
      title: 'Lesegeschwindigkeit über drei Erhebungen',
      yTitel: 'Lesegeschwindigkeit',
      zeitpunkte: [
        { id: 'm25', label: '2025 März' }, { id: 'h25', label: '2025 Herbst' }, { id: 'm26', label: '2026 März' },
      ],
      // Benannte Zonen statt Zahlen — das ist der Kern der Vorlage: eine
      // Drittklässlerin liest „Fink", nicht „Kompetenzstufe III".
      zonen: [
        { label: 'Silbe', von: 0, bis: 35 },
        { label: 'Wort', von: 35, bis: 60 },
        { label: 'Fink', von: 60, bis: 80 },
        { label: 'Adler', von: 80, bis: 100 },
      ],
      personen: [
        { id: 's1', name: 'Anna B.', werte: [{ zeitpunkt: 'm25', wert: 41 }, { zeitpunkt: 'h25', wert: 58 }, { zeitpunkt: 'm26', wert: 74 }] },
        { id: 's2', name: 'Ben C.', werte: [{ zeitpunkt: 'm25', wert: 66 }, { zeitpunkt: 'h25', wert: 71 }, { zeitpunkt: 'm26', wert: 84 }] },
        { id: 's3', name: 'Cem D.', werte: [{ zeitpunkt: 'm25', wert: 28 }, { zeitpunkt: 'h25', wert: 33 }, { zeitpunkt: 'm26', wert: 46 }] },
        { id: 's4', name: 'Dilara E.', werte: [{ zeitpunkt: 'm25', wert: 79 }, { zeitpunkt: 'h25', wert: 88 }, { zeitpunkt: 'm26', wert: 92 }] },
      ],
    },
    selbsteinschaetzung: {
      title: 'Selbsteinschätzung und Ergebnis',
      zeilen: [
        { label: 'Lesen', selbst: 82, gemessen: 61 },
        { label: 'Zuhören', selbst: 60, gemessen: 64 },
        { label: 'Orthografie', selbst: 45, gemessen: 72 },
        { label: 'Sprachgebrauch', selbst: 70, gemessen: 66 },
      ],
    },
    glossar: {
      title: 'Begriffe dieser Rückmeldung',
      eintraege: [
        { id: 'ks', begriff: 'Kompetenzstufe', erklaerung: 'Fünf Stufen von I bis V. Stufe I liegt unter dem Mindeststandard, ab II gilt er als erreicht.' },
        { id: 'fv', begriff: 'Fairer Vergleich', erklaerung: 'Der Vergleich mit Schulen ähnlicher sozialer Zusammensetzung statt mit allen.', auch: ['Standorttyp', 'STYPS'] },
        { id: 'lh', begriff: 'Lösungshäufigkeit', erklaerung: 'Der Anteil der Lernenden, die eine Aufgabe richtig gelöst haben.' },
        { id: 'ms', begriff: 'Mindeststandard', erklaerung: 'Das Niveau, das am Ende der Jahrgangsstufe alle erreicht haben sollen.' },
        { id: 'do', begriff: 'Domäne', erklaerung: 'Ein Teilbereich eines Faches, etwa Leseverstehen oder Hörverstehen.', auch: ['Teilbereich'] },
      ],
    },
  },
  {
    'kompetenzstufen-leiste': {
      title: '8b Mathematik',
      domain: 'Leitidee Zahl',
      rows: [
        { label: '8b Mathematik', total: 22, levels: stufen(24, 31, 27, 13, 5) },
        { label: 'Schule', total: 91, levels: stufen(18, 27, 31, 17, 7) },
        { label: 'Fairer Vergleich', total: 520, fair: true, levels: stufen(17, 26, 32, 18, 7) },
        { label: 'Bundesland', total: 14800, levels: stufen(15, 25, 33, 19, 8) },
      ],
    },
    'aufgaben-tabelle': {
      title: 'Aufgaben der Lerngruppe',
      items: [
        { label: 'MA-104', exercise: 'Bruchrechnung', level: 'I', actual: 22, expected: 41 },
        { label: 'MA-108', exercise: 'Prozentsätze', level: 'II', actual: 38, expected: 44 },
        { label: 'MA-112', exercise: 'Dreisatz', level: 'III', actual: 55, expected: 52 },
        { label: 'MA-115', exercise: 'Flächeninhalt', level: 'II', actual: 61, expected: 47 },
        { label: 'MA-119', exercise: 'Gleichungen', level: 'IV', actual: 29, expected: 58 },
      ],
    },
    'mittelwert-vergleich': {
      title: 'Mittlere Lösungsquote im Vergleich',
      domain: 'Leitidee Zahl',
      rows: [
        { label: '8b Mathematik', mean: 41, ciLow: 33, ciHigh: 49, n: 22 },
        { label: 'Schule', mean: 49, ciLow: 45, ciHigh: 53, n: 91 },
        { label: 'Fairer Vergleich', mean: 50, ciLow: 48, ciHigh: 52, fair: true, n: 520 },
        { label: 'Bundesland', mean: 52, n: 14800 },
      ],
    },
    'erwartet-tatsaechlich': {
      title: 'Erwartete und tatsächliche Lösungsquote',
      domain: '8b Mathematik',
      items: [
        { label: 'MA-104', level: 'I', actual: 22, expected: 41 },
        { label: 'MA-108', level: 'II', actual: 38, expected: 44 },
        { label: 'MA-112', level: 'III', actual: 55, expected: 52 },
        { label: 'MA-115', level: 'II', actual: 61, expected: 47 },
        { label: 'MA-119', level: 'IV', actual: 29, expected: 58 },
      ],
    },
    perzentilbaender: {
      title: 'Teilbereiche der Lerngruppe',
      items: [
        { label: 'Zahl', bandLeft: 28, bandRight: 58, studentScore: 33 },
        { label: 'Messen', bandLeft: 33, bandRight: 64, studentScore: 57 },
        { label: 'Raum und Form', bandLeft: 30, bandRight: 61, studentScore: null },
        { label: 'Funktionaler Zusammenhang', bandLeft: 25, bandRight: 55, studentScore: 21 },
        { label: 'Daten und Zufall', bandLeft: 35, bandRight: 66, studentScore: 48 },
      ],
    },
    'schueler-tabelle': {
      title: 'Lösungen je Schüler:in',
      sortierung: 'name',
      richtung: 'auf',
      auswaehlbar: false,
      domains: [
        { key: 'total', label: 'Insgesamt' },
        { key: 'arith', label: 'Arithmetik' },
        { key: 'geo', label: 'Geometrie' },
      ],
      rows: [
        { id: 'm1', name: 'Ilyas K.', gender: 'm', domains: {
          total: { pctCorrect: 38, pctOmitted: 18, pctIncorrect: 44 },
          arith: { pctCorrect: 42, pctOmitted: 16, pctIncorrect: 42 },
          geo: { pctCorrect: 34, pctOmitted: 20, pctIncorrect: 46 },
        } },
        { id: 'm2', name: 'Jana L.', gender: 'f', domains: {
          total: { pctCorrect: 55, pctOmitted: 9, pctIncorrect: 36 },
          arith: { pctCorrect: 61, pctOmitted: 6, pctIncorrect: 33 },
          geo: { pctCorrect: 49, pctOmitted: 12, pctIncorrect: 39 },
        } },
        { id: 'm3', name: 'Kilian M.', gender: 'm', domains: {
          total: { pctCorrect: 27, pctOmitted: 25, pctIncorrect: 48 },
          arith: { pctCorrect: 30, pctOmitted: 22, pctIncorrect: 48 },
          geo: { pctCorrect: 24, pctOmitted: 28, pctIncorrect: 48 },
        } },
      ],
    },
    uebersichtskarten: {
      title: 'Kompetenzübersicht 8b Mathematik',
      spalten: 2,
      karten: [
        { id: 'verteilung', label: 'Kompetenzstufen', wert: 22, einheit: '',
          anteile: [
            { label: 'I', wert: 5, farbe: STUFENFARBEN.I },
            { label: 'II', wert: 7, farbe: STUFENFARBEN.II },
            { label: 'III', wert: 6, farbe: STUFENFARBEN.III },
            { label: 'IV', wert: 3, farbe: STUFENFARBEN.IV },
            { label: 'V', wert: 1, farbe: STUFENFARBEN.V },
          ],
          details: [
            { label: 'I · Unter Mindeststandard', wert: 5 },
            { label: 'II · Mindeststandard', wert: 7 },
            { label: 'III · Regelstandard', wert: 6 },
            { label: 'IV · Regelstandard plus', wert: 3 },
            { label: 'V · Optimalstandard', wert: 1 },
          ] },
        { id: 'unter-mindest', label: 'Unter Mindeststandard', wert: 23, einheit: '%',
          anteile: [
            { label: 'betroffen', wert: 5, farbe: '#dc2626' },
            { label: 'übrige', wert: 17, farbe: '#94a3b8' },
          ],
          details: [{ label: 'Schüler:innen', wert: 5 }] },
      ],
    },
    streudiagramm: {
      title: 'Schüler:innen nach Stufe und Lösungsquote',
      mittelwert: 41,
      punkte: [
        { id: 'm1', name: 'Ilyas K.', x: 2.1, y: 38, details: [{ label: 'Arithmetik', wert: 42 }, { label: 'Geometrie', wert: 34 }] },
        { id: 'm2', name: 'Jana L.', x: 3.0, y: 55, details: [{ label: 'Arithmetik', wert: 61 }, { label: 'Geometrie', wert: 49 }] },
        { id: 'm3', name: 'Kilian M.', x: 1.4, y: 27, details: [{ label: 'Arithmetik', wert: 30 }, { label: 'Geometrie', wert: 24 }] },
        { id: 'm4', name: 'Lara N.', x: 1.4, y: 27, details: [{ label: 'Arithmetik', wert: 26 }, { label: 'Geometrie', wert: 28 }] },
        { id: 'm5', name: 'Mert O.', x: 4.1, y: 71, details: [{ label: 'Arithmetik', wert: 74 }, { label: 'Geometrie', wert: 68 }] },
      ],
    },
    'bista-verteilung': {
      title: 'BISTA-Punkte der 8b Mathematik',
      mittelwert: 424,
      punkteMin: 280,
      zonen: [
        { id: 'ks1', label: 'KS I', von: 280, bis: 415 },
        { id: 'ks2', label: 'KS II', von: 415, bis: 495 },
        { id: 'ks3', label: 'KS III', von: 495, bis: 565 },
      ],
      schueler: [
        { id: 'm1', name: 'Ilyas K.', punkte: 408 },
        { id: 'm2', name: 'Jana L.', punkte: 462 },
        { id: 'm3', name: 'Kilian M.', punkte: 351 },
        { id: 'm4', name: 'Lara N.', punkte: 351 },
        { id: 'm5', name: 'Mert O.', punkte: 508 },
        { id: 'm6', name: 'Nele P.', punkte: 408 },
      ],
    },
    'lernstands-verlauf': {
      title: 'Lernstand über drei Erhebungen',
      yTitel: 'Lösungsquote (%)',
      punkte: [
        { label: 'Herbst', mean: 47, ciLow: 39, ciHigh: 55, n: 22 },
        { label: 'Winter', mean: 44, ciLow: 37, ciHigh: 51, n: 22 },
        { label: 'Frühjahr', mean: 41, ciLow: 34, ciHigh: 48, n: 22 },
      ],
      vergleich: [{ mean: 49 }, { mean: 51 }, { mean: 52 }],
    },
    'aufgaben-heatmap': {
      title: 'Aufgaben über die Lerngruppen',
      skala: 'wert',
      zeilen: [
        { id: 'ma-104', label: 'MA-104' },
        { id: 'ma-108', label: 'MA-108' },
        { id: 'ma-112', label: 'MA-112' },
      ],
      spalten: [
        { id: '8a', label: '8a' },
        { id: '8b', label: '8b' },
      ],
      werte: [
        { zeile: 'ma-104', spalte: '8a', wert: 47 },
        { zeile: 'ma-104', spalte: '8b', wert: 22 },
        { zeile: 'ma-108', spalte: '8a', wert: 51 },
        { zeile: 'ma-108', spalte: '8b', wert: 38 },
        { zeile: 'ma-112', spalte: '8a', wert: 58 },
        { zeile: 'ma-112', spalte: '8b', wert: 55 },
      ],
    },
    'kennzahl-kachel': {
      label: 'Mittlere Lösungsquote',
      wert: 41,
      einheit: '%',
      vergleich: 50,
      verlauf: [47, 44, 41],
      hinweis: '22 Schüler:innen · Leitidee Zahl',
    },
    'kontextmerkmal-ring': {
      label: 'Sozioökonomischer Status',
      geordnet: true,
      mitteLabel: 'Schul-Median',
      segmente: [
        { label: 'A — sehr niedrig', wert: 6 },
        { label: 'B — niedrig', wert: 9 },
        { label: 'C — mittel', wert: 5 },
        { label: 'D — hoch', wert: 3 },
        { label: 'E — sehr hoch', wert: 1 },
      ],
    },
    'standard-erreichung': {
      label: 'Mindeststandard erreicht',
      zeilen: [
        { label: 'Lesen', wert: 58, gesamt: 24 },
        { label: 'Zuhören', wert: 46, gesamt: 24 },
        { label: 'Orthografie', wert: 39, gesamt: 24 },
      ],
      hinweis: 'Deutlich unter dem fairen Vergleich — die Aufschlüsselung zeigt, wo.',
    },
    zeugnissaetze: {
      titel: 'Vorschläge für das Zeugnis',
      werte: { name: 'Cem D.', stufe: 'II', domaene: 'Leseverstehen', quote: '44' },
      saetze: [
        { id: 'stufe', stufe: 'II', vorlage: '{name} erreicht im {domaene} die Kompetenzstufe {stufe}.',
          grundlage: 'Kompetenzstufe {stufe}, Lösungsquote {quote} %' },
        { id: 'foerder', vorlage: '{name} sollte das sinnentnehmende Lesen weiter üben.',
          grundlage: 'Lösungsquote {quote} % im {domaene}' },
      ],
    },
    'lernverlauf-figuren': {
      title: 'Lesegeschwindigkeit über drei Erhebungen',
      yTitel: 'Lesegeschwindigkeit',
      zeitpunkte: [
        { id: 'm25', label: '2025 März' }, { id: 'h25', label: '2025 Herbst' }, { id: 'm26', label: '2026 März' },
      ],
      zonen: [
        { label: 'Silbe', von: 0, bis: 35 },
        { label: 'Wort', von: 35, bis: 60 },
        { label: 'Fink', von: 60, bis: 80 },
        { label: 'Adler', von: 80, bis: 100 },
      ],
      // Eine Gruppe, die sich kaum bewegt — damit sichtbar wird, dass der
      // Baustein auch das zeigt und nicht nur den erfreulichen Fall.
      personen: [
        { id: 's1', name: 'Emre F.', werte: [{ zeitpunkt: 'm25', wert: 31 }, { zeitpunkt: 'h25', wert: 29 }, { zeitpunkt: 'm26', wert: 34 }] },
        { id: 's2', name: 'Frieda G.', werte: [{ zeitpunkt: 'm25', wert: 44 }, { zeitpunkt: 'h25', wert: 43 }, { zeitpunkt: 'm26', wert: 47 }] },
        { id: 's3', name: 'Gero H.', werte: [{ zeitpunkt: 'm25', wert: 22 }, { zeitpunkt: 'h25', wert: 26 }, { zeitpunkt: 'm26', wert: 25 }] },
      ],
    },
    selbsteinschaetzung: {
      title: 'Selbsteinschätzung und Ergebnis',
      zeilen: [
        { label: 'Lesen', selbst: 35, gemessen: 38 },
        { label: 'Zuhören', selbst: 40, gemessen: 42 },
        { label: 'Orthografie', selbst: 30, gemessen: 31 },
      ],
    },
    glossar: {
      title: 'Begriffe dieser Rückmeldung',
      eintraege: [
        { id: 'ks', begriff: 'Kompetenzstufe', erklaerung: 'Fünf Stufen von I bis V.' },
        { id: 'ms', begriff: 'Mindeststandard', erklaerung: 'Das Niveau, das alle erreicht haben sollen.' },
      ],
    },
  },
];

export default DEMODATEN;
