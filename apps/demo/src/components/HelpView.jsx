import { useTexte } from '../i18n';
import HtmlText from '../i18n/HtmlText';

/**
 * Help / documentation view: MCP server connection and tools.
 * Shown in the "Hilfe" tab of the dashboard.
 *
 * Die Texte stehen zweisprachig in i18n/texte.js unter `hilfe`; Absätze mit
 * Auszeichnung kommen über <HtmlText>.
 */
const HelpView = () => {
  const t = useTexte();

  const mcpHttpUrl =
    import.meta.env.VITE_MCP_HTTP_URL ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/mcp`
      : 'https://ihr-mcp-server.example/mcp');

  const werkzeuge = [
    ['tba3_list_entities', 'hilfe.werkzeuge.listEntities'],
    ['tba3_list_subjects', 'hilfe.werkzeuge.listSubjects'],
    ['tba3_list_grades', 'hilfe.werkzeuge.listGrades'],
    ['tba3_get_competence_levels', 'hilfe.werkzeuge.competenceLevels'],
    ['tba3_get_aggregations', 'hilfe.werkzeuge.aggregations'],
    ['tba3_get_items', 'hilfe.werkzeuge.items'],
  ];

  return (
    <div className="space-y-8 max-w-3xl" data-testid="ansicht-hilfe">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">{t('hilfe.titel')}</h2>
        <HtmlText pfad="hilfe.einleitung" className="text-gray-600 text-sm" />
      </div>

      {/* Server: Docker */}
      <section className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">{t('hilfe.dockerTitel')}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{t('hilfe.dockerUnterzeile')}</p>
        </div>
        <div className="p-5 space-y-4 text-sm">
          <HtmlText pfad="hilfe.dockerAbsatz1" className="text-gray-700" />
          <HtmlText pfad="hilfe.dockerAbsatz2" className="text-gray-600" />
        </div>
      </section>

      {/* Client: nur URL eintragen */}
      <section className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">{t('hilfe.clientTitel')}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{t('hilfe.clientUnterzeile')}</p>
        </div>
        <div className="p-5 space-y-4 text-sm">
          <p className="text-gray-700">
            {t('hilfe.clientUrl')}{' '}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 break-all">{mcpHttpUrl}</code>
          </p>
          <p className="text-gray-700 font-medium">Cursor</p>
          <HtmlText pfad="hilfe.cursorText" className="text-gray-600" />
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
          <HtmlText pfad="hilfe.claudeText" className="text-gray-600" />
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
          <HtmlText pfad="hilfe.claudeHinweis" className="text-gray-500 text-xs mt-2" />
        </div>
      </section>

      {/* Tools */}
      <section className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">{t('hilfe.werkzeugeTitel')}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{t('hilfe.werkzeugeUnterzeile')}</p>
        </div>
        <div className="p-5 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 font-semibold text-gray-700">{t('hilfe.spalteTool')}</th>
                <th className="text-left py-2 font-semibold text-gray-700">{t('hilfe.spalteBeschreibung')}</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {werkzeuge.map(([name, pfad]) => (
                <tr key={name} className="border-b border-gray-100">
                  <td className="py-2.5 pr-4 font-mono text-xs text-primary">{name}</td>
                  <HtmlText als="td" pfad={pfad} className="py-2.5" />
                </tr>
              ))}
            </tbody>
          </table>
          <HtmlText pfad="hilfe.werkzeugeHinweis" className="text-xs text-gray-500 mt-3" />
        </div>
      </section>
    </div>
  );
};

export default HelpView;
