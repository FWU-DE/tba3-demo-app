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
    <header class="shell-header">
      <div class="shell-header-inner">
        <div class="header-brand">
          <RouterLink to="/" class="header-title">{{ t('huelle.titel') }}</RouterLink>
          <template v-if="componentName">
            <span class="header-sep">/</span>
            <span class="header-breadcrumb">{{ componentName }}</span>
          </template>
        </div>
        <div class="header-right">
          <!-- GitHub führt die gemeinsame Leiste; hier bleibt der Stack-Hinweis -->
          <span class="header-sub">{{ t('huelle.stack') }}</span>
        </div>
      </div>
    </header>

    <!-- Breadcrumb bar — visible on all component detail pages -->
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

/* ── Header ──────────────────────────────────────────────────────────────── */
.shell-header { background: #1e3a5f; padding: 12px 32px; }
.shell-header-inner {
  max-width: 1100px; margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
}

.header-brand { display: flex; align-items: center; gap: 8px; }
.header-title { font-size: 1rem; font-weight: 700; color: #fff; }
.header-title:hover { color: #93c5fd; }
.header-sep { color: rgba(255,255,255,0.3); }
.header-breadcrumb {
  color: rgba(255,255,255,0.65); font-size: 0.88rem;
  font-family: ui-monospace, monospace;
}

.header-right { display: flex; align-items: center; gap: 16px; }
.header-sub { font-size: 0.72rem; color: rgba(255,255,255,0.38); }

/* ── Breadcrumb bar ──────────────────────────────────────────────────────── */
.breadcrumb-bar {
  background: #fff; border-bottom: 1px solid #e2e8f0;
  padding: 9px 32px;
}
.breadcrumb-inner {
  max-width: 1100px; margin: 0 auto;
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
