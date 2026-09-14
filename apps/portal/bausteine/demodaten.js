// Beispieldaten für den Demonstrator.
//
// Zwei Lerngruppen mit unterschiedlichem Profil — die zweite hat einen
// deutlichen Schwerpunkt im unteren Bereich, damit sich sehen lässt, wie die
// Bausteine auf andere Daten reagieren und nicht nur ein Bild zeigen.
//
// Die Zahlen sind erfunden und folgen dem Zuschnitt der TBA3-Beispieldaten;
// echte Auswertungen kommen im Betrieb aus der Schnittstelle.

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
  },
];

export default DEMODATEN;
