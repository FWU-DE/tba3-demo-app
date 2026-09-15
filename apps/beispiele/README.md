# Rückmeldungen des Konsortiums

Übersicht der 10 Rückmeldungen, die im Projekt TBA III entstanden sind,
ausgeliefert unter `/beispiele`.

Jede Rückmeldung liegt bei ihrer Einrichtung — in einem eigenen Repositorium,
mit eigener Demo, teils mit eigener Dokumentation. Hier steht nur der Verweis
darauf. Dieser Bereich ist statisches HTML ohne Build; `tools/build-site.mjs`
kopiert ihn unverändert nach `dist/beispiele/` (ohne `README.md` und
Testdateien).

## Wo die Daten stehen

**Nicht hier**, sondern in [`apps/shared/konsortium.js`](../shared/konsortium.js),
ausgeliefert als `/gemeinsam/konsortium.js`. Der Grund: dieselben Daten tragen
drei Stellen — diese Übersicht, den Reiter „Rückmeldeelemente" der
Demoanwendung und das erzeugte Dokument
[`/dokumentation/bausteine-der-rueckmeldungen`](../portal/dokumentation/bausteine-der-rueckmeldungen.md).
Eine zweite Liste wäre eine Liste, die veraltet.

Quelle der Angaben ist der Sachbericht der Abschlusssitzung der Steuergruppe vom
15.09.2026. Was dort nicht steht, steht hier nicht: fehlt einer Rückmeldung die
Dokumentationsadresse, bleibt das Feld leer, statt eine zu raten.

## Eine Rückmeldung eintragen oder ändern

```js
{
  id: 'indibit-klassenrueckmeldung',
  einrichtung: 'indibit',          // EINRICHTUNGEN
  titel: { de: '…', en: '…' },
  beschreibung: { de: '…', en: '…' },
  faecher: ['DE'],                 // leer = fachunabhängig
  stufen: ['V8'],                  // leer = alle Jahrgänge
  zielgruppen: ['lehrkraft'],      // ZIELGRUPPEN
  demo: 'https://…',               // null, wenn es keine gibt
  code: 'https://…',
  doku: 'https://…',
  hinweis: { de: '…', en: '…' },   // was an den Verweisen vorläufig ist
  technik: { de: '…', en: '…' },
  bausteine: ['profil-heatmap'],   // Kennungen aus BAUSTEINE
}
```

Eine fehlende Adresse erscheint als „Demo folgt" und ist nicht klickbar.

Nach einer Änderung an den Daten: **`npm run konsortium:doc`** — sonst sagt das
Dokument unter `/dokumentation` etwas anderes als diese Seite, und
`tools/konsortium-dokument.test.mjs` schlägt fehl.

## Filter

Gefiltert wird nach Einrichtung, Fach, Klassenstufe und Zielgruppe. Ein weiterer
Filter kostet einen Eintrag in `FILTER` plus das Feld an den Rückmeldungen —
Seite und Adresszeile (`?einrichtung=zepf&fach=DE`) ziehen automatisch mit.
Angeboten werden nur Werte, die zu mindestens einer Rückmeldung führen.

Fach und Klassenstufe sind **offene** Felder: eine leere Liste heißt „gilt für
alles", nicht „gilt für nichts". Die Schulrückmeldung von indibit ist
fachunabhängig — „das Fach ist Filter, keine inhaltliche Festlegung" — und darf
nicht verschwinden, sobald jemand nach Deutsch filtert.

Die Logik (`filtern`, `optionen`) ist von der Seite getrennt und wird in
[`apps/shared/konsortium.test.mjs`](../shared/konsortium.test.mjs) geprüft;
`seite.test.mjs` daneben führt das Seitenskript wirklich aus und schaut nach,
was im DOM ankommt.
