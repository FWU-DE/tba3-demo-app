// Die eingebauten Texte der Bausteine, Deutsch und Englisch.
//
// Ein Baustein zeigt Text, den niemand von außen setzt: Spaltenköpfe,
// Legenden, Leerhinweise, Beschriftungen für Vorleseprogramme. Die stehen
// hier, an einer Stelle, und nicht verstreut über die Elemente — sonst fällt
// eine fehlende Übersetzung erst im Browser auf.
//
// Welche Sprache gilt, entscheidet das Dokument, nicht die Bibliothek: `lang`
// des nächsten Vorfahren, sonst `<html lang>`. 'en', 'en-GB' … ergeben
// Englisch, alles andere Deutsch (siehe `spracheVon` in
// webcomponents/baustein-element.js).
//
// Platzhalter stehen in geschweiften Klammern (`{n}`) und werden von `text()`
// gefüllt — dieselbe Schreibweise wie in den Wörterbüchern der Apps.
//
// Der Kern bleibt rein: keine Abhängigkeit, kein DOM.

export const SPRACHEN = ['de', 'en'];

/** Aus einem lang-Wert die Sprache der Bibliothek machen: 'en*' → en, sonst de. */
export function spracheAus(lang) {
  return /^en(?:-|_|$)/i.test(String(lang ?? '').trim()) ? 'en' : 'de';
}

/** Alle Texte, die ein Baustein selbst mitbringt. */
export const TEXTE = {
  // ── Gemeinsam ───────────────────────────────────────────────────────────
  stufe: { de: 'Stufe {stufe}', en: 'Level {stufe}' },
  prozent: { de: '{wert} Prozent', en: '{wert} percent' },
  'leer.daten': { de: 'Keine Daten', en: 'No data' },
  'leer.aufgaben': { de: 'Keine Aufgaben', en: 'No items' },
  'leer.schueler': { de: 'Keine Schüler:innen', en: 'No students' },
  'leer.teilbereiche': { de: 'Keine Teilbereiche', en: 'No domains' },

  // ── Kompetenzstufen-Leiste ──────────────────────────────────────────────
  'leiste.aria': { de: 'Kompetenzstufenverteilung', en: 'Competence level distribution' },
  'leiste.segment': { de: '{zeile}, Stufe {stufe}: {pct} Prozent', en: '{zeile}, level {stufe}: {pct} percent' },
  'leiste.hinweis': { de: 'Stufe {stufe}: {pct} %', en: 'Level {stufe}: {pct} %' },

  // ── Aufgaben-Tabelle ────────────────────────────────────────────────────
  'tabelle.position': { de: 'Aufgabe', en: 'Item' },
  'tabelle.exercise': { de: 'Aufgabenname', en: 'Exercise' },
  'tabelle.level': { de: 'Stufe', en: 'Level' },
  'tabelle.actual': { de: 'Lösungsquote', en: 'Solution rate' },
  'tabelle.expected': { de: 'Erwartet', en: 'Expected' },
  'tabelle.delta': { de: 'Abweichung', en: 'Deviation' },

  // ── Mittelwert-Vergleich ────────────────────────────────────────────────
  'vergleich.aria': { de: 'Mittelwert-Vergleich', en: 'Mean comparison' },
  'vergleich.zone-unten': { de: 'KS I–II', en: 'CL I–II' },
  'vergleich.zone-mitte': { de: 'KS III', en: 'CL III' },
  'vergleich.zone-oben': { de: 'KS IV–V', en: 'CL IV–V' },

  // ── Erwartete und tatsächliche Lösungsquote ─────────────────────────────
  'erwartung.aria': { de: 'Erwartete und tatsächliche Lösungsquote', en: 'Expected and actual solution rate' },
  'erwartung.ueber': { de: 'mehr als {n} Punkte über Erwartung', en: 'more than {n} points above expectation' },
  'erwartung.im-rahmen': { de: 'im erwarteten Bereich', en: 'within the expected range' },
  'erwartung.unter': { de: 'mehr als {n} Punkte unter Erwartung', en: 'more than {n} points below expectation' },
  'erwartung.linie': { de: 'Erwartungswert', en: 'Expected value' },
  'erwartung.zeile': {
    de: '{label}: {ist} Prozent, erwartet {soll} Prozent',
    en: '{label}: {ist} percent, expected {soll} percent',
  },
  'erwartung.kurz': { de: 'erw. {soll}%', en: 'exp. {soll}%' },
  'erwartung.hinweis': { de: '{label}: {ist} % (erwartet {soll} %)', en: '{label}: {ist} % (expected {soll} %)' },
  'erwartung.achse': { de: 'Lösungsquote (%)', en: 'Solution rate (%)' },

  // ── Perzentilbänder ─────────────────────────────────────────────────────
  'baender.aria': { de: 'Perzentilbänder', en: 'Percentile bands' },
  'baender.unten': { de: 'unterdurchschnittlich', en: 'below average' },
  'baender.oben': { de: 'überdurchschnittlich', en: 'above average' },

  // ── Schüler-Tabelle ─────────────────────────────────────────────────────
  'schueler.name': { de: 'Schüler:in', en: 'Student' },
  'schueler.richtig': { de: 'richtig', en: 'correct' },
  'schueler.ausgelassen': { de: 'ausgelassen', en: 'omitted' },
  'schueler.falsch': { de: 'falsch', en: 'incorrect' },
  'schueler.auswahl': { de: 'Auswahl', en: 'Selection' },
  'schueler.waehlen': { de: '{name} auswählen', en: 'Select {name}' },
  'schueler.abwesend': { de: 'nicht teilgenommen', en: 'did not take part' },

  // ── Übersichtskarten ────────────────────────────────────────────────────
  'karten.mehr': { de: '▸ mehr', en: '▸ more' },
  'karten.weniger': { de: '▾ weniger', en: '▾ less' },

  // ── Streudiagramm ───────────────────────────────────────────────────────
  'streu.aria': { de: 'Streudiagramm', en: 'Scatter plot' },
  'streu.quote': { de: 'Lösungsquote', en: 'Solution rate' },
  'streu.stufe': { de: 'Stufe', en: 'Level' },
  'streu.punkt': { de: '{name}, {wert} Prozent', en: '{name}, {wert} percent' },

  // ── BISTA-Verteilung ────────────────────────────────────────────────────
  'bista.aria': { de: 'Verteilung auf der Punkteskala', en: 'Distribution on the point scale' },
  'bista.zone': { de: 'Zone {label}', en: 'Zone {label}' },
  'bista.mittelwert': { de: 'Mittelwert {wert}', en: 'Mean {wert}' },
  'bista.kopf': { de: '{name}, {punkte} Punkte', en: '{name}, {punkte} points' },
  'bista.punkte': { de: ' · {punkte} Punkte', en: ' · {punkte} points' },

  // ── Lernstands-Verlauf ──────────────────────────────────────────────────
  'verlauf.leer': { de: 'Keine Erhebungen', en: 'No assessments' },
  'verlauf.aria': { de: 'Verlauf über mehrere Erhebungen', en: 'Trend across several assessments' },
  'verlauf.gruppe': { de: 'Gruppe', en: 'Group' },
  'verlauf.band': { de: 'Band: Konfidenzintervall', en: 'Band: confidence interval' },
  'verlauf.belegt': { de: '· belegt', en: '· significant' },
  'verlauf.nicht-belegt': { de: '· nicht belegt', en: '· not significant' },

  // ── Aufgaben-Heatmap ────────────────────────────────────────────────────
  'heatmap.leer': { de: 'Keine Werte', en: 'No values' },
  'heatmap.aufgabe': { de: 'Aufgabe', en: 'Item' },
  'heatmap.ohne-wert': { de: '{zeile} · {spalte}: kein Wert', en: '{zeile} · {spalte}: no value' },
  'heatmap.erwartet': { de: ' (erwartet {soll} %)', en: ' (expected {soll} %)' },
  'heatmap.niedrig': { de: 'niedrig', en: 'low' },
  'heatmap.hoch': { de: 'hoch', en: 'high' },
  'heatmap.unter': { de: 'unter Erwartung', en: 'below expectation' },
  'heatmap.ueber': { de: 'über Erwartung', en: 'above expectation' },

  // ── Kennzahl-Kachel ─────────────────────────────────────────────────────
  'kachel.ohne-wert': { de: 'kein Wert', en: 'no value' },
  'kachel.delta': { de: '{delta} ggü. {vergleich}', en: '{delta} vs. {vergleich}' },
  'kachel.verlauf': { de: 'Verlauf', en: 'Trend' },
  'kachel.verlauf-aria': { de: 'Verlauf der letzten Erhebungen', en: 'Trend of the last assessments' },

  // ── Kontextmerkmal als Ring ─────────────────────────────────────────────
  'ring.leer': { de: 'Keine Angaben', en: 'No data' },
  'ring.median': { de: 'Median', en: 'Median' },
  'ring.median-fuss': { de: 'Median: {label}', en: 'Median: {label}' },

  // ── Standard-Erreichung ─────────────────────────────────────────────────
  'erreichung.leer': { de: 'Keine Aufschlüsselung vorhanden', en: 'No breakdown available' },

  // ── Zeugnissätze ────────────────────────────────────────────────────────
  'saetze.kopieren': { de: 'kopieren', en: 'copy' },
  'saetze.kopieren-aria': { de: 'Satz kopieren: {text}', en: 'Copy sentence: {text}' },

  // ── Lernverlauf als Figuren ─────────────────────────────────────────────
  'figuren.leer': { de: 'Keine Messwerte', en: 'No measurements' },
  'figuren.aria': {
    de: 'Lernverlauf über mehrere Messzeitpunkte',
    en: 'Learning progress across several measurement points',
  },

  // ── Selbsteinschätzung ──────────────────────────────────────────────────
  'selbst.leer': { de: 'Keine Selbsteinschätzung erhoben', en: 'No self-assessment collected' },
  'selbst.aria': { de: 'Selbsteinschätzung gegen Ergebnis', en: 'Self-assessment versus result' },
  'selbst.zeile': {
    de: '{label}: Selbsteinschätzung {selbst}, gemessen {gemessen}',
    en: '{label}: self-assessment {selbst}, measured {gemessen}',
  },
  'selbst.stimmig': {
    de: 'Selbsteinschätzung und Messung liegen überall nah beieinander.',
    en: 'Self-assessment and measurement are close together everywhere.',
  },
  'selbst.auffaellig': {
    de: '{n} von {gesamt} Merkmalen liegen weit auseinander.',
    en: '{n} of {gesamt} characteristics are far apart.',
  },

  // ── Glossar ─────────────────────────────────────────────────────────────
  'glossar.gefiltert': { de: '{n} von {gesamt} Begriffen', en: '{n} of {gesamt} terms' },
  'glossar.alle': { de: '{gesamt} Begriffe', en: '{gesamt} terms' },
  'glossar.auch': { de: 'auch: {liste}', en: 'also: {liste}' },

  // ── Lösungsquote nach Merkmal ───────────────────────────────────────────
  'gradient.aria': { de: 'Lösungsquote nach Merkmal', en: 'Solution rate by characteristic' },

  // ── Abweichung je Lerngruppe ────────────────────────────────────────────
  'abweichung.aria': { de: 'Abweichung je Lerngruppe', en: 'Deviation per learning group' },
  'abweichung.bezug': { de: ' gegenüber {label} ({wert})', en: ' compared with {label} ({wert})' },
  'abweichung.zeile': {
    de: '{label}: {wert}, {delta} Prozentpunkte',
    en: '{label}: {wert}, {delta} percentage points',
  },

  // ── Zwei Gruppen gespiegelt ─────────────────────────────────────────────
  'pyramide.aria': { de: '{titel}: {links} gegen {rechts}', en: '{titel}: {links} versus {rechts}' },
  'pyramide.titel': { de: 'Zwei Gruppen gespiegelt', en: 'Two groups mirrored' },
  'pyramide.zeile': {
    de: 'Stufe {stufe}: {links} {linksWert}, {rechts} {rechtsWert}',
    en: 'Level {stufe}: {links} {linksWert}, {rechts} {rechtsWert}',
  },

  // ── Netzdiagramm ────────────────────────────────────────────────────────
  'netz.zu-wenig': {
    de: 'Ein Netz braucht mindestens drei Teilkompetenzen.',
    en: 'A radar chart needs at least three sub-competences.',
  },
  'netz.aria': { de: 'Netzdiagramm', en: 'Radar chart' },
};

/**
 * Vorgaben von Eigenschaften, die als sichtbarer Text enden — je Baustein.
 *
 * `de` ist genau der Wert aus `STANDARD` des Kerns (der Test hält beides
 * gegeneinander). Setzt ein Aufrufer die Eigenschaft auf einen anderen Wert,
 * gewinnt er; gleicht der Wert einer dieser Fassungen, gilt er als Vorgabe und
 * folgt der Sprache des Dokuments.
 */
export const VORGABEN = {
  'mittelwert-vergleich': {
    xLabel: { de: 'Mittlere Lösungsquote', en: 'Mean solution rate' },
  },
  perzentilbaender: {
    markerLabel: { de: 'einzelne Schüler:in', en: 'individual student' },
    bandLabel: { de: 'mittlerer Bereich', en: 'middle range' },
    xAxisLabel: { de: 'Lösungsquote (%)', en: 'Solution rate (%)' },
  },
  'schueler-tabelle': {
    domains: {
      de: [
        { key: 'total', label: 'Insgesamt' },
        { key: 'reading', label: 'Lesen' },
        { key: 'listening', label: 'Zuhören' },
      ],
      en: [
        { key: 'total', label: 'Total' },
        { key: 'reading', label: 'Reading' },
        { key: 'listening', label: 'Listening' },
      ],
    },
  },
  streudiagramm: {
    xTitel: { de: 'Kompetenzstufe', en: 'Competence level' },
    yTitel: { de: 'Lösungsquote (%)', en: 'Solution rate (%)' },
  },
  'bista-verteilung': {
    zonen: {
      de: [
        { id: 'ks1', label: 'KS I', von: 0, bis: 430 },
        { id: 'ks2', label: 'KS II', von: 430, bis: 500 },
        { id: 'ks3', label: 'KS III', von: 500, bis: 565 },
      ],
      en: [
        { id: 'ks1', label: 'CL I', von: 0, bis: 430 },
        { id: 'ks2', label: 'CL II', von: 430, bis: 500 },
        { id: 'ks3', label: 'CL III', von: 500, bis: 565 },
      ],
    },
  },
  'lernstands-verlauf': {
    vergleichLabel: { de: 'fairer Vergleich', en: 'fair comparison' },
    yTitel: { de: 'Lösungsquote (%)', en: 'Solution rate (%)' },
  },
  'kennzahl-kachel': {
    vergleichLabel: { de: 'fairer Vergleich', en: 'fair comparison' },
  },
  'standard-erreichung': {
    label: { de: 'Mindeststandard erreicht', en: 'Minimum standard reached' },
  },
  zeugnissaetze: {
    leerHinweis: { de: 'Zu dieser Auswahl gibt es keinen Satz.', en: 'There is no sentence for this selection.' },
  },
  selbsteinschaetzung: {
    selbstLabel: { de: 'Selbsteinschätzung', en: 'Self-assessment' },
    gemessenLabel: { de: 'Gemessen', en: 'Measured' },
    xTitel: { de: 'Anteil (%)', en: 'Share (%)' },
  },
  glossar: {
    platzhalter: { de: 'Begriff suchen …', en: 'Search for a term …' },
    leerHinweis: { de: 'Kein Eintrag passt zu dieser Suche.', en: 'No entry matches this search.' },
  },
  'abweichung-je-gruppe': {
    bezug: { de: { label: 'Schule', wert: null }, en: { label: 'School', wert: null } },
  },
};

/**
 * Name und Endpunkt jedes Bausteins auf Englisch — für Seiten, die die
 * Bibliothek vorstellen. `BAUPLAN.titel` bleibt die deutsche Zeichenkette,
 * damit nichts bricht, was sie schon liest; `BAUPLAN.titelEn` kommt dazu.
 */
export const TITEL_EN = {
  'kompetenzstufen-leiste': 'Competence level bar',
  'aufgaben-tabelle': 'Item table',
  'mittelwert-vergleich': 'Mean comparison',
  'erwartet-tatsaechlich': 'Expected and actual solution rate',
  perzentilbaender: 'Percentile bands',
  'schueler-tabelle': 'Student table',
  uebersichtskarten: 'Overview cards',
  streudiagramm: 'Scatter plot of students',
  'bista-verteilung': 'BISTA distribution',
  'lernstands-verlauf': 'Attainment trend',
  'aufgaben-heatmap': 'Item heatmap',
  'kennzahl-kachel': 'Key figure tile',
  'kontextmerkmal-ring': 'Context characteristic as a ring',
  'standard-erreichung': 'Standard attainment',
  zeugnissaetze: 'Report card sentences',
  'lernverlauf-figuren': 'Learning progress as figures',
  selbsteinschaetzung: 'Self-assessment versus result',
  glossar: 'Glossary with search',
  'merkmal-gradient': 'Solution rate by characteristic',
  'abweichung-je-gruppe': 'Deviation per learning group',
  'gruppen-pyramide': 'Two groups mirrored',
  netzdiagramm: 'Radar chart of sub-competences',
};

/** Endpunkte, die kein Pfad sind, sondern ein Satz — nur die brauchen eine Übersetzung. */
export const ENDPUNKT_EN = {
  'lernverlauf-figuren': 'several assessments per student',
  selbsteinschaetzung: 'collected self-assessment, not part of the API',
  glossar: 'none — kept independent of data',
};

/** Platzhalter füllen: `{n}` → werte.n. Ein unbekannter bleibt sichtbar stehen. */
function fuellen(vorlage, werte) {
  return vorlage.replace(/\{(\w+)\}/g, (treffer, name) =>
    (werte && werte[name] !== undefined && werte[name] !== null ? String(werte[name]) : treffer));
}

/**
 * Ein Text in der gewünschten Sprache, mit gefüllten Platzhaltern.
 * Ein unbekannter Schlüssel kommt zurück, wie er ist — sichtbar falsch statt leer.
 */
export function text(schluessel, sprache = 'de', werte = {}) {
  const eintrag = TEXTE[schluessel];
  if (!eintrag) return schluessel;
  return fuellen(eintrag[sprache] ?? eintrag.de, werte);
}

/** Ein Werkzeug `t(schluessel, werte)` für eine feste Sprache. */
export function uebersetzer(sprache = 'de') {
  return (schluessel, werte) => text(schluessel, sprache, werte);
}

export default TEXTE;
