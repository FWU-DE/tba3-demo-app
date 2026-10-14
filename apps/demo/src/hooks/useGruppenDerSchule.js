import { useMemo } from 'react';
import { tba3Api } from '../services/tba3Api';
import { GROUPS, SCHOOLS } from '../utils/constants';
import { useApiDaten } from './useApiDaten';

// Die Lerngruppen einer Schule im selben Fach, je mit ihren Kompetenzstufen —
// für die Bausteine, die mehrere Gruppen zugleich brauchen (Abweichung je
// Lerngruppe, zwei Gruppen gespiegelt). Die Schnittstelle hat dafür keinen
// eigenen Endpunkt; gefragt wird je Gruppe, parallel.
//
// In den Demodaten hängt die Schule an der Klassenstufe: die dritten Klassen
// gehören zur Grundschule, die achten zum Gymnasium.
export const SCHULE_JE_STUFE = { V3: 'gs-musterstadt', V8: 'gym-beispielstadt' };

/** Auf Modulebene, sonst lädt useApiDaten endlos (siehe dort). */
const ABRUFE = {
  geschwister: (gruppenId) => {
    const gruppe = GROUPS.find((g) => g.id === gruppenId);
    const liste = gruppe
      ? GROUPS.filter((g) => g.subject === gruppe.subject && g.grade === gruppe.grade)
      : [];
    return Promise.all(liste.map((g) => tba3Api.getGroupCompetenceLevels(g.id, { type: 'group' })
      .then((antwort) => ({ id: g.id, name: g.name, daten: antwort.data }))))
      .then((data) => ({ data }));
  },
};

/**
 * @param {string} gruppenId - die gewählte Lerngruppe
 * @returns {{ data: Array<{id, name, daten}>|null, loading, error, schule: {id, name}|null }}
 */
export const useGruppenDerSchule = (gruppenId) => {
  const ergebnis = useApiDaten(ABRUFE, 'geschwister', gruppenId);
  const schule = useMemo(() => {
    const gruppe = GROUPS.find((g) => g.id === gruppenId);
    const id = gruppe ? SCHULE_JE_STUFE[gruppe.grade] : null;
    return SCHOOLS.find((s) => s.id === id) ?? null;
  }, [gruppenId]);
  return { ...ergebnis, schule };
};

export default useGruppenDerSchule;
