// Ist unter dieser Adresse ein MCP-Server erreichbar?
//
// Die Demoanwendung läuft an zwei Orten: im Docker-Abbild leitet nginx /mcp an
// den MCP-Server weiter, auf der öffentlichen Seite (Vercel) gibt es ihn nicht.
// Der Hilfe-Reiter zeigt die Adresse nur, wenn dort tatsächlich jemand
// antwortet — eine Konfiguration zum Abschreiben, die ins Leere führt, wäre
// schlimmer als keine.
//
// Ein GET ohne Sitzung beantwortet ein MCP-Server mit 400 oder 405, nicht mit
// 404. 404 und Netzfehler heißen: hier nicht. Ebenso eine HTML-Seite — ein
// Fallback, der auf jede unbekannte Adresse die Startseite liefert (so die
// lokale Vorschau), ist kein Server.

export async function mcpErreichbar(url, { signal } = {}) {
  try {
    const antwort = await fetch(url, { method: 'GET', headers: { Accept: 'text/event-stream' }, signal });
    if (antwort.status === 404) return false;
    return !(antwort.headers.get('content-type') ?? '').includes('text/html');
  } catch {
    return false;
  }
}
