# AGENTS.md — TBA3

Einstiegspunkt für Agenten, unabhängig vom Werkzeug. Drei Dateien, in dieser
Reihenfolge:

1. **[`CLAUDE.md`](CLAUDE.md)** — Architektur, Konventionen, bekannte Fallen.
   Vollständig lesen, bevor du etwas änderst.
2. **[`CONTRIBUTING.md`](CONTRIBUTING.md)** — der Weg einer Änderung: Ticket,
   Branch, Commit, Pull Request. Der Abschnitt „Für Agenten" nennt die Schleife,
   die Abbruchbedingungen und die Verbote.
3. **[`DEFINITION_OF_DONE.md`](DEFINITION_OF_DONE.md)** — die Checkliste, die in
   jeden PR-Body gehört.

Bereichsnahe Hinweise ergänzen das: [`apps/katalog/AGENTS.md`](apps/katalog/AGENTS.md),
[`apps/demo/README.md`](apps/demo/README.md),
[`packages/bausteine/README.md`](packages/bausteine/README.md).

Das Tor vor jedem Commit:

```bash
npm run lint && npm test && npm run build
```

Nicht mergen, nicht auf `main` pushen, bei Unklarheit fragen statt raten.
