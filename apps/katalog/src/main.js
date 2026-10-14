import { createApp } from 'vue';
import axios from 'axios';
import { aufgabenAntwortAbgleichen, stufenAntwortAbgleichen } from '../../shared/stufen.js';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import 'primeicons/primeicons.css';
import router from './router/index.js';
import App from './App.vue';

// Leer im Dev-Betrieb und auf Vercel (dort greifen Proxy bzw. Rewrites),
// im Docker-Image auf /tba3-api gesetzt.
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || '';

// Kompetenzstufen kommen in mehreren Schreibweisen (Ia/Ib, 1a/1b/2 … in
// Mathematik Klasse 8). Hier einmal auf I–V gebracht, wie in der
// Demoanwendung — sonst zeigte der Katalog für 8a Mathematik „Keine Daten“.
axios.interceptors.response.use((antwort) => {
  const pfad = antwort.config?.url ?? '';
  if (pfad.includes('/competence-levels')) antwort.data = stufenAntwortAbgleichen(antwort.data);
  else if (pfad.includes('/items')) antwort.data = aufgabenAntwortAbgleichen(antwort.data);
  return antwort;
});

const app = createApp(App);

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: { prefix: 'p', darkModeSelector: '.dark', cssLayer: false },
  },
});
app.use(router);
app.mount('#app');
