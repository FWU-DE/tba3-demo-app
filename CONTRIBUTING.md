# Contributing — TBA3

An diesem Repository arbeiten Menschen und Agenten. Für beide gelten dieselben
Regeln; der Unterschied liegt nur darin, was eine Änderung auslöst — ein Mensch
öffnet einen Branch, ein Agent bekommt ein Ticket. Dieses Dokument beschreibt
den Weg von der Idee bis zum gemergten Pull Request.

Es ist bewusst so geschrieben, dass ein Agent es als Anweisung lesen kann:
jede Regel nennt das Kommando oder die Datei, an der sie hängt. Wo eine Regel
eine Begründung hat, steht sie dabei — eine Regel, deren Grund niemand kennt,
wird beim ersten Widerstand umgangen.

---

## Wo was steht

Bevor du irgendetwas änderst, lies `CLAUDE.md`. Dort steht, wie die Bereiche
zusammenhängen und welche Fallen schon einmal Geld gekostet haben.

| Datei | Inhalt |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Architektur, Konventionen, bekannte Fallen — die Pflichtlektüre |
| `CONTRIBUTING.md` (hier) | der Weg einer Änderung: Ticket, Branch, Commit, PR |
| [`DEFINITION_OF_DONE.md`](DEFINITION_OF_DONE.md) | die Checkliste, die in jeden PR-Body gehört |
| [`README.md`](README.md) | was das Projekt ist, für Leute von außen |
| [`docs/CHANGELOG.md`](docs/CHANGELOG.md) | was sich geändert hat, in Prosa |
| [`apps/katalog/AGENTS.md`](apps/katalog/AGENTS.md) | Hinweise speziell für `apps/katalog` |
| [`packages/bausteine/README.md`](packages/bausteine/README.md) | Kern, Web Component, Vue- und React-Hüllen |

Bereichsnahe Dokumente ergänzen `CLAUDE.md`, sie ersetzen es nicht. Wer in
einem Unterverzeichnis arbeitet, liest beides.

---

## Einmal einrichten

Node 22 (dieselbe Version wie in `.github/workflows/ci.yml`), npm-Workspaces,
kein Python, kein externes Backend.

```bash
npm install            # alle Workspaces auf einmal

npm run mock           # TBA3-Mock          → http://localhost:8000
npm run dev:demo       # Demoanwendung      → http://localhost:5173/demo/
npm run dev:katalog    # Komponentenkatalog → http://localhost:5174/katalog/
```

Der Mock gehört dazu: Demo und Katalog leiten `/groups`, `/schools` und
`/states` dorthin weiter. Ohne laufenden Mock siehst du leere Ansichten und
suchst den Fehler an der falschen Stelle.

Den ausgelieferten Stand prüfst du mit `npm run build && npm run preview`
(→ http://localhost:4173). Das ist nicht dasselbe wie der Dev-Server: Base-Pfade,
Rewrites und die gemeinsame Leiste greifen erst dort so wie im Deployment.

---

## Die eine Prüfung vor jedem Commit

```bash
npm run lint && npm test && npm run build
```

Alle drei laufen auf `main` ohne Befund, und so sollen sie bleiben. Was die drei
abdecken:

- **`npm run lint`** — ESLint über `apps/demo`, inklusive der Regeln des
  React-Compilers. Hier fällt auf, wenn eine Memoisierung nicht mehr erhalten
  werden kann.
- **`npm test`** — Vitest über alle Bereiche. Darunter sind Tests, die keine
  Funktion prüfen, sondern eine Verabredung: dass kein Bereich eine eigene
  Spaltenbreite erfindet, dass jeder Textschlüssel in beiden Sprachen existiert,
  dass jeder Querverweis zwischen den Dokumenten einen Abschnitt trifft, dass
  keine Markenfarbe in `@tba3/bausteine` rutscht. Schlägt einer davon fehl, ist
  meist nicht der Test falsch.
- **`npm run build`** — baut alle Bereiche nach `dist/`.

Wer die Oberfläche anfasst, nimmt `npm run e2e` dazu (siehe unten).

`.github/workflows/ci.yml` führt dieselben drei bei jedem Push und Pull Request
aus, lässt daneben die E2E-Tests laufen und ruft danach über `npm run preview`
jede ausgelieferte Seite einzeln ab.
Ein Bereich, der lokal läuft und im Deployment 404 gibt, fällt dort auf — aber
später und teurer als bei dir.

---

## Der Weg einer Änderung

### 1. Ein Ticket, kein Zuruf

Jede Änderung, die mehr ist als ein Tippfehler, beginnt als Datei unter
`docs/tasks/todo/{slug}.md`. Der Dateiname ist der Slug und bestimmt alles
Weitere: Branch `req/{slug}`, Issue-Titel `req({slug}): {Titel}`. Die erste
Überschrift in den ersten fünf Zeilen wird zum Issue-Titel — sie sollte also
den Zweck nennen, nicht das Vorgehen.

Ins Ticket gehören die Akzeptanzkriterien, an denen die Umsetzung später
gemessen wird, und der Grund für die Änderung. Was nicht drinsteht, wird nicht
gebaut; was unklar ist, wird nachgefragt statt geraten.

Landet ein neues Ticket auf `main`, legt `.github/workflows/implement-tasks.yml`
ein Issue an und setzt das Label `claude-implement` — das startet den Agenten
über `claude-on-labeled.yml`. Der Lauf wird übersprungen, wenn es den Branch
`req/{slug}` schon gibt, ein offener PR dazu existiert oder das Ticket bereits
unter `docs/tasks/archived/` liegt. Ein Ticket doppelt zu starten geht also
nicht versehentlich; ein Ticket erneut zu starten heißt, den alten Branch
aufzuräumen.

### 2. Branch

```
feat/kurze-beschreibung      neue Funktion
fix/kurze-beschreibung       Fehlerbehebung
req/{slug}                   vom Ticket-Workflow erzeugt
```

Deutsch, mit Bindestrichen, beschreibend — `fix/sprache-bleibt-in-der-adresse`
sagt nach drei Wochen noch, worum es ging.

### 3. Commits — deutsch, mit Begründung

Betreffzeile als Conventional Commit, auf Deutsch, im Präsens:

```
feat(bausteine): echtes DOM statt SVG-Zeichenketten
fix: die Sprachwahl überlebt das erste Rendern der Demoanwendung
test: Seitenskript der Rückmeldungsübersicht im DOM prüfen
```

Der Body ist kein Protokoll der Änderung — das steht im Diff. Er beantwortet
drei Fragen:

1. **Was war vorher**, und warum hat es nicht getragen?
2. **Wie sieht es jetzt aus**, und warum so?
3. **Woran merkt man, dass es stimmt** — welcher Test schlägt ohne die Änderung
   fehl?

`git log` ist in diesem Repository das Begründungsarchiv. Wer wissen will, warum
die Bausteine ihre Farben über eine private Variablenleitung ziehen, findet die
Antwort dort und nirgends sonst.

Am Ende jedes Commits, der mit einem Agenten entstanden ist:

```
Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

### 4. Pull Request

Draft-PR gegen `main`, Titel wie die Betreffzeile des Commits:
`{prefix}({identifier}): {Titel}`. Die Vorlage in
`.github/PULL_REQUEST_TEMPLATE.md` füllt sich selbst ein; was hineingehört:

- **Was und Warum** — in ganzen Sätzen, nicht als Aufzählung von Dateinamen.
- **`Closes #{issue}`** — sonst bleibt das Issue offen zurück.
- **Die Checkliste aus `DEFINITION_OF_DONE.md`**, mit dem tatsächlichen Stand
  jedes Punktes. Ein abgehakter Punkt, der nicht erledigt ist, ist schlimmer als
  ein offener.
- **Screenshots** aus `docs/screenshots/{identifier}/` für jede geänderte
  UI-Seite: Normalzustand, Fehlerzustand falls vorhanden, Mobil-Ansicht bei
  Layout-Änderungen.
- **Was du nicht getan hast** und warum — ausgelassene Teile, bewusste Lücken,
  offene Fragen. Das ist der wertvollste Abschnitt des PR-Bodys.

### 5. Review und Merge

Der PR wird von einem Menschen gemergt. Niemand mergt seinen eigenen PR, niemand
pusht auf `main`.

Nach dem Merge: Ticket von `docs/tasks/todo/{slug}.md` nach
`docs/tasks/archived/{slug}.md` verschieben und `docs/CHANGELOG.md` ergänzen.
Beides gehört in denselben PR, nicht in einen Nachzügler.

---

## Was in den Code gehört

Die vollständigen Konventionen stehen in `CLAUDE.md`. Fünf davon werden am
häufigsten übersehen:

- **`data-testid` an jedem neuen Bedienelement.** Tests adressieren darüber,
  nicht über Beschriftungen — die ändern sich häufiger als Kennungen.
- **Sichtbarer Text steht in `i18n/texte.js`**, zweisprachig. Ein Text in der
  Komponente fällt erst im Browser auf, und dann nur in der Sprache, die gerade
  eingestellt ist.
- **API-Aufrufe der Demo laufen über `apps/demo/src/services/tba3Api.js`** —
  kein `fetch` oder `axios` in Komponenten. Das ist die eine Stelle, die Tests
  ersetzen.
- **Maße kommen aus `apps/shared/container.css`** (`.wrap`, `var(--breite)`,
  `var(--rand)`). Eine eigene Zahl ist ein Bug, und `container.test.mjs` sucht
  danach.
- **Keine CDN-Abhängigkeit zur Laufzeit.** Bibliotheken werden aus
  `node_modules` kopiert. Das Deployment soll nicht an fremder Infrastruktur
  hängen.

Wer einen neuen Bereich anlegt, fasst die fünf Stellen an, die in `CLAUDE.md`
unter „Architektur" aufgezählt sind. Vergisst man eine, funktioniert lokal
alles und im Deployment die Hälfte.

### Sprache im Code

Dokumentation, Commits, PR-Bodys und Ticket-Texte sind deutsch. Neue Module in
`tools/`, `apps/shared/` und `packages/bausteine/` werden deutsch benannt
(`sprache.js`, `kompetenzstufen-leiste.js`, `uebersetze()`); in `apps/demo`
bleibt die gewachsene englische Benennung, damit nicht beide Konventionen in
derselben Datei stehen. Im Zweifel: wie die Nachbardateien.

### Abhängigkeiten

Eine neue Laufzeit-Abhängigkeit braucht eine Begründung im PR-Body: was sie
kann, was sie wiegt, und was ohne sie fehlt. Schwere Bibliotheken werden erst im
Moment der Nutzung geladen (`const { exportPDF } = await import(…)`). Eine neue
Lösung für globalen Zustand oder ein weiteres Framework gibt es nur mit ADR.
Updates bestehender Abhängigkeiten erledigt Renovate (`renovate.json`).

---

## Für Agenten

### Zuerst lesen

1. `CLAUDE.md` — vollständig, nicht überflogen.
2. Das Ticket unter `docs/tasks/todo/{slug}.md`.
3. Die `AGENTS.md` bzw. `README.md` des Bereichs, in dem du arbeitest.
4. `git log` der Dateien, die du anfassen willst — dort steht, warum sie so
   aussehen, wie sie aussehen.

### Die Schleife

```
Ticket lesen  →  Akzeptanzkriterien auflisten  →  bestehendes Muster suchen
     →  implementieren  →  Test schreiben, der ohne die Änderung fehlschlägt
     →  npm run lint && npm test && npm run build  (+ npm run e2e bei UI)
     →  Screenshots  →  Ticket archivieren  →  CHANGELOG  →  Draft-PR
```

Ein Test, der auch vor der Änderung grün ist, prüft nichts. Führe ihn einmal
gegen den alten Stand aus, bevor du ihn als Nachweis in den PR schreibst.

Der Agentenlauf in `reusable-claude-implement.yml` prüft mit
`npm run lint && npm run build` — ohne Tests. Das ist das Tor der Automatik, nicht
dein Maßstab: `npm test` läuft trotzdem, sonst bricht die CI im PR.

### Wann du aufhörst und fragst

Rate nicht. Schreib einen Kommentar an den PR oder das Issue und warte, wenn:

- die Akzeptanzkriterien einander widersprechen oder einen Fall offenlassen, der
  die Hälfte der Umsetzung bestimmt;
- die Umsetzung eine Konvention aus `CLAUDE.md` brechen müsste;
- eine neue Abhängigkeit, eine neue Zustandslösung oder eine Änderung an der
  Schnittstelle nötig wäre;
- ein bestehender Test fehlschlägt, den deine Änderung nicht betrifft — dann hast
  du etwas gefunden, das nicht dir gehört;
- Daten oder Spezifikation aus `indibit-eu/tba3` nachgezogen werden müssten
  (`npm run docs:update`, `spec:update`, `fixtures:update`): das Ergebnis ist ein
  eigener Commit mit geprüftem Diff, keine Nebenwirkung.

Eine gestellte Frage kostet eine Stunde. Eine falsche Annahme kostet den PR.

### Absolutes Verbot

- den eigenen PR mergen
- direkt auf `main` pushen
- committen ohne grünes `npm run lint && npm test && npm run build`
- UI-Komponenten ohne `data-testid` anlegen
- generierte Dateien (`dist/`, `node_modules/`) committen
- einen fehlschlagenden Test löschen oder überspringen, statt die Ursache zu
  beheben
- eine DoD-Checkbox abhaken, deren Punkt nicht erledigt ist

### Wie du berichtest

Im PR-Body steht der Stand, nicht die Absicht. Was lief, was nicht lief, was du
ausgelassen hast und warum. Wenn du einen Teil des Tickets nicht umsetzen
konntest, setze den Rest vollständig um und schreib den ausgelassenen Teil
ausdrücklich hin — den Umfang zu verkleinern ist eine Entscheidung, die dem
Ticketgeber gehört.

---

## Tests

Getestet wird mit Vitest — `apps/demo` und `apps/shared` unter jsdom, `tools/`,
`apps/beispiele` und `apps/katalog` als Node. Die vorhandenen Testdateien sind in
`CLAUDE.md` aufgeführt; ein neuer Test kommt neben den, der seinem Bereich am
nächsten liegt.

Zwei Fallen aus der Praxis: `userEvent.hover` erreicht SVG-Elemente in jsdom
nicht (`fireEvent.mouseEnter` nehmen), und Recharts misst in jsdom keine Fläche —
prüfe deshalb Daten und Beschriftungen, nicht gezeichnete Balken.

### E2E-Tests

Die E2E-Tests liegen unter `e2e/` und laufen mit Playwright:

```bash
npm run e2e        # baut, startet die Vorschau und läuft
npm run e2e:ui     # dasselbe zum Nachvollziehen
E2E_BASE_URL=http://localhost:4173 npm run e2e   # gegen einen laufenden Server
```

Gelaufen wird gegen `npm run preview`, nicht gegen den Dev-Server: Base-Pfade,
Rewrites und der eigene Mock verhalten sich erst dort wie im Deployment.

Zwei Regeln für einen neuen E2E-Test:

- **Adressiert wird über `data-testid`**, nie über Beschriftungen.
- **Geprüft wird, was die Anwendung abruft**, nicht nur, was sie zeigt
  (`page.waitForRequest`). Eine Ansicht, die sich verändert, ohne die richtige
  Abfrage zu stellen, hat nichts gezeigt.

Die Screenshots für den PR entstehen aus demselben Lauf — ein kurzes Skript
gegen `npm run preview` genügt, siehe `docs/screenshots/`.
