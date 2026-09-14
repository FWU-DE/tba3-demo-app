# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- `@tba3/bausteine`: die Visualisierungen als **Web Component, Vue- und
  React-Komponente**. Ein framework-freier Kern je Baustein, darüber drei dünne
  Adapter — dieselbe Implementierung, drei Fassungen. Vier Bausteine portiert
  (Kompetenzstufen-Leiste, Mittelwert-Vergleich, erwartete gegen tatsächliche
  Lösungsquote, Perzentilbänder). Wird als reines ESM unter `/bausteine/`
  ausgeliefert und lässt sich ohne Build einbinden.

### Changed
- Der Katalog bezieht diese vier Visualisierungen aus `@tba3/bausteine/vue`
  statt aus eigenen `.vue`-Dateien.
- Zwei Beschriftungen, die im Original am rechten SVG-Rand abgeschnitten wurden
  (`n=` in der Kompetenzstufen-Leiste, der letzte Legendeneintrag der
  Perzentilbänder), haben jetzt Platz.

### Added
- Illustration im Aufmacher des Portals: ein Endpunkt der Schnittstelle geht
  rein, eine Kompetenzstufenverteilung kommt raus. Reines SVG mit
  CSS-Animation, kein Skript und kein Bild; die Balken stehen auch ohne
  laufende Animation vollständig da.
- Impressum und Datenschutz im Fuß von Portal und Rückmeldungen, verlinkt auf
  softwarehub.schule.

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
