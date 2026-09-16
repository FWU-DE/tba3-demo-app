// Vue-Adapter.
//
// Eine Hülle um das Custom Element, kein zweiter Nachbau. Sie tut drei Dinge,
// die Vue sonst nicht von allein richtig macht:
//
//   1. Objekte und Arrays als **Eigenschaften** setzen, nicht als Attribute.
//      Vue würde ein Array sonst zu "[object Object]" verstringen.
//   2. Ereignisse des Elements als Vue-Ereignisse weitergeben, damit
//      @stufe-gewaehlt funktioniert.
//   3. Die Elemente registrieren, sobald der Adapter geladen wird.
//
// `vue` ist peerDependency — der Adapter bringt kein eigenes Vue mit, und
// sonst nichts.
//
//   import { KompetenzstufenLeiste } from '@tba3/bausteine/vue';
//   <KompetenzstufenLeiste :rows="zeilen" @stufe-gewaehlt="zeigen" />

import { defineComponent, h, onMounted, onUpdated, ref, watch } from 'vue';
import { BAUPLAENE, PRAEFIX, registrieren } from '../webcomponents/index.js';

registrieren();

function pascal(name) {
  return name.replace(/(^|-)([a-zäöü])/g, (_, __, c) => c.toUpperCase());
}

function komponenteBauen(bauplan) {
  const elementName = PRAEFIX + bauplan.name;
  const schluessel = Object.keys(bauplan.standard);

  return defineComponent({
    name: pascal(bauplan.name),
    props: Object.fromEntries(
      schluessel.map((k) => [
        k,
        Array.isArray(bauplan.standard[k])
          ? { type: Array, default: () => bauplan.standard[k] }
          : { default: bauplan.standard[k] },
      ]),
    ),
    emits: bauplan.ereignisse ?? [],
    setup(props, { emit, attrs }) {
      const knoten = ref(null);

      const uebertragen = () => {
        const el = knoten.value;
        if (!el) return;
        // Als Eigenschaft, nicht als Attribut: nur so überleben Arrays und
        // Objekte den Weg ins Element.
        el.props = Object.fromEntries(schluessel.map((k) => [k, props[k]]));
      };

      onMounted(() => {
        uebertragen();
        for (const typ of bauplan.ereignisse ?? []) {
          knoten.value?.addEventListener(typ, (ev) => emit(typ, ev.detail));
        }
      });

      watch(() => schluessel.map((k) => props[k]), uebertragen, { deep: true });

      return () => h(elementName, { ...attrs, ref: knoten });
    },
  });
}

const gebaut = Object.fromEntries(
  BAUPLAENE.map((b) => [pascal(b.name), komponenteBauen(b)]),
);

export const {
  KompetenzstufenLeiste,
  AufgabenTabelle,
  MittelwertVergleich,
  ErwartetTatsaechlich,
  Perzentilbaender,
  SchuelerTabelle,
  Uebersichtskarten,
  Streudiagramm,
  BistaVerteilung,
  LernstandsVerlauf,
  AufgabenHeatmap,
  KennzahlKachel,
  KontextmerkmalRing,
  StandardErreichung,
  Zeugnissaetze,
  LernverlaufFiguren,
  Selbsteinschaetzung,
  Glossar,
} = gebaut;

/** Alle Komponenten, nach Namen. */
export const KOMPONENTEN = gebaut;

/** Als Plugin einhängen: app.use(bausteine). */
export const bausteine = {
  install(app) {
    for (const [name, komponente] of Object.entries(gebaut)) {
      app.component(name, komponente);
    }
    // Vue soll die Custom Elements nicht als eigene Komponenten auflösen
    // wollen — sonst warnt es bei jedem Rendern.
    const vorher = app.config.compilerOptions.isCustomElement;
    app.config.compilerOptions.isCustomElement = (tag) =>
      tag.startsWith(PRAEFIX) || (vorher ? vorher(tag) : false);
  },
};

export { PRAEFIX, registrieren };
export default bausteine;
