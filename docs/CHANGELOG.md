# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- **Rezepte der Demoanwendung** unter `/dokumentation/demo-rezepte`. Zweiter
  Eintrag: **der PDF-Export** — die beiden Ausgaben (individuelle Rückmeldung und
  Materialzuordnung) und was an ihnen entschieden ist. Dass alles im Browser
  entsteht und kein Byte an einen Dienst geht, ist bei Individualdaten kein
  Nebeneffekt, sondern der Grund für die Bauweise; dass jsPDF erst beim Klick
  geladen wird, spart dem ersten Seitenaufruf gut die Hälfte (870 KB Hauptbündel
  gegen 410 KB nachgeladen); dass jede Zeichenkette durch `safe()` geht, liegt an
  Helvetica, das Emoji nicht darstellen kann — und daran, dass Wegwerfen aufhört
  zu taugen, sobald Namen betroffen sind, die nicht in WinAnsi passen. Dazu
  Seitenumbruch von Hand, QR-Codes vor der Zeichenschleife und die Platzhalter-URL,
  die die Fußzeile als solche ausweist. Neuer E2E-Test: das Datenblatt liefert eine
  PDF-Datei mit dem Namen im Dateinamen.
- Erster Eintrag der Rezepte: **der Observer-Modus** — der Schalter im Kopf der
  Demoanwendung, der die Namen weichzeichnet und die Ergebnisse stehen lässt, damit
  Individualergebnisse auf dem Beamer oder in einer Bildschirmfreigabe besprochen
  werden können. Der Text beschreibt auch, was der Modus *nicht* leistet — der
  Name steht weiter im DOM, das PDF trägt ihn unverändert, und der Schalter
  überlebt kein Neuladen —, und wo die Grenze wirklich liegt: beim liefernden
  System, denn `name` an der Wertegruppe heißt in der Spezifikation
  „Bezeichnung“ und hat als Beispiel schon `Schüler 1`. Dazu zwei E2E-Tests, die
  beides prüfen: dass der Name verdeckt ist und dass das Ergebnis daneben noch
  dasteht.
- **Eigene Dokumente in `/dokumentation`.** Ein Eintrag in `DOKUMENTE` mit
  `eigen: true` wird hier geschrieben statt aus `indibit-eu/tba3` geholt:
  `docs:update` fasst ihn nicht an, der Herkunftsverweis zeigt auf dieses
  Repository, und Seite wie Übersichtskarte sagen das, statt einen „Stand“ zu
  behaupten, den es nicht gibt. Ohne diese Unterscheidung wäre das Rezept zum
  Observer-Modus beim nächsten Nachziehen verschwunden — es beschreibt die
  Oberfläche, nicht die Schnittstelle.
- **Sieben weitere Bausteine, und alle neun Katalog-Ansichten laufen jetzt über
  das Paket.** Aus dem Katalog umgezogen sind Schüler-Tabelle (mit Auswahl),
  Übersichtskarten, Streudiagramm und BISTA-Verteilung; dazu drei, die es nur in
  der Bibliothek gibt, weil die Schau die Frage gar nicht stellt:
  Lernstands-Verlauf (mehrere Erhebungen), Aufgaben-Heatmap (Aufgaben gegen
  Lerngruppen) und Kennzahl-Kachel. Damit zeigt jede Katalog-Ansicht denselben
  Quelltext, den auch ein fremdes Projekt bekommt — der Quelltext-Link führt
  entsprechend nach `packages/bausteine/` statt auf eine Kopie im Katalog.
  `NUR_BAUSTEIN` in `zuordnung.js` hält mit Grund fest, was ohne Ansicht
  bleibt, und drei Tests halten Zuordnung, Beispieldaten und die drei Fassungen
  beieinander.
- **Jede Kompetenzstufe trägt ihre Beschriftungsfarbe selbst**
  (`--tba3-stufe-1-text` … `--tba3-stufe-5-text`). Eine einzige Inversfarbe
  reichte nicht: Weiß auf dem Gelb der Stufe 3 hat ein Kontrastverhältnis von
  2,0, lesbar ist ab 4,5. Wer die Stufenfarben überschreibt, überschreibt die
  Beschriftung mit — kommt die Farbe als Daten herein, rechnet der Baustein
  selbst. Neu im Paket: `pruefeThema()` geht jedes Paar durch, an dem ein
  Baustein Text auf Fläche legt, und sagt, was unter 4,5 bleibt. Zwei Tests
  lassen sie über die Vorgaben der Bibliothek und über die vier
  Beispiel-Themen des Demonstrators laufen.
- **Vorschauen in der Zuordnung auf `/bausteine`**: jede Zeile der Tabelle und
  jeder Eintrag der Liste darunter zeigt den Baustein in klein — dieselben
  Daten wie unten, nicht bedienbar und für Vorlesesoftware ausgeblendet. Ein
  Elementname allein sagt niemandem, was der Baustein zeigt.
- **E2E-Tests für die Demoanwendung** (Playwright, `npm run e2e`): 47 Tests
  über Reiter und Deeplinks, Filter — jeweils gegen die Abfrage, die dabei
  herauskommt —, Schülerliste mit Datenblatt und eigenen Gruppen, Materialien
  samt Export nach `.imscc` und `.pdf`, Vergleichsauswertung, Sprachwahl,
  Fehlerfälle und den schmalen Schirm. Gelaufen wird gegen `npm run preview`,
  also gegen den ausgelieferten Stand, nicht gegen den Dev-Server. Eigener
  Job in der CI.
- **`@tba3/bausteine`** — die Visualisierungen als **native Web Component,
  Vue- und React-Komponente**. Die Web Component ist die eine echte
  Implementierung (echtes DOM, echte Ereignis-Empfänger, Shadow DOM), Vue und
  React sind Hüllen darum; der Kern liefert reine Berechnung. Fünf Bausteine:
  Kompetenzstufen-Leiste, Aufgaben-Tabelle, Mittelwert-Vergleich, erwartete
  gegen tatsächliche Lösungsquote, Perzentilbänder. Ausgeliefert als reines ESM
  unter `/bausteine/`, ohne Build einbindbar.
- Die Bausteine sind **themebar und bringen kein Design mit**: Farben, Schrift
  und Maße kommen über `--tba3-*`-Variablen mit neutralen Vorgaben. Ein Test
  verhindert, dass eine Markenfarbe ins Paket rutscht.
- **Dark Mode in jedem Baustein.** Jede Variable hat eine helle und eine dunkle
  Vorgabe; ohne Zutun folgt ein Baustein `prefers-color-scheme`, erzwingen
  lässt sich der Modus über `data-thema`. Die Kompetenzstufen bekommen im
  Dunklen angehobene Töne, damit sie auf dunklem Grund nicht absaufen.
- Demonstrator unter `/bausteine`: alle Bausteine in allen drei Fassungen
  nebeneinander, mit Theme-Umschalter (FWU, neutral, hoher Kontrast, dunkel),
  Datensatzwechsel und Ereignis-Protokoll.
- Übersicht **Katalog ↔ Bausteine** auf `/bausteine` — welche Katalog-Ansicht
  schon über einen Baustein läuft und was den übrigen fehlt. Gegen die
  Wirklichkeit geprüft von `zuordnung.test.mjs`.
- Design-Tokens aus dem VIDIS Design System (Figma `HsHyINjx5Ll6uJfzwlBNUn`) als
  `/gemeinsam/tokens.css`: Farben, Abstandsraster, Typo-Skala, Radien, Schatten
  und ein einheitlicher Fokusring. Dieselbe Quelle, aus der sich anbieterportal
  und vidis-portal-new bedienen.
- Illustration im Aufmacher des Portals: ein Endpunkt der Schnittstelle geht
  rein, eine Kompetenzstufenverteilung kommt raus. Reines SVG mit
  CSS-Animation, kein Skript und kein Bild.
- Impressum und Datenschutz im Fuß von Portal und Rückmeldungen, verlinkt auf
  softwarehub.schule.

### Changed
- Die Legende der Kompetenzstufen bricht auf schmalen Schirmen um (zwei, drei
  und ab 1024 px fünf Spalten). Vorher standen fünf Spalten fest: auf dem
  Telefon blieben je 52 px, in denen „Unter Mindeststandard" nicht umbrechen
  kann — der Text lief rechts aus der Seite und zog die ganze Demoanwendung
  26 px in die Breite.
- Portal, Rückmeldungen, Dokumentation und die gemeinsame Navigationsleiste
  nutzen die Design-Tokens statt eigener Paletten. Sichtbarster Unterschied: die
  Markenfarbe ist jetzt das VIDIS-Blau `#0000c4` statt Tailwind-Standard
  `#2563eb`.
- Vier Katalog-Ansichten beziehen ihre Visualisierung aus `@tba3/bausteine/vue`
  statt aus eigenen `.vue`-Dateien.
- Zwei Beschriftungen, die im Original am rechten SVG-Rand abgeschnitten wurden
  (`n=` in der Kompetenzstufen-Leiste, der letzte Legendeneintrag der
  Perzentilbänder), haben jetzt Platz.

### Fixed
- **Heller Text auf heller Seite bei dunkel gestelltem System.** Die Bausteine
  folgen `prefers-color-scheme`; Katalog und Demonstrator haben aber keinen
  eigenen Dunkelmodus. Beide setzen jetzt `data-thema` an den Elementen — der
  einzige Weg, den Modus festzunageln, denn `:host([data-thema])` prüft nur das
  Element selbst und nicht den Baum darüber. Der Kommentar im Paket behauptete
  das Gegenteil.
- **Die Perzentilbänder waren schwarz.** `var(--tba3-_band))` — eine
  schließende Klammer zu viel in vier Konstanten und zwei Aufrufen. Ein
  ungültiger Farbwert ist in SVG nicht leer, sondern schwarz; derselbe
  Tippfehler hatte in der Aufgaben-Tabelle still das Zeilen-Hover
  ausgeschaltet. Ein Test zählt jetzt die Klammern in jedem Wert, der `var(`
  enthält.
- **`/katalog#/percentile-band` war eine weiße Seite.** Ein Endpunkt-Eintrag
  trug `description` statt `pfad`; `t(undefined)` warf, und Vue riss das Setup
  der Ansicht ab. `t()` gibt bei fehlendem Pfad jetzt einen leeren Text zurück,
  statt eine ganze Ansicht mitzunehmen.
- **`/bausteine` ohne abschließenden Schrägstrich lud nichts.** Die Seite
  importierte `./demodaten.js` und `./zuordnung.js` relativ; unter `/bausteine`
  löst der Browser das gegen `/` auf, beide Module kamen als 404 zurück — die
  Zuordnungstabelle blieb leer und kein einziger Baustein wurde registriert,
  ohne sichtbare Fehlermeldung. Die Navigationsleiste verweist genau auf diese
  Form. Jetzt absolut wie der Import daneben, und `e2e/bausteine.spec.js` prüft
  beide Formen der Adresse.
- Die Sprachwahl überlebt das erste Rendern der Demoanwendung: `FilterContext`
  schrieb die Adresszeile aus einem frischen `URLSearchParams` und warf dabei
  `?lang=` weg. Die nachgeladene Navigationsleiste fiel dadurch auf die
  Browsersprache zurück und stand in der anderen Sprache da als der Inhalt
  daneben.

## [0.1.0] — 2026-05-05

### Added
- React 19 + Vite SPA for TBA3 VERA test data visualization
- Competence level distribution charts (Recharts)
- Item statistics charts
- Multi-level navigation (Group / School / State)
- Filters: subject, grade level, gender, language
- PDF, ZIP, QR code export
- LTI OAuth callback (`api/lti-callback.js`)
- MCP server integration (SSE via nginx proxy at `/mcp`)
- Docker deployment (main app + MCP server in single image via supervisord)
- GHCR CI/CD for both Docker images
- MUNDO educational materials search integration
