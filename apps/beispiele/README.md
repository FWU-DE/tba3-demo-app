# Rückmeldungsbeispiele

Platzhalter für die vollständigen Rückmeldungsbeispiele — die Beispiele selbst folgen noch.

Was hier liegt, wird von `tools/build-site.mjs` unverändert nach `dist/beispiele/`
kopiert und ist dann unter `/beispiele` erreichbar; `README.md` wird dabei ausgelassen.
Solange der Ordner nur diese Datei enthält, entsteht kein Bereich im Deployment.

Sobald die Beispiele da sind:

1. Inhalte hier ablegen (statisches HTML genügt; wird es eine eigene App, kommt sie
   als Workspace `@tba3/beispiele` in die Root-`package.json` und baut nach
   `apps/beispiele/dist` — dann in `tools/build-site.mjs` die Quelle entsprechend
   umstellen).
2. Im Portal (`apps/portal/index.html`) die Karte „Rückmeldungsbeispiele“ von
   `<div class="karte bald">` auf `<a class="karte" href="/beispiele">` umstellen und
   das Schild „in Vorbereitung“ entfernen.
3. Bei eigenem Routing den SPA-Fallback `/beispiele/:path*` in `vercel.json` ergänzen.
