import { useEffect, useState } from 'react';
import { tba3Api } from '../services/tba3Api';

/**
 * Die Materialien aus `/materials`.
 *
 * Eigener Hook statt `useApiDaten`: der führt eine Ebene (Gruppe, Schule,
 * Bundesland) mit einer Id, und genau die hat `/materials` nicht — gefiltert
 * wird dort über Eigenschaften des Materials. Die beiden Regeln von nebenan
 * gelten trotzdem: eine überholte Antwort wird verworfen, und `loading` wird
 * aus dem Zustand abgeleitet statt im Effekt gesetzt.
 *
 * @param {Object} params - Abfrageparameter des Entwurfs (scope, kind, audience …)
 * @returns {{ data: Array|null, loading: boolean, error: Error|null }}
 */
export const useMaterialien = (params = {}) => {
  const [ergebnis, setErgebnis] = useState({ schluessel: null, data: null, error: null });

  // Die Parameter kommen bei jedem Durchlauf als frisches Objekt herein —
  // verglichen wird deshalb ihr Inhalt, nicht die Objektidentität.
  const schluessel = JSON.stringify(params);

  useEffect(() => {
    let überholt = false;
    tba3Api.getMaterials(JSON.parse(schluessel)).then(
      (antwort) => {
        if (!überholt) setErgebnis({ schluessel, data: antwort.data ?? [], error: null });
      },
      (fehler) => {
        if (!überholt) setErgebnis({ schluessel, data: null, error: fehler });
      },
    );
    return () => { überholt = true; };
  }, [schluessel]);

  return {
    data: ergebnis.data,
    error: ergebnis.error,
    loading: ergebnis.schluessel !== schluessel,
  };
};

export default useMaterialien;
