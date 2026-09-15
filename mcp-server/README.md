# TBA3-MCP-Server

Ein MCP-Server, der die Daten der TBA3-Auswertungsschnittstelle als Werkzeuge
anbietet: Kompetenzstufen, Aggregationen und Aufgabenstatistiken lassen sich
damit aus Claude Code, Cursor oder jedem anderen MCP-Client abfragen, ohne
vorher zu wissen, welche Gruppen und Schulen es überhaupt gibt.

Das Paket ist **bewusst kein npm-Workspace** des Repositoriums: eigener
Lockfile, eigener Docker-Kontext. Wer den Server einsetzt, soll nicht die
Abhängigkeiten der Demoanwendung mitschleppen.

## Starten

```bash
cd mcp-server && npm install

npm start    # stdio  — für MCP-Clients, die einen Prozess starten
npm run serve  # HTTP — Streamable HTTP auf PORT (Vorgabe 3000), Endpunkt POST /mcp
```

Der Server holt seine Daten über HTTP von einer TBA3-Schnittstelle. Im
einfachsten Fall ist das der Mock dieses Repositoriums:

```bash
npm run mock   # im Wurzelverzeichnis → http://localhost:8000
```

| Variable | Bedeutung | Vorgabe |
|---|---|---|
| `TBA3_API_BASE_URL` | Basis-URL der Schnittstelle | `http://localhost:8000` |
| `PORT` | Port des HTTP-Betriebs | `3000` |

## Werkzeuge

Vier Werkzeuge beantworten „was gibt es?", drei „wie sieht es aus?". Die
Trennung ist Absicht: ein Modell, das `tba3_get_competence_levels` aufruft,
braucht vorher eine gültige Id, und die soll es sich holen können, statt sie zu
raten.

| Werkzeug | Beschreibung |
|---|---|
| `tba3_list_entities` | Lerngruppen, Schulen oder Bundesländer auflisten (`entityType`: `group` \| `school` \| `state`), optional nach `subject`, `grade` oder Schulart gefiltert. |
| `tba3_list_subjects` | Die Fächer mit Code und Name (DE, MA, EN, FR). |
| `tba3_list_grades` | Die Jahrgangsstufen (Klasse 3, Klasse 8). |
| `tba3_list_materials` | Lernmaterialien aus dem Demokatalog, filterbar nach `source`, `subject`, `grade`, `type` und `targetLevel`. |
| `tba3_get_competence_levels` | Kompetenzstufen I–V für eine Gruppe, Schule oder ein Bundesland. |
| `tba3_get_aggregations` | Aggregationen (Mittelwert, Häufigkeit …) derselben drei Ebenen. |
| `tba3_get_items` | Aufgabenstatistiken (Lösungshäufigkeit …) derselben drei Ebenen. |

Die drei `get`-Werkzeuge nehmen zusätzlich `type`: `group`, `students` oder
`group,students` — ob die Antwort Gruppenwerte, Einzelwerte oder beides
enthalten soll.

Die Listen von Gruppen, Schulen, Fächern und Jahrgängen stehen in
`server-impl.js` fest. Das ist kein Versehen: sie beschreiben die Beispieldaten
des Mocks, und ein Werkzeug, das erst eine Anfrage stellen muss, um sagen zu
können, welche Anfragen möglich sind, hilft niemandem.

## Aufbau

```
index.js         stdio-Einstieg
server-http.js   HTTP-Einstieg (Streamable HTTP, POST /mcp)
server-impl.js   die Werkzeuge — beide Einstiege benutzen dieselben
Dockerfile       Abbild für den HTTP-Betrieb
```

## Einbinden

**Claude Code** — `claude mcp add tba3 -- node /pfad/zu/mcp-server/index.js`,
oder für den laufenden HTTP-Betrieb
`claude mcp add --transport http tba3 https://dein-host/mcp`.

**Cursor und andere Clients mit Konfigurationsdatei:**

```json
{
  "mcpServers": {
    "tba3-results": {
      "command": "node",
      "args": ["/pfad/zu/mcp-server/index.js"],
      "env": { "TBA3_API_BASE_URL": "http://localhost:8000" }
    }
  }
}
```

## Deployment

`.github/workflows/docker.yml` baut im Auftrag `build-mcp` ein eigenes Abbild
neben dem der Demoanwendung — dieselbe Registry, Namenszusatz `-mcp`. Der
Container startet `server-http.js` auf Port 3000; `TBA3_API_BASE_URL` muss auf
eine erreichbare Schnittstelle zeigen.
