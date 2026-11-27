// Speichert Bestenlisten, ein laufendes Quiz und den Lernfortschritt im Browser.

const SCORES_KEY = 'geo-trainer.scores.v1';
const RUN_KEY = 'geo-trainer.run.v1';
const STATS_KEY = 'geo-trainer.stats.v1';
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
    /* Speicher voll oder gesperrt */
  }
}

export function compareAttempts(a, b) {
  return b.pct - a.pct || a.time - b.time || a.date - b.date;
}

export const getScores = (key) => read(SCORES_KEY, {})[key] || [];
export const getAllScores = () => read(SCORES_KEY, {});

export function addScore(key, attempt) {
  const all = read(SCORES_KEY, {});
  const list = [...(all[key] || []), attempt].sort(compareAttempts);
  const rank = list.indexOf(attempt) + 1;
  all[key] = list.slice(0, MAX_SCORES);
  write(SCORES_KEY, all);
  return rank <= MAX_SCORES ? rank : 0;
}

export function clearScores(key) {
  if (!key) return write(SCORES_KEY, null);
  const all = read(SCORES_KEY, {});
  delete all[key];
  write(SCORES_KEY, all);
}

export const loadRun = () => read(RUN_KEY, null);
export const saveRun = (run) => write(RUN_KEY, run);
export const clearRun = () => write(RUN_KEY, null);

// Lernfortschritt: pro Frage, ob sie zuletzt richtig beantwortet wurde
export function recordAnswer(key, ok) {
  const s = read(STATS_KEY, {});
  const prev = s[key] || [0, 0, 0];
  s[key] = [prev[0] + (ok ? 1 : 0), prev[1] + (ok ? 0 : 1), ok ? 1 : 0];
  write(STATS_KEY, s);
}

export const getStats = () => read(STATS_KEY, {});

export function mastery(keys) {
  const s = getStats();
  const done = keys.filter((k) => s[k] && s[k][2] === 1).length;
  return { done, total: keys.length };
}

export const clearStats = () => write(STATS_KEY, null);
