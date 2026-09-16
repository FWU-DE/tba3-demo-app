// Der Kern: Berechnung, kein Markup.
//
// Jeder Baustein hat hier eine reine Funktion, die aus Daten Geometrie bzw.
// aufbereitete Zeilen macht — Zahlen und Objekte, keine Zeichenketten. Aus
// denen baut jede Fassung ihr eigenes DOM.
//
// Der erste Entwurf gab fertiges SVG aus. Das ließ sich in drei Frameworks
// einsetzen, aber nicht bedienen: an eine Zeichenkette lassen sich keine
// Ereignisse hängen, und Tabellen und Karten sind damit gar nicht zu bauen.
// Der Kern ist jetzt der Teil, der nicht driften darf; das Zeichnen liegt bei
// den Elementen.

export {
  THEMA,
  themaCss,
  v,
  stufenFlaeche,
  stufenNummer,
  stufenSchrift,
} from './thema.js';

// Ob ein Thema lesbar ist, lässt sich ausrechnen — auch von außen, für ein
// eigenes Thema. `pruefeThema()` gibt zurück, welches Paar durchfällt.
export {
  PAARE as KONTRAST_PAARE,
  SCHWELLE as KONTRAST_SCHWELLE,
  farbe,
  kontrast,
  leuchtkraft,
  lesbareSchrift,
  pruefeThema,
} from './kontrast.js';

export {
  NAME as LEISTE_NAME,
  STANDARD as LEISTE_STANDARD,
  MASSE as LEISTE_MASSE,
  geometrie as leisteGeometrie,
  stufenFarbe,
} from './kompetenzstufen-leiste.js';

export {
  NAME as TABELLE_NAME,
  STANDARD as TABELLE_STANDARD,
  SPALTEN as TABELLE_SPALTEN,
  SCHWELLE,
  bewertung,
  zeilen as tabellenZeilen,
  naechsteSortierung,
} from './aufgaben-tabelle.js';

export {
  NAME as VERGLEICH_NAME,
  STANDARD as VERGLEICH_STANDARD,
  geometrie as vergleichGeometrie,
} from './mittelwert-vergleich.js';

export {
  NAME as ERWARTUNG_NAME,
  STANDARD as ERWARTUNG_STANDARD,
  geometrie as erwartungGeometrie,
  legende as erwartungLegende,
} from './erwartet-tatsaechlich.js';

export {
  NAME as BAENDER_NAME,
  STANDARD as BAENDER_STANDARD,
  geometrie as baenderGeometrie,
  raute,
} from './perzentilbaender.js';

// Aus dem Katalog umgezogen: die vier Ansichten, die es bisher nur dort gab.

export {
  NAME as SCHUELER_NAME,
  STANDARD as SCHUELER_STANDARD,
  ANTEILE,
  BALKEN,
  zeilen as schuelerZeilen,
  spalten as schuelerSpalten,
  segmente as schuelerSegmente,
  auswahlUmschalten,
  naechsteSortierung as schuelerNaechsteSortierung,
} from './schueler-tabelle.js';

export {
  NAME as KARTEN_NAME,
  STANDARD as KARTEN_STANDARD,
  RING,
  REIHENFOLGE as KARTEN_REIHENFOLGE,
  karten,
  ringSegment,
  umschalten as karteUmschalten,
} from './uebersichtskarten.js';

export {
  NAME as STREU_NAME,
  STANDARD as STREU_STANDARD,
  MASSE as STREU_MASSE,
  TEILSTRICHE,
  geometrie as streuGeometrie,
} from './streudiagramm.js';

export {
  NAME as BISTA_NAME,
  STANDARD as BISTA_STANDARD,
  MASSE as BISTA_MASSE,
  geometrie as bistaGeometrie,
} from './bista-verteilung.js';

// Nur in der Bibliothek: drei Bausteine, für die es keine Katalog-Ansicht
// gibt. Die Zuordnung ist keine Teilmenge — was ein einbauendes Projekt
// braucht, ist nicht dasselbe wie das, was die Schau zeigt.

export {
  NAME as VERLAUF_NAME,
  STANDARD as VERLAUF_STANDARD,
  MASSE as VERLAUF_MASSE,
  geometrie as verlaufGeometrie,
} from './lernstands-verlauf.js';

export {
  NAME as HEATMAP_NAME,
  STANDARD as HEATMAP_STANDARD,
  MASSE as HEATMAP_MASSE,
  ausschlag,
  farbe as heatmapFarbe,
  raster as heatmapRaster,
} from './aufgaben-heatmap.js';

export {
  NAME as KACHEL_NAME,
  STANDARD as KACHEL_STANDARD,
  MASSE as KACHEL_MASSE,
  bewertung as kachelBewertung,
  kachel,
} from './kennzahl-kachel.js';

// ── Aus den Rückmeldungen des Konsortiums herausgezogen ────────────────────
export {
  NAME as KONTEXTMERKMAL_RING, STANDARD as kontextmerkmalRingStandard,
  MASSE as kontextmerkmalRingMasse, ringPfad, ring,
} from './kontextmerkmal-ring.js';
export {
  NAME as STANDARD_ERREICHUNG, STANDARD as standardErreichungStandard, erreichung,
} from './standard-erreichung.js';
export {
  NAME as ZEUGNISSAETZE, STANDARD as zeugnissaetzeStandard, fuellen, trifftZu, saetze,
} from './zeugnissaetze.js';

export {
  NAME as LERNVERLAUF_FIGUREN, STANDARD as lernverlaufFigurenStandard,
  MASSE as lernverlaufFigurenMasse, zeichenVon, verlauf,
} from './lernverlauf-figuren.js';
export {
  NAME as SELBSTEINSCHAETZUNG, STANDARD as selbsteinschaetzungStandard, lage, einschaetzung,
} from './selbsteinschaetzung.js';
export {
  NAME as GLOSSAR, STANDARD as glossarStandard, normal, glossar,
} from './glossar.js';
