<script setup>
import { useRoute } from 'vue-router';
import { computed } from 'vue';

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
</script>

<template>
  <div class="shell">
    <header class="shell-header">
      <div class="shell-header-inner">
        <div class="header-brand">
          <RouterLink to="/" class="header-title">TBA3 Component Catalog</RouterLink>
          <template v-if="componentName">
            <span class="header-sep">/</span>
            <span class="header-breadcrumb">{{ componentName }}</span>
          </template>
        </div>
        <div class="header-right">
          <a
            href="https://github.com/FWU-DE/tba3-demo-app"
            target="_blank"
            rel="noopener"
            class="header-gh"
            title="GitHub Repository"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            GitHub
          </a>
          <span class="header-sub">Vue 3 · PrimeVue · Mock-Server</span>
        </div>
      </div>
    </header>

    <!-- Breadcrumb bar — visible on all component detail pages -->
    <nav v-if="!isHome" class="breadcrumb-bar">
      <div class="breadcrumb-inner">
        <RouterLink to="/" class="bc-home">
          <i class="pi pi-th-large" />
          Alle Komponenten
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
.header-gh {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 0.75rem; font-weight: 600; color: rgba(255,255,255,0.75);
  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.18);
  padding: 4px 10px; border-radius: 6px; transition: all 0.15s;
}
.header-gh:hover { background: rgba(255,255,255,0.2); color: #fff; }
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
