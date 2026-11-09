// Speichert Bestenlisten und ein laufendes Quiz im Browser (localStorage).

const SCORES_KEY = 'hauptstadt-quiz.scores.v1';
const RUN_KEY = 'hauptstadt-quiz.run.v1';
const PREFS_KEY = 'hauptstadt-quiz.prefs.v1';
export const MAX_SCORES = 5;

function read(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Speicher voll oder gesperrt – dann eben ohne Speichern */
  }
}

/** Besser = höherer Anteil richtig, bei Gleichstand schneller. */
export function compareAttempts(a, b) {
  return b.pct - a.pct || a.time - b.time || a.date - b.date;
}

export function getScores(catKey) {
  return read(SCORES_KEY, {})[catKey] || [];
}

export function getAllScores() {
  return read(SCORES_KEY, {});
}

/**
 * Trägt einen Versuch ein und behält die besten fünf.
 * @returns Platz (1–5) oder 0, wenn der Versuch nicht in die Top 5 kommt
 */
export function addScore(catKey, attempt) {
  const all = read(SCORES_KEY, {});
  const list = [...(all[catKey] || []), attempt].sort(compareAttempts);
  const rank = list.indexOf(attempt) + 1;
  all[catKey] = list.slice(0, MAX_SCORES);
  write(SCORES_KEY, all);
  return rank <= MAX_SCORES ? rank : 0;
}

export function clearScores(catKey) {
  if (!catKey) return write(SCORES_KEY, null);
  const all = read(SCORES_KEY, {});
  delete all[catKey];
  write(SCORES_KEY, all);
}

export const loadRun = () => read(RUN_KEY, null);
export const saveRun = (run) => write(RUN_KEY, run);
export const clearRun = () => write(RUN_KEY, null);

export const loadPrefs = () => read(PREFS_KEY, {});
export const savePrefs = (p) => write(PREFS_KEY, { ...loadPrefs(), ...p });
