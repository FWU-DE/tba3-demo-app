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

export { THEMA, themaCss, v } from './thema.js';

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
