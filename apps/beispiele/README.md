# Rückmeldungsbeispiele

Übersicht der 16 prototypischen Rückmeldungen, ausgeliefert unter `/beispiele`.

Jede Rückmeldung liegt in einem **eigenen Repository** und wird über GitHub Pages
veröffentlicht — hier steht nur der Verweis darauf. Dieser Bereich ist statisches
HTML ohne Build; `tools/build-site.mjs` kopiert ihn unverändert nach
`dist/beispiele/` (ohne `README.md` und Testdateien).

## Eine Rückmeldung eintragen oder freischalten

Alles steht in [`rueckmeldungen.js`](./rueckmeldungen.js) — eine Datei, sonst nichts:

```js
{
  id: 'de-v3-lehrkraft',
  titel: 'Klassenrückmeldung Deutsch, Klasse 3',
  beschreibung: '…',
  fach: 'DE',            // FAECHER
  stufe: 'V3',           // STUFEN
  zielgruppe: 'lehrkraft', // ZIELGRUPPEN
  url: 'https://fwu-de.github.io/tba3-rueckmeldung-…/',
}
```

Ohne `url` erscheint der Eintrag als „in Vorbereitung“ und ist nicht klickbar;
sobald die Seite steht, wird er verlinkt. Titel, Beschreibungen und die Zuordnung
zu Fach, Klassenstufe und Zielgruppe sind derzeit **Platzhalter** (4 Fächer ×
2 Klassenstufen × 2 Zielgruppen), damit die Filter sichtbar arbeiten.

## Filter

Gefiltert wird nach Fach, Klassenstufe und Zielgruppe. Ein weiterer Filter kostet
einen Eintrag in `FILTER` plus das Feld an den Rückmeldungen — Seite und Adresszeile
(`?fach=DE&stufe=V3`) ziehen automatisch mit. Angeboten werden nur Werte, die
mindestens einmal vorkommen; `ZIELGRUPPEN` kennt deshalb schon „Schüler:in“ und
„Eltern“, ohne dass sie in der Auswahl auftauchen.

Die Logik (`filtern`, `optionen`) ist von der Seite getrennt und wird in
`rueckmeldungen.test.mjs` geprüft (`npm test`).
