// Available Groups
export const GROUPS = [
  // V3 Deutsch
  { id: '3a-deutsch', name: '3a Deutsch', subject: 'DE', grade: 'V3' },
  { id: '3b-deutsch', name: '3b Deutsch', subject: 'DE', grade: 'V3' },
  { id: '3c-deutsch', name: '3c Deutsch', subject: 'DE', grade: 'V3' },

  // V3 Mathematik
  { id: '3a-mathe', name: '3a Mathematik', subject: 'MA', grade: 'V3' },
  { id: '3b-mathe', name: '3b Mathematik', subject: 'MA', grade: 'V3' },
  { id: '3c-mathe', name: '3c Mathematik', subject: 'MA', grade: 'V3' },

  // V8 Deutsch
  { id: '8a-deutsch', name: '8a Deutsch', subject: 'DE', grade: 'V8' },
  { id: '8b-deutsch', name: '8b Deutsch', subject: 'DE', grade: 'V8' },
  { id: '8c-deutsch', name: '8c Deutsch', subject: 'DE', grade: 'V8' },

  // V8 Englisch
  { id: '8a-englisch', name: '8a Englisch', subject: 'EN', grade: 'V8' },
  { id: '8b-englisch', name: '8b Englisch', subject: 'EN', grade: 'V8' },
  { id: '8c-englisch', name: '8c Englisch', subject: 'EN', grade: 'V8' },

  // V8 Französisch
  { id: '8a-franzoesisch', name: '8a Französisch', subject: 'FR', grade: 'V8' },
  { id: '8b-franzoesisch', name: '8b Französisch', subject: 'FR', grade: 'V8' },
  { id: '8c-franzoesisch', name: '8c Französisch', subject: 'FR', grade: 'V8' },

  // V8 Mathematik
  { id: '8a-mathe', name: '8a Mathematik', subject: 'MA', grade: 'V8' },
  { id: '8b-mathe', name: '8b Mathematik', subject: 'MA', grade: 'V8' },
  { id: '8c-mathe', name: '8c Mathematik', subject: 'MA', grade: 'V8' },
  { id: '8d-mathe', name: '8d Mathematik', subject: 'MA', grade: 'V8' },
];

// Available Schools
export const SCHOOLS = [
  { id: 'gs-musterstadt', name: 'Grundschule Musterstadt', type: 'Grundschule' },
  { id: 'gym-beispielstadt', name: 'Gymnasium Beispielstadt', type: 'Gymnasium' },
];

// Available States
export const STATES = [
  { id: 'beispielland', name: 'Beispielland' },
];

// Subject mappings
export const SUBJECTS = {
  DE: { code: 'DE', name: 'Deutsch', color: '#2563eb' },
  MA: { code: 'MA', name: 'Mathematik', color: '#7c3aed' },
  EN: { code: 'EN', name: 'Englisch', color: '#dc2626' },
  FR: { code: 'FR', name: 'Französisch', color: '#0891b2' },
};

// Grade levels
export const GRADES = {
  V3: { code: 'V3', name: 'Klasse 3', description: 'Vergleichsarbeiten Klasse 3' },
  V8: { code: 'V8', name: 'Klasse 8', description: 'Vergleichsarbeiten Klasse 8' },
};

// Competence levels
export const COMPETENCE_LEVELS = {
  I: {
    level: 'I',
    name: 'Kompetenzstufe I',
    description: 'Unter Mindeststandard',
    color: '#ef4444'
  },
  II: {
    level: 'II',
    name: 'Kompetenzstufe II',
    description: 'Mindeststandard',
    color: '#f97316'
  },
  III: {
    level: 'III',
    name: 'Kompetenzstufe III',
    description: 'Regelstandard',
    color: '#eab308'
  },
  IV: {
    level: 'IV',
    name: 'Kompetenzstufe IV',
    description: 'Regelstandard Plus',
    color: '#22c55e'
  },
  V: {
    level: 'V',
    name: 'Kompetenzstufe V',
    description: 'Optimalstandard',
    color: '#16a34a'
  },
};

// Demographic categories
export const GENDERS = {
  f: 'Weiblich',
  m: 'Männlich',
  d: 'Divers',
};

export const LANGUAGES = {
  german: 'Deutsch',
  english: 'Englisch',
  french: 'Französisch',
  other: 'Andere',
};

// Type parameters
export const TYPE_OPTIONS = [
  { value: 'group', label: 'Nur Gruppe' },
  { value: 'students', label: 'Nur Schüler*innen' },
  { value: 'both', label: 'Beide' },
];

// Educational material types
export const MATERIAL_TYPES = {
  worksheet: { id: 'worksheet', label: 'Übungsblatt', icon: '📄' },
  video: { id: 'video', label: 'Lernvideo', icon: '🎬' },
  game: { id: 'game', label: 'Lernspiel', icon: '🎮' },
  task_set: { id: 'task_set', label: 'Aufgabenset', icon: '📝' },
  support: { id: 'support', label: 'Fördermaterial', icon: '🌟' },
  reading: { id: 'reading', label: 'Lesetext', icon: '📖' },
};

// Educational materials catalog
export const EDUCATIONAL_MATERIALS = [
  // Deutsch V3
  {
    id: 'mat-de-v3-01',
    title: 'Lesen üben: Satzverständnis',
    description: 'Einfache Leseübungen zum Verstehen von Sätzen und kurzen Texten.',
    type: 'worksheet',
    subject: 'DE',
    grade: 'V3',
    targetLevels: ['I', 'II'],
    duration: '20 min',
  },
  {
    id: 'mat-de-v3-02',
    title: 'Rechtschreibung: Groß- und Kleinschreibung',
    description: 'Interaktive Aufgaben zur sicheren Anwendung der Groß- und Kleinschreibung.',
    type: 'task_set',
    subject: 'DE',
    grade: 'V3',
    targetLevels: ['II', 'III'],
    duration: '30 min',
  },
  {
    id: 'mat-de-v3-03',
    title: 'Kreatives Schreiben: Bildergeschichten',
    description: 'Anregungen und Hilfen zum eigenständigen Schreiben von Geschichten.',
    type: 'support',
    subject: 'DE',
    grade: 'V3',
    targetLevels: ['III', 'IV', 'V'],
    duration: '45 min',
  },
  {
    id: 'mat-de-v3-04',
    title: 'Wortschatz erweitern – Lernvideo',
    description: 'Animiertes Video zur Erweiterung des Grundwortschatzes für Klasse 3.',
    type: 'video',
    subject: 'DE',
    grade: 'V3',
    targetLevels: ['I', 'II', 'III'],
    duration: '15 min',
  },
  // Mathematik V3
  {
    id: 'mat-ma-v3-01',
    title: 'Einmaleins – Lernspiel',
    description: 'Spielerisches Üben des kleinen Einmaleins in verschiedenen Schwierigkeitsstufen.',
    type: 'game',
    subject: 'MA',
    grade: 'V3',
    targetLevels: ['I', 'II', 'III'],
    duration: '20 min',
  },
  {
    id: 'mat-ma-v3-02',
    title: 'Addition und Subtraktion im Zahlenraum bis 1000',
    description: 'Übungsblatt mit gestuften Aufgaben zum sicheren Rechnen.',
    type: 'worksheet',
    subject: 'MA',
    grade: 'V3',
    targetLevels: ['II', 'III'],
    duration: '30 min',
  },
  {
    id: 'mat-ma-v3-03',
    title: 'Sachaufgaben lösen – Schritt für Schritt',
    description: 'Strukturierte Hilfe zum Verstehen und Lösen von Textaufgaben.',
    type: 'support',
    subject: 'MA',
    grade: 'V3',
    targetLevels: ['I', 'II'],
    duration: '40 min',
  },
  // Deutsch V8
  {
    id: 'mat-de-v8-01',
    title: 'Sachtexte verstehen und analysieren',
    description: 'Strategien zur Textanalyse mit Übungstexten aus verschiedenen Bereichen.',
    type: 'reading',
    subject: 'DE',
    grade: 'V8',
    targetLevels: ['II', 'III', 'IV'],
    duration: '45 min',
  },
  {
    id: 'mat-de-v8-02',
    title: 'Grammatik: Satzglieder bestimmen',
    description: 'Übungsaufgaben zum sicheren Bestimmen von Subjekt, Prädikat und Objekt.',
    type: 'task_set',
    subject: 'DE',
    grade: 'V8',
    targetLevels: ['III', 'IV'],
    duration: '35 min',
  },
  {
    id: 'mat-de-v8-03',
    title: 'Erörterung schreiben – Fördermaterial',
    description: 'Aufbauendes Material mit Mustertexten und Hilfsmitteln für Klasse 8.',
    type: 'support',
    subject: 'DE',
    grade: 'V8',
    targetLevels: ['I', 'II'],
    duration: '60 min',
  },
  {
    id: 'mat-de-v8-04',
    title: 'Literarische Texte analysieren – Vertiefung',
    description: 'Anspruchsvolle Analyseaufgaben für leistungsstarke Schüler*innen.',
    type: 'task_set',
    subject: 'DE',
    grade: 'V8',
    targetLevels: ['IV', 'V'],
    duration: '50 min',
  },
  // Mathematik V8
  {
    id: 'mat-ma-v8-01',
    title: 'Lineare Gleichungen – Grundlagen',
    description: 'Schritt-für-Schritt-Erklärungen und Übungsaufgaben zu linearen Gleichungen.',
    type: 'video',
    subject: 'MA',
    grade: 'V8',
    targetLevels: ['II', 'III'],
    duration: '25 min',
  },
  {
    id: 'mat-ma-v8-02',
    title: 'Geometrie: Flächenberechnungen',
    description: 'Übungsblatt zu Flächen von Dreiecken, Vierecken und zusammengesetzten Figuren.',
    type: 'worksheet',
    subject: 'MA',
    grade: 'V8',
    targetLevels: ['III', 'IV'],
    duration: '40 min',
  },
  {
    id: 'mat-ma-v8-03',
    title: 'Prozentrechnung – Alltagsanwendungen',
    description: 'Realitätsnahe Aufgaben zur Prozentrechnung mit Lösungshilfen.',
    type: 'task_set',
    subject: 'MA',
    grade: 'V8',
    targetLevels: ['I', 'II', 'III'],
    duration: '35 min',
  },
  {
    id: 'mat-ma-v8-04',
    title: 'Knobel- und Denksportaufgaben Mathematik',
    description: 'Herausfordernde Aufgaben für mathematisch starke Schüler*innen.',
    type: 'game',
    subject: 'MA',
    grade: 'V8',
    targetLevels: ['IV', 'V'],
    duration: '30 min',
  },
  // Englisch V8
  {
    id: 'mat-en-v8-01',
    title: 'Vocabulary Training: Everyday Topics',
    description: 'Wortschatzübungen zu Alltagsthemen mit Wiederholungsspielen.',
    type: 'game',
    subject: 'EN',
    grade: 'V8',
    targetLevels: ['I', 'II', 'III'],
    duration: '20 min',
  },
  {
    id: 'mat-en-v8-02',
    title: 'Reading Comprehension: Short Stories',
    description: 'Kurze englische Texte mit Aufgaben zum Leseverstehen.',
    type: 'reading',
    subject: 'EN',
    grade: 'V8',
    targetLevels: ['II', 'III', 'IV'],
    duration: '40 min',
  },
  {
    id: 'mat-en-v8-03',
    title: 'Grammar: Tenses Review',
    description: 'Übungsblatt zu den wichtigsten englischen Zeitformen.',
    type: 'worksheet',
    subject: 'EN',
    grade: 'V8',
    targetLevels: ['III', 'IV'],
    duration: '30 min',
  },
  // Französisch V8
  {
    id: 'mat-fr-v8-01',
    title: 'Vocabulaire: La vie quotidienne',
    description: 'Vokabelübungen zum Alltagswortschatz mit Sprechübungen.',
    type: 'task_set',
    subject: 'FR',
    grade: 'V8',
    targetLevels: ['I', 'II'],
    duration: '25 min',
  },
  {
    id: 'mat-fr-v8-02',
    title: 'Compréhension écrite – Textes simples',
    description: 'Einfache französische Lesetexte mit Aufgaben für Einsteiger.',
    type: 'reading',
    subject: 'FR',
    grade: 'V8',
    targetLevels: ['II', 'III'],
    duration: '35 min',
  },
  {
    id: 'mat-fr-v8-03',
    title: 'Grammaire: Les verbes irréguliers',
    description: 'Lernvideo und Übungsblatt zu unregelmäßigen Verben im Französischen.',
    type: 'video',
    subject: 'FR',
    grade: 'V8',
    targetLevels: ['III', 'IV', 'V'],
    duration: '30 min',
  },
];

// Chart configuration defaults
export const CHART_DEFAULTS = {
  minHeight: 400,
  margin: { top: 20, right: 30, left: 20, bottom: 5 },
  animationDuration: 300,
};
