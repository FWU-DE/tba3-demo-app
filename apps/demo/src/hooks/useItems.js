import { tba3Api } from '../services/tba3Api';
import { useApiDaten } from './useApiDaten';

const ABRUFE = {
  group: tba3Api.getGroupItems,
  school: tba3Api.getSchoolItems,
  state: tba3Api.getStateItems,
};

/**
 * Item-Statistiken einer Ebene.
 *
 * @param {string} level - 'group', 'school' oder 'state'
 * @param {string} id - Id der Ebene
 * @param {Object} params - Abfrageparameter
 * @returns {Object} { data, loading, error, refetch }
 */
export const useItems = (level, id, params = {}) =>
  useApiDaten(ABRUFE, level, id, params);

export default useItems;
