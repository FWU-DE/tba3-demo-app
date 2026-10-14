# Changelog

Format nach [Keep a Changelog](https://keepachangelog.com/en/1.0.0/). Ein Eintrag,
eine Zeile: was sich geändert hat, nicht warum. Die Begründung steht im Pull
Request.

## [Unreleased]

### Added
- Mock: `comparison=faircomparison` auf `/items`; der Mittelwert-Vergleich im Katalog nutzt ihn statt Schulwert × 0,96.
- Ausschnitte der Originale neben jedem Baustein: Demonstrator, Reiter „Rückmeldeelemente“, Dokument „Bausteine der Rückmeldungen“ (mit Nachbau).
- Karten im Reiter „Rückmeldeelemente“ verlinken auf den Baustein im Demonstrator.
- Bausteine Lösungsquote nach Merkmal, Abweichung je Lerngruppe, Zwei Gruppen gespiegelt, Netzdiagramm; in Katalog, Demonstrator und Demoanwendung.
- Teaser der Machbarkeitsstudie mit Grafik auf der Startseite.
- Elfte Rückmeldung: Kompetenzstand Mathematik, Klassenbericht (kompetenztest.de, seit 08.10.2026).
- Baustein-Katalog neu erhoben (14.10.2026): 26 neue Zuordnungen, fünf neue Bausteine (43).
- Beispielwerte für alle Parameter von `/materials` in der API-Referenz.
- Machbarkeitsstudie unter `/dokumentation/machbarkeitsstudie`, zweisprachig, mit Grafik:
  Mediatheken, Materialsammlung an das LMS, Ergebnisdaten an Lernsysteme (AIS.schule).
- Dokumente mit englischer Fassung (`englisch`) und Unterseiten (`teil`) in `DOKUMENTE`.
- Zielgruppen-Marken („Ohne Technikkenntnisse“ / „Für Entwickler:innen“) auf Startseite,
  Bereichen und Dokumentation.
- Die elf Rückmeldungen des Konsortiums unter `/beispiele`, mit Bildern und Filtern.
- Technologieagnostischer Katalog `/dokumentation/bausteine-der-rueckmeldungen`.
- Reiter „Rückmeldeelemente“ in der Demoanwendung.
- `@tba3/bausteine`: Visualisierungen als Web Component, Vue und React; themebar, Dark Mode;
  Demonstrator unter `/bausteine`.
- Bausteine Kontextmerkmal-Ring, Standard-Erreichung, Zeugnissätze und sieben weitere.
- Rezepte der Demoanwendung: Observer-Modus, PDF-Export, MCP-Server.
- Abbildungen in Dokumentseiten, erzeugt mit `npm run docs:bilder`.
- E2E-Tests (Playwright) gegen den ausgelieferten Stand.
- Design-Tokens aus dem VIDIS Design System; Impressum und Datenschutz im Fuß.

### Changed
- Katalog: Fehlerbalken und fairer Vergleich der Kompetenzstufen als simuliert gekennzeichnet, mit Rechnung.
- Startseite nach Zielgruppen geteilt; Bausteine-Seite neu geschrieben.
- Katalog: sprechende Namen statt technischer.
- Y-Achsen-Beschriftungen linksbündig (Bausteine, Katalog, Demoanwendung).
- Common Cartridge als Version 1.1, in Moodle 4.5 importierbar.
- Machbarkeitsstudie: Teilkonzepte statt Teilfragen, ohne Meta-Sätze.
- indibit-Quelltext verweist auf `indibit-eu/tba3-elements`.
- Alle Katalog-Ansichten laufen über `@tba3/bausteine`.
- Kompetenzstufen mit eigener Beschriftungsfarbe (Kontrast ≥ 4,5).
- Portal, Rückmeldungen und Dokumentation nutzen die Design-Tokens (VIDIS-Blau).
- Legende der Kompetenzstufen bricht auf schmalen Schirmen um.

### Fixed
- Katalog, Kompetenzübersicht: Englisch zeigt die Verteilung nach dem Referenzrahmen statt „Keine Daten“.
- Mathematik 8 (Stufen 1a/1b/2 …) und Englisch/Französisch (GER-Stufen) in Demoanwendung und Katalog: Farben, Kennzahlen, „Keine Daten“.
- Referenz-Backend-Link zeigt auf `/tba3-api/docs` statt auf eine 404.
- Mock `/materials`: Kompetenz-URIs, `name:`-Präfix, Fach- und Domänenkürzel.
- Cartridge-Seiten folgen der gewählten Sprache.
- Katalog läuft auf Telefonen nicht mehr seitlich über.
- Erhebungsskript erkennt React, Vue und Angular wieder.
- Perzentilbänder nicht mehr schwarz; `/katalog#/percentile-band` keine weiße Seite mehr.
- `/bausteine` ohne Schrägstrich lädt.
- Heller Text auf heller Seite bei dunklem System.
- Sprachwahl überlebt das erste Rendern der Demoanwendung.

## [0.1.0] — 2026-05-05

### Added
- React-19-Anwendung für TBA3-Auswertungsdaten: Kompetenzstufen, Item-Statistik, drei Ebenen, Filter.
- Export als PDF, ZIP und QR-Code; MUNDO-Anbindung über LTI.
- MCP-Server; Docker-Abbild mit App und MCP-Server; CI für beide Abbilder.
