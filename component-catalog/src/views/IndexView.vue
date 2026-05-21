<script setup>
const GH_BASE = 'https://github.com/FWU-DE/tba3-demo-app/blob/main/component-catalog/src/components/';

const COMPONENTS = [
  {
    name: 'MeanComparisonChart',
    route: '/mean-comparison',
    githubFile: 'MeanComparisonChart.vue',
    tag: 'SVG',
    tagSeverity: 'info',
    desc: 'Mittlere Lösungsquote als Diamant-Marker auf einer horizontalen Skala. Vergleicht Klasse, Schule, Fairen Vergleich (⚖ Standorttyp) und Bundesland — inkl. optionaler Konfidenzintervalle.',
    useCases: [
      'Wo liegt meine Klasse im Vergleich zu ähnlichen Schulen?',
      'Fairer Vergleich (Standorttyp) als Referenzlinie',
      'Konfidenzintervalle für Lehrpersonen-Feedback',
    ],
    api: '/groups, /schools, /states (items)',
    preview: 'mean-comparison',
  },
  {
    name: 'BistaDistributionChart',
    route: '/bista-distribution',
    githubFile: 'BistaDistributionChart.vue',
    tag: 'SVG',
    tagSeverity: 'info',
    desc: 'Alle Schüler*innen als Avatar-Icons auf einem horizontalen BISTA-Wertestrahl. Drei Kompetenzstreifen (KS I–III) als Hintergrund. Mouseover zeigt StudentTooltip mit Detailinformationen.',
    useCases: [
      'Individuelle BISTA-Scores einer Klasse visualisieren',
      'Kompetenzzonenverteilung auf Schüler*innenebene',
    ],
    api: 'Schülerdaten mit BISTA-Werten',
    preview: 'bista',
  },
  {
    name: 'CompetencyOverviewCards',
    route: '/competency-overview',
    githubFile: 'CompetencyOverviewCards.vue',
    tag: 'SVG',
    tagSeverity: 'info',
    desc: 'Zwei Karten nebeneinander: SVG-Donut-Diagramm mit Kompetenzstufenverteilung und Schlüsselkennzahlen (Mindeststandard und darüber vs. darunter).',
    useCases: [
      'Schnellübersicht Kompetenzverteilung einer Klasse',
      'Anteil Schüler*innen über/unter Mindeststandard',
    ],
    api: '/groups (competence-levels)',
    preview: 'donut',
  },
  {
    name: 'PercentileBandChart',
    route: '/percentile-band',
    githubFile: 'PercentileBandChart.vue',
    tag: 'SVG',
    tagSeverity: 'info',
    desc: 'Visualisiert Lösungshäufigkeit oder Perzentilrang pro Aufgabe als Diamant-Marker, überlagert mit einem Streuungsband der Referenzgruppe.',
    useCases: [
      'Klasse vs. Schule — Lösungshäufigkeit',
      'Schule vs. Bundesland — Lösungshäufigkeit',
      'Schüler*in Perzentilrang in der Klasse',
    ],
    api: '/groups, /schools, /states',
    preview: 'band',
  },
  {
    name: 'CompetenceLevelBar',
    route: '/competence-levels',
    githubFile: 'CompetenceLevelBar.vue',
    tag: 'SVG',
    tagSeverity: 'info',
    desc: 'Zeigt die Kompetenzstufenverteilung (I–V) als horizontale Stapelbalken. Mehrere Ebenen (Klasse, Schule, Bundesland) direkt vergleichbar.',
    useCases: [
      'Kompetenzstufenverteilung einer Klasse',
      'Vergleich Klasse · Schule · Bundesland',
    ],
    api: '/groups, /schools, /states (competence-levels)',
    preview: 'stacked',
  },
  {
    name: 'StudentSolutionTable',
    route: '/student-solution-table',
    githubFile: 'StudentSolutionTable.vue',
    tag: 'Tabelle',
    tagSeverity: 'secondary',
    desc: 'Lösungshäufigkeiten auf Schüler:innen-Ebene. Barrierefreie Balken (Blau/Orange statt Rot/Grün), sortierbar nach Lösungsquote, Verlinkung zu Testheft und SuS-Lösungen.',
    useCases: [
      'Individuelle Lösungsquoten pro Schüler:in und Kompetenzbereich',
      'Sortierung hoch → tief / tief → hoch nach Lösungsquote',
      'Verlinkung zu Testheft und SuS-Lösungsansichten',
    ],
    api: '/groups (items?type=students)',
    preview: 'student-solution',
  },
  {
    name: 'ItemSolutionTable',
    route: '/item-solution-table',
    githubFile: 'ItemSolutionTable.vue',
    tag: 'Tabelle',
    tagSeverity: 'secondary',
    desc: 'Lösungsquoten auf Aufgabenebene als sortierbare Tabelle mit internen Balkendiagrammen. Spaltentoggle und Textsuche für Kompetenz, Stufe und Aufgabentitel.',
    useCases: [
      'Lösungsquoten Klasse vs. Schule vs. Bundesland',
      'Suche & Filter nach Aufgabe / Kompetenz / Stufe',
      'Opt-in: Kompetenztyp und numerische Prozentwerte',
    ],
    api: '/groups, /schools, /states (items)',
    preview: 'table',
  },
  {
    name: 'StudentScatterPlot',
    route: '/student-scatter',
    githubFile: 'StudentScatterPlot.vue',
    tag: 'SVG',
    tagSeverity: 'info',
    desc: 'Schüler*innen-Scatter: Kompetenzstufe (X) × Rohwert % (Y) mit K-Means-Clustering, Konvex-Hüll-Regionen (dashed) und interaktiver Detailcard.',
    useCases: [
      'Leistungsverteilung einer Klasse im Überblick',
      'Gruppen ähnlicher Schüler*innen identifizieren',
      'Einzelne Schüler*in im Klassenkontext verorten',
    ],
    api: '/groups (items?type=students)',
    preview: 'scatter',
  },
];
</script>

<template>
  <main class="index-main">
    <div class="index-intro">
      <h2 class="intro-heading">Komponenten</h2>
      <p class="intro-text">
        Vue 3 SVG-Visualisierungen für VERA-Auswertungsdaten.
        Alle Komponenten nutzen den Mock-Server (localhost:8000) direkt — keine granularen Schülerdaten nötig.
      </p>
    </div>

    <div class="index-grid">
      <RouterLink
        v-for="comp in COMPONENTS"
        :key="comp.name"
        :to="comp.route"
        class="comp-card"
      >
        <!-- Preview area -->
        <div class="card-preview">
          <!-- Donut preview -->
          <svg v-if="comp.preview === 'donut'" viewBox="0 0 200 120" class="preview-svg">
            <!-- Left: donut -->
            <circle cx="55" cy="60" r="38" fill="none" stroke="#f1f5f9" stroke-width="22" />
            <circle cx="55" cy="60" r="38" fill="none" stroke="#ef4444" stroke-width="22"
              stroke-dasharray="36 203" stroke-dashoffset="0" />
            <circle cx="55" cy="60" r="38" fill="none" stroke="#f97316" stroke-width="22"
              stroke-dasharray="28 203" stroke-dashoffset="-36" />
            <circle cx="55" cy="60" r="38" fill="none" stroke="#eab308" stroke-width="22"
              stroke-dasharray="46 203" stroke-dashoffset="-64" />
            <circle cx="55" cy="60" r="38" fill="none" stroke="#22c55e" stroke-width="22"
              stroke-dasharray="52 203" stroke-dashoffset="-110" />
            <circle cx="55" cy="60" r="38" fill="none" stroke="#15803d" stroke-width="22"
              stroke-dasharray="41 203" stroke-dashoffset="-162" />
            <text x="55" y="57" text-anchor="middle" font-size="9" font-weight="700" fill="#0f172a">25</text>
            <text x="55" y="67" text-anchor="middle" font-size="5.5" fill="#94a3b8">Schüler*innen</text>
            <!-- Right: stat blocks -->
            <rect x="104" y="12" width="88" height="40" rx="5" fill="#22c55e" />
            <text x="110" y="28" font-size="11" font-weight="700" fill="white">68 %</text>
            <text x="110" y="39" font-size="5.5" fill="rgba(255,255,255,0.9)">Mindeststandard+</text>
            <text x="110" y="47" font-size="5" fill="rgba(255,255,255,0.75)">Stufen II–V · 17 Schüler*innen</text>
            <rect x="104" y="58" width="88" height="40" rx="5" fill="#f97316" />
            <text x="110" y="74" font-size="11" font-weight="700" fill="white">32 %</text>
            <text x="110" y="85" font-size="5.5" fill="rgba(255,255,255,0.9)">Unter Mindeststandard</text>
            <text x="110" y="93" font-size="5" fill="rgba(255,255,255,0.75)">Stufe I · 8 Schüler*innen</text>
          </svg>

          <!-- Band chart preview -->
          <svg v-else-if="comp.preview === 'band'" viewBox="0 0 200 120" class="preview-svg">
            <rect x="60" y="0" width="140" height="120" fill="#e8f2f9" />
            <g v-for="(_, i) in Array(6)" :key="i">
              <line :x1="60" :y1="i*20" :x2="200" :y2="i*20" stroke="rgba(255,255,255,0.7)" stroke-width="1" />
            </g>
            <!-- Band shape -->
            <path d="M 100 2 L 98 10 C 97 20 96 30 90 40 C 84 50 80 60 76 70 C 72 80 70 90 68 100 L 68 118 L 130 118 L 130 100 C 132 90 136 80 140 70 C 144 60 148 50 152 40 C 156 30 158 20 158 10 L 156 2 Z"
              fill="rgba(90,155,210,0.45)" stroke="rgba(60,125,185,0.65)" stroke-width="1" />
            <!-- Diamonds -->
            <path d="M145 10 L148 13 L145 16 L142 13 Z" fill="#1e3a5f" stroke="white" stroke-width="0.5" />
            <path d="M125 30 L128 33 L125 36 L122 33 Z" fill="#1e3a5f" stroke="white" stroke-width="0.5" />
            <path d="M110 50 L113 53 L110 56 L107 53 Z" fill="#1e3a5f" stroke="white" stroke-width="0.5" />
            <path d="M84 70 L87 73 L84 76 L81 73 Z" fill="#1e3a5f" stroke="white" stroke-width="0.5" />
            <path d="M72 90 L75 93 L72 96 L69 93 Z" fill="#1e3a5f" stroke="white" stroke-width="0.5" />
            <!-- Labels -->
            <text x="55" y="13" text-anchor="end" font-size="7" fill="#64748b" font-family="monospace">HO-001</text>
            <text x="55" y="33" text-anchor="end" font-size="7" fill="#64748b" font-family="monospace">HO-002</text>
            <text x="55" y="53" text-anchor="end" font-size="7" fill="#64748b" font-family="monospace">LE-026</text>
            <text x="55" y="73" text-anchor="end" font-size="7" fill="#64748b" font-family="monospace">LE-027</text>
            <text x="55" y="93" text-anchor="end" font-size="7" fill="#64748b" font-family="monospace">LE-028</text>
          </svg>

          <!-- Student solution preview -->
          <svg v-else-if="comp.preview === 'student-solution'" viewBox="0 0 200 120" class="preview-svg">
            <rect x="0" y="0" width="200" height="120" fill="#f8fafc" rx="4" />
            <!-- Header -->
            <rect x="0" y="0" width="200" height="14" fill="#f1f5f9" />
            <text x="4"   y="10" font-size="5" fill="#94a3b8" font-weight="700">SCHÜLER:IN</text>
            <text x="72"  y="10" font-size="5" fill="#94a3b8" font-weight="700">INSGESAMT ▼</text>
            <text x="130" y="10" font-size="5" fill="#94a3b8" font-weight="700">LESEN</text>
            <!-- Rows -->
            <g v-for="(row, ri) in [[68,52],[81,74],[45,38],[92,88]]" :key="ri">
              <rect x="0" :y="14+ri*24" width="200" :height="24" :fill="ri%2===0?'#fff':'#fafafa'" />
              <!-- Name -->
              <text x="4" :y="26+ri*24" font-size="6" font-weight="600" fill="#1e293b">Schüler:in 0{{ ri+1 }}1</text>
              <text x="4" :y="34+ri*24" font-size="4.5" fill="#0369a1">Testheft B</text>
              <!-- Bar 1 (insgesamt) -->
              <rect x="72" :y="19+ri*24" width="52" height="7" rx="2" fill="#f1f5f9" />
              <rect x="72" :y="19+ri*24" :width="row[0]*52/100" height="7" rx="2" fill="#3b82f6" />
              <rect x="72" :y="19+ri*24" :x2="72+row[0]*52/100" :width="(100-row[0])*52/100" height="7" rx="2" fill="#f97316" :x="72+row[0]*52/100" />
              <!-- Bar 2 (lesen) -->
              <rect x="130" :y="19+ri*24" width="52" height="7" rx="2" fill="#f1f5f9" />
              <rect x="130" :y="19+ri*24" :width="row[1]*52/100" height="7" rx="2" fill="#3b82f6" />
              <rect :x="130+row[1]*52/100" :y="19+ri*24" :width="(100-row[1])*52/100" height="7" rx="2" fill="#f97316" />
            </g>
          </svg>

          <!-- Table preview -->
          <svg v-else-if="comp.preview === 'table'" viewBox="0 0 200 120" class="preview-svg">
            <rect x="0" y="0" width="200" height="120" fill="#f8fafc" rx="4" />
            <!-- Header row -->
            <rect x="0" y="0" width="200" height="16" fill="#f1f5f9" rx="0" />
            <text x="4"   y="11" font-size="5.5" fill="#94a3b8" font-weight="700" font-family="system-ui">KOMPETENZ</text>
            <text x="52"  y="11" font-size="5.5" fill="#94a3b8" font-weight="700" font-family="system-ui">STUFE</text>
            <text x="78"  y="11" font-size="5.5" fill="#94a3b8" font-weight="700" font-family="system-ui">NR.</text>
            <text x="110" y="11" font-size="5.5" fill="#94a3b8" font-weight="700" font-family="system-ui">GRAFIK</text>
            <!-- Data rows -->
            <g v-for="(row, ri) in [[30,'#0369a1','#e0f2fe','1','#ef4444','HO-001',62,44,38],[20,'#0369a1','#e0f2fe','2','#f97316','HO-002',78,60,52],[30,'#0369a1','#e0f2fe','3','#eab308','LE-026',45,50,55],[20,'#0369a1','#e0f2fe','4','#22c55e','LE-027',90,82,74],[30,'#0369a1','#e0f2fe','5','#15803d','MA-001',55,61,67]]" :key="ri">
              <rect x="0" :y="16+ri*20" width="200" :height="20" :fill="ri%2===0?'#fff':'#f8fafc'" />
              <!-- domain chip -->
              <rect x="4" :y="20+ri*20" width="42" height="10" rx="4" :fill="row[2]" />
              <text x="6" :y="28+ri*20" font-size="5" :fill="row[1]" font-family="system-ui">Hörverstehen</text>
              <!-- level badge -->
              <rect x="54" :y="20+ri*20" width="14" height="10" rx="2" :fill="row[4]" />
              <text x="57" :y="28+ri*20" font-size="6" fill="white" font-weight="700" font-family="system-ui">{{ row[3] }}</text>
              <!-- exercise id -->
              <rect x="78" :y="21+ri*20" width="24" height="9" rx="2" fill="#eff6ff" />
              <text x="80" :y="28+ri*20" font-size="5" fill="#1e3a5f" font-family="monospace">{{ row[5] }}</text>
              <!-- bars -->
              <rect x="110" :y="21+ri*20" width="72" height="7" rx="2" fill="#f1f5f9" />
              <rect x="110" :y="21+ri*20" :width="row[6]*72/100" height="7" rx="2" fill="#f97316" opacity="0.85" />
            </g>
          </svg>

          <!-- Scatter preview -->
          <svg v-else-if="comp.preview === 'scatter'" viewBox="0 0 200 120" class="preview-svg">
            <rect x="20" y="0" width="175" height="106" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8" />
            <!-- grid -->
            <line v-for="(t,ti) in [0,1,2,3,4]" :key="ti" :x1="20+t*35" y1="0" :x2="20+t*35" y2="106" stroke="#e2e8f0" stroke-width="0.6" />
            <line v-for="(t,ti) in [0,1,2,3]" :key="`h${ti}`" x1="20" :y1="ti*35" x2="195" :y2="ti*35" stroke="#e2e8f0" stroke-width="0.6" />
            <!-- cluster 1 blob (blue) -->
            <path d="M 34 88 C 28 80 26 70 32 62 C 38 54 48 54 58 58 C 68 62 70 72 66 82 C 62 92 44 96 34 88 Z"
              fill="#3b82f620" stroke="#3b82f6" stroke-width="1" stroke-dasharray="4,2" />
            <!-- cluster 2 blob (orange) -->
            <path d="M 90 52 C 84 44 82 34 90 28 C 98 22 110 26 116 36 C 122 46 116 58 106 62 C 96 66 96 60 90 52 Z"
              fill="#f9731620" stroke="#f97316" stroke-width="1" stroke-dasharray="4,2" />
            <!-- cluster 3 blob (green) -->
            <path d="M 148 22 C 142 14 142 6 152 4 C 162 2 172 8 176 18 C 180 28 174 38 164 40 C 154 42 154 30 148 22 Z"
              fill="#22c55e20" stroke="#22c55e" stroke-width="1" stroke-dasharray="4,2" />
            <!-- dots cluster 1 (blue) -->
            <circle cx="38" cy="84" r="7" fill="#3b82f6" stroke="white" stroke-width="1.5" />
            <text x="38" y="87" text-anchor="middle" font-size="5" font-weight="700" fill="white">MB</text>
            <circle cx="50" cy="70" r="7" fill="#3b82f6" stroke="white" stroke-width="1.5" />
            <text x="50" y="73" text-anchor="middle" font-size="5" font-weight="700" fill="white">SF</text>
            <circle cx="62" cy="60" r="7" fill="#3b82f6" stroke="white" stroke-width="1.5" />
            <text x="62" y="63" text-anchor="middle" font-size="5" font-weight="700" fill="white">MK</text>
            <!-- dots cluster 2 (orange) -->
            <circle cx="96" cy="46" r="7" fill="#f97316" stroke="white" stroke-width="1.5" />
            <text x="96" y="49" text-anchor="middle" font-size="5" font-weight="700" fill="white">JS</text>
            <circle cx="110" cy="36" r="7" fill="#f97316" stroke="white" stroke-width="1.5" />
            <text x="110" y="39" text-anchor="middle" font-size="5" font-weight="700" fill="white">NR</text>
            <!-- dots cluster 3 (green) -->
            <circle cx="154" cy="18" r="7" fill="#22c55e" stroke="white" stroke-width="1.5" />
            <text x="154" y="21" text-anchor="middle" font-size="5" font-weight="700" fill="white">JK</text>
            <circle cx="168" cy="12" r="7" fill="#22c55e" stroke="white" stroke-width="1.5" />
            <text x="168" y="15" text-anchor="middle" font-size="5" font-weight="700" fill="white">EW</text>
            <!-- x labels -->
            <text x="37" y="116" text-anchor="middle" font-size="7" font-weight="700" fill="#ef4444">I</text>
            <text x="72" y="116" text-anchor="middle" font-size="7" font-weight="700" fill="#f97316">II</text>
            <text x="107" y="116" text-anchor="middle" font-size="7" font-weight="700" fill="#eab308">III</text>
            <text x="142" y="116" text-anchor="middle" font-size="7" font-weight="700" fill="#22c55e">IV</text>
            <text x="177" y="116" text-anchor="middle" font-size="7" font-weight="700" fill="#15803d">V</text>
          </svg>

          <!-- BISTA distribution preview -->
          <svg v-else-if="comp.preview === 'bista'" viewBox="0 0 200 120" class="preview-svg">
            <!-- KS I gradient zone -->
            <defs>
              <linearGradient id="prev-ks1" x1="0" x2="1">
                <stop offset="0%" stop-color="#c85535" />
                <stop offset="100%" stop-color="#c09828" />
              </linearGradient>
            </defs>
            <rect x="4" y="18" width="118" height="72" fill="url(#prev-ks1)" />
            <rect x="122" y="18" width="38" height="72" fill="#6abc6a" />
            <rect x="160" y="18" width="36" height="72" fill="#5ab6b0" />
            <!-- zone labels -->
            <text x="63"  y="14" text-anchor="middle" font-size="7" font-weight="600" fill="#475569">KS I</text>
            <text x="141" y="14" text-anchor="middle" font-size="7" font-weight="600" fill="#475569">KS II</text>
            <text x="178" y="14" text-anchor="middle" font-size="7" font-weight="600" fill="#475569">KS III</text>
            <!-- avatar dots -->
            <circle cx="28"  cy="60" r="8" fill="white" stroke="#f43f5e" stroke-width="1.8" />
            <text   x="28"  y="63" text-anchor="middle" font-size="9">🧒</text>
            <circle cx="55"  cy="38" r="8" fill="white" stroke="#f43f5e" stroke-width="1.8" />
            <text   x="55"  y="41" text-anchor="middle" font-size="9">👧</text>
            <circle cx="72"  cy="72" r="8" fill="white" stroke="#3b82f6" stroke-width="1.8" />
            <text   x="72"  y="75" text-anchor="middle" font-size="9">👦</text>
            <circle cx="90"  cy="50" r="8" fill="white" stroke="#f43f5e" stroke-width="1.8" />
            <text   x="90"  y="53" text-anchor="middle" font-size="9">👩</text>
            <circle cx="110" cy="65" r="8" fill="white" stroke="#14b8a6" stroke-width="1.8" />
            <text   x="110" y="68" text-anchor="middle" font-size="9">👦</text>
            <circle cx="134" cy="40" r="8" fill="white" stroke="#f43f5e" stroke-width="1.8" />
            <text   x="134" y="43" text-anchor="middle" font-size="9">👧</text>
            <circle cx="148" cy="68" r="8" fill="white" stroke="#f43f5e" stroke-width="1.8" />
            <text   x="148" y="71" text-anchor="middle" font-size="9">🧑</text>
            <circle cx="172" cy="52" r="8" fill="white" stroke="#f43f5e" stroke-width="1.8" />
            <text   x="172" y="55" text-anchor="middle" font-size="9">👩</text>
            <!-- x-axis -->
            <line x1="4" y1="90" x2="196" y2="90" stroke="#94a3b8" stroke-width="0.8" />
            <text x="100" y="105" text-anchor="middle" font-size="7" fill="#64748b">BISTA Werte</text>
          </svg>

          <!-- Mean comparison preview -->
          <svg v-else-if="comp.preview === 'mean-comparison'" viewBox="0 0 200 120" class="preview-svg">
            <!-- Zone backgrounds -->
            <rect x="50" y="0" width="42" height="120" fill="#fef2f2" />
            <rect x="92" y="0" width="42" height="120" fill="#fefce8" />
            <rect x="134" y="0" width="66" height="120" fill="#f0fdf4" />
            <!-- Zone labels -->
            <text x="71" y="9" text-anchor="middle" font-size="6" fill="#94a3b8">KS I–II</text>
            <text x="113" y="9" text-anchor="middle" font-size="6" fill="#94a3b8">KS III</text>
            <text x="167" y="9" text-anchor="middle" font-size="6" fill="#94a3b8">KS IV–V</text>
            <!-- Tick lines -->
            <line x1="50" y1="12" x2="50" y2="108" stroke="#e2e8f0" stroke-width="0.8" />
            <line x1="92" y1="12" x2="92" y2="108" stroke="#e2e8f0" stroke-width="0.8" />
            <line x1="134" y1="12" x2="134" y2="108" stroke="#e2e8f0" stroke-width="0.8" />
            <line x1="200" y1="12" x2="200" y2="108" stroke="#e2e8f0" stroke-width="0.8" />
            <!-- Row 1: Klasse -->
            <text x="46" y="34" text-anchor="end" font-size="7" fill="#374151">Klasse</text>
            <line x1="60" y1="30" x2="95" y2="30" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/>
            <line x1="60" y1="25" x2="60" y2="35" stroke="#3b82f6" stroke-width="1.5"/>
            <line x1="95" y1="25" x2="95" y2="35" stroke="#3b82f6" stroke-width="1.5"/>
            <polygon points="77,21 85,30 77,39 69,30" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
            <text x="77" y="32" text-anchor="middle" font-size="5.5" font-weight="700" fill="white">55</text>
            <!-- Row 2: Schule -->
            <text x="46" y="56" text-anchor="end" font-size="7" fill="#374151">Schule</text>
            <line x1="72" y1="52" x2="105" y2="52" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/>
            <line x1="72" y1="47" x2="72" y2="57" stroke="#3b82f6" stroke-width="1.5"/>
            <line x1="105" y1="47" x2="105" y2="57" stroke="#3b82f6" stroke-width="1.5"/>
            <polygon points="88,43 96,52 88,61 80,52" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
            <text x="88" y="54" text-anchor="middle" font-size="5.5" font-weight="700" fill="white">62</text>
            <!-- Row 3: Fairer Vergleich (teal) -->
            <text x="40" y="78" text-anchor="end" font-size="7" fill="#0f766e">Fairer Vgl.</text>
            <text x="46" y="78" text-anchor="end" font-size="9">⚖</text>
            <line x1="68" y1="74" x2="103" y2="74" stroke="#0d9488" stroke-width="2" stroke-linecap="round"/>
            <line x1="68" y1="69" x2="68" y2="79" stroke="#0d9488" stroke-width="1.5"/>
            <line x1="103" y1="69" x2="103" y2="79" stroke="#0d9488" stroke-width="1.5"/>
            <polygon points="85,65 93,74 85,83 77,74" fill="#0d9488" stroke="#0f766e" stroke-width="1"/>
            <text x="85" y="76" text-anchor="middle" font-size="5.5" font-weight="700" fill="white">60</text>
            <!-- Row 4: Bundesland -->
            <text x="46" y="100" text-anchor="end" font-size="7" fill="#374151">Bundesland</text>
            <line x1="90" y1="96" x2="130" y2="96" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/>
            <line x1="90" y1="91" x2="90" y2="101" stroke="#3b82f6" stroke-width="1.5"/>
            <line x1="130" y1="91" x2="130" y2="101" stroke="#3b82f6" stroke-width="1.5"/>
            <polygon points="110,87 118,96 110,105 102,96" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
            <text x="110" y="98" text-anchor="middle" font-size="5.5" font-weight="700" fill="white">71</text>
          </svg>

          <!-- Stacked bar preview -->
          <svg v-else-if="comp.preview === 'stacked'" viewBox="0 0 200 120" class="preview-svg">
            <g transform="translate(50, 15)">
              <!-- Row 1: Klasse -->
              <text x="-4" y="17" text-anchor="end" font-size="8" fill="#64748b">Klasse</text>
              <rect x="0" y="5" width="42" height="16" fill="#ef4444" rx="1" />
              <rect x="42" y="5" width="30" height="16" fill="#f97316" rx="1" />
              <rect x="72" y="5" width="28" height="16" fill="#eab308" rx="1" />
              <rect x="100" y="5" width="22" height="16" fill="#22c55e" rx="1" />
              <rect x="122" y="5" width="28" height="16" fill="#15803d" rx="1" />
              <!-- Row 2: Schule -->
              <text x="-4" y="52" text-anchor="end" font-size="8" fill="#64748b">Schule</text>
              <rect x="0" y="40" width="32" height="16" fill="#ef4444" rx="1" />
              <rect x="32" y="40" width="34" height="16" fill="#f97316" rx="1" />
              <rect x="66" y="40" width="30" height="16" fill="#eab308" rx="1" />
              <rect x="96" y="40" width="26" height="16" fill="#22c55e" rx="1" />
              <rect x="122" y="40" width="28" height="16" fill="#15803d" rx="1" />
              <!-- Row 3: Land -->
              <text x="-4" y="87" text-anchor="end" font-size="8" fill="#64748b">Land</text>
              <rect x="0" y="75" width="24" height="16" fill="#ef4444" rx="1" />
              <rect x="24" y="75" width="28" height="16" fill="#f97316" rx="1" />
              <rect x="52" y="75" width="34" height="16" fill="#eab308" rx="1" />
              <rect x="86" y="75" width="34" height="16" fill="#22c55e" rx="1" />
              <rect x="120" y="75" width="30" height="16" fill="#15803d" rx="1" />
              <!-- Level labels -->
              <text x="21" y="17" text-anchor="middle" font-size="7" fill="white" font-weight="600">I</text>
              <text x="57" y="17" text-anchor="middle" font-size="7" fill="white" font-weight="600">II</text>
              <text x="86" y="17" text-anchor="middle" font-size="7" fill="white" font-weight="600">III</text>
              <text x="111" y="17" text-anchor="middle" font-size="7" fill="white" font-weight="600">IV</text>
              <text x="136" y="17" text-anchor="middle" font-size="7" fill="white" font-weight="600">V</text>
            </g>
          </svg>
        </div>

        <!-- Info -->
        <div class="card-body">
          <div class="card-name-row">
            <code class="card-name">{{ comp.name }}</code>
            <span class="card-api-badge">{{ comp.api }}</span>
          </div>
          <p class="card-desc">{{ comp.desc }}</p>
          <ul class="card-use-cases">
            <li v-for="uc in comp.useCases" :key="uc">{{ uc }}</li>
          </ul>
        </div>

        <div class="card-footer">
          <a
            v-if="comp.githubFile"
            :href="GH_BASE + comp.githubFile"
            target="_blank"
            rel="noopener"
            class="card-gh-link"
            @click.stop
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            Source
          </a>
          <span class="card-link">Öffnen <i class="pi pi-arrow-right" /></span>
        </div>
      </RouterLink>
    </div>
  </main>
</template>

<style scoped>
.index-main {
  max-width: 1100px;
  margin: 32px auto;
  padding: 0 20px;
}

.index-intro { margin-bottom: 28px; }
.intro-heading { font-size: 1.2rem; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
.intro-text { font-size: 0.88rem; color: #475569; max-width: 600px; }

.index-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
}

.comp-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: box-shadow 0.15s, border-color 0.15s, transform 0.1s;
}
.comp-card:hover {
  box-shadow: 0 8px 24px rgba(30, 58, 95, 0.12);
  border-color: #93c5fd;
  transform: translateY(-2px);
}

.card-preview {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 150px;
}
.preview-svg { width: 100%; max-width: 220px; height: 120px; }

.card-body { padding: 16px 18px 12px; flex: 1; }
.card-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}
.card-name {
  font-size: 0.95rem;
  font-weight: 700;
  font-family: ui-monospace, monospace;
  color: #1e3a5f;
  background: #eff6ff;
  padding: 2px 7px;
  border-radius: 4px;
}
.card-api-badge {
  font-size: 0.7rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: ui-monospace, monospace;
  white-space: nowrap;
}
.card-desc { font-size: 0.82rem; color: #475569; line-height: 1.5; margin-bottom: 10px; }
.card-use-cases {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.card-use-cases li {
  font-size: 0.78rem;
  color: #64748b;
  padding-left: 12px;
  position: relative;
}
.card-use-cases li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: #93c5fd;
}

.card-footer {
  padding: 10px 18px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-gh-link {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 0.72rem; font-weight: 600; color: #64748b;
  background: #f1f5f9; border: 1px solid #e2e8f0;
  padding: 3px 8px; border-radius: 4px;
  transition: all 0.15s; text-decoration: none;
}
.card-gh-link:hover { background: #1e293b; color: #fff; border-color: #1e293b; }
.card-link {
  font-size: 0.78rem;
  font-weight: 600;
  color: #1e3a5f;
  display: flex;
  align-items: center;
  gap: 4px;
}
.comp-card:hover .card-link { color: #2563eb; }
</style>
