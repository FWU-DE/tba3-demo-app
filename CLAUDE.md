# CLAUDE.md — TBA3

## Commands

Alle Kommandos im Repository-Wurzelverzeichnis (npm workspaces):

```bash
npm install            # alle Workspaces
npm run dev:demo       # Demoanwendung      → http://localhost:5173/demo/
npm run dev:katalog    # Komponentenkatalog → http://localhost:5174/katalog/
npm run build          # alle Bereiche → dist/
npm run preview        # dist/ ausliefern wie im Deployment → http://localhost:4173
npm run lint           # ESLint über apps/demo
```

**CI check (run before every commit):**
```bash
npm run build
```

`npm run lint` meldet Altlasten aus `apps/demo` (React-Hook-Regeln, unbenutzte
Variablen). Neue Dateien müssen sauber sein — den Bestand nicht nebenbei mit
umbauen.

## Architektur

Monorepo mit vier Bereichen, die zu **einem** Deployment zusammengesetzt werden.

```
apps/portal/        Startseite (/) und API-Referenz (/schnittstelle) — statisches HTML
apps/demo/          React 19 + Vite, ausgeliefert unter /demo      (@tba3/demo)
apps/katalog/       Vue 3 + PrimeVue + Vite, unter /katalog        (@tba3/katalog)
apps/beispiele/     Rückmeldungsbeispiele — Platzhalter, siehe README dort
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

| Umgebung | Weg |
|---|---|
| Dev | Vite-Proxy je App → `http://localhost:8000` |
| Vercel | Rewrites in `vercel.json` → `apps.indibit.eu/tba3-api` |
| Docker | nginx (`nginx.conf`) → `/tba3-api` extern, `/groups…` lokaler Mock |
| Preview | `tools/serve-site.mjs` → `TBA3_API_BASE_URL` |

Die API-Basis kommt in beiden Apps aus `VITE_API_BASE_URL` (Demo:
`src/services/tba3Api.js`, Katalog: `axios.defaults.baseURL` in `src/main.js`);
leer bedeutet „gleicher Host".

Die OpenAPI-Spezifikation wird nicht eingecheckt: `/tba3-spec.yml` wird auf
`raw.githubusercontent.com/indibit-eu/tba3` umgeschrieben, damit die Referenz
unter `/schnittstelle` nicht driftet.

## Konventionen

- Neue UI-Komponenten bekommen `data-testid`-Attribute.
- API-Aufrufe der Demo laufen über `apps/demo/src/services/tba3Api.js` — kein
  direktes `fetch`/`axios` in Komponenten.
- Globaler Zustand der Demo lebt in `FilterContext`; neue globale
  State-Lösungen nur mit ADR.
- Keine Kaskaden-Operationen — Seiteneffekte explizit halten.
- Redoc kommt aus `node_modules` und wird beim Build kopiert, nicht von einem
  CDN geladen — das Deployment soll nicht an fremder Infrastruktur hängen.

## Task Workflow

Task-Tickets liegen in `docs/tasks/todo/{slug}.md`. Eine neue Datei dort löst
über GitHub Actions den Claude-Code-Agenten aus. Vollständiger Ablauf:
`skills/ai-first-webapp-gitops/01-requirements.md` (Repository FWU-DE/skills).
