import { useMemo, useState } from 'react';
import { LEVEL_KEYS, zuordnungsplan } from '../../utils/materialien';
import { useTexte } from '../../i18n';
import HtmlText from '../../i18n/HtmlText';

/**
 * Weist Materialien der Schnittstelle anhand ihrer Anhänge den
 * Kompetenzstufen zu — mit Vorschau, nicht auf Zuruf.
 *
 * Die Vorschau ist der Punkt: die Zuordnung ist eine Behauptung über fremde
 * Metadaten, und wer sie übernimmt, soll vorher sehen, was dabei herauskommt
 * — einschließlich dessen, was die Anwendung *nicht* zuordnet.
 *
 * Gerechnet wird in `utils/materialien.js`; hier steht nur die Darstellung.
 */
const AutoZuweisung = ({ materialien, onZuweisen }) => {
  const t = useTexte();
  const [offen, setOffen] = useState(false);
  const [zugewiesen, setZugewiesen] = useState(null);

  const plan = useMemo(() => zuordnungsplan(materialien), [materialien]);

  const zeilen = [
    ...LEVEL_KEYS.map((stufe) => ({
      schluessel: stufe,
      ziel: t('materialien.autoStufe', { stufe }),
      materialien: plan.jeStufe[stufe],
      hervorgehoben: false,
    })),
    {
      schluessel: 'allgemein',
      ziel: t('materialien.autoAlleStufen'),
      materialien: plan.allgemein,
      hervorgehoben: true,
    },
  ];

  const anwenden = () => {
    onZuweisen(plan);
    setZugewiesen(plan.anzahl);
  };

  return (
    <div
      data-testid="auto-zuweisung"
      className="border border-blue-200 rounded-xl bg-blue-50/40 overflow-hidden"
    >
      <button
        data-testid="auto-zuweisung-aufklappen"
        onClick={() => setOffen((v) => !v)}
        aria-expanded={offen}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-blue-50 transition-colors"
      >
        <div className="flex-1">
          <p className="font-semibold text-gray-800 text-sm">{t('materialien.autoTitel')}</p>
          <p className="text-xs text-gray-500 mt-0.5">{t('materialien.autoUnterzeile')}</p>
        </div>
        {zugewiesen != null && (
          <span className="text-xs text-green-700 font-semibold mr-2" data-testid="auto-zuweisung-fertig">
            {t('materialien.autoFertig', { n: zugewiesen })}
          </span>
        )}
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ${offen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {offen && (
        <div className="px-5 pb-5 border-t border-blue-100 bg-white/70">
          <HtmlText pfad="materialien.autoErklaerung" className="text-xs text-gray-500 mt-4 mb-3" />

          <div className="rounded-lg border border-gray-200 overflow-x-auto mb-4">
            <table className="w-full text-sm" data-testid="auto-zuweisung-vorschau">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {t('materialien.autoZiel')}
                  </th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {t('materialien.autoMaterialien')}
                  </th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {t('materialien.autoAnzahl')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {zeilen.map(({ schluessel, ziel, materialien: liste, hervorgehoben }) => (
                  <tr
                    key={schluessel}
                    data-testid={`auto-zuweisung-zeile-${schluessel}`}
                    className={`border-b border-gray-100 last:border-0 ${hervorgehoben ? 'bg-blue-50/40' : ''}`}
                  >
                    <td className={`px-3 py-2 font-medium ${hervorgehoben ? 'text-blue-700' : 'text-gray-700'}`}>
                      {ziel}
                    </td>
                    <td className="px-3 py-2 text-gray-500 text-xs">
                      {liste.map((m) => m.title).join(', ') || '—'}
                    </td>
                    <td className={`px-3 py-2 text-right font-bold ${hervorgehoben ? 'text-blue-700' : 'text-gray-800'}`}>
                      {liste.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {plan.ohneStufe.length > 0 && (
            <p className="text-xs text-gray-400 mb-4" data-testid="auto-zuweisung-offen">
              {t('materialien.autoOffen', { n: plan.ohneStufe.length })}
            </p>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <button
              data-testid="auto-zuweisung-anwenden"
              onClick={anwenden}
              disabled={plan.anzahl === 0}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                plan.anzahl > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {plan.anzahl === 0
                ? t('materialien.autoNichts')
                : t(plan.anzahl === 1 ? 'materialien.autoKnopfEines' : 'materialien.autoKnopf', {
                    n: plan.anzahl,
                  })}
            </button>
            <button onClick={() => setOffen(false)} className="text-sm text-gray-400 hover:text-gray-600">
              {t('materialien.autoSchliessen')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoZuweisung;
