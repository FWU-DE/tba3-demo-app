// Vue-Adapter für alle Bausteine.
//
// Dünn mit Absicht: die Komponenten bauen kein eigenes Markup, sondern setzen
// das, was der Kern liefert. Dadurch gibt es die Visualisierung genau einmal,
// und die Vue-Fassung kann nicht gegenüber der React- oder Web-Component-Fassung
// driften.
//
//   import { KompetenzstufenLeiste } from '@tba3/bausteine/vue';
//   <KompetenzstufenLeiste :rows="zeilen" title="3a Deutsch" />
//
// `vue` ist peerDependency — der Adapter bringt kein eigenes Vue mit.

import { computed, defineComponent, h } from 'vue';
import { BAUSTEINE } from '../kern/index.js';

/** Aus kebab-case einen Komponentennamen machen: kompetenzstufen-leiste → KompetenzstufenLeiste */
function pascal(name) {
  return name.replace(/(^|-)([a-zäöü])/g, (_, __, c) => c.toUpperCase());
}

function komponenteBauen({ name, standard, bauen }) {
  return defineComponent({
    name: pascal(name),
    props: Object.fromEntries(
      Object.entries(standard).map(([schluessel, vorgabe]) => [
        schluessel,
        Array.isArray(vorgabe)
          ? { type: Array, default: () => vorgabe }
          : { default: vorgabe },
      ]),
    ),
    setup(props) {
      // computed statt Neuberechnung im Render: die Kerne bauen Zeichenketten,
      // das lohnt sich zu merken, solange sich die Eigenschaften nicht ändern.
      const markup = computed(() => bauen({ ...props }).html);
      return () => h('div', { class: 'tba3-baustein', innerHTML: markup.value });
    },
  });
}

const gebaut = Object.fromEntries(BAUSTEINE.map((b) => [pascal(b.name), komponenteBauen(b)]));

export const {
  KompetenzstufenLeiste,
  MittelwertVergleich,
  ErwartetTatsaechlich,
  Perzentilbaender,
} = gebaut;

/** Alle Komponenten, nach Namen. */
export const KOMPONENTEN = gebaut;

/** Als Plugin einhängen: app.use(bausteine). */
export const bausteine = {
  install(app) {
    for (const [name, komponente] of Object.entries(gebaut)) {
      app.component(name, komponente);
    }
  },
};

export { STIL } from '../kern/index.js';
export default bausteine;
