import { tba3Api } from '../services/tba3Api';
import { useApiDaten } from './useApiDaten';

const ABRUFE = {
  group: tba3Api.getGroupCompetenceLevels,
  school: tba3Api.getSchoolCompetenceLevels,
  state: tba3Api.getStateCompetenceLevels,
};

/**
 * Kompetenzstufen-Verteilung einer Ebene.
 *
 * @param {string} level - 'group', 'school' oder 'state'
 * @param {string} id - Id der Ebene
 * @param {Object} params - Abfrageparameter
 * @returns {Object} { data, loading, error, refetch }
 */
export const useCompetenceLevels = (level, id, params = {}) =>
  useApiDaten(ABRUFE, level, id, params);

export default useCompetenceLevels;
