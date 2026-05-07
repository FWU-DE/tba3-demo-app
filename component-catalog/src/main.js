import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import 'primeicons/primeicons.css';
import router from './router/index.js';
import App from './App.vue';

const app = createApp(App);

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: { prefix: 'p', darkModeSelector: '.dark', cssLayer: false },
  },
});
app.use(router);
app.mount('#app');
