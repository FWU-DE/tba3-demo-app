import { useCallback, useEffect, useState } from 'react';

/**
 * Gemeinsame Grundlage der Daten-Hooks: lädt eine Ebene (Gruppe, Schule,
 * Bundesland) über den passenden API-Aufruf und hält Ladezustand und Fehler.
 *
 * Zwei Dinge, die die früheren Einzel-Hooks nicht konnten:
 *
 * - Antworten aus überholten Anfragen werden verworfen. Wer schnell zwischen
 *   Filtern wechselt, bekam sonst je nach Laufzeit die ältere Antwort zu sehen.
 * - `loading` wird aus dem Zustand abgeleitet statt im Effekt gesetzt; das
 *   spart einen Renderdurchlauf je Ladevorgang.
 *
 * @param {Object} abrufe - { group, school, state }: je eine Funktion (id, params) → Promise.
 *                          Muss außerhalb der Komponente definiert sein, sonst lädt der Hook endlos.
 * @param {string} level - 'group' | 'school' | 'state'
 * @param {string} id - Id der Ebene
 * @param {Object} params - Abfrageparameter
 * @returns {{ data: any, loading: boolean, error: Error|null, refetch: Function }}
 */
export const useApiDaten = (abrufe, level, id, params = {}) => {
  const [ergebnis, setErgebnis] = useState({ schluessel: null, data: null, error: null });
  const [versuch, setVersuch] = useState(0);

  // Die Parameter kommen bei jedem Durchlauf als frisches Objekt herein —
  // verglichen wird deshalb ihr Inhalt, nicht die Objektidentität.
  const paramsJson = JSON.stringify(params);
  const schluessel = `${level}|${id}|${paramsJson}|${versuch}`;

  const abrufen = abrufe[level];

  useEffect(() => {
    if (!id || !abrufen) return undefined;

    let überholt = false;
    abrufen(id, JSON.parse(paramsJson)).then(
      (antwort) => { if (!überholt) setErgebnis({ schluessel, data: antwort.data, error: null }); },
      (fehler) => { if (!überholt) setErgebnis({ schluessel, data: null, error: fehler }); },
    );

    return () => { überholt = true; };
  }, [abrufen, id, paramsJson, schluessel]);

  const refetch = useCallback(() => setVersuch((v) => v + 1), []);

  // Eine unbekannte Ebene ist ein Aufruffehler, kein Ladezustand — deshalb hier
  // abgeleitet statt im Effekt gesetzt.
  const ebenenFehler = abrufen ? null : new Error(`Unbekannte Ebene: ${level}`);

  return {
    data: ergebnis.data,
    error: ebenenFehler ?? ergebnis.error,
    loading: Boolean(id) && Boolean(abrufen) && ergebnis.schluessel !== schluessel,
    refetch,
  };
};

export default useApiDaten;
