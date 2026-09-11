import { createApp } from 'vue';
import axios from 'axios';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import 'primeicons/primeicons.css';
import router from './router/index.js';
import App from './App.vue';

// Leer im Dev-Betrieb und auf Vercel (dort greifen Proxy bzw. Rewrites),
// im Docker-Image auf /tba3-api gesetzt.
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || '';

const app = createApp(App);

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: { prefix: 'p', darkModeSelector: '.dark', cssLayer: false },
  },
});
app.use(router);
app.mount('#app');
