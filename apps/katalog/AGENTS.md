# AGENTS.md — TBA3 Komponentenbibliothek

Hinweise für die Arbeit in `apps/katalog`. Übergreifende Konventionen stehen in
[`../../CLAUDE.md`](../../CLAUDE.md).

---

## Überblick

Vue 3 + Vite. Zeigt die wiederverwendbaren SVG-Visualisierungen für
VERA-Auswertungsdaten, jede mit Einsatzzweck, genutztem Endpunkt und Quelltext.
Ausgeliefert wird die Bibliothek unter `/katalog` (`base: '/katalog/'`), Routing
über Hash-History — Deep Links funktionieren damit ohne Server-Regeln.

```bash
npm run dev:katalog   # aus dem Repository-Wurzelverzeichnis → http://localhost:5174/katalog/
npm run build         # baut alles nach dist/
```

---

## TBA3 API

### Spezifikation

- **Raw YAML:** `https://raw.githubusercontent.com/indibit-eu/tba3/refs/heads/main/tba3-spec.yml`
- **Gerenderte Referenz:** `/schnittstelle` im eigenen Deployment

Die drei Endpunkt-Gruppen:

| Prefix | Beschreibung |
|---|---|
| `/groups/{id}/…` | Lerngruppen-Ebene (items, competence-levels, …) |
| `/schools/{id}/…` | Schul-Aggregate |
| `/states/{id}/…` | Land-Aggregate |

### Backend

Alle Ansichten werden vom eigenen Mock bedient — lokal `npm run mock` (Port 8000),
im Deployment die Vercel-Funktion in `api/`. Die Beispieldaten stammen einmalig
vom Referenzserver `https://apps.indibit.eu/tba3-api` und liegen in
`data/fixtures.mjs` (`npm run fixtures:update`).

Die Basis-URL kommt aus `VITE_API_BASE_URL` (`axios.defaults.baseURL` in
`src/main.js`); leer heißt „gleicher Host", dann greifen Proxy bzw. Rewrites.

```bash
npm run mock          # aus dem Repository-Wurzelverzeichnis
npm run dev:katalog
```

---

## Eine Komponente hinzufügen

1. Komponente in `src/components/` anlegen.
2. Ansicht in `src/views/` ergänzen und in `src/router/index.js` registrieren.
3. Eintrag in `src/views/IndexView.vue` ergänzen — inklusive Vorschau-SVG,
   Einsatzzwecken und genutztem Endpunkt.
4. Neue Endpunkte in `vite.config.js` **und** in der Root-`vercel.json` proxien.
5. `npm run build` im Wurzelverzeichnis muss durchlaufen.
