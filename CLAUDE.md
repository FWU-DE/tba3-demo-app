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
                       #  (eigene Dokumente mit `eigen: true` bleiben unberührt)
npm run docs:bilder    # Abbildungen der Dokumentseiten neu erzeugen (gegen npm run preview)
npm run konsortium:doc # /dokumentation/bausteine-der-rueckmeldungen aus
                       #  apps/shared/konsortium.js neu erzeugen
npm test               # Vitest (apps/demo + apps/shared mit jsdom; tools/,
                       #  apps/beispiele, apps/katalog als Node)
npm run test:watch     # dasselbe im Beobachtungsmodus
npm run e2e            # Playwright gegen den gebauten Stand (baut und startet selbst)
npm run e2e:ui         # dasselbe mit Oberfläche zum Nachvollziehen
npm run lint           # ESLint über apps/demo
```

**CI check (run before every commit):**
```bash
npm run lint && npm test && npm run build
```

Vor einer Änderung an der Oberfläche zusätzlich `npm run e2e`.

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
apps/beispiele/     Die Rückmeldungen des Konsortiums — statisches HTML, unter /beispiele
apps/shared/        Navigationsleiste, Sprachwahl, Containerregel → /gemeinsam/
apps/shared/konsortium.js
                    Die Rückmeldungen des Konsortiums und der Baustein-Katalog —
                    Daten für /beispiele, den Reiter „Rückmeldeelemente" der
                    Demoanwendung und das erzeugte Dokument
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
tools/konsortium-dokument.mjs
                       erzeugt bausteine-der-rueckmeldungen.md aus konsortium.js
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

Wer eine Datei unter `/gemeinsam/` hinzufügt oder umbenennt, fasst eine sechste
Stelle an: die Liste der geprüften Adressen in `.github/workflows/ci.yml`. Sie
ruft nach dem Build jede ausgelieferte Adresse einzeln ab — ein Bereich, der
lokal läuft und im Deployment 404 gibt, fällt sonst erst dort auf. Lint, Tests
und Build merken davon nichts; sie klopfen den ausgelieferten Baum nicht ab.

### Deployment — `main` deployt nicht von selbst

**Ein Merge nach `main` geht nicht live.** Es gibt keinen Deploy-Workflow;
ausgeliefert wird von Hand:

```bash
git checkout main && git pull
npx vercel deploy --prod          # gebaut wird auf Vercel, nicht hier
```

Das Projekt ist über `.vercel/project.json` verknüpft (`jan-renzs-projects/tba3`),
ein lokales `dist/` spielt dabei keine Rolle — Vercel baut selbst über
`buildCommand` aus `vercel.json`.

Das steht hier, weil die Abwesenheit der Automatik nirgends sichtbar ist: `npm
run preview` heißt „ausliefern wie im Deployment", `vercel.json` liegt im
Wurzelverzeichnis, und wer beides sieht, nimmt eine Git-Integration an, die es
nicht gibt. Wer mergt, deployt, oder sagt ausdrücklich, dass jemand anderes es
tut.

Verlassen kann man sich darauf nicht. Am Artefakt gemessen lag #20 rund **elf
Stunden** zwischen Merge (14.09., 20:21 UTC) und Auslieferung (15.09., 07:17
UTC) — und das Deployment vier Minuten nach dem Merge trug den Stand von davor.

Darin steckt die eigentliche Falle: **der Zeitpunkt eines Deployments sagt
nichts darüber, welcher Commit darin steckt.** Wer aus seinem eigenen Checkout
deployt, liefert dessen Stand aus, auch wenn inzwischen etwas gemergt wurde.
Welcher Stand live ist, steht deshalb in keinem Zeitstempel — das prüft man am
ausgelieferten Artefakt, mit einem Marker aus dem fraglichen Commit:

```bash
npx vercel curl https://tba3.vercel.app/bausteine/kern/thema.js | grep stufe-1-text
```

Dieser Absatz stand zweimal falsch hier, einmal in jede Richtung, weil zweimal
Zeitstempel verglichen wurden statt Artefakte. Wer ihn das nächste Mal anfasst:
erst messen, dann schreiben.

Der zweite Fehler, der droht, ist das gleichzeitige Fahren: laufen mehrere
Sitzungen am selben Checkout, deployt **genau eine**. Zwei Läufe erzeugen zwei
Production-Deployments, von denen das zweite gewinnt — auch wenn es den älteren
Stand trägt.

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

**Abbildungen.** Ein Bild, das allein in seinem Absatz steht, wird zu einem
`<figure>`; der Markdown-Titel (`![alt](/dokumentation/bilder/x.png "Unterschrift")`)
ist die sichtbare Bildunterschrift, nicht ein `title`-Attribut, das nur sieht, wer
mit der Maus stehen bleibt. Die Dateien liegen unter
`apps/portal/dokumentation/bilder/` und werden **absolut** verlinkt — die Seite
liegt unter `/dokumentation/<slug>/`, ein relatives `bilder/x.png` zeigte also ein
Verzeichnis zu tief. `tools/dokumente.test.mjs` prüft beides.

Erzeugt werden sie mit `npm run docs:bilder` (`tools/dokumentbilder.mjs`) gegen
`npm run preview`, nicht von Hand: Oberflächen und erzeugte PDFs veralten, und ein
veraltetes Bild ist schlimmer als keines, weil niemand ihm ansieht, dass es von
gestern ist. Das Skript braucht `pdftoppm` (poppler-utils) und `magick`
(ImageMagick); fehlt eines, bricht es ab, statt halbe Bilder zu schreiben.

**Nicht jedes Dokument kommt von oben.** Ein Eintrag mit `eigen: true` wird hier
geschrieben und gepflegt: `docs:update` fasst ihn nicht an, der Herkunftsverweis
zeigt auf `FWU-DE/tba3-demo-app`, und Seite wie Übersichtskarte sagen das, statt
einen „Stand“ zu behaupten, den es nicht gibt. So liegt
`demo-rezepte.md` — Rezepte der Demoanwendung, angefangen beim Observer-Modus —
neben den Kopien, ohne beim nächsten Nachziehen zu verschwinden. Die Regel dafür
ist einfach: was die Schnittstelle beschreibt, gehört nach `indibit-eu/tba3`; was
die Oberfläche beschreibt, gehört hierher.

### Die Rückmeldungen des Konsortiums

`apps/beispiele/` ist statisches HTML ohne Build — die 10 Rückmeldungen liegen
bei den vier Einrichtungen, die sie gebaut haben (kompetenztest.de, indibit, ISQ
Berlin, zepf), mit eigener Demo und eigenem Repositorium. Hier steht nur die
filterbare Übersicht mit Demo-, Quelltext- und Dokumentationsverweis.

**Die Daten stehen nicht im Bereich, sondern in `apps/shared/konsortium.js`**
(ausgeliefert als `/gemeinsam/konsortium.js`). Der Grund ist, dass sie drei
Stellen tragen:

| Stelle | Was sie zeigt |
|---|---|
| `/beispiele` | die Rückmeldungen mit ihren Adressen, filterbar |
| `/demo/?tab=elemente` | den Katalog, gezeichnet mit den Daten der gewählten Ebene |
| `/dokumentation/bausteine-der-rueckmeldungen` | den Katalog als Text, erzeugt |

Quelle der Angaben ist der Sachbericht der Abschlusssitzung der Steuergruppe vom
15.09.2026. Was dort nicht steht, steht hier nicht — fehlt einer Rückmeldung die
Dokumentationsadresse, bleibt das Feld leer, statt eine zu raten.

Fach und Klassenstufe sind **offene** Felder: eine leere Liste heißt „gilt für
alles", nicht „gilt für nichts". Die Schulrückmeldung von indibit ist
fachunabhängig — „das Fach ist Filter, keine inhaltliche Festlegung" — und darf
nicht verschwinden, sobald jemand nach Deutsch filtert. Die Auswahl steht in der
Adresse (`?einrichtung=zepf&fach=DE`), damit sich eine gefilterte Ansicht
verschicken lässt.

### Der Baustein-Katalog

`BAUSTEINE` in derselben Datei führt 29 Bausteine in drei Schichten —
Anzeigebausteine, Rückmeldeelemente, Rahmen. Der Aufbau stammt von indibit (16
Anzeigekomponenten, 13 Rückmeldeelemente, 3 Rollen-Sichten) und passt auf die
anderen drei Einrichtungen genauso.

Zwei Regeln halten den Katalog ehrlich, und beide haben einen Test:

- **Zugeordnet ist, was der Sachbericht nennt.** Eine Rückmeldung, die einen
  Baustein nicht in ihrer Liste hat, zeigt ihn womöglich trotzdem — sie hat ihn
  nur nicht berichtet. Was allein aus `@tba3/bausteine` kommt und von keinem
  Bericht genannt wird, steht als solches da.
- **`quelle` nur, wo es auch einen Baustein gibt.** Das Feld sagt, welche
  Ressource die Demoanwendung dafür abruft; stünde dort eine ohne zugehörigen
  Baustein, bliebe die Kachel leer und niemand merkte es. Wo es keine Zeichnung
  gibt, nennt `reiter` den Reiter der Demoanwendung, der dieselbe Frage sonst
  beantwortet.

Nach jeder Änderung an den Daten: **`npm run konsortium:doc`**. Die erzeugte
Datei ist eingecheckt, weil `tools/build-site.mjs` sie auf der Platte erwartet
und der Stand im Diff sichtbar sein soll; `tools/konsortium-dokument.test.mjs`
vergleicht beides.

### Der Reiter „Rückmeldeelemente" der Demoanwendung

`apps/demo/src/components/charts/ReportElementsView.jsx` zeichnet den Katalog
mit den Daten der gewählten Ebene, über `@tba3/bausteine/react` — dasselbe
Paket, das ein fremdes Projekt bekommt.

Die Ansicht **doppelt mit Absicht**, was andere Reiter schon zeigen: sie ordnet
nach der fachlichen Frage statt nach der Ressource der Schnittstelle. Wer wissen
will, wie vier Einrichtungen unabhängig voneinander dieselbe Frage beantwortet
haben, findet hier alle Antworten nebeneinander.

Die Abbildung von Antwort auf Baustein-Eigenschaften steht in
`apps/demo/src/utils/reportElements.js`, mit zwei Regeln:

- **Nichts erfinden, was die Antwort nicht hergibt.** Die Schnittstelle liefert
  kein Konfidenzintervall — also bekommt der Mittelwert-Vergleich keines. Sie
  trennt „falsch" nicht von „ausgelassen" — also steht der ausgelassene Anteil
  auf 0, und die Ansicht sagt das dazu.
- **Beschriftungen kommen von außen.** Das Modul kennt keine Sprache;
  Domänennamen, Stufenfarben und Hinweise reicht die Ansicht herein.

Ein Baustein ohne Datenweg bleibt nicht leer, sondern sagt, woran es liegt:
entweder gibt es ihn in der Bibliothek noch nicht, oder die Schnittstelle
liefert die Daten nicht (der Verlauf über Messzeitpunkte braucht mehrere
Erhebungen, die Schnittstelle kennt eine).

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

### Zwei Sorten Lernmaterial

Der Reiter „Lernmaterialien“ der Demoanwendung führt beides nebeneinander, und
das ist Absicht:

- **Der lokale Pool** (`EDUCATIONAL_MATERIALS` in `utils/constants.js`) plus
  MUNDO-Treffer. Ein Material hat hier Art, Fach und Dauer und passt „zu einer
  Stufe“ — mehr Struktur gibt es nicht.
- **`/materials`** im dritten Modus. Der Entwurf kennt sechs Zuordnungsarten:
  ein Material hängt an einer Kompetenzstufe, einer Kompetenz, einem Item,
  einer Aufgabe, am ganzen Test — oder an nichts Bestimmtem. Erst
  nebeneinander wird sichtbar, was das austrägt.

Gerechnet wird in `apps/demo/src/utils/materialien.js`, geladen über
`hooks/useMaterialien.js` (eigener Hook statt `useApiDaten`: `/materials` hängt
an keiner Ebene). Eine Falle steckt in `stufeAusAnhang()`: die Anhänge zeigen
mal über `refName` auf die Stufe („Ia“), mal über `refId` („III“), und mal auf
eine UUID, zu der die Schnittstelle keinen Namen führt — die Kompetenzstufen
der Gruppen kommen ohne `id`. Dazu teilt das IQB die unterste Stufe in Ia und
Ib, die Anwendung führt fünf. Ein Abgleich, der stumpf `refName === 'I'` prüft,
ordnet auf den echten Beispieldaten **nichts** zu und meldet trotzdem Erfolg;
der Unit-Test läuft deshalb gegen die Fixtures des Mocks, nicht gegen
selbstgebaute Daten.

Die Auto-Zuweisung ordnet nur zu, was eindeutig im Anhang steht (Stufe → diese
Stufe, „ohne festes Ziel“ → alle fünf) und zählt den Rest sichtbar mit. Was an
einem Item, einer Aufgabe oder einem Test hängt, braucht den Einsatzkontext und
bleibt Sache der Lehrkraft. Geschrieben wird in dieselben beiden Ablagen wie
bei MUNDO (`tba3_materials_by_level`, `tba3_external_materials`) — danach
unterscheidet nur die Herkunft `schnittstelle` das eine vom anderen.

Die OpenAPI-Spezifikation liegt als Kopie unter
`apps/portal/schnittstelle/tba3-spec.yml` und wird mit `npm run spec:update` aus
`indibit-eu/tba3` nachgezogen — bewusst eingecheckt, damit die Referenz an nichts
Externem hängt. In der Referenz schreibt ein `requestInterceptor` Anfragen auf den
eigenen Host um, sodass „Try it out“ ohne CORS gegen dieselben Demodaten läuft.

## Tests

```
apps/demo/src/utils/__tests__/dataTransformers.test.js   Datenaufbereitung
apps/demo/src/utils/__tests__/materialien.test.js        Materialien: Gruppierung, Zuordnungsplan
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

Dazu die E2E-Tests unter `e2e/` (Playwright, `npm run e2e`):

```
e2e/demo-grundgeruest.spec.js   Laden, Leiste, Übersichtskarten, alle sieben Reiter, Deeplinks
e2e/demo-filter.spec.js         Ebene, Lerngruppe, Fach, Klassenstufe, Datentyp — je gegen die Abfrage
e2e/demo-schueler.spec.js       Suche, Filter, Datenblatt, eigene Gruppen (localStorage)
e2e/demo-materialien.spec.js    Stufe wählen, zuweisen, Export als .imscc und .pdf
e2e/demo-materialien-schnittstelle.spec.js
                                /materials im dritten Modus: Gruppierung, Vorschau, Zuweisung
e2e/demo-vergleich.spec.js      Teilbereiche, Vergleiche hinzunehmen, gesperrte Vergleiche
e2e/demo-sprache.spec.js        Umschalten, Merken, über Bereiche hinweg, ?lang= beim ersten Rendern
e2e/demo-fehler.spec.js         Abfrage scheitert, erneut versuchen, Fehler bleibt im Reiter
e2e/demo-mobil.spec.js          Filter-Umschalter, Bedienbarkeit und kein seitlicher Überlauf bei 390 px
```

Gelaufen wird gegen `npm run preview`, nicht gegen den Dev-Server: Base-Pfade,
Rewrites und der eigene Mock verhalten sich erst dort wie im Deployment.
`playwright.config.js` baut und startet das selbst; gegen einen schon laufenden
Server geht es mit `E2E_BASE_URL=http://localhost:4173 npm run e2e` ohne Bauen.

Zwei Regeln für neue E2E-Tests: adressiert wird über `data-testid`, und geprüft
wird, was die Anwendung tatsächlich abruft (`page.waitForRequest`) — eine
Ansicht, die sich verändert, ohne die richtige Abfrage zu stellen, hat nichts
gezeigt.

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

Der vollständige Weg einer Änderung — Ticket, Branch, Commit-Stil, PR,
Abbruchbedingungen für Agenten — steht in
[`CONTRIBUTING.md`](CONTRIBUTING.md).

Task-Tickets liegen in `docs/tasks/todo/{slug}.md`. Eine neue Datei dort löst
über GitHub Actions den Claude-Code-Agenten aus. Vollständiger Ablauf:
`skills/ai-first-webapp-gitops/01-requirements.md` (Repository FWU-DE/skills).
