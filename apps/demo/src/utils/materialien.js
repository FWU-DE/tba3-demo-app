// Die Materialien aus `/materials` — Ordnen und Zuordnen.
//
// Der Endpunkt liefert Materialien im Schema des Materialien-Entwurfs: ein
// Material trägt `kind`, `audience`, `language` und eine Liste `attachments`.
// Erst der Anhang sagt, *woran* das Material hängt — an einer Kompetenzstufe,
// an einer Aufgabe, an einem Item, am ganzen Test, oder an nichts Bestimmtem.
//
// Hier steht nur Rechnung, kein JSX: die Gruppierung nach Scope und der Plan,
// den die Auto-Zuweisung vorschlägt. Beides ist ohne DOM prüfbar, und genau
// darum geht es — der Zuordnungsplan ist die Stelle, an der es still schiefgeht
// (siehe `stufeAusAnhang`).

export const LEVEL_KEYS = ['I', 'II', 'III', 'IV', 'V'];

/**
 * Die sechs Zuordnungsarten des Entwurfs, in der Reihenfolge, in der sie
 * angezeigt werden: vom Feinsten (eine Stufe) zum Gröbsten (alles).
 */
export const SCOPES = ['competence-level', 'competence', 'item', 'exercise', 'test', 'general'];

/** Ein Anhang ohne `scope` zählt als `general` — irgendwo muss er hin. */
export const scopeVon = (material) => {
  const scope = material.attachments?.[0]?.scope;
  return SCOPES.includes(scope) ? scope : 'general';
};

/**
 * Die Kompetenzstufe, auf die ein Anhang zeigt — oder `null`.
 *
 * Hier steckt die Tücke der echten Daten. Ein `competence-level`-Anhang zeigt
 * mal über `refName` auf die Stufe („Ia"), mal über `refId` („III"), und mal
 * ist `refId` eine UUID, zu der die Schnittstelle keinen Namen mitliefert —
 * die Kompetenzstufen der Gruppen kommen ohne `id`, es gibt also nichts, wogegen
 * sich so eine UUID auflösen ließe.
 *
 * Dazu teilt das IQB die unterste Stufe in Ia und Ib. Die Demoanwendung führt
 * fünf Stufen I–V; „Ia" gehört also zu I, nicht daneben.
 *
 * Ein Abgleich, der stumpf `refName === 'I'` prüft, trifft auf diesen Daten
 * genau nichts und meldet trotzdem Erfolg. Deshalb diese Funktion, und deshalb
 * zählt `zuordnungsplan` die nicht auflösbaren Anhänge sichtbar mit.
 */
export const stufeAusAnhang = (anhang) => {
  const roh = anhang?.refName ?? anhang?.refId;
  if (!roh) return null;
  // „Ia" → „I", „IIb" → „II"; eine UUID bleibt eine UUID und fällt durch.
  const stufe = String(roh).trim().replace(/[a-z]+$/, '');
  return LEVEL_KEYS.includes(stufe) ? stufe : null;
};

/** Die Materialien nach Zuordnungsart, in der Reihenfolge von `SCOPES`. */
export const nachScope = (materialien = []) => {
  const gruppen = new Map(SCOPES.map((s) => [s, []]));
  for (const material of materialien) gruppen.get(scopeVon(material)).push(material);
  return SCOPES.map((scope) => ({ scope, materialien: gruppen.get(scope) })).filter(
    (g) => g.materialien.length > 0,
  );
};

/**
 * Was die Auto-Zuweisung tun würde.
 *
 * Zugeordnet wird nur, was sich aus den Metadaten *sicher* ableiten lässt:
 *
 * - `competence-level` mit auflösbarer Stufe → an diese Stufe
 * - `general` → an alle fünf Stufen, denn es gilt für alle
 *
 * Alles andere — ein Material zu einem Item, einer Aufgabe, einem Test, einer
 * Leitidee — braucht den Kontext, in dem es eingesetzt wird, und den kennt die
 * Zuweisung nach Stufe nicht. Solche Materialien landen in `ohneStufe` und
 * werden in der Vorschau als das benannt, was sie sind: nicht automatisch
 * zuordenbar. Dasselbe gilt für Stufenanhänge, deren Ziel sich nicht auflösen
 * ließ — sie verschwinden nicht stillschweigend.
 *
 * @returns {{ jeStufe: Object, allgemein: Array, ohneStufe: Array, anzahl: number }}
 */
export const zuordnungsplan = (materialien = []) => {
  const jeStufe = Object.fromEntries(LEVEL_KEYS.map((k) => [k, []]));
  const allgemein = [];
  const ohneStufe = [];

  for (const material of materialien) {
    const anhang = material.attachments?.[0];
    const scope = scopeVon(material);

    if (scope === 'general') {
      allgemein.push(material);
      continue;
    }

    const stufe = scope === 'competence-level' ? stufeAusAnhang(anhang) : null;
    if (stufe) jeStufe[stufe].push(material);
    else ohneStufe.push(material);
  }

  const anzahl = LEVEL_KEYS.reduce((summe, k) => summe + jeStufe[k].length, 0) + allgemein.length;
  return { jeStufe, allgemein, ohneStufe, anzahl };
};

/**
 * Der Plan als Zuweisung: welche Material-Ids hängen nach der Zuweisung an
 * welcher Stufe. Bestehende Zuweisungen bleiben, Dubletten fallen weg.
 */
export const planAnwenden = (plan, bisher = {}) =>
  Object.fromEntries(
    LEVEL_KEYS.map((stufe) => [
      stufe,
      [
        ...new Set([
          ...(bisher[stufe] ?? []),
          ...plan.jeStufe[stufe].map((m) => m.id),
          ...plan.allgemein.map((m) => m.id),
        ]),
      ],
    ]),
  );
