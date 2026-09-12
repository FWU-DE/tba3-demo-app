// Die 16 prototypischen Rückmeldungen.
//
// Jede Rückmeldung lebt in einem eigenen Repository und wird über GitHub Pages
// ausgeliefert — hier steht nur der Verweis darauf. Diese Datei ist deshalb die
// einzige Stelle, die angefasst werden muss, wenn eine Rückmeldung dazukommt,
// umzieht oder fertig wird: `url` eintragen, und der Eintrag wird verlinkt.
// Ohne `url` erscheint er als „in Vorbereitung“.
//
// ► Die Einträge sind ausformulierte Beispiele: So könnten die Rückmeldungen
//   heißen und zugeschnitten sein. Verbindlich ist daran nichts — Titel und
//   Beschreibungen werden ersetzt, sobald die echten Rückmeldungen vorliegen.
//
// Die Zuschnitte folgen VERA: in Klasse 3 werden Deutsch und Mathematik
// erhoben, in Klasse 8 zusätzlich Englisch und Französisch.
//
// Alle sichtbaren Texte stehen als `{ de, en }` — die Seite löst sie über
// `text()` aus /gemeinsam/sprache.js auf. Bewusst ohne Import davon: so bleibt
// diese Datei reine Daten und Logik und läuft unverändert im Test unter Node.
//
// Das Vokabular für Fach und Klassenstufe entspricht dem der Demoanwendung
// (`apps/demo/src/utils/constants.js`). Bewusst doppelt geführt: dieser Bereich
// ist statisches HTML ohne Build und soll nichts aus einem Workspace ziehen.

export const FAECHER = {
  DE: { de: 'Deutsch', en: 'German' },
  MA: { de: 'Mathematik', en: 'Mathematics' },
  EN: { de: 'Englisch', en: 'English' },
  FR: { de: 'Französisch', en: 'French' },
};

export const STUFEN = {
  V3: { de: 'Klasse 3', en: 'Grade 3' },
  V8: { de: 'Klasse 8', en: 'Grade 8' },
};

export const ZIELGRUPPEN = {
  lehrkraft: { de: 'Lehrkraft', en: 'Teacher' },
  schulleitung: { de: 'Schulleitung', en: 'School leadership' },
  lernende: { de: 'Schüler:in', en: 'Student' },
  eltern: { de: 'Eltern', en: 'Parents' },
};

// Reihenfolge der Filter auf der Seite — Beschriftung und zugehöriges Feld.
export const FILTER = [
  { feld: 'fach', text: { de: 'Fach', en: 'Subject' }, werte: FAECHER },
  { feld: 'stufe', text: { de: 'Klassenstufe', en: 'Grade' }, werte: STUFEN },
  { feld: 'zielgruppe', text: { de: 'Zielgruppe', en: 'Audience' }, werte: ZIELGRUPPEN },
];

export const RUECKMELDUNGEN = [
  // ── Klasse 3, Deutsch ────────────────────────────────────────────────────
  {
    id: 'de-v3-klassenbericht',
    titel: {
      de: 'Klassenbericht Deutsch',
      en: 'Class report, German',
    },
    beschreibung: {
      de: 'Kompetenzstufen für Lesen, Zuhören und Orthografie nebeneinander, dazu die Lösungshäufigkeit je Aufgabe und der Vergleich mit Schule und Land.',
      en: 'Competence levels for reading, listening and spelling side by side, plus the solution frequency per exercise and the comparison with school and state.',
    },
    fach: 'DE',
    stufe: 'V3',
    zielgruppe: 'lehrkraft',
    url: null,
  },
  {
    id: 'de-v3-foerderblick',
    titel: {
      de: 'Förderblick Lesen',
      en: 'Support focus: reading',
    },
    beschreibung: {
      de: 'Für die Unterrichtsplanung: Welche Kinder stehen unter dem Mindeststandard, an welchen Aufgabenformaten scheitert die Klasse — mit Vorschlägen für passende Materialien.',
      en: 'For lesson planning: which children are below the minimum standard, which exercise formats the class stumbles over — with suggestions for matching materials.',
    },
    fach: 'DE',
    stufe: 'V3',
    zielgruppe: 'lehrkraft',
    url: null,
  },
  {
    id: 'de-v3-elternbrief',
    titel: {
      de: 'Elternbrief Deutsch',
      en: 'Letter to parents, German',
    },
    beschreibung: {
      de: 'Eine Seite ohne Fachjargon: Was wurde getestet, wo steht mein Kind, was heißt eine Kompetenzstufe — und was daraus folgt (und was nicht).',
      en: 'One page without jargon: what was tested, where my child stands, what a competence level means — and what follows from it (and what does not).',
    },
    fach: 'DE',
    stufe: 'V3',
    zielgruppe: 'eltern',
    url: null,
  },

  // ── Klasse 3, Mathematik ─────────────────────────────────────────────────
  {
    id: 'ma-v3-klassenbericht',
    titel: {
      de: 'Klassenbericht Mathematik',
      en: 'Class report, mathematics',
    },
    beschreibung: {
      de: 'Ergebnisse nach Leitideen — Zahlen und Operationen, Raum und Form, Größen und Messen — mit Kompetenzstufenverteilung und Aufgabenstatistik.',
      en: 'Results by domain — numbers and operations, space and shape, quantities and measurement — with the competence level distribution and item statistics.',
    },
    fach: 'MA',
    stufe: 'V3',
    zielgruppe: 'lehrkraft',
    url: null,
  },
  {
    id: 'ma-v3-aufgabenblick',
    titel: {
      de: 'Aufgaben unter Erwartung',
      en: 'Exercises below expectation',
    },
    beschreibung: {
      de: 'Stellt die tatsächliche der erwarteten Lösungsquote gegenüber und hebt die Aufgaben hervor, bei denen die Klasse deutlich abweicht — nach oben wie nach unten.',
      en: 'Puts the actual solution rate next to the expected one and highlights the exercises where the class clearly deviates — in either direction.',
    },
    fach: 'MA',
    stufe: 'V3',
    zielgruppe: 'lehrkraft',
    url: null,
  },
  {
    id: 'ma-v3-schulbericht',
    titel: {
      de: 'Schulbericht Mathematik, Jahrgang 3',
      en: 'School report, mathematics, grade 3',
    },
    beschreibung: {
      de: 'Alle dritten Klassen der Schule nebeneinander, mit fairem Vergleich zu Schulen ähnlicher Zusammensetzung und dem Landesmittelwert als Bezugslinie.',
      en: 'All the school’s grade 3 classes side by side, with a fair comparison to schools of a similar composition and the state average as a reference line.',
    },
    fach: 'MA',
    stufe: 'V3',
    zielgruppe: 'schulleitung',
    url: null,
  },

  // ── Klasse 8, Deutsch ────────────────────────────────────────────────────
  {
    id: 'de-v8-klassenbericht',
    titel: {
      de: 'Klassenbericht Deutsch',
      en: 'Class report, German',
    },
    beschreibung: {
      de: 'Lesen, Zuhören und Sprachgebrauch im Profil, mit Streuungsband der Schule und der Möglichkeit, einzelne Aufgaben aufzuklappen.',
      en: 'Reading, listening and language use as a profile, with the school’s spread band and the option to open up individual exercises.',
    },
    fach: 'DE',
    stufe: 'V8',
    zielgruppe: 'lehrkraft',
    url: null,
  },
  {
    id: 'de-v8-schulbericht',
    titel: {
      de: 'Schulbericht Deutsch, Jahrgang 8',
      en: 'School report, German, grade 8',
    },
    beschreibung: {
      de: 'Für die Steuerung: alle achten Klassen im Vergleich, Entwicklung über drei Durchgänge und die Frage, wo die Streuung innerhalb der Schule größer ist als zwischen den Schulen.',
      en: 'For steering: all grade 8 classes compared, the trend across three assessments, and the question of where the spread within the school exceeds the spread between schools.',
    },
    fach: 'DE',
    stufe: 'V8',
    zielgruppe: 'schulleitung',
    url: null,
  },
  {
    id: 'de-v8-meine-ergebnisse',
    titel: {
      de: 'Meine Ergebnisse Deutsch',
      en: 'My results, German',
    },
    beschreibung: {
      de: 'Die eigene Rückmeldung für Jugendliche: Was habe ich schon gut gekonnt, wo liegt der nächste Schritt — ohne Ranglisten und ohne Note.',
      en: 'The student’s own report: what I already did well, where the next step lies — no rankings, no marks.',
    },
    fach: 'DE',
    stufe: 'V8',
    zielgruppe: 'lernende',
    url: null,
  },

  // ── Klasse 8, Mathematik ─────────────────────────────────────────────────
  {
    id: 'ma-v8-klassenbericht',
    titel: {
      de: 'Klassenbericht Mathematik',
      en: 'Class report, mathematics',
    },
    beschreibung: {
      de: 'Ergebnisse entlang der Leitideen mit Kompetenzstufenverteilung, Aufgabenprofil und der mittleren Lösungsquote im Vergleich zu Schule und Land.',
      en: 'Results along the domains, with the competence level distribution, the exercise profile, and the mean solution rate compared with school and state.',
    },
    fach: 'MA',
    stufe: 'V8',
    zielgruppe: 'lehrkraft',
    url: null,
  },
  {
    id: 'ma-v8-fachschaft',
    titel: {
      de: 'Fachschaftsbericht Mathematik',
      en: 'Department report, mathematics',
    },
    beschreibung: {
      de: 'Grundlage für die Fachkonferenz: Welche Leitideen sitzen jahrgangsweit, welche nicht — und welche Aufgabenformate über alle Klassen hinweg auffallen.',
      en: 'A basis for the department meeting: which domains are secure across the year group and which are not — and which exercise formats stand out across all classes.',
    },
    fach: 'MA',
    stufe: 'V8',
    zielgruppe: 'schulleitung',
    url: null,
  },
  {
    id: 'ma-v8-meine-ergebnisse',
    titel: {
      de: 'Meine Ergebnisse Mathematik',
      en: 'My results, mathematics',
    },
    beschreibung: {
      de: 'Das eigene Kompetenzprofil als Spinnennetz, dazu drei konkrete Übungsvorschläge zu dem Bereich, in dem der nächste Schritt am nächsten liegt.',
      en: 'The student’s own competence profile as a radar chart, plus three concrete practice suggestions for the area where the next step is closest.',
    },
    fach: 'MA',
    stufe: 'V8',
    zielgruppe: 'lernende',
    url: null,
  },

  // ── Klasse 8, Englisch ───────────────────────────────────────────────────
  {
    id: 'en-v8-klassenbericht',
    titel: {
      de: 'Klassenbericht Englisch',
      en: 'Class report, English',
    },
    beschreibung: {
      de: 'Hör- und Leseverstehen getrennt ausgewiesen, mit Bezug zu den Niveaustufen des Gemeinsamen europäischen Referenzrahmens.',
      en: 'Listening and reading comprehension reported separately, related to the levels of the Common European Framework of Reference.',
    },
    fach: 'EN',
    stufe: 'V8',
    zielgruppe: 'lehrkraft',
    url: null,
  },
  {
    id: 'en-v8-elterninformation',
    titel: {
      de: 'Elterninformation Englisch',
      en: 'Information for parents, English',
    },
    beschreibung: {
      de: 'Erklärt, was in Hör- und Leseverstehen geprüft wurde, wie die Stufen zu lesen sind und warum eine Vergleichsarbeit keine Klassenarbeit ist.',
      en: 'Explains what was tested in listening and reading, how to read the levels, and why a comparative assessment is not a class test.',
    },
    fach: 'EN',
    stufe: 'V8',
    zielgruppe: 'eltern',
    url: null,
  },

  // ── Klasse 8, Französisch ────────────────────────────────────────────────
  {
    id: 'fr-v8-klassenbericht',
    titel: {
      de: 'Klassenbericht Französisch',
      en: 'Class report, French',
    },
    beschreibung: {
      de: 'Leseverstehen und Hörverstehen im Profil, mit Aufgabenstatistik und dem Vergleich zu Lerngruppen desselben Jahrgangs an der Schule.',
      en: 'Reading and listening comprehension as a profile, with item statistics and a comparison to learning groups of the same year at the school.',
    },
    fach: 'FR',
    stufe: 'V8',
    zielgruppe: 'lehrkraft',
    url: null,
  },
  {
    id: 'fr-v8-schulbericht',
    titel: {
      de: 'Schulbericht Französisch',
      en: 'School report, French',
    },
    beschreibung: {
      de: 'Kleine Kohorten sauber dargestellt: Verteilung mit Unsicherheitsbereich, damit aus wenigen Lernenden keine überdeutlichen Aussagen werden.',
      en: 'Small cohorts shown honestly: the distribution with its uncertainty range, so that a handful of learners does not turn into an overconfident statement.',
    },
    fach: 'FR',
    stufe: 'V8',
    zielgruppe: 'schulleitung',
    url: null,
  },
];

/**
 * Filtert die Rückmeldungen. Felder ohne Wert („Alle“) schränken nicht ein,
 * unbekannte Felder werden ignoriert — so kostet ein neuer Filter nur einen
 * Eintrag in FILTER. Gefiltert wird über Kürzel (DE, V3, lehrkraft), nicht über
 * Beschriftungen: die Auswahl übersteht damit einen Sprachwechsel.
 */
export function filtern(liste, auswahl = {}) {
  const aktiv = FILTER.map((f) => f.feld).filter((feld) => auswahl[feld]);
  return liste.filter((r) => aktiv.every((feld) => r[feld] === auswahl[feld]));
}

/**
 * Die auswählbaren Werte eines Feldes — nur die, die auch vorkommen, in der
 * Reihenfolge des Vokabulars. Ein Filter zeigt damit nie eine leere Auswahl.
 * `text` bleibt das `{ de, en }`-Paar; die Sprache wählt die Seite.
 */
export function optionen(liste, feld) {
  const { werte } = FILTER.find((f) => f.feld === feld) ?? {};
  if (!werte) return [];
  const vorhanden = new Set(liste.map((r) => r[feld]));
  return Object.entries(werte)
    .filter(([wert]) => vorhanden.has(wert))
    .map(([wert, text]) => ({ wert, text }));
}
