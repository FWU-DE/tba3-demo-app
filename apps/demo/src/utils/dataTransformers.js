import { COMPETENCE_LEVELS } from './constants';

/**
 * Transform competence levels data for Recharts
 * @param {Array|Object} data - API response data (array of domains or single object)
 * @returns {Array} Transformed data for stacked bar chart
 */
export const transformCompetenceLevels = (data) => {
  // Handle array response (multiple domains)
  if (Array.isArray(data)) {
    // Aggregate all competence levels across all domains
    const aggregated = {};
    let totalStudents = 0;

    data.forEach((domain) => {
      if (domain.competenceLevels) {
        domain.competenceLevels.forEach((level) => {
          const key = level.nameShort;
          const freq = level.descriptiveStatistics?.frequency || 0;
          aggregated[key] = (aggregated[key] || 0) + freq;
          totalStudents += freq;
        });
      }
    });

    // Convert to array format for chart
    return Object.entries(aggregated).map(([level, count]) => ({
      level,
      count,
      percentage: totalStudents > 0 ? count / totalStudents : 0,
      color: COMPETENCE_LEVELS[level]?.color || '#gray',
      name: COMPETENCE_LEVELS[level]?.name || level,
    }));
  }

  // Handle old format (fallback)
  if (!data?.competence_levels) return [];

  const levels = data.competence_levels;
  const total = Object.values(levels).reduce((sum, val) => sum + val, 0);

  return Object.entries(levels).map(([level, count]) => ({
    level,
    count,
    percentage: total > 0 ? count / total : 0,
    color: COMPETENCE_LEVELS[level]?.color || '#gray',
    name: COMPETENCE_LEVELS[level]?.name || level,
  }));
};

/**
 * Group items by exercise
 * @param {Array} items - Array of item objects from API
 * @returns {Object} Items grouped by exercise ID
 */
export const groupItemsByExercise = (items) => {
  if (!Array.isArray(items)) return {};

  return items.reduce((acc, item) => {
    const exerciseId = item.metadata?.exercise_id || 'unknown';
    if (!acc[exerciseId]) {
      acc[exerciseId] = [];
    }
    acc[exerciseId].push(item);
    return acc;
  }, {});
};

/**
 * Transform items data for horizontal bar chart
 * @param {Array} items - Array of item objects from API
 * @returns {Array} Transformed data for Recharts
 */
export const transformItems = (items) => {
  if (!Array.isArray(items)) return [];

  return items.map((item) => ({
    id: item.iqbId || item.id || item.name,
    name: item.name || item.iqbId,
    solutionFrequency: item.descriptiveStatistics?.mean || item.solution_frequency || 0,
    solutionFrequencyPercentage: ((item.descriptiveStatistics?.mean || item.solution_frequency || 0) * 100),
    exerciseId: item.exercise?.name || item.metadata?.exercise_id || 'unknown',
    competenceLevel: item.parameters?.competenceLevel?.nameShort || item.metadata?.competence_level,
    metadata: item.parameters || item.metadata || {},
  }));
};

/**
 * Transform aggregation data for charts
 * @param {Object} data - API response data
 * @returns {Array} Transformed data for Recharts
 */
export const transformAggregations = (data) => {
  if (!data?.aggregations) return [];

  return Object.entries(data.aggregations).map(([key, value]) => ({
    name: key,
    value: value,
    displayValue: typeof value === 'number' ? value.toFixed(2) : value,
  }));
};

/**
 * Calculate summary statistics from competence levels
 * @param {Array|Object} data - Competence levels data
 * @returns {Object} Summary statistics
 */
export const calculateSummaryStats = (data) => {
  // Handle array response (multiple domains)
  if (Array.isArray(data)) {
    const aggregated = {};
    let total = 0;

    data.forEach((domain) => {
      if (domain.competenceLevels) {
        domain.competenceLevels.forEach((level) => {
          const key = level.nameShort;
          const freq = level.descriptiveStatistics?.frequency || 0;
          aggregated[key] = (aggregated[key] || 0) + freq;
          total += freq;
        });
      }
    });

    if (total === 0) return null;

    // Calculate weighted mean (I=1, II=2, III=3, IV=4, V=5)
    const weightedSum = Object.entries(aggregated).reduce((sum, [level, count]) => {
      const weight = ['I', 'II', 'III', 'IV', 'V'].indexOf(level) + 1;
      return sum + (weight * count);
    }, 0);

    const mean = total > 0 ? weightedSum / total : 0;

    return {
      total,
      mean,
      belowStandard: (aggregated.I || 0) / total,
      atStandard: ((aggregated.II || 0) + (aggregated.III || 0)) / total,
      aboveStandard: ((aggregated.IV || 0) + (aggregated.V || 0)) / total,
    };
  }

  // Handle old format (fallback)
  if (!data?.competence_levels) return null;

  const levels = data.competence_levels;
  const total = Object.values(levels).reduce((sum, val) => sum + val, 0);

  // Calculate weighted mean (I=1, II=2, III=3, IV=4, V=5)
  const weightedSum = Object.entries(levels).reduce((sum, [level, count]) => {
    const weight = ['I', 'II', 'III', 'IV', 'V'].indexOf(level) + 1;
    return sum + (weight * count);
  }, 0);

  const mean = total > 0 ? weightedSum / total : 0;

  return {
    total,
    mean,
    belowStandard: (levels.I || 0) / total,
    atStandard: ((levels.II || 0) + (levels.III || 0)) / total,
    aboveStandard: ((levels.IV || 0) + (levels.V || 0)) / total,
  };
};

/**
 * Sort items by exercise and position
 * @param {Array} items - Array of items
 * @returns {Array} Sorted items
 */
export const sortItems = (items) => {
  if (!Array.isArray(items)) return [];

  return [...items].sort((a, b) => {
    // First sort by exercise
    const exerciseA = a.exercise?.name || a.metadata?.exercise_id || '';
    const exerciseB = b.exercise?.name || b.metadata?.exercise_id || '';
    if (exerciseA !== exerciseB) {
      return exerciseA.localeCompare(exerciseB);
    }
    // Then sort by position or item id
    const posA = a.position || 0;
    const posB = b.position || 0;
    if (posA !== posB) {
      return posA - posB;
    }
    // Finally by ID
    const idA = a.iqbId || a.id || '';
    const idB = b.iqbId || b.id || '';
    return idA.localeCompare(idB);
  });
};
