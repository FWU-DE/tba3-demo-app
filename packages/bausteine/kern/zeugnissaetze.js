// Zeugnissätze — Berechnung.
//
// Gefunden in der Messwiederholung des kompetenztest.de: ein eigener Reiter
// „Zeugnissätze" neben Grafik und Tabelle, im Quelltext `ReportCardHelper.vue`.
// Kein Sachbericht nennt ihn.
//
// Der einzige Baustein der Bibliothek, dessen Ausgabe **Text** ist. Er
// beantwortet den Schritt, der nach jeder Rückmeldung ohnehin kommt: aus einem
// Ergebnis muss ein Satz werden, den man einem Kind und seinen Eltern sagen
// kann.
//
// Zwei Entscheidungen stecken darin:
//
//   1. **Der Baustein formuliert nicht selbst.** Die Sätze kommen als Vorlagen
//      herein, mit Platzhaltern. Wie über eine Schülerin geschrieben wird, ist
//      keine Entscheidung einer Visualisierungsbibliothek — und schon gar
//      keine, die in einem Baustein versteckt gehört.
//   2. **Jeder Satz nennt seine Grundlage.** Ein Satz ohne die Zahl, aus der er
//      stammt, ist eine Behauptung; mit ihr ist er eine Ableitung, die jemand
//      prüfen und verwerfen kann.

export const NAME = 'zeugnissaetze';

export const STANDARD = {
  titel: '',
  /**
   * [{ id, vorlage, grundlage?, stufe?, wenn? }]
   * `vorlage` darf Platzhalter in geschweiften Klammern tragen.
   * `wenn` ist eine Bedingung über `werte` — fehlt sie, gilt der Satz immer.
   */
  saetze: [],
  /** Werte für die Platzhalter, etwa { name: 'Anna', stufe: 'III' }. */
  werte: {},
  /** Anrede in der Ausgabe — nur zur Auswahl, der Baustein wertet sie nicht. */
  leerHinweis: 'Zu dieser Auswahl gibt es keinen Satz.',
};

/** Platzhalter füllen. Ein unbekannter bleibt sichtbar stehen statt zu verschwinden. */
export function fuellen(vorlage, werte = {}) {
  return String(vorlage ?? '').replace(/\{(\w+)\}/g, (treffer, name) =>
    (name in werte && werte[name] !== null && werte[name] !== undefined ? String(werte[name]) : treffer));
}

/**
 * Trifft die Bedingung zu? `wenn` ist ein Objekt aus Feld → Wert oder Feld →
 * Liste erlaubter Werte. Bewusst kein Ausdruck, der ausgewertet wird: eine
 * Bibliothek, die fremde Zeichenketten als Code ausführt, ist ein Einfallstor.
 */
export function trifftZu(wenn, werte = {}) {
  if (!wenn) return true;
  return Object.entries(wenn).every(([feld, erlaubt]) =>
    (Array.isArray(erlaubt) ? erlaubt : [erlaubt]).some((w) => String(werte[feld]) === String(w)));
}

export function saetze(props = {}) {
  const { titel, saetze: vorlagen, werte, leerHinweis } = { ...STANDARD, ...props };

  const passend = (Array.isArray(vorlagen) ? vorlagen : [])
    .filter((s) => s && s.vorlage)
    .filter((s) => trifftZu(s.wenn, werte));

  return {
    titel,
    leerHinweis,
    leer: passend.length === 0,
    saetze: passend.map((s, i) => ({
      id: s.id ?? `satz-${i}`,
      stufe: s.stufe ?? null,
      text: fuellen(s.vorlage, werte),
      grundlage: s.grundlage ? fuellen(s.grundlage, werte) : '',
    })),
  };
}

export default saetze;
