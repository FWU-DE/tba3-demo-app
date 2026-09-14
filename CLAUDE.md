# CLAUDE.md — TBA3

## Commands

Alle Kommandos im Repository-Wurzelverzeichnis (npm workspaces):

```bash
npm install            # alle Workspaces
npm run mock           # TBA3-Mock          → http://localhost:8000
npm run dev:demo       # Demoanwendung      → http://localhost:5173/demo/
npm run dev:katalog    # Komponentenkatalog → http://localhost:5174/katalog/
npm run build          # alle Bereiche → dist/
npm run preview        # dist/ ausliefern wie im Deployment → http://localhost:4173
npm run docs:update    # Konzepte, Endpunkt-Referenz, Rezepte aus indibit-eu/tba3 holen
npm test               # Vitest (apps/demo + apps/shared mit jsdom; tools/,
                       #  apps/beispiele, apps/katalog als Node)
npm run test:watch     # dasselbe im Beobachtungsmodus
npm run lint           # ESLint über apps/demo
```

**CI check (run before every commit):**
```bash
npm run lint && npm test && npm run build
```

Alle drei laufen ohne Befund; bitte sauber halten. `.github/workflows/ci.yml`
führt sie bei jedem Push und Pull Request aus und prüft anschließend den
ausgelieferten Stand über `npm run preview` — Seiten, Spezifikationen, Leiste
und Mock-Antworten.

## Architektur

Monorepo mit fünf Bereichen, die zu **einem** Deployment zusammengesetzt werden.

```
apps/portal/        Startseite (/) und API-Referenz (/schnittstelle) — statisches HTML
apps/portal/dokumentation/
                    Markdown-Kopien der erklärenden Texte (npm run docs:update),
                    gerendert unter /dokumentation
apps/demo/          React 19 + Vite, ausgeliefert unter /demo      (@tba3/demo)
apps/katalog/       Vue 3 + PrimeVue + Vite, unter /katalog        (@tba3/katalog)
apps/beispiele/     Rückmeldungsbeispiele — statisches HTML, unter /beispiele
apps/shared/        Navigationsleiste, Sprachwahl, Containerregel → /gemeinsam/
apps/portal/bausteine/
                    Demonstrator: alle Bausteine in allen drei Fassungen, mit
                    Theme-Umschalter und der Zuordnung Katalog ↔ Bausteine
packages/bausteine/ Die Visualisierungen als native Web Component, Vue- und
                    React-Komponente (@tba3/bausteine). Kern = Berechnung,
                    Web Component = die eine Implementierung, Vue/React = Hüllen.
                    → /bausteine/
api/                Eigener TBA3-Mock als Vercel-Funktion
data/fixtures.mjs   Beispieldaten, gepackt (npm run fixtures:update)
data/material-fixtures.mjs
                    Beispiele des Materialien-Entwurfs (npm run material-spec:update)
mcp-server/         MCP-Server (eigenes Paket, bewusst kein Workspace:
                    eigener Lockfile, eigener Docker-Kontext)
tools/dokumente.mjs    Verzeichnis, Rendern und Seitenvorlage für /dokumentation
tools/build-site.mjs   dist/ = portal + demo/ + katalog/ + beispiele/ + schnittstelle/
                       + dokumentation/
tools/serve-site.mjs   lokaler Server, der die Deployment-Rewrites nachbildet
```

Wer einen Bereich hinzufügt, fasst fünf Stellen an: `tools/build-site.mjs`
(Zusammenbau), `vercel.json` und `nginx.conf` (Fallback), `apps/portal/index.html`
(Verlinkung), `BEREICHE` in `apps/shared/tba3-leiste.js` (Navigationsleiste) und
`/gemeinsam/container.css` (dieselbe Spalte wie alle anderen). Ein
statischer Bereich mit eigenen Verzeichnissen braucht keinen SPA-Fallback —
`/dokumentation` fasst deshalb nur drei dieser vier Stellen an.

### Eine Spalte für die ganze Seite

`apps/shared/container.css` führt die Maße, unter `/gemeinsam/container.css`
eingebunden: **1200px breit, 20px Rand, unter 640px 12px**. Die
Navigationsleiste steht über jedem Bereich und ist damit die Kante, an der sich
alles ausrichtet — läuft ein Bereich mit eigenen Maßen, springt sein Inhalt
gegenüber der Leiste ein, und das sieht auf einem breiten Schirm nach Absicht
aus.

Wer die Spalte braucht, nimmt `.wrap` (Portal, Rückmeldungen, Dokumentation)
oder `var(--breite)` und `var(--rand)` in eigenen Regeln (Schnittstelle,
Katalog). Eine eigene Zahl ist ein Bug; `apps/shared/container.test.mjs` sucht
im ganzen `apps/`-Baum danach.

Zwei Stellen weichen mit Absicht ab: Der Fließtext der Dokumentation bekommt
ein Lesemaß von 760px — über 105 Zeichen je Zeile findet das Auge nicht zurück
an den Anfang der nächsten —, und was dabei übrig bleibt, fällt zwischen Text
und Gliederung, sodass beide bündig mit den Kanten der Leiste stehen. Und die
Demoanwendung hat keine zentrierte Spalte, sondern eine Seitenleiste mit
Inhaltsfläche daneben (`max-w-7xl` im `Dashboard`); dort gibt es nichts, was
sich an der Leiste ausrichten ließe.

### Gemeinsame Navigationsleiste

`apps/shared/tba3-leiste.js` ist ein Custom Element mit Shadow DOM und steht in
jedem Bereich **im HTML-Dokument**, nicht im Framework-Baum:

```html
<tba3-leiste aktiv="demo"></tba3-leiste>
```

So muss weder React noch Vue davon wissen, und das Shadow DOM hält Tailwind und
PrimeVue aus den Stilen heraus. Eingebunden wird sie zur Laufzeit per
`document.createElement` — ein `<script src="/gemeinsam/…">` im Markup würde Vite
auflösen und mitbündeln wollen. Im Dev-Server liefert
`apps/shared/vite-plugin-gemeinsam.js` die Datei aus, im Build `tools/build-site.mjs`.

### Dokumentation

Die erklärenden Texte zur Schnittstelle — Konzepte, Endpunkt-Referenz, Rezepte —
stehen im Quell-Repository `indibit-eu/tba3` als Markdown. Statt dorthin zu
verlinken, liegen sie **als eingecheckte Kopie** unter
`apps/portal/dokumentation/` und werden beim Build zu Seiten unter
`/dokumentation/<slug>` gerendert. Dasselbe Muster wie bei der
OpenAPI-Spezifikation: die Seite hängt an nichts Externem, und der Stand ist
sichtbar statt stillschweigend.

Nachgezogen wird mit `npm run docs:update` — der Diff ist die eigentliche
Ausgabe des Skripts: er zeigt, was sich oben geändert hat. Eine Fehlerseite oder
eine leere Antwort überschreibt die Kopie nicht. `stand.json` hält das
Abrufdatum, das auf jeder Seite steht.

`tools/dokumente.mjs` führt drei Dinge zusammen, die sonst auseinanderlaufen:
das Verzeichnis `DOKUMENTE`, das Rendern (`marked`) und die Seitenvorlage. Zwei
Entscheidungen stecken darin:

- **Sprungmarken werden gebildet wie auf GitHub**, Umlaute eingeschlossen
  (`#gruppierung-nach-domäne-wann-sinnvoll`). Die Dokumente verlinken
  untereinander auf diese Form; eine eigene Form hieße, jeden Querverweis zu
  brechen. `tools/dokumente.test.mjs` prüft, dass jeder Verweis zwischen den
  Dokumenten einen Abschnitt trifft — ein falscher Anker ist kein 404 und fiele
  sonst niemandem auf.
- **Verweise auf ein Nachbardokument zeigen hierher**, nicht nach GitHub. Was
  hier nicht geführt wird, bleibt der externe Link, der es ist; `docs:update`
  meldet solche Fälle, der Test lässt sie nicht durch.

Wer ein Dokument aufnimmt, trägt es in `DOKUMENTE` ein und ruft `docs:update` —
Übersicht, Navigation und Build ziehen daraus nach.

### Rückmeldungsbeispiele

`apps/beispiele/` ist statisches HTML ohne Build — die 16 prototypischen
Rückmeldungen liegen je in einem eigenen Repository und werden über GitHub Pages
ausgeliefert. Hier steht nur die filterbare Übersicht. Alles Inhaltliche steckt in
`apps/beispiele/rueckmeldungen.js`: Liste, Vokabular (Fach, Klassenstufe,
Zielgruppe) und die Filterlogik. Ohne `url` gilt ein Eintrag als „in Vorbereitung“
und wird nicht verlinkt. Die Einträge sind ausformulierte Beispiele, keine
Zusagen — die Zuschnitte folgen VERA (Klasse 3: Deutsch, Mathematik; Klasse 8
zusätzlich Englisch und Französisch). Die Auswahl steht in der Adresse (`?fach=DE`), damit sich
eine gefilterte Ansicht verschicken lässt.

### Zweisprachigkeit

Die ganze Seite gibt es auf Deutsch und Englisch. Die Wahl gehört dem Besucher,
nicht dem Bereich: sie steht in `localStorage` (`tba3-sprache`) und gilt damit
über alle Bereiche hinweg. `apps/shared/sprache.js` führt sie; umgeschaltet wird
in der Navigationsleiste.

| Bereich | Weg |
|---|---|
| Portal, Rückmeldungen, Schnittstelle | beide Fassungen im Markup, `html[lang]` blendet die andere aus |
| Demoanwendung | `useTexte()` → `t('pfad')`, Texte in `apps/demo/src/i18n/texte.js` |
| Komponentenkatalog | `t('pfad')` aus `apps/katalog/src/i18n`, Texte in dessen `texte.js` |

Reihenfolge beim Bestimmen der Sprache: `?lang=en` in der Adresse (wird gemerkt),
dann die gemerkte Wahl, dann die Browsersprache, sonst Deutsch.

Beim Umschalten zeichnen sich die Apps neu: React über `useSyncExternalStore`,
Vue über eine reaktive Referenz. Was außerhalb einer Komponente übersetzt wird
(PDF- und Cartridge-Ausgabe, Fehlermeldungen in Hooks), ruft `uebersetze()` bzw.
`konstantenJetzt()` **beim Aufruf** auf — nicht beim Laden des Moduls, sonst
steht in der Ausgabe die Sprache von vorhin.

`utils/constants.js` der Demo führt nur Kennungen, Farben und Zeichen; die
Beschriftungen liegen in `texte.js` und kommen über `useKonstanten()` dazu —
dieselben Objekte (`COMPETENCE_LEVELS[x].name` …), nur übersetzt.

Zwei Fallen:

- `t()` ist für den React-Compiler eine fremde Funktion. Wird ihr ein Wert
  gereicht, der aus einem Objekt stammt, das später eine `useMemo`-Abhängigkeit
  ist, bricht die Kompilierung ab („Existing memoization could not be
  preserved"). Namen deshalb außerhalb anhängen:
  `` `${t('…')} – ${gruppe.name}` `` statt `t('…', { name: gruppe.name })`.
- Texte mit Auszeichnung (`<strong>`, `<code>`) stehen als Ganzes im
  Wörterbuch und werden über `i18n/HtmlText.jsx` bzw. `v-html` gesetzt — ein in
  Bruchstücke zerlegter Satz lässt sich in keiner zweiten Sprache sauber
  zusammensetzen.

`apps/demo/src/i18n/texte.test.js` und `apps/katalog/src/i18n/texte.test.mjs`
prüfen, dass jeder verwendete Schlüssel existiert, jeder Eintrag beide Sprachen
führt und die Platzhalter (`{n}`) in beiden Fassungen dieselben sind.

Nicht übersetzt sind die Beispieldaten: Namen von Schüler:innen, Lerngruppen und
Teilbereichen, der Materialkatalog und die OpenAPI-Spezifikation. Sie kommen im
Betrieb aus der Schnittstelle.

### Base-Pfade

Demo und Katalog liegen in Unterpfaden — `base: '/demo/'` bzw. `base: '/katalog/'`
in der jeweiligen `vite.config.js`. Wird das geändert, muss der Zielpfad in
`tools/build-site.mjs` mitgezogen werden, sonst laden die Assets ins Leere.

### API-Zugriff

Alle Wege führen zum **eigenen Mock** — kein externes Backend zur Laufzeit:

| Umgebung | Weg |
|---|---|
| Dev | Vite-Proxy je App → `npm run mock` auf Port 8000 |
| Vercel | Rewrites in `vercel.json` → `api/[...pfad].js` |
| Docker | nginx → `tools/mock-server.mjs` im selben Container |
| Preview | `tools/serve-site.mjs` beantwortet direkt |

Geteilte Logik: `tools/mock.mjs`. Daten: `data/fixtures.mjs`, einmal vom
Referenzserver abgezogen (`npm run fixtures:update`), pro Antwort brotli-gepackt
und erst beim Zugriff ausgepackt. Fehlt eine Parameterkombination, wird auf die
allgemeinere Antwort ausgewichen — `X-TBA3-Mock-Treffer` sagt `genau` oder `ersatz`.
`type=group,students` wird aus Gruppen- und Schülerdaten zusammengesetzt statt
gespeichert; das halbiert die Datenmenge.

Die API-Basis kommt in beiden Apps aus `VITE_API_BASE_URL` (Demo:
`src/services/tba3Api.js`, Katalog: `axios.defaults.baseURL` in `src/main.js`);
leer bedeutet „gleicher Host".

`/materials` bedient der Mock nicht über hinterlegte Schlüssel, sondern filtert die
Beispiele des Entwurfs zur Laufzeit (scope, kind, audience, item, competenceLevel …) —
sonst gäbe „Try it out“ auf jede Anfrage dieselbe Liste zurück.

Die OpenAPI-Spezifikation liegt als Kopie unter
`apps/portal/schnittstelle/tba3-spec.yml` und wird mit `npm run spec:update` aus
`indibit-eu/tba3` nachgezogen — bewusst eingecheckt, damit die Referenz an nichts
Externem hängt. In der Referenz schreibt ein `requestInterceptor` Anfragen auf den
eigenen Host um, sodass „Try it out“ ohne CORS gegen dieselben Demodaten läuft.

## Tests

```
apps/demo/src/utils/__tests__/dataTransformers.test.js   Datenaufbereitung
apps/demo/src/hooks/__tests__/useApiDaten.test.jsx       Laden, Fehler, überholte Antworten
apps/demo/src/components/charts/__tests__/…              Übersichtskarten
apps/demo/src/__tests__/App.test.jsx                     Zusammenspiel: Filter, Reiter, Abfragen
tools/mock.test.mjs                                      Mock: Schlüssel, Ersatz, Materialfilter
tools/dokumente.test.mjs                                 Dokumentseiten: Rendern, Anker, Querverweise
apps/beispiele/rueckmeldungen.test.mjs                   Rückmeldungsliste: Filter und Optionen
apps/shared/sprache.test.mjs                             Sprachwahl: Quellen, Merken, Ereignis
apps/shared/container.test.mjs                           Eine Spalte: Maße, Einbindung, Ausreißer
apps/demo/src/i18n/texte.test.js                         Textschlüssel der Demoanwendung
apps/katalog/src/i18n/texte.test.mjs                     Textschlüssel des Katalogs
```

Der App-Test ersetzt `src/services/tba3Api` — das ist die einzige Stelle, an der
die Anwendung mit dem Backend spricht, und genügt deshalb, um Filter, Reiter und
Fehlerzustände zu prüfen. Bedienelemente werden über `data-testid` adressiert
(`ebene-*`, `auswahl-*`, `reiter-*`), nicht über Beschriftungen — die ändern sich
häufiger als die Kennungen.

Zwei Fallen aus der Praxis: `userEvent.hover` erreicht SVG-Elemente in jsdom nicht
(`fireEvent.mouseEnter` nehmen), und Recharts misst in jsdom keine Fläche — Tests
sollten sich deshalb nicht auf gezeichnete Balken stützen, sondern auf Daten und
Beschriftungen.

## Konventionen

- Neue UI-Komponenten bekommen `data-testid`-Attribute.
- Sichtbarer Text steht nie in der Komponente, sondern in `i18n/texte.js` des
  jeweiligen Bereichs — zweisprachig, sonst fällt die fehlende Übersetzung erst
  im Browser auf.
- API-Aufrufe der Demo laufen über `apps/demo/src/services/tba3Api.js` — kein
  direktes `fetch`/`axios` in Komponenten.
- Globaler Zustand der Demo lebt in `FilterContext`; neue globale
  State-Lösungen nur mit ADR.
- Keine Kaskaden-Operationen — Seiteneffekte explizit halten.
- Zustand, der nur Props oder Kontext spiegelt, wird beim Rendern abgeglichen
  (`if (letzterWert !== aktuell) { … }`), nicht in einem Effekt nachgezogen.
- Tooltip- und Hilfskomponenten gehören auf Modulebene; im Render definiert
  hängt Recharts sie bei jedem Durchlauf neu ein.
- Schwere Bibliotheken (jsPDF, JSZip) werden erst im Moment des Exports
  geladen: `const { exportPDF } = await import(…)`.
- Swagger UI kommt aus `node_modules` und wird beim Build kopiert, nicht von einem
  CDN geladen — das Deployment soll nicht an fremder Infrastruktur hängen. Wer die
  Bibliothek tauscht, prüft, ob sie zur Laufzeit weitere Dateien nachlädt: Redoc
  holte einen Worker-Chunk nach, der im Deployment fehlte und die Seite kippen ließ.

## Task Workflow

Task-Tickets liegen in `docs/tasks/todo/{slug}.md`. Eine neue Datei dort löst
über GitHub Actions den Claude-Code-Agenten aus. Vollständiger Ablauf:
`skills/ai-first-webapp-gitops/01-requirements.md` (Repository FWU-DE/skills).
