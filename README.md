# TBA3

Alles zur TBA3-Auswertungsschnittstelle an einem Ort: die Demoanwendung, die
Komponentenbibliothek, die API-Referenz — und künftig die vollständigen
Rückmeldungsbeispiele. Ein Repository, ein Deployment, eine URL.

| Pfad | Bereich | Stack |
|---|---|---|
| `/` | Portal — Einstieg und Wegweiser | statisches HTML |
| `/demo` | Demoanwendung: Filter, Kompetenzstufen, Schülerdetails, Export | React 19 + Recharts + Tailwind |
| `/katalog` | Komponentenbibliothek: die Visualisierungen einzeln, mit Einsatzzweck und Quelltext | Vue 3 + PrimeVue |
| `/schnittstelle` | API-Referenz, Endpunkte direkt ausprobierbar | Swagger UI |
| `/beispiele` | Rückmeldungsbeispiele | folgt |

## Struktur

```
apps/
├── portal/        Startseite und API-Referenz (statisch, kein Build)
├── demo/          Demoanwendung        → Workspace @tba3/demo
├── katalog/       Komponentenbibliothek → Workspace @tba3/katalog
└── beispiele/     Rückmeldungsbeispiele (Platzhalter)
mcp-server/        MCP-Server zur Demoanwendung (eigenes Paket, kein Workspace)
tools/
├── build-site.mjs Setzt die App-Builds zu dist/ zusammen
└── serve-site.mjs Liefert dist/ lokal aus wie das Deployment
```

## Entwicklung

```bash
npm install            # installiert alle Workspaces

npm run dev:demo       # Demoanwendung      → http://localhost:5173/demo/
npm run dev:katalog    # Komponentenkatalog → http://localhost:5174/katalog/

npm run build          # baut alle Bereiche nach dist/
npm run preview        # liefert dist/ aus  → http://localhost:4173
npm run lint           # ESLint über die Demoanwendung
```

Beide Dev-Server erwarten den TBA3-Mock-Server auf `http://localhost:8000` und
leiten `/groups`, `/schools` und `/states` dorthin weiter. Quelle und Anleitung:
[indibit-eu/tba3 → mock-server](https://github.com/indibit-eu/tba3/tree/main/mock-server).
`npm run preview` fragt stattdessen das öffentliche Referenz-Backend ab
(über `TBA3_API_BASE_URL` umstellbar).

## Schnittstelle

Spezifikation, Konzeptdokumentation und Mock-Server leben in
[indibit-eu/tba3](https://github.com/indibit-eu/tba3). Die Spezifikation liegt hier
als Kopie unter `apps/portal/schnittstelle/tba3-spec.yml` — die Referenz hängt damit
an nichts Externem. Auf neuen Stand bringen:

```bash
npm run spec:update     # holt tba3-spec.yml, danach git diff prüfen und mit committen
```

In der Referenz fragt „Try it out“ über den eigenen Host ab; `/groups`, `/schools`
und `/states` werden von dort zum Backend weitergereicht, deshalb ohne CORS-Umwege
und mit denselben Demodaten wie in den übrigen Bereichen.

Backend aller Ansichten: `https://apps.indibit.eu/tba3-api`.

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
- [`CLAUDE.md`](CLAUDE.md) — Konventionen und Task-Workflow
