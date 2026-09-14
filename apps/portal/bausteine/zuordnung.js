// Wie Katalog und Bausteine zusammenhängen.
//
// Zwei Bereiche zeigen Visualisierungen, und das verwirrt zu Recht:
//
//   /katalog    — die Schau: jede Visualisierung mit echten Daten aus der
//                 Schnittstelle, mit Einsatzzweck, Endpunkt und Quelltext.
//                 Zum Anschauen und Verstehen.
//   /bausteine  — die Bibliothek: dieselben Visualisierungen als Paket zum
//                 Mitnehmen, in drei Fassungen und themebar. Zum Einbauen.
//
// Der Katalog ist älter. Seine Ansichten wandern nach und nach auf die
// Bausteine um — eine umgezogene Ansicht zeigt dann denselben Quelltext, den
// auch ein fremdes Projekt bekommt. Diese Datei hält fest, wo das schon so ist.
//
// `apps/portal/bausteine/zuordnung.test.mjs` prüft die Tabelle gegen die
// Wirklichkeit: importiert eine Ansicht aus `@tba3/bausteine/vue`, muss sie
// hier als umgezogen stehen — und umgekehrt. Sonst veraltet die Übersicht
// still, und das ist schlimmer als keine.

/**
 * @typedef {Object} Zuordnung
 * @property {string} katalog    Name der Ansicht in apps/katalog/src/views (ohne "View")
 * @property {string} anzeige    Klartext für die Tabelle
 * @property {string|null} baustein  Elementname ohne Präfix, oder null
 * @property {'umgezogen'|'offen'} stand
 * @property {string} [hinweis]
 */

/** @type {Zuordnung[]} */
export const ZUORDNUNG = [
  {
    katalog: 'CompetenceLevels',
    anzeige: 'Kompetenzstufen-Leiste',
    baustein: 'kompetenzstufen-leiste',
    stand: 'umgezogen',
  },
  {
    katalog: 'MeanComparison',
    anzeige: 'Mittelwert-Vergleich',
    baustein: 'mittelwert-vergleich',
    stand: 'umgezogen',
  },
  {
    katalog: 'ItemExpectedActual',
    anzeige: 'Erwartete und tatsächliche Lösungsquote',
    baustein: 'erwartet-tatsaechlich',
    stand: 'umgezogen',
  },
  {
    katalog: 'PercentileBand',
    anzeige: 'Perzentilbänder',
    baustein: 'perzentilbaender',
    stand: 'umgezogen',
  },
  {
    katalog: 'ItemSolutionTable',
    anzeige: 'Lösungshäufigkeiten je Aufgabe',
    baustein: 'aufgaben-tabelle',
    stand: 'umgezogen',
    hinweis:
      'Eine Tabelle je Domäne; welche Ebene die Erwartung stellt — Schule oder Bundesland —, wählt die Ansicht.',
  },
  {
    katalog: 'StudentSolutionTable',
    anzeige: 'Lösungen je Schüler:in',
    baustein: 'schueler-tabelle',
    stand: 'umgezogen',
    hinweis: 'Die Auswahl hält die Ansicht, der Baustein meldet sie nur.',
  },
  {
    katalog: 'CompetencyOverview',
    anzeige: 'Übersichtskarten',
    baustein: 'uebersichtskarten',
    stand: 'umgezogen',
    hinweis: 'Aus zwei Karten wurden drei: die Verteilung und die beiden Aussagen dazu.',
  },
  {
    katalog: 'StudentScatter',
    anzeige: 'Streudiagramm der Schüler:innen',
    baustein: 'streudiagramm',
    stand: 'umgezogen',
    hinweis:
      'Ohne das K-Means-Clustering der alten Ansicht — Gruppen zu bilden ist Auswertung und gehört nicht in den Baustein.',
  },
  {
    katalog: 'BistaDistribution',
    anzeige: 'BISTA-Verteilung',
    baustein: 'bista-verteilung',
    stand: 'umgezogen',
    hinweis:
      'Gleiche Werte stapeln sich, statt zufällig zu streuen; die Schwellen der Kompetenzstufen kommen aus der Ansicht.',
  },
];

/** Bausteine ohne Katalog-Ansicht — die Bibliothek ist nicht nur eine Teilmenge. */
export const NUR_BAUSTEIN = [
  {
    baustein: 'lernstands-verlauf',
    anzeige: 'Lernstands-Verlauf',
    grund:
      'Mehrere Erhebungen nebeneinander — der Katalog zeigt immer eine. Wer den Baustein einbaut, hat die Zeitreihe meist schon.',
  },
  {
    baustein: 'aufgaben-heatmap',
    anzeige: 'Aufgaben-Heatmap',
    grund:
      'Aufgaben gegen Lerngruppen: die Sicht der Schulleitung, nicht die der Lehrkraft — und deshalb keine Ansicht der Schau.',
  },
  {
    baustein: 'kennzahl-kachel',
    anzeige: 'Kennzahl-Kachel',
    grund:
      'Eine einzelne Zahl mit Vergleich und kleinem Verlauf. Zu klein für eine eigene Ansicht, zu oft gebraucht, um sie wegzulassen.',
  },
];

export const ZAHLEN = {
  get umgezogen() {
    return ZUORDNUNG.filter((z) => z.stand === 'umgezogen').length;
  },
  get gesamt() {
    return ZUORDNUNG.length;
  },
};

export default ZUORDNUNG;
