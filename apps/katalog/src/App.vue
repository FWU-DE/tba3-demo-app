<script setup>
import { useRoute } from 'vue-router';
import { computed, watchEffect } from 'vue';
import { t } from './i18n';

const route = useRoute();

const ROUTE_NAMES = {
  '/percentile-band':        'PercentileBandChart',
  '/competence-levels':      'CompetenceLevelBar',
  '/item-solution-table':    'ItemSolutionTable',
  '/competency-overview':    'CompetencyOverviewCards',
  '/student-scatter':        'StudentScatterPlot',
  '/bista-distribution':     'BistaDistributionChart',
  '/student-solution-table': 'StudentSolutionTable',
};

const isHome        = computed(() => route.path === '/');
const componentName = computed(() => ROUTE_NAMES[route.path] ?? null);

// Der Titel im Browser-Reiter folgt der Sprachwahl; das Markup kann das nicht.
watchEffect(() => {
  document.title = componentName.value
    ? `${componentName.value} — ${t('huelle.titel')}`
    : t('huelle.titel');
});
</script>

<template>
  <div class="shell">
    <!-- Kein eigener Kopf mehr: Der Katalog ist in der gemeinsamen Leiste
         markiert, die Brotkrumen darunter nennen die Komponente, und jede
         Ansicht trägt ihren Namen noch einmal im Kartenkopf. Ein dritter
         Balken sagte dasselbe ein viertes Mal — und tat es als einziger
         Bereich in einer eigenen Farbe. Der Stack-Hinweis steht jetzt auf
         der Übersicht, wo er hingehört. -->

    <!-- Brotkrumen — auf allen Detailseiten, nicht auf der Übersicht -->
    <nav v-if="!isHome" class="breadcrumb-bar">
      <div class="breadcrumb-inner">
        <RouterLink to="/" class="bc-home">
          <i class="pi pi-th-large" />
          {{ t('huelle.alleKomponenten') }}
        </RouterLink>
        <i class="pi pi-chevron-right bc-sep" />
        <span class="bc-current">{{ componentName ?? route.path }}</span>
      </div>
    </nav>

    <RouterView />
  </div>
</template>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 14px;
  background: #f1f5f9;
  color: #1e293b;
  line-height: 1.5;
}
a { text-decoration: none; color: inherit; }

.shell { min-height: 100vh; }

/* ── Brotkrumen ──────────────────────────────────────────────────────── */
.breadcrumb-bar {
  background: #fff; border-bottom: 1px solid #e2e8f0;
  padding: 9px var(--rand);
}
.breadcrumb-inner {
  max-width: var(--breite); margin: 0 auto;
  display: flex; align-items: center; gap: 8px;
  font-size: 0.8rem;
}
.bc-home {
  display: inline-flex; align-items: center; gap: 5px;
  color: #3b82f6; font-weight: 500; transition: color 0.15s;
}
.bc-home:hover { color: #1d4ed8; text-decoration: underline; }
.bc-home .pi { font-size: 0.7rem; }
.bc-sep { font-size: 0.58rem; color: #cbd5e1; }
.bc-current { color: #475569; font-weight: 600; font-family: ui-monospace, monospace; }
</style>
