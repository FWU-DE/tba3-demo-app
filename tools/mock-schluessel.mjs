// Schlüssel-Normalisierung des Mocks — bewusst ohne Abhängigkeit zu den
// Fixtures, damit auch das Abzug-Skript sie nutzen kann, bevor es data/
// überhaupt gibt.

// Nur diese Parameter verändern die Antwort — alles andere (etwa gender oder
// languageAtHome, die die Demoanwendung mitschickt) kennt die Spezifikation
// nicht und der Referenzserver ignoriert sie.
export const RELEVANTE_PARAMETER = ['type', 'aggregation', 'comparison'];

/** Pfad + Parameter auf einen stabilen Schlüssel bringen. */
export const normalisiereAbfrage = (pfad, query = {}) => {
  const paare = RELEVANTE_PARAMETER
    .filter((name) => query[name] !== undefined && query[name] !== '')
    .sort()
    .map((name) => `${name}=${query[name]}`);
  const sauberer = pfad.replace(/\/+$/, '');
  return paare.length ? `${sauberer}?${paare.join('&')}` : sauberer;
};
