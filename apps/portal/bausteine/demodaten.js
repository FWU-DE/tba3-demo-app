// Beispieldaten für den Demonstrator.
//
// Zwei Lerngruppen mit unterschiedlichem Profil — die zweite hat einen
// deutlichen Schwerpunkt im unteren Bereich, damit sich sehen lässt, wie die
// Bausteine auf andere Daten reagieren und nicht nur ein Bild zeigen.
//
// Die Zahlen sind erfunden und folgen dem Zuschnitt der TBA3-Beispieldaten;
// echte Auswertungen kommen im Betrieb aus der Schnittstelle.
//
// Beschriftungen gibt es in beiden Sprachen der Seite: `text(de, en)` steht
// für einen Wert, den der Demonstrator vor dem Setzen in die gerade gewählte
// Sprache auflöst (`lokal()`), und bei jedem Wechsel neu. Namen von
// Schüler:innen, Lerngruppen, Aufgaben und Teilbereichen bleiben, wie sie sind
// — sie kämen im Betrieb so aus der Schnittstelle.

/** Ein sichtbarer Text in beiden Sprachen. */
const text = (de, en) => ({ de, en });

/** Ist `wert` ein Text in beiden Sprachen, und nicht etwa ein Datenobjekt? */
export const istText = (wert) =>
  wert !== null && typeof wert === 'object' && !Array.isArray(wert) &&
  Object.keys(wert).length === 2 && typeof wert.de === 'string' && typeof wert.en === 'string';

/** Alle Texte in `wert` in die Sprache `sprache` auflösen — tief, ohne das Original zu ändern. */
export function lokal(wert, sprache) {
  if (istText(wert)) return wert[sprache] ?? wert.de;
  if (Array.isArray(wert)) return wert.map((w) => lokal(w, sprache));
  if (wert && typeof wert === 'object') {
    return Object.fromEntries(Object.entries(wert).map(([k, w]) => [k, lokal(w, sprache)]));
  }
  return wert;
}

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
        { label: text('Schule', 'School'), total: 78, levels: stufen(10, 24, 33, 22, 11) },
        { label: text('Fairer Vergleich', 'Fair comparison'), total: 480, fair: true, levels: stufen(11, 23, 34, 22, 10) },
        { label: text('Bundesland', 'State'), total: 12400, levels: stufen(12, 25, 33, 20, 10) },
      ],
    },
    'aufgaben-tabelle': {
      title: text('Aufgaben der Lerngruppe', 'Items of the learning group'),
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
      title: text('Mittlere Lösungsquote im Vergleich', 'Mean solution rate compared'),
      domain: 'Leseverstehen',
      rows: [
        { label: '3a Deutsch', mean: 62, ciLow: 55, ciHigh: 69, n: 25 },
        { label: text('Schule', 'School'), mean: 60, ciLow: 56, ciHigh: 64, n: 78 },
        { label: text('Fairer Vergleich', 'Fair comparison'), mean: 58, ciLow: 56, ciHigh: 60, fair: true, n: 480 },
        { label: text('Bundesland', 'State'), mean: 57, n: 12400 },
      ],
    },
    'erwartet-tatsaechlich': {
      title: text('Erwartete und tatsächliche Lösungsquote', 'Expected and actual solution rate'),
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
      title: text('Teilbereiche der Lerngruppe', 'Domains of the learning group'),
      items: [
        { label: 'Lesen', bandLeft: 35, bandRight: 70, studentScore: 52 },
        { label: 'Zuhören', bandLeft: 40, bandRight: 75, studentScore: 61 },
        { label: 'Orthografie', bandLeft: 30, bandRight: 65, studentScore: null },
        { label: 'Sprachgebrauch', bandLeft: 38, bandRight: 72, studentScore: 44 },
      ],
    },
    'schueler-tabelle': {
      title: text('Lösungen je Schüler:in', 'Solutions per student'),
      domains: [
        { key: 'total', label: text('Insgesamt', 'Total') },
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
          absentMessage: text('Am Testtag entschuldigt gefehlt.', 'Excused absence on the test day.'), domains: {} },
      ],
    },
    uebersichtskarten: {
      title: text('Kompetenzübersicht 3a Deutsch', 'Competence overview 3a Deutsch'),
      karten: [
        { id: 'verteilung', label: text('Kompetenzstufen', 'Competence levels'), wert: 25, einheit: '',
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
            { label: text('I · Unter Mindeststandard', 'I · Below minimum standard'), wert: 2 },
            { label: text('II · Mindeststandard', 'II · Minimum standard'), wert: 5 },
            { label: text('III · Regelstandard', 'III · Regular standard'), wert: 9 },
            { label: text('IV · Regelstandard plus', 'IV · Regular standard plus'), wert: 6 },
            { label: text('V · Optimalstandard', 'V · Optimal standard'), wert: 3 },
          ] },
        // Zwei Aussagen, zwei Farben: die Vorgabe des Bausteins läuft von Grün
        // nach Rot durch die Kompetenzstufen und würde hier „nicht erreicht"
        // grün einfärben. Farben, die etwas behaupten, gehören zu den Daten.
        { id: 'ab-mindest', label: text('Mindeststandard und darüber', 'Minimum standard and above'), wert: 92, einheit: '%',
          anteile: [
            { label: text('erreicht', 'reached'), wert: 23, farbe: '#16a34a' },
            { label: text('nicht erreicht', 'not reached'), wert: 2, farbe: '#94a3b8' },
          ],
          details: [{ label: text('Schüler:innen', 'Students'), wert: 23 }] },
        { id: 'unter-mindest', label: text('Unter Mindeststandard', 'Below minimum standard'), wert: 8, einheit: '%',
          anteile: [
            { label: text('betroffen', 'affected'), wert: 2, farbe: '#dc2626' },
            { label: text('übrige', 'others'), wert: 23, farbe: '#94a3b8' },
          ],
          details: [{ label: text('Schüler:innen', 'Students'), wert: 2 }] },
      ],
    },
    streudiagramm: {
      title: text('Schüler:innen nach Stufe und Lösungsquote', 'Students by level and solution rate'),
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
      title: text('BISTA-Punkte der 3a Deutsch', 'BISTA points of 3a Deutsch'),
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
      title: text('Lernstand über drei Erhebungen', 'Attainment across three assessments'),
      punkte: [
        { label: text('Herbst', 'Autumn'), mean: 54, ciLow: 47, ciHigh: 61, n: 25 },
        { label: 'Winter', mean: 61, ciLow: 55, ciHigh: 67, n: 25 },
        { label: text('Frühjahr', 'Spring'), mean: 66, ciLow: 60, ciHigh: 72, n: 24 },
      ],
      vergleich: [{ mean: 52 }, { mean: 56 }, { mean: 59 }],
    },
    'aufgaben-heatmap': {
      title: text('Aufgaben über die Lerngruppen', 'Items across the learning groups'),
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
      label: text('Mittlere Lösungsquote', 'Mean solution rate'),
      wert: 62,
      einheit: '%',
      vergleich: 58,
      verlauf: [54, 57, 59, 62],
      hinweis: text('25 Schüler:innen · Leseverstehen', '25 students · Leseverstehen'),
    },
    'kontextmerkmal-ring': {
      label: text('Sprache zuhause', 'Language at home'),
      segmente: [
        { label: text('Deutsch', 'German'), wert: 17, farbe: '#2563eb' },
        { label: text('andere', 'other'), wert: 8, farbe: '#eab308' },
      ],
    },
    'standard-erreichung': {
      label: text('Mindeststandard erreicht', 'Minimum standard reached'),
      zeilen: [
        { label: 'Lesen', wert: 84, gesamt: 25 },
        { label: 'Zuhören', wert: 76, gesamt: 25 },
        { label: 'Orthografie', wert: 62, gesamt: 25 },
      ],
    },
    zeugnissaetze: {
      titel: text('Vorschläge für das Zeugnis', 'Suggestions for the report card'),
      werte: { name: 'Anna B.', stufe: 'IV', domaene: 'Leseverstehen', quote: '78' },
      saetze: [
        { id: 'stufe', stufe: 'IV', vorlage: text(
            '{name} erreicht im {domaene} die Kompetenzstufe {stufe} und liegt damit über dem Regelstandard.',
            '{name} reaches competence level {stufe} in {domaene} and is thus above the regular standard.',
          ),
          grundlage: text('Kompetenzstufe {stufe}, Lösungsquote {quote} %', 'Competence level {stufe}, solution rate {quote} %') },
        { id: 'arbeit', vorlage: text('{name} erschließt sich auch längere Texte selbstständig.', '{name} also works through longer texts independently.'),
          grundlage: text('Lösungsquote {quote} % im {domaene}', 'Solution rate {quote} % in {domaene}') },
      ],
    },
    'lernverlauf-figuren': {
      title: text('Lesegeschwindigkeit über drei Erhebungen', 'Reading speed across three assessments'),
      yTitel: text('Lesegeschwindigkeit', 'Reading speed'),
      zeitpunkte: [
        { id: 'm25', label: text('2025 März', 'March 2025') }, { id: 'h25', label: text('2025 Herbst', 'Autumn 2025') }, { id: 'm26', label: text('2026 März', 'March 2026') },
      ],
      // Benannte Zonen statt Zahlen — das ist der Kern der Vorlage: eine
      // Drittklässlerin liest „Fink", nicht „Kompetenzstufe III".
      zonen: [
        { label: text('Silbe', 'Syllable'), von: 0, bis: 35 },
        { label: text('Wort', 'Word'), von: 35, bis: 60 },
        { label: text('Fink', 'Finch'), von: 60, bis: 80 },
        { label: text('Adler', 'Eagle'), von: 80, bis: 100 },
      ],
      personen: [
        { id: 's1', name: 'Anna B.', werte: [{ zeitpunkt: 'm25', wert: 41 }, { zeitpunkt: 'h25', wert: 58 }, { zeitpunkt: 'm26', wert: 74 }] },
        { id: 's2', name: 'Ben C.', werte: [{ zeitpunkt: 'm25', wert: 66 }, { zeitpunkt: 'h25', wert: 71 }, { zeitpunkt: 'm26', wert: 84 }] },
        { id: 's3', name: 'Cem D.', werte: [{ zeitpunkt: 'm25', wert: 28 }, { zeitpunkt: 'h25', wert: 33 }, { zeitpunkt: 'm26', wert: 46 }] },
        { id: 's4', name: 'Dilara E.', werte: [{ zeitpunkt: 'm25', wert: 79 }, { zeitpunkt: 'h25', wert: 88 }, { zeitpunkt: 'm26', wert: 92 }] },
      ],
    },
    selbsteinschaetzung: {
      title: text('Selbsteinschätzung und Ergebnis', 'Self-assessment and result'),
      zeilen: [
        { label: 'Lesen', selbst: 82, gemessen: 61 },
        { label: 'Zuhören', selbst: 60, gemessen: 64 },
        { label: 'Orthografie', selbst: 45, gemessen: 72 },
        { label: 'Sprachgebrauch', selbst: 70, gemessen: 66 },
      ],
    },
    'merkmal-gradient': {
      titel: text('Lösungsquote nach Geschlecht', 'Solution rate by gender'),
      merkmal: text('Geschlecht', 'Gender'),
      auspraegungen: [{ id: 'f', label: text('weiblich', 'female') }, { id: 'm', label: text('männlich', 'male') }],
      reihen: [
        { id: 'klasse', label: '3a', werte: { f: 64, m: 57 }, n: { f: 13, m: 12 } },
        { id: 'schule', label: text('Schule', 'School'), werte: { f: 60, m: 56 } },
        { id: 'land', label: text('Land', 'State'), werte: { f: 58, m: 54 } },
      ],
    },
    'abweichung-je-gruppe': {
      titel: text('Anteil ab Regelstandard', 'Share at or above the regular standard'),
      bezug: { label: text('Schule', 'School'), wert: 58 },
      gruppen: [
        { id: '3a', label: '3a Deutsch', wert: 64, n: 25 },
        { id: '3b', label: '3b Deutsch', wert: 55, n: 24 },
        { id: '3c', label: '3c Deutsch', wert: 47, n: 26 },
      ],
    },
    'gruppen-pyramide': {
      titel: text('Kompetenzstufen im Vergleich', 'Competence levels compared'),
      links: { label: '3a Deutsch', stufen: [{ stufe: 'I', anteil: 8 }, { stufe: 'II', anteil: 22 }, { stufe: 'III', anteil: 34 }, { stufe: 'IV', anteil: 24 }, { stufe: 'V', anteil: 12 }] },
      rechts: { label: '3b Deutsch', stufen: [{ stufe: 'I', anteil: 16 }, { stufe: 'II', anteil: 28 }, { stufe: 'III', anteil: 30 }, { stufe: 'IV', anteil: 18 }, { stufe: 'V', anteil: 8 }] },
    },
    netzdiagramm: {
      titel: text('Profil über die Kompetenzbereiche', 'Profile across the competence areas'),
      achsen: [
        { id: 'sz', label: 'Sprechen, Zuhören' }, { id: 'sc', label: 'Schreiben' },
        { id: 'le', label: 'Lesen' }, { id: 'sp', label: 'Sprache untersuchen' },
      ],
      reihen: [
        { id: 'person', label: 'Anna', werte: { sz: 72, sc: 58, le: 81, sp: 49 } },
        { id: 'klasse', label: '3a', werte: { sz: 63, sc: 55, le: 66, sp: 52 } },
        { id: 'land', label: text('Land', 'State'), werte: { sz: 60, sc: 57, le: 62, sp: 55 } },
      ],
    },
    glossar: {
      title: text('Begriffe dieser Rückmeldung', 'Terms in this report'),
      eintraege: [
        { id: 'ks', begriff: text('Kompetenzstufe', 'Competence level'),
          erklaerung: text(
            'Fünf Stufen von I bis V. Stufe I liegt unter dem Mindeststandard, ab II gilt er als erreicht.',
            'Five levels from I to V. Level I is below the minimum standard; from II on, it counts as reached.',
          ) },
        { id: 'fv', begriff: text('Fairer Vergleich', 'Fair comparison'),
          erklaerung: text(
            'Der Vergleich mit Schulen ähnlicher sozialer Zusammensetzung statt mit allen.',
            'The comparison with schools of a similar social composition instead of with all schools.',
          ),
          auch: [text('Standorttyp', 'Location type'), 'STYPS'] },
        { id: 'lh', begriff: text('Lösungshäufigkeit', 'Solution frequency'),
          erklaerung: text('Der Anteil der Lernenden, die eine Aufgabe richtig gelöst haben.', 'The share of learners who solved an item correctly.') },
        { id: 'ms', begriff: text('Mindeststandard', 'Minimum standard'),
          erklaerung: text('Das Niveau, das am Ende der Jahrgangsstufe alle erreicht haben sollen.', 'The level everyone should have reached by the end of the school year.') },
        { id: 'do', begriff: text('Domäne', 'Domain'),
          erklaerung: text('Ein Teilbereich eines Faches, etwa Leseverstehen oder Hörverstehen.', 'A sub-area of a subject, such as reading or listening comprehension.'),
          auch: [text('Teilbereich', 'Sub-area')] },
      ],
    },
  },
  {
    'kompetenzstufen-leiste': {
      title: '8b Mathematik',
      domain: 'Leitidee Zahl',
      rows: [
        { label: '8b Mathematik', total: 22, levels: stufen(24, 31, 27, 13, 5) },
        { label: text('Schule', 'School'), total: 91, levels: stufen(18, 27, 31, 17, 7) },
        { label: text('Fairer Vergleich', 'Fair comparison'), total: 520, fair: true, levels: stufen(17, 26, 32, 18, 7) },
        { label: text('Bundesland', 'State'), total: 14800, levels: stufen(15, 25, 33, 19, 8) },
      ],
    },
    'aufgaben-tabelle': {
      title: text('Aufgaben der Lerngruppe', 'Items of the learning group'),
      items: [
        { label: 'MA-104', exercise: 'Bruchrechnung', level: 'I', actual: 22, expected: 41 },
        { label: 'MA-108', exercise: 'Prozentsätze', level: 'II', actual: 38, expected: 44 },
        { label: 'MA-112', exercise: 'Dreisatz', level: 'III', actual: 55, expected: 52 },
        { label: 'MA-115', exercise: 'Flächeninhalt', level: 'II', actual: 61, expected: 47 },
        { label: 'MA-119', exercise: 'Gleichungen', level: 'IV', actual: 29, expected: 58 },
      ],
    },
    'mittelwert-vergleich': {
      title: text('Mittlere Lösungsquote im Vergleich', 'Mean solution rate compared'),
      domain: 'Leitidee Zahl',
      rows: [
        { label: '8b Mathematik', mean: 41, ciLow: 33, ciHigh: 49, n: 22 },
        { label: text('Schule', 'School'), mean: 49, ciLow: 45, ciHigh: 53, n: 91 },
        { label: text('Fairer Vergleich', 'Fair comparison'), mean: 50, ciLow: 48, ciHigh: 52, fair: true, n: 520 },
        { label: text('Bundesland', 'State'), mean: 52, n: 14800 },
      ],
    },
    'erwartet-tatsaechlich': {
      title: text('Erwartete und tatsächliche Lösungsquote', 'Expected and actual solution rate'),
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
      title: text('Teilbereiche der Lerngruppe', 'Domains of the learning group'),
      items: [
        { label: 'Zahl', bandLeft: 28, bandRight: 58, studentScore: 33 },
        { label: 'Messen', bandLeft: 33, bandRight: 64, studentScore: 57 },
        { label: 'Raum und Form', bandLeft: 30, bandRight: 61, studentScore: null },
        { label: 'Funktionaler Zusammenhang', bandLeft: 25, bandRight: 55, studentScore: 21 },
        { label: 'Daten und Zufall', bandLeft: 35, bandRight: 66, studentScore: 48 },
      ],
    },
    'schueler-tabelle': {
      title: text('Lösungen je Schüler:in', 'Solutions per student'),
      sortierung: 'name',
      richtung: 'auf',
      auswaehlbar: false,
      domains: [
        { key: 'total', label: text('Insgesamt', 'Total') },
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
      title: text('Kompetenzübersicht 8b Mathematik', 'Competence overview 8b Mathematik'),
      spalten: 2,
      karten: [
        { id: 'verteilung', label: text('Kompetenzstufen', 'Competence levels'), wert: 22, einheit: '',
          anteile: [
            { label: 'I', wert: 5, farbe: STUFENFARBEN.I },
            { label: 'II', wert: 7, farbe: STUFENFARBEN.II },
            { label: 'III', wert: 6, farbe: STUFENFARBEN.III },
            { label: 'IV', wert: 3, farbe: STUFENFARBEN.IV },
            { label: 'V', wert: 1, farbe: STUFENFARBEN.V },
          ],
          details: [
            { label: text('I · Unter Mindeststandard', 'I · Below minimum standard'), wert: 5 },
            { label: text('II · Mindeststandard', 'II · Minimum standard'), wert: 7 },
            { label: text('III · Regelstandard', 'III · Regular standard'), wert: 6 },
            { label: text('IV · Regelstandard plus', 'IV · Regular standard plus'), wert: 3 },
            { label: text('V · Optimalstandard', 'V · Optimal standard'), wert: 1 },
          ] },
        { id: 'unter-mindest', label: text('Unter Mindeststandard', 'Below minimum standard'), wert: 23, einheit: '%',
          anteile: [
            { label: text('betroffen', 'affected'), wert: 5, farbe: '#dc2626' },
            { label: text('übrige', 'others'), wert: 17, farbe: '#94a3b8' },
          ],
          details: [{ label: text('Schüler:innen', 'Students'), wert: 5 }] },
      ],
    },
    streudiagramm: {
      title: text('Schüler:innen nach Stufe und Lösungsquote', 'Students by level and solution rate'),
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
      title: text('BISTA-Punkte der 8b Mathematik', 'BISTA points of 8b Mathematik'),
      mittelwert: 424,
      punkteMin: 280,
      zonen: [
        { id: 'ks1', label: text('KS I', 'CL I'), von: 280, bis: 415 },
        { id: 'ks2', label: text('KS II', 'CL II'), von: 415, bis: 495 },
        { id: 'ks3', label: text('KS III', 'CL III'), von: 495, bis: 565 },
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
      title: text('Lernstand über drei Erhebungen', 'Attainment across three assessments'),
      yTitel: text('Lösungsquote (%)', 'Solution rate (%)'),
      punkte: [
        { label: text('Herbst', 'Autumn'), mean: 47, ciLow: 39, ciHigh: 55, n: 22 },
        { label: 'Winter', mean: 44, ciLow: 37, ciHigh: 51, n: 22 },
        { label: text('Frühjahr', 'Spring'), mean: 41, ciLow: 34, ciHigh: 48, n: 22 },
      ],
      vergleich: [{ mean: 49 }, { mean: 51 }, { mean: 52 }],
    },
    'aufgaben-heatmap': {
      title: text('Aufgaben über die Lerngruppen', 'Items across the learning groups'),
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
      label: text('Mittlere Lösungsquote', 'Mean solution rate'),
      wert: 41,
      einheit: '%',
      vergleich: 50,
      verlauf: [47, 44, 41],
      hinweis: text('22 Schüler:innen · Leitidee Zahl', '22 students · Leitidee Zahl'),
    },
    'kontextmerkmal-ring': {
      label: text('Sozioökonomischer Status', 'Socio-economic status'),
      geordnet: true,
      mitteLabel: text('Schul-Median', 'School median'),
      segmente: [
        { label: text('A — sehr niedrig', 'A — very low'), wert: 6 },
        { label: text('B — niedrig', 'B — low'), wert: 9 },
        { label: text('C — mittel', 'C — medium'), wert: 5 },
        { label: text('D — hoch', 'D — high'), wert: 3 },
        { label: text('E — sehr hoch', 'E — very high'), wert: 1 },
      ],
    },
    'standard-erreichung': {
      label: text('Mindeststandard erreicht', 'Minimum standard reached'),
      zeilen: [
        { label: 'Lesen', wert: 58, gesamt: 24 },
        { label: 'Zuhören', wert: 46, gesamt: 24 },
        { label: 'Orthografie', wert: 39, gesamt: 24 },
      ],
      hinweis: text('Deutlich unter dem fairen Vergleich — die Aufschlüsselung zeigt, wo.', 'Clearly below the fair comparison — the breakdown shows where.'),
    },
    zeugnissaetze: {
      titel: text('Vorschläge für das Zeugnis', 'Suggestions for the report card'),
      werte: { name: 'Cem D.', stufe: 'II', domaene: 'Leseverstehen', quote: '44' },
      saetze: [
        { id: 'stufe', stufe: 'II', vorlage: text('{name} erreicht im {domaene} die Kompetenzstufe {stufe}.', '{name} reaches competence level {stufe} in {domaene}.'),
          grundlage: text('Kompetenzstufe {stufe}, Lösungsquote {quote} %', 'Competence level {stufe}, solution rate {quote} %') },
        { id: 'foerder', vorlage: text('{name} sollte das sinnentnehmende Lesen weiter üben.', '{name} should keep practising reading for meaning.'),
          grundlage: text('Lösungsquote {quote} % im {domaene}', 'Solution rate {quote} % in {domaene}') },
      ],
    },
    'lernverlauf-figuren': {
      title: text('Lesegeschwindigkeit über drei Erhebungen', 'Reading speed across three assessments'),
      yTitel: text('Lesegeschwindigkeit', 'Reading speed'),
      zeitpunkte: [
        { id: 'm25', label: text('2025 März', 'March 2025') }, { id: 'h25', label: text('2025 Herbst', 'Autumn 2025') }, { id: 'm26', label: text('2026 März', 'March 2026') },
      ],
      zonen: [
        { label: text('Silbe', 'Syllable'), von: 0, bis: 35 },
        { label: text('Wort', 'Word'), von: 35, bis: 60 },
        { label: text('Fink', 'Finch'), von: 60, bis: 80 },
        { label: text('Adler', 'Eagle'), von: 80, bis: 100 },
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
      title: text('Selbsteinschätzung und Ergebnis', 'Self-assessment and result'),
      zeilen: [
        { label: 'Lesen', selbst: 35, gemessen: 38 },
        { label: 'Zuhören', selbst: 40, gemessen: 42 },
        { label: 'Orthografie', selbst: 30, gemessen: 31 },
      ],
    },
    'merkmal-gradient': {
      titel: text('Lösungsquote nach Geschlecht', 'Solution rate by gender'),
      merkmal: text('Geschlecht', 'Gender'),
      auspraegungen: [{ id: 'f', label: text('weiblich', 'female') }, { id: 'm', label: text('männlich', 'male') }, { id: 'd', label: text('divers', 'diverse') }],
      reihen: [
        { id: 'klasse', label: '8b', werte: { f: 52, m: 58, d: 47 }, n: { f: 14, m: 12, d: 1 } },
        { id: 'schule', label: text('Schule', 'School'), werte: { f: 54, m: 57 } },
        { id: 'land', label: text('Land', 'State'), werte: { f: 51, m: 55, d: 50 } },
      ],
    },
    'abweichung-je-gruppe': {
      titel: text('Mittlere Lösungsquote', 'Mean solution rate'),
      bezug: { label: 'Gymnasium Beispielstadt', wert: 61 },
      gruppen: [
        { id: '8a', label: '8a Mathematik', wert: 66, n: 27 },
        { id: '8b', label: '8b Mathematik', wert: 59, n: 26 },
        { id: '8c', label: '8c Mathematik', wert: 63, n: 25 },
        { id: '8d', label: '8d Mathematik', wert: 52, n: 28 },
      ],
    },
    'gruppen-pyramide': {
      titel: text('Kompetenzstufen im Vergleich', 'Competence levels compared'),
      links: { label: '8a Mathematik', stufen: [{ stufe: 'I', anteil: 6 }, { stufe: 'II', anteil: 18 }, { stufe: 'III', anteil: 37 }, { stufe: 'IV', anteil: 26 }, { stufe: 'V', anteil: 13 }] },
      rechts: { label: '8d Mathematik', stufen: [{ stufe: 'I', anteil: 21 }, { stufe: 'II', anteil: 32 }, { stufe: 'III', anteil: 29 }, { stufe: 'IV', anteil: 14 }, { stufe: 'V', anteil: 4 }] },
    },
    netzdiagramm: {
      titel: text('Profil über die Leitideen', 'Profile across the key ideas'),
      achsen: [
        { id: 'zo', label: 'Zahl und Operation' }, { id: 'gm', label: 'Größen und Messen' },
        { id: 'rf', label: 'Raum und Form' }, { id: 'fz', label: 'Funktionaler Zusammenhang' },
        { id: 'dz', label: 'Daten und Zufall' },
      ],
      reihen: [
        { id: 'person', label: 'Ben', werte: { zo: 68, gm: 41, rf: 77, fz: 52, dz: 60 } },
        { id: 'klasse', label: '8b', werte: { zo: 59, gm: 50, rf: 62, fz: 48, dz: 56 } },
        { id: 'land', label: text('Land', 'State'), werte: { zo: 57, gm: 53, rf: 58, fz: 51, dz: 55 } },
      ],
    },
    glossar: {
      title: text('Begriffe dieser Rückmeldung', 'Terms in this report'),
      eintraege: [
        { id: 'ks', begriff: text('Kompetenzstufe', 'Competence level'), erklaerung: text('Fünf Stufen von I bis V.', 'Five levels from I to V.') },
        { id: 'ms', begriff: text('Mindeststandard', 'Minimum standard'), erklaerung: text('Das Niveau, das alle erreicht haben sollen.', 'The level everyone should have reached.') },
      ],
    },
  },
];

export default DEMODATEN;
