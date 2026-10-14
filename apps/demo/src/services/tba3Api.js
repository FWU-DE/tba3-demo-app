import axios from 'axios';
import { aufgabenAntwortAbgleichen, stufenAntwortAbgleichen } from '../utils/stufen';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Stufen kommen in mehreren Schreibweisen (Ia/Ib, 1a/1b/2 …) — hier einmal
// auf I–V gebracht, damit keine Ansicht das selbst wissen muss (utils/stufen.js).
const mitStufen = (anfrage) => anfrage.then((r) => ({ ...r, data: stufenAntwortAbgleichen(r.data) }));
const mitAufgaben = (anfrage) => anfrage.then((r) => ({ ...r, data: aufgabenAntwortAbgleichen(r.data) }));

export const tba3Api = {
  // Groups
  getGroupCompetenceLevels: (groupId, params = {}) =>
    mitStufen(api.get(`/groups/${groupId}/competence-levels`, { params })),

  getGroupItems: (groupId, params = {}) =>
    mitAufgaben(api.get(`/groups/${groupId}/items`, { params })),

  getGroupAggregations: (groupId, params = {}) =>
    api.get(`/groups/${groupId}/aggregations`, { params }),

  // Schools
  getSchoolCompetenceLevels: (schoolId, params = {}) =>
    mitStufen(api.get(`/schools/${schoolId}/competence-levels`, { params })),

  getSchoolItems: (schoolId, params = {}) =>
    mitAufgaben(api.get(`/schools/${schoolId}/items`, { params })),

  getSchoolAggregations: (schoolId, params = {}) =>
    api.get(`/schools/${schoolId}/aggregations`, { params }),

  // States
  getStateCompetenceLevels: (stateId, params = {}) =>
    mitStufen(api.get(`/states/${stateId}/competence-levels`, { params })),

  getStateItems: (stateId, params = {}) =>
    mitAufgaben(api.get(`/states/${stateId}/items`, { params })),

  getStateAggregations: (stateId, params = {}) =>
    api.get(`/states/${stateId}/aggregations`, { params }),

  // Materialien
  // Hängt an keiner Ebene: `/materials` wird über Eigenschaften gefiltert
  // (scope, kind, audience, item, competenceLevel …), nicht über eine Gruppe.
  getMaterials: (params = {}) => api.get('/materials', { params }),
};

export default tba3Api;
