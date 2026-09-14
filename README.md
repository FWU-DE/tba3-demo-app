# TBA3

Alles zur TBA3-Auswertungsschnittstelle an einem Ort: die Demoanwendung, die
Komponentenbibliothek, die API-Referenz — und künftig die vollständigen
Rückmeldungsbeispiele. Ein Repository, ein Deployment, eine URL.

| Pfad | Bereich | Stack |
|---|---|---|
| `/` | Portal — Einstieg und Wegweiser | statisches HTML |
| `/demo` | Demoanwendung: Filter, Kompetenzstufen, Schülerdetails, Export | React 19 + Recharts + Tailwind |
| `/katalog` | Komponentenbibliothek: die Visualisierungen einzeln, mit Einsatzzweck und Quelltext | Vue 3 + PrimeVue |
| `/schnittstelle` | API-Referenz (Auswertung und Materialien-Entwurf), ausprobierbar | Swagger UI |
| `/beispiele` | Rückmeldungsbeispiele | folgt |

## Struktur

```
apps/
├── portal/        Startseite und API-Referenz (statisch, kein Build)
├── demo/          Demoanwendung        → Workspace @tba3/demo
├── katalog/       Komponentenbibliothek → Workspace @tba3/katalog
├── beispiele/     Rückmeldungsbeispiele (Platzhalter)
└── shared/        Gemeinsame Navigationsleiste über allen Bereichen
api/               Eigener TBA3-Mock als Vercel-Funktion
data/fixtures.mjs  Die Beispieldaten (gepackt, erzeugt von tools/fetch-fixtures.mjs)
mcp-server/        MCP-Server zur Demoanwendung (eigenes Paket, kein Workspace)
tools/
├── build-site.mjs    Setzt die App-Builds zu dist/ zusammen
├── serve-site.mjs    Liefert dist/ lokal aus wie das Deployment
├── mock-server.mjs   Der Mock als eigenständiger Server (npm run mock, Docker)
├── mock.mjs          Nachschlage-Logik, von allen Mock-Varianten geteilt
├── fetch-fixtures.mjs Zieht die Beispieldaten vom Referenzserver ab
└── update-spec.mjs   Holt die OpenAPI-Spezifikation
```

## Entwicklung

```bash
npm install            # installiert alle Workspaces

npm run mock           # TBA3-Mock          → http://localhost:8000
npm run dev:demo       # Demoanwendung      → http://localhost:5173/demo/
npm run dev:katalog    # Komponentenkatalog → http://localhost:5174/katalog/

npm run build          # baut alle Bereiche nach dist/
npm run preview        # liefert dist/ aus  → http://localhost:4173
npm test               # Tests (Vitest)
npm run lint           # ESLint über die Demoanwendung
```

Beide Dev-Server leiten `/groups`, `/schools` und `/states` an
`http://localhost:8000` weiter — dort antwortet `npm run mock`. Ein Python-Setup
ist dafür nicht mehr nötig. `npm run preview` beantwortet dieselben Pfade direkt.

## Schnittstelle

Spezifikation, Konzeptdokumentation und Mock-Server leben in
[indibit-eu/tba3](https://github.com/indibit-eu/tba3). Die Spezifikation liegt hier
als Kopie unter `apps/portal/schnittstelle/tba3-spec.yml` — die Referenz hängt damit
an nichts Externem. Auf neuen Stand bringen:

```bash
npm run spec:update     # holt tba3-spec.yml, danach git diff prüfen und mit committen
```

Unter `/schnittstelle` liegen zwei Spezifikationen nebeneinander:

| Reiter | Inhalt | Pflege |
|---|---|---|
| Auswertung | die verabschiedete TBA3-Schnittstelle | `npm run spec:update` |
| Materialien | Entwurf für Begleitmaterialien aus [indibit-eu/tba3#54](https://github.com/indibit-eu/tba3/pull/54) | `npm run material-spec:update` |

Der Materialien-Entwurf liegt im Quell-Repository als Fragmente (Schemas, Pfad-Skizzen,
Beispiele) und wird von `tools/build-material-spec.mjs` zu einer eigenständigen Datei
zusammengesetzt; die mitgelieferten Beispiele werden dabei zu Mock-Antworten, sodass
`/materials` samt Filtern ausprobierbar ist. Solange der Pull Request offen ist, liest
das Skript aus dessen Branch.

In der Referenz fragt „Try it out“ über den eigenen Host ab; `/groups`, `/schools`
und `/states` werden von dort zum Backend weitergereicht, deshalb ohne CORS-Umwege
und mit denselben Demodaten wie in den übrigen Bereichen.

## Beispieldaten

Alle Bereiche werden vom **eigenen Mock** bedient — im Deployment durch die
Vercel-Funktion in `api/`, lokal durch `npm run mock` bzw. die Vorschau, im
Docker-Image durch `tools/mock-server.mjs`. Alle drei nutzen dieselben Daten
und dieselbe Logik (`tools/mock.mjs`).

Die Daten stammen einmalig vom Referenzserver `https://apps.indibit.eu/tba3-api`
und liegen gepackt in `data/fixtures.mjs` (157 Antworten, ~650 KB). Nachziehen:

```bash
npm run fixtures:update     # danach git diff --stat prüfen und mit committen
```

Ist eine Parameterkombination nicht hinterlegt, wird auf die allgemeinere
Antwort ausgewichen; der Antwortkopf `X-TBA3-Mock-Treffer` sagt, ob `genau`
oder `ersatz` geliefert wurde. Gegen das echte Backend testen:
`TBA3_API_BASE_URL=https://apps.indibit.eu/tba3-api npm run preview`.

## Deployment

**Vercel** — ein Projekt, Root des Repositories. `vercel.json` legt Build-Kommando,
Ausgabeverzeichnis und die Rewrites fest (API-Proxy, Spezifikation, SPA-Fallback
je Bereich).

**Docker** — `Dockerfile` baut dieselbe Site und liefert sie über nginx aus,
zusammen mit dem MCP-Server und einem lokalen Mock-API-Server. Der MCP-Server
wird zusätzlich als eigenes Image gebaut (`FWU-DE/tba3-demo-app-mcp`).

## Weitere Dokumentation

- [`apps/demo/README.md`](apps/demo/README.md) — Demoanwendung im Detail
- [`apps/katalog/AGENTS.md`](apps/katalog/AGENTS.md) — Komponentenbibliothek
- [`apps/beispiele/README.md`](apps/beispiele/README.md) — wie die Beispiele eingehängt werden
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — der Weg einer Änderung: Ticket, Branch, Commit, PR
- [`CLAUDE.md`](CLAUDE.md) — Konventionen und Task-Workflow
- [`DEFINITION_OF_DONE.md`](DEFINITION_OF_DONE.md) — die Checkliste für jeden PR
