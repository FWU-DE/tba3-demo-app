# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
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
