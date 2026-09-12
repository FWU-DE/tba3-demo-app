import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useFilters } from '../../context/useFilters';
import { useCompetenceLevels } from '../../hooks/useCompetenceLevels';
import { transformCompetenceLevels, calculateSummaryStats } from '../../utils/dataTransformers';
import { formatPercentage } from '../../utils/formatters';
import Card from '../common/Card';
import LoadingSkeleton from '../common/LoadingSkeleton';
import ErrorMessage from '../common/ErrorMessage';
import { useKonstanten, useTexte } from '../../i18n';

// Auf Modulebene, nicht im Render: sonst entsteht bei jedem Durchlauf eine
// neue Komponente und Recharts hängt den Tooltip jedes Mal neu ein.
const CustomTooltip = ({ active, payload }) => {
  const t = useTexte();
  if (active && payload && payload.length) {
  const item = payload[0].payload;
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{item.name}</p>
        <p className="text-sm text-gray-600">
          {t('kompetenzstufenDiagramm.anzahl')}: <span className="font-medium">{item.count}</span>
        </p>
        <p className="text-sm text-gray-600">
          {t('kompetenzstufenDiagramm.anteil')}: <span className="font-medium">{formatPercentage(item.percentage)}</span>
        </p>
      </div>
    );
  }
  return null;
};

const CompetenceLevelsChart = ({ level, id }) => {
  const t = useTexte();
  const { COMPETENCE_LEVELS } = useKonstanten();
  const { buildQueryParams } = useFilters();
  const { data, loading, error, refetch } = useCompetenceLevels(level, id, buildQueryParams());

  if (loading) {
    return (
      <Card title={t('kompetenzstufenDiagramm.titel')}>
        <LoadingSkeleton height="400px" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={t('kompetenzstufenDiagramm.titel')}>
        <ErrorMessage error={error} retry={refetch} />
      </Card>
    );
  }

  if (!data) {
    return (
      <Card title={t('kompetenzstufenDiagramm.titel')}>
        <div className="text-gray-500 text-center py-8">
          {t('kompetenzstufenDiagramm.keineDaten')}
        </div>
      </Card>
    );
  }

  const chartData = transformCompetenceLevels(data);
  const stats = calculateSummaryStats(data);

  return (
    <Card title={t('kompetenzstufenDiagramm.titel')}>
      {/* Summary Statistics */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">{t('kompetenzstufenDiagramm.gesamt')}</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.total}
            </div>
            <div className="text-xs text-gray-500">{t('kompetenzstufenDiagramm.schuelerinnen')}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-sm text-red-600">{t('kompetenzstufenDiagramm.unterStandard')}</div>
            <div className="text-2xl font-bold text-red-900">
              {formatPercentage(stats.belowStandard)}
            </div>
            <div className="text-xs text-red-500">{t('kompetenzstufenDiagramm.stufeI')}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-green-600">{t('kompetenzstufenDiagramm.ueberStandard')}</div>
            <div className="text-2xl font-bold text-green-900">
              {formatPercentage(stats.aboveStandard)}
            </div>
            <div className="text-xs text-green-500">{t('kompetenzstufenDiagramm.stufeIVundV')}</div>
          </div>
        </div>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="level" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value, entry) => {
              const level = entry.payload.level;
              return COMPETENCE_LEVELS[level]?.name || level;
            }}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend with descriptions */}
      <div className="mt-6 grid grid-cols-5 gap-3">
        {Object.values(COMPETENCE_LEVELS).map((level) => (
          <div key={level.level} className="flex items-start space-x-2">
            <div
              className="w-4 h-4 rounded mt-0.5 flex-shrink-0"
              style={{ backgroundColor: level.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-900">{level.name}</div>
              <div className="text-xs text-gray-500">{level.description}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default CompetenceLevelsChart;
