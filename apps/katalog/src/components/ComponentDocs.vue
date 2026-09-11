<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  componentName: { type: String, required: true },
  githubFile:    { type: String, required: true },  // filename only, e.g. 'ItemSolutionTable.vue'
  propsDocs: {
    type: Array,
    default: () => [],
    // [{ name, type, default: string, required: boolean, description }]
  },
  codeExample:   { type: String, default: '' },
  apiEndpoints: {
    type: Array,
    default: () => [],
    // [{ method, path, description }]
  },
  apiNote:       { type: String, default: '' },
  dataShape:     { type: String, default: '' },
});

const GITHUB_BASE = 'https://github.com/FWU-DE/tba3-demo-app/blob/main/component-catalog/src/components/';
const API_SPEC_URL = 'https://petstore.swagger.io/?url=https%3A%2F%2Fraw.githubusercontent.com%2Findibit-eu%2Ftba3%2Frefs%2Fheads%2Fmain%2Ftba3-spec.yml';

const githubUrl = computed(() => GITHUB_BASE + props.githubFile);

const copied = ref(false);
const copyCode = () => {
  navigator.clipboard?.writeText(props.codeExample).then(() => {
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 1800);
  });
};
</script>

<template>
  <div class="docs-wrap">
    <div class="docs-divider" />

    <!-- Links bar -->
    <div class="docs-links-bar">
      <a :href="githubUrl" target="_blank" rel="noopener" class="docs-link docs-link-gh">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
        </svg>
        Quellcode (GitHub)
      </a>
      <a v-if="apiEndpoints.length" :href="API_SPEC_URL" target="_blank" rel="noopener" class="docs-link docs-link-api">
        <i class="pi pi-server" />
        TBA3 API Spec
      </a>
    </div>

    <!-- Props table -->
    <div v-if="propsDocs.length" class="docs-section">
      <h3 class="docs-heading">Props</h3>
      <div class="props-table-wrap">
        <table class="props-table">
          <thead>
            <tr>
              <th>Prop</th>
              <th>Typ</th>
              <th>Default</th>
              <th>Beschreibung</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in propsDocs" :key="p.name">
              <td>
                <code class="prop-name">{{ p.name }}</code>
                <span v-if="p.required" class="req-badge">required</span>
              </td>
              <td><code class="prop-type">{{ p.type }}</code></td>
              <td><code v-if="p.default !== undefined" class="prop-default">{{ p.default }}</code><span v-else class="na">—</span></td>
              <td class="prop-desc">{{ p.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Data shape -->
    <div v-if="dataShape" class="docs-section">
      <h3 class="docs-heading">Datenstruktur</h3>
      <pre class="code-block code-data"><code>{{ dataShape }}</code></pre>
    </div>

    <!-- Code example -->
    <div v-if="codeExample" class="docs-section">
      <div class="code-header">
        <h3 class="docs-heading" style="margin:0">Verwendungsbeispiel</h3>
        <button class="copy-btn" @click="copyCode">
          <i :class="copied ? 'pi pi-check' : 'pi pi-copy'" />
          {{ copied ? 'Kopiert' : 'Kopieren' }}
        </button>
      </div>
      <pre class="code-block"><code>{{ codeExample }}</code></pre>
    </div>

    <!-- API endpoints -->
    <div v-if="apiEndpoints.length" class="docs-section">
      <h3 class="docs-heading">TBA3 API Endpunkte</h3>
      <p v-if="apiNote" class="api-note">{{ apiNote }}</p>
      <div class="endpoint-list">
        <div v-for="ep in apiEndpoints" :key="ep.path" class="endpoint-row">
          <span class="ep-method" :class="`ep-${ep.method.toLowerCase()}`">{{ ep.method }}</span>
          <code class="ep-path">{{ ep.path }}</code>
          <span class="ep-desc">{{ ep.description }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.docs-wrap { display: flex; flex-direction: column; gap: 0; margin-top: 28px; }

.docs-divider {
  border: none; border-top: 2px solid #e2e8f0; margin-bottom: 20px;
}

/* Links bar */
.docs-links-bar { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 24px; }

.docs-link {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 0.78rem; font-weight: 600; padding: 6px 12px;
  border-radius: 6px; border: 1px solid; text-decoration: none;
  transition: background 0.15s, color 0.15s;
}
.docs-link-gh {
  color: #1e293b; border-color: #cbd5e1; background: #f8fafc;
}
.docs-link-gh:hover { background: #1e293b; color: #fff; border-color: #1e293b; }
.docs-link-api {
  color: #0369a1; border-color: #bae6fd; background: #f0f9ff;
}
.docs-link-api:hover { background: #0369a1; color: #fff; border-color: #0369a1; }
.docs-link .pi { font-size: 0.72rem; }

/* Section */
.docs-section { margin-bottom: 24px; }

.docs-heading {
  font-size: 0.78rem; font-weight: 700; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px;
}

/* Props table */
.props-table-wrap { overflow-x: auto; }
.props-table {
  width: 100%; border-collapse: collapse;
  border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;
  font-size: 0.8rem;
}
.props-table th {
  background: #f8fafc; padding: 8px 12px;
  font-size: 0.7rem; font-weight: 700; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.05em;
  border-bottom: 1px solid #e2e8f0; text-align: left; white-space: nowrap;
}
.props-table td {
  padding: 8px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top;
}
.props-table tr:last-child td { border-bottom: none; }
.props-table tr:nth-child(even) td { background: #fafafa; }

.prop-name {
  font-family: ui-monospace, monospace; font-weight: 700;
  color: #1e3a5f; background: #eff6ff; padding: 1px 5px; border-radius: 3px;
  font-size: 0.78rem;
}
.req-badge {
  display: inline-block; margin-left: 5px;
  font-size: 0.6rem; font-weight: 700; color: #dc2626;
  background: #fee2e2; padding: 1px 5px; border-radius: 3px; vertical-align: middle;
}
.prop-type {
  font-family: ui-monospace, monospace; color: #7c3aed;
  background: #f5f3ff; padding: 1px 5px; border-radius: 3px; font-size: 0.78rem;
}
.prop-default {
  font-family: ui-monospace, monospace; color: #059669;
  background: #f0fdf4; padding: 1px 5px; border-radius: 3px; font-size: 0.78rem;
}
.prop-desc { color: #475569; line-height: 1.4; }
.na { color: #cbd5e1; }

/* Code block */
.code-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;
}
.copy-btn {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 0.72rem; font-weight: 600; color: #64748b;
  background: #f8fafc; border: 1px solid #e2e8f0;
  padding: 4px 10px; border-radius: 5px; cursor: pointer; transition: all 0.15s;
}
.copy-btn:hover { background: #f1f5f9; color: #1e293b; }
.copy-btn .pi { font-size: 0.65rem; }

.code-block {
  background: #0f172a; color: #e2e8f0;
  font-family: ui-monospace, 'Cascadia Code', 'Fira Code', monospace;
  font-size: 0.78rem; line-height: 1.6;
  padding: 16px 18px; border-radius: 8px;
  overflow-x: auto; white-space: pre; tab-size: 2;
}
.code-block code { background: none; color: inherit; padding: 0; }
.code-data { background: #1e293b; }

/* API endpoints */
.api-note {
  font-size: 0.8rem; color: #64748b; margin-bottom: 10px;
  background: #fffbeb; border: 1px solid #fde68a;
  padding: 8px 12px; border-radius: 6px; line-height: 1.5;
}
.endpoint-list { display: flex; flex-direction: column; gap: 6px; }
.endpoint-row {
  display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap;
  background: #f8fafc; border: 1px solid #e2e8f0;
  padding: 8px 12px; border-radius: 6px;
}
.ep-method {
  font-size: 0.65rem; font-weight: 800; padding: 2px 6px; border-radius: 3px;
  letter-spacing: 0.05em; flex-shrink: 0;
}
.ep-get  { background: #dcfce7; color: #16a34a; }
.ep-post { background: #dbeafe; color: #1d4ed8; }
.ep-path {
  font-family: ui-monospace, monospace; font-size: 0.78rem;
  color: #1e3a5f; background: #eff6ff; padding: 1px 6px; border-radius: 3px;
  flex-shrink: 0;
}
.ep-desc { font-size: 0.78rem; color: #64748b; }
</style>
