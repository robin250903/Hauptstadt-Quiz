// Vergleich der Eingabe mit der richtigen Hauptstadt.
// Ergebnis: 'exact' (richtig), 'close' (Tippfehler, zählt trotzdem) oder 'wrong'.

const SPECIAL = { ß: 'ss', ø: 'o', æ: 'ae', œ: 'oe', ð: 'd', þ: 'th', ı: 'i', ł: 'l', đ: 'd', ħ: 'h' };

function stripMarks(s) {
  return s
    .toLowerCase()
    .replace(/[ßøæœðþıłđħ]/g, (c) => SPECIAL[c])
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function compact(s) {
  return s
    .replace(/\b(saint|sankt|st)\b\.?/g, 'st')
    .replace(/[^a-z0-9]/g, '');
}

/** Vereinfachte Form: klein, ohne Akzente, Leerzeichen und Satzzeichen. */
export function normalize(s) {
  return compact(stripMarks(s.trim()));
}

/** Variante mit ausgeschriebenen Umlauten (ä → ae), damit "Pjoengjang" passt. */
function normalizeUmlauts(s) {
  const t = s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue');
  return compact(stripMarks(t));
}

/** Damerau-Levenshtein-Abstand (vertauschte Nachbarbuchstaben zählen als ein Fehler). */
export function distance(a, b) {
  const n = a.length;
  const m = b.length;
  if (!n) return m;
  if (!m) return n;
  const d = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) d[i][0] = i;
  for (let j = 0; j <= m; j++) d[0][j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[n][m];
}

/** Wie viele Fehler bei einem Wort dieser Länge noch erlaubt sind. */
export function allowedErrors(len) {
  if (len <= 3) return 0;
  if (len <= 5) return 1;
  if (len <= 8) return 2;
  if (len <= 13) return 3;
  return 4;
}

/** Alle akzeptierten Schreibweisen eines Eintrags. */
export function answersOf(entry) {
  const list = [entry.cap, ...(entry.ans || [])];
  // "Ostjerusalem / Ramallah" → beide Teile einzeln
  for (const a of [...list]) if (a.includes(' / ')) list.push(...a.split(' / '));
  return [...new Set(list)];
}

let otherCapitals = null;
function capitalIndex(allEntries) {
  if (otherCapitals) return otherCapitals;
  otherCapitals = new Set();
  for (const e of allEntries) for (const a of answersOf(e)) otherCapitals.add(normalize(a));
  return otherCapitals;
}

/**
 * Prüft eine Antwort.
 * @returns {{result: 'exact'|'close'|'wrong', match: string}}
 *   match = die Schreibweise, die gemeint war (bzw. die Hauptstadt bei falscher Antwort)
 */
export function checkAnswer(input, entry, allEntries = []) {
  const raw = (input || '').trim();
  const answers = answersOf(entry);
  if (!raw) return { result: 'wrong', match: entry.cap };

  const n = normalize(raw);
  const nu = normalizeUmlauts(raw);
  if (!n) return { result: 'wrong', match: entry.cap };

  for (const a of answers) {
    if (normalize(a) === n || normalizeUmlauts(a) === nu || normalizeUmlauts(a) === n) {
      return { result: 'exact', match: a };
    }
  }

  // Eine andere Hauptstadt richtig geschrieben → falsch, auch wenn sie ähnlich ist
  if (allEntries.length && capitalIndex(allEntries).has(n)) {
    return { result: 'wrong', match: entry.cap };
  }

  let best = null;
  for (const a of answers) {
    const forms = [normalize(a), normalizeUmlauts(a)];
    for (const f of forms) {
      const d = Math.min(distance(n, f), distance(nu, f));
      const ok = d <= allowedErrors(f.length);
      if (ok && (!best || d < best.d)) best = { d, a };
    }
  }
  if (best) return { result: 'close', match: best.a };
  return { result: 'wrong', match: entry.cap };
}

/**
 * Markiert Buchstaben, die zwischen Eingabe und richtiger Schreibweise abweichen.
 * Gibt für beide Wörter Teilstücke {text, diff} zurück.
 */
export function diffWords(typed, correct) {
  const A = [...typed];
  const B = [...correct];
  const key = (c) => compact(stripMarks(c)) || c;
  const n = A.length;
  const m = B.length;
  const d = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) d[i][0] = i;
  for (let j = 0; j <= m; j++) d[0][j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = key(A[i - 1]) === key(B[j - 1]) ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  const aMarks = new Array(n).fill(false);
  const bMarks = new Array(m).fill(false);
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (key(A[i - 1]) === key(B[j - 1]) ? 0 : 1)) {
      if (key(A[i - 1]) !== key(B[j - 1])) {
        aMarks[i - 1] = true;
        bMarks[j - 1] = true;
      }
      i--;
      j--;
    } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) {
      aMarks[i - 1] = true;
      i--;
    } else {
      bMarks[j - 1] = true;
      j--;
    }
  }
  const group = (chars, marks) => {
    const out = [];
    chars.forEach((c, k) => {
      const last = out[out.length - 1];
      if (last && last.diff === marks[k]) last.text += c;
      else out.push({ text: c, diff: marks[k] });
    });
    return out;
  };
  return { typed: group(A, aMarks), correct: group(B, bMarks) };
}
