// Die 16 prototypischen Rückmeldungen.
//
// Jede Rückmeldung lebt in einem eigenen Repository und wird über GitHub Pages
// ausgeliefert — hier steht nur der Verweis darauf. Diese Datei ist deshalb die
// einzige Stelle, die angefasst werden muss, wenn eine Rückmeldung dazukommt,
// umzieht oder fertig wird: `url` eintragen, und der Eintrag wird verlinkt.
// Ohne `url` erscheint er als „in Vorbereitung“.
//
// ► Titel und Beschreibungen sind noch Platzhalter. Fach, Klassenstufe und
//   Zielgruppe sind angenommen, damit die Filter sichtbar arbeiten; beides wird
//   ersetzt, sobald die Rückmeldungen vorliegen.
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

const klassenrueckmeldung = (fach, stufe) => ({
  id: `${fach.toLowerCase()}-${stufe.toLowerCase()}-lehrkraft`,
  titel: {
    de: `Klassenrückmeldung ${FAECHER[fach].de}, ${STUFEN[stufe].de}`,
    en: `Class report ${FAECHER[fach].en}, ${STUFEN[stufe].en}`,
  },
  beschreibung: {
    de:
      `Wie die Lerngruppe in ${FAECHER[fach].de} abgeschnitten hat: Kompetenzstufen, ` +
      'Aufgabenstatistiken und der Vergleich mit Schule und Land.',
    en:
      `How the learning group did in ${FAECHER[fach].en}: competence levels, item ` +
      'statistics and the comparison with school and state.',
  },
  fach,
  stufe,
  zielgruppe: 'lehrkraft',
  url: null,
});

const schulrueckmeldung = (fach, stufe) => ({
  id: `${fach.toLowerCase()}-${stufe.toLowerCase()}-schulleitung`,
  titel: {
    de: `Schulrückmeldung ${FAECHER[fach].de}, ${STUFEN[stufe].de}`,
    en: `School report ${FAECHER[fach].en}, ${STUFEN[stufe].en}`,
  },
  beschreibung: {
    de:
      `Alle Lerngruppen der Schule in ${FAECHER[fach].de} nebeneinander, mit ` +
      'Landesvergleich und Entwicklung über die Erhebungen.',
    en:
      `All the school's learning groups in ${FAECHER[fach].en} side by side, with the ` +
      'state comparison and the trend across assessments.',
  },
  fach,
  stufe,
  zielgruppe: 'schulleitung',
  url: null,
});

// 4 Fächer × 2 Klassenstufen × 2 Zielgruppen = 16 Rückmeldungen.
export const RUECKMELDUNGEN = ['V3', 'V8'].flatMap((stufe) =>
  ['DE', 'MA', 'EN', 'FR'].flatMap((fach) => [
    klassenrueckmeldung(fach, stufe),
    schulrueckmeldung(fach, stufe),
  ]),
);

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
