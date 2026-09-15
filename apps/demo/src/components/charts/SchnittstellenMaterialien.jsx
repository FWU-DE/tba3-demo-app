import { useMemo } from 'react';
import { useMaterialien } from '../../hooks/useMaterialien';
import { nachScope } from '../../utils/materialien';
import { useTexte } from '../../i18n';
import HtmlText from '../../i18n/HtmlText';
import Card from '../common/Card';
import LoadingSkeleton from '../common/LoadingSkeleton';
import ErrorMessage from '../common/ErrorMessage';
import AutoZuweisung from './AutoZuweisung';

// Die Farbe sagt die Art, nicht die Wichtigkeit — deshalb durchweg gedeckte
// Töne und kein Rot, das nach Fehler aussähe.
const ART_FARBEN = {
  support: 'bg-green-100 text-green-700',
  diagnostic: 'bg-orange-100 text-orange-700',
  solution: 'bg-blue-100 text-blue-700',
  didactic: 'bg-purple-100 text-purple-700',
  'anchor-text': 'bg-teal-100 text-teal-700',
  info: 'bg-gray-100 text-gray-600',
  video: 'bg-indigo-100 text-indigo-700',
  audio: 'bg-amber-100 text-amber-700',
  transcript: 'bg-cyan-100 text-cyan-700',
  example: 'bg-violet-100 text-violet-700',
  other: 'bg-gray-100 text-gray-500',
};

const Abzeichen = ({ children, klasse = 'bg-gray-100 text-gray-500' }) => (
  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${klasse}`}>{children}</span>
);

/**
 * Ein Material, wie die Schnittstelle es liefert.
 *
 * Gezeigt wird, was ein Mensch zum Einordnen braucht: Titel, Beschreibung, die
 * Art, die Zielgruppe und — wenn der Anhang einen Namen trägt — woran es hängt.
 * Übersetzt sind nur die Vokabeln des Entwurfs; Titel und Beschreibung kommen
 * aus der Schnittstelle und bleiben, wie sie dort stehen.
 */
const MaterialKarte = ({ material }) => {
  const t = useTexte();
  const anhang = material.attachments?.[0];
  const art = material.kind ?? 'other';

  return (
    <div
      data-testid={`schnittstellen-material-${material.id}`}
      className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-medium text-gray-900 text-sm leading-snug flex-1">{material.title}</p>
        {material.source && (
          <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">{material.source}</span>
        )}
      </div>

      {material.description && (
        <p className="text-xs text-gray-500 mb-2 leading-relaxed">{material.description}</p>
      )}

      <div className="flex flex-wrap gap-1.5 mt-2">
        <Abzeichen klasse={ART_FARBEN[art] ?? ART_FARBEN.other}>{t(`materialien.art.${art}`)}</Abzeichen>
        {material.audience && <Abzeichen>{t(`materialien.zielgruppe.${material.audience}`)}</Abzeichen>}
        {anhang?.refName && <Abzeichen>{anhang.refName}</Abzeichen>}
      </div>

      {material.url && (
        <a
          href={material.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-xs text-blue-600 hover:underline truncate"
        >
          {material.url}
        </a>
      )}
    </div>
  );
};

/**
 * Die Materialien aus `/materials`, gruppiert nach ihrer Zuordnungsart.
 *
 * Der lokale Pool nebenan kennt nur „passt zur Stufe". Der Entwurf kennt sechs
 * Arten, und erst nebeneinander wird sichtbar, was das austrägt: eine
 * Musterlösung zu einem einzelnen Item steht neben einem Elternbrief, der an
 * nichts hängt. Deshalb die Gruppierung — sie ist hier der eigentliche Inhalt.
 */
const SchnittstellenMaterialien = ({ onZuweisen }) => {
  const t = useTexte();
  const { data, loading, error } = useMaterialien();

  const gruppen = useMemo(() => nachScope(data ?? []), [data]);

  if (error) return <ErrorMessage error={error} />;
  if (loading) return <LoadingSkeleton height="240px" />;

  return (
    <div className="space-y-6" data-testid="schnittstellen-materialien">
      <HtmlText pfad="materialien.schnittstelleEinleitung" className="text-sm text-gray-500" />

      <AutoZuweisung materialien={data ?? []} onZuweisen={onZuweisen} />

      {gruppen.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-500">{t('materialien.schnittstelleLeer')}</p>
        </Card>
      ) : (
        gruppen.map(({ scope, materialien }) => (
          <Card key={scope} testid={`schnittstellen-scope-${scope}`}>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="font-semibold text-gray-800 text-base">{t(`materialien.scope.${scope}`)}</h3>
              <Abzeichen>
                {t(
                  materialien.length === 1 ? 'materialien.scopeAnzahlEines' : 'materialien.scopeAnzahl',
                  { n: materialien.length },
                )}
              </Abzeichen>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {materialien.map((m) => (
                <MaterialKarte key={m.id} material={m} />
              ))}
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default SchnittstellenMaterialien;
