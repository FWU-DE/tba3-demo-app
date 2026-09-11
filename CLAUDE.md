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
npm run lint           # ESLint über apps/demo
```

**CI check (run before every commit):**
```bash
npm run lint && npm run build
```

Beides läuft ohne Befund; bitte sauber halten.

## Architektur

Monorepo mit vier Bereichen, die zu **einem** Deployment zusammengesetzt werden.

```
apps/portal/        Startseite (/) und API-Referenz (/schnittstelle) — statisches HTML
apps/demo/          React 19 + Vite, ausgeliefert unter /demo      (@tba3/demo)
apps/katalog/       Vue 3 + PrimeVue + Vite, unter /katalog        (@tba3/katalog)
apps/beispiele/     Rückmeldungsbeispiele — Platzhalter, siehe README dort
api/                Eigener TBA3-Mock als Vercel-Funktion
data/fixtures.mjs   Beispieldaten, gepackt (npm run fixtures:update)
mcp-server/         MCP-Server (eigenes Paket, bewusst kein Workspace:
                    eigener Lockfile, eigener Docker-Kontext)
tools/build-site.mjs   dist/ = portal + demo/ + katalog/ + schnittstelle/
tools/serve-site.mjs   lokaler Server, der die Deployment-Rewrites nachbildet
```

Wer einen Bereich hinzufügt, fasst drei Stellen an: `tools/build-site.mjs`
(Zusammenbau), `vercel.json` und `nginx.conf` (Fallback), `apps/portal/index.html`
(Verlinkung).

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

Die OpenAPI-Spezifikation liegt als Kopie unter
`apps/portal/schnittstelle/tba3-spec.yml` und wird mit `npm run spec:update` aus
`indibit-eu/tba3` nachgezogen — bewusst eingecheckt, damit die Referenz an nichts
Externem hängt. In der Referenz schreibt ein `requestInterceptor` Anfragen auf den
eigenen Host um, sodass „Try it out“ ohne CORS gegen dieselben Demodaten läuft.

## Konventionen

- Neue UI-Komponenten bekommen `data-testid`-Attribute.
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
