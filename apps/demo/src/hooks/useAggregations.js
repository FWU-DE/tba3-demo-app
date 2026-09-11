import { tba3Api } from '../services/tba3Api';
import { useApiDaten } from './useApiDaten';

const ABRUFE = {
  group: tba3Api.getGroupAggregations,
  school: tba3Api.getSchoolAggregations,
  state: tba3Api.getStateAggregations,
};

/**
 * Aggregierte Werte einer Ebene.
 *
 * @param {string} level - 'group', 'school' oder 'state'
 * @param {string} id - Id der Ebene
 * @param {Object} params - Abfrageparameter
 * @returns {Object} { data, loading, error, refetch }
 */
export const useAggregations = (level, id, params = {}) =>
  useApiDaten(ABRUFE, level, id, params);

export default useAggregations;
