import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useFilters } from '../../context/FilterContext';
import { useItems } from '../../hooks/useItems';
import { transformItems, sortItems } from '../../utils/dataTransformers';
import { formatPercentage } from '../../utils/formatters';
import Card from '../common/Card';
import LoadingSkeleton from '../common/LoadingSkeleton';
import ErrorMessage from '../common/ErrorMessage';

const ItemStatisticsChart = ({ level, id }) => {
  const { buildQueryParams } = useFilters();
  const { data, loading, error, refetch } = useItems(level, id, buildQueryParams());

  if (loading) {
    return (
      <Card title="Item-Statistiken">
        <LoadingSkeleton height="600px" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Item-Statistiken">
        <ErrorMessage error={error} retry={refetch} />
      </Card>
    );
  }

  // Handle array response (multiple domains)
  let allItems = [];
  if (Array.isArray(data)) {
    // Flatten items from all domains
    data.forEach((domain) => {
      if (domain.items && Array.isArray(domain.items)) {
        allItems = allItems.concat(domain.items);
      }
    });
  } else if (data?.items) {
    allItems = data.items;
  }

  if (allItems.length === 0) {
    return (
      <Card title="Item-Statistiken">
        <div className="text-gray-500 text-center py-8">
          Keine Item-Daten verfügbar
        </div>
      </Card>
    );
  }

  const sortedItems = sortItems(allItems);
  const chartData = transformItems(sortedItems);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-sm">
          <p className="font-semibold text-gray-900 mb-2">{item.id}</p>
          <p className="text-sm text-gray-600 mb-1">
            Lösungshäufigkeit: <span className="font-medium">{formatPercentage(item.solutionFrequency)}</span>
          </p>
          {item.exerciseId && item.exerciseId !== 'unknown' && (
            <p className="text-sm text-gray-600 mb-1">
              Aufgabe: <span className="font-mono text-xs">{item.exerciseId}</span>
            </p>
          )}
          {item.competenceLevel && (
            <p className="text-sm text-gray-600">
              Kompetenzstufe: <span className="font-medium">{item.competenceLevel}</span>
            </p>
          )}
          {item.metadata && Object.keys(item.metadata).length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-1">IQB Metadaten:</p>
              {Object.entries(item.metadata).map(([key, value]) => (
                <p key={key} className="text-xs text-gray-500">
                  {key}: {JSON.stringify(value)}
                </p>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Calculate height based on number of items
  const chartHeight = Math.max(600, chartData.length * 30);

  return (
    <Card title="Item-Statistiken">
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Zeigt die Lösungshäufigkeit für jedes Item an. Bewegen Sie den Mauszeiger über einen Balken, um Details zu sehen.
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Anzahl Items: <span className="font-medium">{chartData.length}</span>
        </p>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: '800px' }}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              type="number"
              domain={[0, 1]}
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              stroke="#6b7280"
            />
            <YAxis
              type="category"
              dataKey="id"
              width={90}
              stroke="#6b7280"
              tick={{ fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="solutionFrequency" fill="#2563eb" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ItemStatisticsChart;
