import { useMemo } from 'react';
import { useMaterials } from '../../hooks/useMaterials';
import { SCOPE_LABELS, SCOPE_ICONS, SCOPE_ORDER, KIND_LABELS } from '../../data/demoMaterials';
import AutoAssignModule from './AutoAssignModule';
import Card from '../common/Card';

const KIND_COLORS = {
  support: 'bg-green-100 text-green-700',
  diagnostic: 'bg-orange-100 text-orange-700',
  solution: 'bg-blue-100 text-blue-700',
  didactic: 'bg-purple-100 text-purple-700',
  'anchor-text': 'bg-teal-100 text-teal-700',
  info: 'bg-gray-100 text-gray-600',
  video: 'bg-red-100 text-red-700',
  audio: 'bg-yellow-100 text-yellow-700',
  transcript: 'bg-cyan-100 text-cyan-700',
  example: 'bg-indigo-100 text-indigo-700',
  other: 'bg-gray-100 text-gray-500',
};

const AUDIENCE_LABELS = { teacher: 'Lehrkraft', student: 'Schüler*in', parents: 'Eltern', other: 'Sonstige' };
const AUDIENCE_COLORS = { teacher: 'bg-gray-100 text-gray-600', student: 'bg-blue-100 text-blue-600', parents: 'bg-green-100 text-green-700', other: 'bg-gray-100 text-gray-500' };

const ApiMaterialCard = ({ material }) => {
  const att = material.attachments?.[0];
  const kindColor = KIND_COLORS[material.kind] || KIND_COLORS.other;
  const audColor = material.audience ? (AUDIENCE_COLORS[material.audience] || AUDIENCE_COLORS.other) : null;

  return (
    <div data-testid="api-material-card" className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-medium text-gray-900 text-sm leading-snug flex-1">{material.title}</p>
        {material.source && (
          <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">{material.source}</span>
        )}
      </div>

      {material.description && (
        <p className="text-xs text-gray-500 mb-2 leading-relaxed line-clamp-2">{material.description}</p>
      )}

      {material.content && (
        <p className="text-xs text-gray-500 mb-2 leading-relaxed italic line-clamp-2">{material.content}</p>
      )}

      <div className="flex flex-wrap gap-1.5 mt-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${kindColor}`}>
          {KIND_LABELS[material.kind] || material.kind}
        </span>
        {material.audience && audColor && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${audColor}`}>
            {AUDIENCE_LABELS[material.audience] || material.audience}
          </span>
        )}
        {att?.refName && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            {att.refName}
          </span>
        )}
        {material.duration && (
          <span className="text-xs text-gray-400 ml-auto">⏱ {Math.round(material.duration / 60)} min</span>
        )}
      </div>

      {material.url && (
        <a
          href={material.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-xs text-blue-500 hover:underline truncate"
        >
          {material.url}
        </a>
      )}
    </div>
  );
};

const ApiMaterialsView = () => {
  const { data: materials, loading, isDemo } = useMaterials();

  const grouped = useMemo(() => {
    if (!materials) return {};
    const result = {};
    materials.forEach((m) => {
      const scope = m.attachments?.[0]?.scope || 'general';
      if (!result[scope]) result[scope] = [];
      result[scope].push(m);
    });
    return result;
  }, [materials]);

  if (loading) {
    return <div className="py-8 text-center text-gray-400 text-sm">Lade Materialien…</div>;
  }

  return (
    <div data-testid="api-materials-view" className="space-y-6">
      {/* Demo mode banner */}
      {isDemo && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-800">
          <span className="text-lg flex-shrink-0">🔌</span>
          <div>
            <span className="font-semibold">Demo-Modus</span>
            <span className="text-blue-600 ml-2">
              Materialien aus lokalem Demo-Datensatz (PR #54-Schema). In Produktion kommen diese Daten von{' '}
              <code className="bg-blue-100 px-1 rounded text-xs">/materials</code>.
            </span>
          </div>
        </div>
      )}

      {/* Auto-assign module */}
      <AutoAssignModule />

      {/* Materials grouped by scope */}
      {SCOPE_ORDER.map((scope) => {
        const items = grouped[scope];
        if (!items || items.length === 0) return null;
        return (
          <Card key={scope}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{SCOPE_ICONS[scope]}</span>
              <h3 className="font-bold text-gray-800 text-base">{SCOPE_LABELS[scope]}</h3>
              <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 font-medium">
                {items.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map((m) => (
                <ApiMaterialCard key={m.id} material={m} />
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ApiMaterialsView;
