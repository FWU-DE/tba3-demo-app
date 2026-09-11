/**
 * Help / documentation view: MCP server connection and tools.
 * Shown in the "Hilfe" tab of the dashboard.
 */
const HelpView = () => {
  const mcpHttpUrl =
    import.meta.env.VITE_MCP_HTTP_URL ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/mcp`
      : 'https://ihr-mcp-server.example/mcp');

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          MCP-Server für TBA3-Ergebnisdaten
        </h2>
        <p className="text-gray-600 text-sm">
          Der MCP-Server läuft <strong>auf dem Server in Docker</strong>. Lokal richten Sie nur die Verbindung ein – keine Installation, kein Projekt-Checkout nötig.
        </p>
      </div>

      {/* Server: Docker */}
      <section className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Auf dem Server: MCP-Server in Docker betreiben</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Container starten, Umgebungsvariable setzen – fertig.
          </p>
        </div>
        <div className="p-5 space-y-4 text-sm">
          <p className="text-gray-700">
            Der MCP-Server wird als eigenes Docker-Image (z. B. <code className="bg-gray-100 px-1 rounded">ghcr.io/…/…-mcp</code>) bereitgestellt. Auf dem Server Container starten und <strong>TBA3_API_BASE_URL</strong> auf die TBA3-API setzen (z. B. Ihre Mock- oder Backend-API). Der Endpunkt für Clients ist <code className="bg-gray-100 px-1 rounded">POST /mcp</code> (Streamable HTTP).
          </p>
          <p className="text-gray-600">
            Beispiel: <code className="bg-gray-100 px-1 rounded">docker run -e TBA3_API_BASE_URL=https://api.example.com -p 3000:3000 …-mcp</code>. Die URL, die Cursor/Claude brauchen, ist dann <code className="bg-gray-100 px-1 rounded">https://ihr-server/mcp</code> (je nach Reverse-Proxy/Ingress).
          </p>
        </div>
      </section>

      {/* Client: nur URL eintragen */}
      <section className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Lokal: In Cursor oder Claude verbinden</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Nur die Server-URL eintragen – kein Node, kein mcp-server-Checkout.
          </p>
        </div>
        <div className="p-5 space-y-4 text-sm">
          <p className="text-gray-700">
            MCP-Server-URL (von Ihrem Deployment): <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 break-all">{mcpHttpUrl}</code>
          </p>
          <p className="text-gray-700 font-medium">Cursor</p>
          <p className="text-gray-600">
            Einstellungen → MCP → „Add new MCP server“ → Typ <strong>Streamable HTTP</strong>, URL: die obige Adresse. Oder im Projekt <code className="bg-gray-100 px-1 rounded">.cursor/mcp.json</code> anlegen:
          </p>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto mt-2">
{`{
  "mcpServers": {
    "tba3-results": {
      "url": "${mcpHttpUrl}"
    }
  }
}`}
          </pre>
          <p className="text-gray-700 font-medium mt-4">Claude</p>
          <p className="text-gray-600">
            Konfigurationsdatei bearbeiten (Einstellungen → Developer → Edit Config): macOS <code className="bg-gray-100 px-1 rounded">~/Library/Application Support/Claude/claude_desktop_config.json</code>, Windows <code className="bg-gray-100 px-1 rounded">%APPDATA%\\Claude\\claude_desktop_config.json</code>. MCP-Server mit Typ <strong>sse</strong> und URL eintragen:
          </p>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto mt-2">
{`{
  "mcpServers": {
    "tba3-results": {
      "type": "sse",
      "url": "${mcpHttpUrl}"
    }
  }
}`}
          </pre>
          <p className="text-gray-500 text-xs mt-2">
            Wenn Ihre Claude-Version nur „command“-Server unterstützt, den MCP-Server lokal mit <code className="bg-gray-100 px-1 rounded">node mcp-server/index.js</code> starten und in der Config command/args verwenden (siehe Projekt-README).
          </p>
        </div>
      </section>

      {/* Tools */}
      <section className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Verfügbare Tools</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Diese Tools stehen dem Assistenten nach der Verbindung zur Verfügung.
          </p>
        </div>
        <div className="p-5 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 font-semibold text-gray-700">Tool</th>
                <th className="text-left py-2 font-semibold text-gray-700">Beschreibung</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              <tr className="border-b border-gray-100">
                <td className="py-2.5 pr-4 font-mono text-xs text-primary">tba3_list_entities</td>
                <td className="py-2.5">Schulen, Lerngruppen/Klassen oder Bundesländer mit id, name, ggf. Fach/Klasse/Schulart. Optional filtern: <code>subject</code>, <code>grade</code> (bei group), <code>type</code> (bei school).</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2.5 pr-4 font-mono text-xs text-primary">tba3_list_subjects</td>
                <td className="py-2.5">Liste der Fächer (code, name): Deutsch, Mathematik, Englisch, Französisch.</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2.5 pr-4 font-mono text-xs text-primary">tba3_list_grades</td>
                <td className="py-2.5">Jahrgangsstufen (Klasse 3, Klasse 8) mit code, name, description.</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2.5 pr-4 font-mono text-xs text-primary">tba3_get_competence_levels</td>
                <td className="py-2.5">Kompetenzstufen-Statistik (I–V) für eine Gruppe, Schule oder ein Land.</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2.5 pr-4 font-mono text-xs text-primary">tba3_get_aggregations</td>
                <td className="py-2.5">Aggregations-Statistiken (z. B. Mittelwert, Häufigkeit) für eine Einheit.</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2.5 pr-4 font-mono text-xs text-primary">tba3_get_items</td>
                <td className="py-2.5">Item-Statistiken (z. B. Lösungsquote) pro Gruppe/Schule/Land.</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-gray-500 mt-3">
            Bei den get-*-Tools kann optional <strong>type</strong> übergeben werden: <code>group</code>, <code>students</code> oder <code>group,students</code>.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HelpView;
