import { useState, useEffect } from 'react';
import { tba3Api } from '../services/tba3Api';

/**
 * Custom hook to fetch competence levels data
 * @param {string} level - 'group', 'school', or 'state'
 * @param {string} id - The ID of the entity
 * @param {Object} params - Query parameters
 * @returns {Object} { data, loading, error, refetch }
 */
export const useCompetenceLevels = (level, id, params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response;
      switch (level) {
        case 'group':
          response = await tba3Api.getGroupCompetenceLevels(id, params);
          break;
        case 'school':
          response = await tba3Api.getSchoolCompetenceLevels(id, params);
          break;
        case 'state':
          response = await tba3Api.getStateCompetenceLevels(id, params);
          break;
        default:
          throw new Error(`Invalid level: ${level}`);
      }
      setData(response.data);
    } catch (err) {
      setError(err);
      console.error('Error fetching competence levels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [level, id, JSON.stringify(params)]);

  return { data, loading, error, refetch: fetchData };
};

export default useCompetenceLevels;
