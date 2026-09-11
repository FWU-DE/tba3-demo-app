import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const tba3Api = {
  // Groups
  getGroupCompetenceLevels: (groupId, params = {}) =>
    api.get(`/groups/${groupId}/competence-levels`, { params }),

  getGroupItems: (groupId, params = {}) =>
    api.get(`/groups/${groupId}/items`, { params }),

  getGroupAggregations: (groupId, params = {}) =>
    api.get(`/groups/${groupId}/aggregations`, { params }),

  // Schools
  getSchoolCompetenceLevels: (schoolId, params = {}) =>
    api.get(`/schools/${schoolId}/competence-levels`, { params }),

  getSchoolItems: (schoolId, params = {}) =>
    api.get(`/schools/${schoolId}/items`, { params }),

  getSchoolAggregations: (schoolId, params = {}) =>
    api.get(`/schools/${schoolId}/aggregations`, { params }),

  // States
  getStateCompetenceLevels: (stateId, params = {}) =>
    api.get(`/states/${stateId}/competence-levels`, { params }),

  getStateItems: (stateId, params = {}) =>
    api.get(`/states/${stateId}/items`, { params }),

  getStateAggregations: (stateId, params = {}) =>
    api.get(`/states/${stateId}/aggregations`, { params }),
};

export default tba3Api;
