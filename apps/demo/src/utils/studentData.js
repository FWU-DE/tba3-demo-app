import { GROUPS } from './constants';

// ── Deterministic pseudo-random helpers ──────────────────────────────────────

const lcgNext = (s) => (s * 1664525 + 1013904223) & 0xffffffff;
const lcgFloat = (s) => (lcgNext(s) >>> 0) / 0xffffffff;

// ── Domain definitions per subject / grade ───────────────────────────────────

export const SUBJECT_DOMAINS = {
  'DE-V3': ['Lesen', 'Orthographie'],
  'DE-V8': ['Lesen', 'Zuhören', 'Sprachgebrauch'],
  'MA-V3': ['Zahlen & Operationen', 'Raum & Form', 'Größen & Messen'],
  'MA-V8': ['Leitidee Zahl', 'Leitidee Raum & Form', 'Leitidee Funkt. Zusammenhang'],
  'EN-V8': ['Reading', 'Listening'],
  'FR-V8': ['Compréhension écrite', 'Compréhension orale'],
};

// ── Name pools ────────────────────────────────────────────────────────────────

const FIRST_F = [
  'Anna', 'Lena', 'Emma', 'Laura', 'Sarah', 'Lisa', 'Hannah', 'Marie',
  'Sophia', 'Julia', 'Leonie', 'Mia', 'Jana', 'Eva', 'Clara', 'Nina',
  'Lea', 'Sophie', 'Katja', 'Jessica',
];
const FIRST_M = [
  'Lukas', 'Leon', 'Finn', 'Jonas', 'Tim', 'Max', 'Paul', 'Felix',
  'Noah', 'Ben', 'Tom', 'Jan', 'Erik', 'Moritz', 'Niklas', 'David',
  'Simon', 'Julian', 'Tobias', 'Luca',
];
const LAST = [
  'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner',
  'Becker', 'Schulz', 'Hoffmann', 'Braun', 'Richter', 'Klein', 'Wolf',
  'Koch', 'Bauer', 'Neumann', 'Schwarz', 'Zimmermann', 'Schäfer',
];

// ── Competence level helpers ──────────────────────────────────────────────────

const LEVEL_THRESHOLDS = [14, 38, 73, 91];
const LEVELS = ['I', 'II', 'III', 'IV', 'V'];

const pctToLevel = (pct) => {
  if (pct < LEVEL_THRESHOLDS[0]) return 'I';
  if (pct < LEVEL_THRESHOLDS[1]) return 'II';
  if (pct < LEVEL_THRESHOLDS[2]) return 'III';
  if (pct < LEVEL_THRESHOLDS[3]) return 'IV';
  return 'V';
};

// Generate a domain level correlated with the student's overall level.
// offset ∈ {-1, 0, 0, +1} — mostly stays close, occasionally shifts by one.
const domainLevel = (overallLevel, seed) => {
  const idx = LEVELS.indexOf(overallLevel);
  const r = (lcgNext(seed) >>> 0) % 4; // 0,1,2,3
  const shift = r === 0 ? -1 : r === 3 ? 1 : 0;
  const newIdx = Math.max(0, Math.min(4, idx + shift));
  return LEVELS[newIdx];
};

// ── Generation ────────────────────────────────────────────────────────────────

const STUDENTS_PER_GROUP = 12;

export const STUDENTS = GROUPS.flatMap((group, gi) =>
  Array.from({ length: STUDENTS_PER_GROUP }, (_, si) => {
    let seed = (gi * 1000 + si + 1) * 7919;

    seed = lcgNext(seed);
    const isFemale = (seed >>> 0) % 2 === 0;

    seed = lcgNext(seed);
    const firstName = isFemale
      ? FIRST_F[(seed >>> 0) % FIRST_F.length]
      : FIRST_M[(seed >>> 0) % FIRST_M.length];

    seed = lcgNext(seed);
    const lastName = LAST[(seed >>> 0) % LAST.length];

    seed = lcgNext(seed);
    const levelPct = (seed >>> 0) % 100;
    const competenceLevel = pctToLevel(levelPct);

    // Domain-level scores correlated with overall level
    const domainKey = `${group.subject}-${group.grade}`;
    const domains = SUBJECT_DOMAINS[domainKey] ?? [];
    const domainLevels = {};
    domains.forEach((d, di) => {
      seed = lcgNext(seed + di * 31);
      domainLevels[d] = domainLevel(competenceLevel, seed);
    });

    return {
      id: `st-${group.id}-${si}`,
      firstName,
      lastName,
      gender: isFemale ? 'f' : 'm',
      grade: group.grade,
      subject: group.subject,
      classGroupId: group.id,
      competenceLevel,
      domainLevels,
    };
  })
);

const BY_ID = Object.fromEntries(STUDENTS.map((s) => [s.id, s]));
export const getStudentById = (id) => BY_ID[id] ?? null;
