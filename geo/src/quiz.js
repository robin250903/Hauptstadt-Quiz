// Erzeugt Quizfragen aus den Lerndaten. Ohne DOM – wird auch von den Tests benutzt.

import { ENTRY_BY_ID } from '../../src/data/entries.js';
import { COUNTRIES, COUNTRY_BY_ID } from './data/countries.js';
import { CATEGORIES, CATEGORY_BY_ID } from './data/categories.js';
import { REGIONS } from './data/regions.js';

export const OPTION_COUNT = 4;

/** Deutscher Name eines Landes (aus dem Hauptstadt-Quiz) */
export function countryName(id) {
  return ENTRY_BY_ID[id]?.name || id;
}

export function cont(id) {
  return ENTRY_BY_ID[id]?.cont;
}

export function shuffle(list, rnd = Math.random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const known = (ids) => ids.filter((id) => COUNTRY_BY_ID[id]);
const countryOption = (id) => ({ id, label: countryName(id), flag: id });

/** Alle Länder, die in einer Kategorie mit einem Merkmal vorkommen */
export function categoryCountries(cat) {
  if (cat.kind !== 'items') return COUNTRIES.map((c) => c.id);
  return [...new Set(cat.items.flatMap((i) => known(i.c)))];
}

/** Mögliche falsche Antworten für ein Merkmal */
export function distractorPool(cat, item) {
  const exclude = new Set([...item.c, ...(item.amb || [])]);
  let pool = known(item.pool || categoryCountries(cat)).filter((id) => !exclude.has(id));
  if (pool.length < OPTION_COUNT - 1) {
    const extra = COUNTRIES.map((c) => c.id).filter((id) => !exclude.has(id) && !pool.includes(id));
    pool = pool.concat(extra);
  }
  return pool;
}

/** Wählt falsche Antworten – bevorzugt aus demselben Kontinent, damit es knifflig bleibt */
function pickDistractors(pool, correct, n, rnd) {
  const same = shuffle(pool.filter((id) => cont(id) === cont(correct)), rnd);
  const other = shuffle(pool.filter((id) => cont(id) !== cont(correct)), rnd);
  const takeSame = Math.min(same.length, Math.ceil(n / 2) + (rnd() < 0.5 ? 1 : 0));
  return [...same.slice(0, takeSame), ...other].concat(same.slice(takeSame)).slice(0, n);
}

function withOptions(q, correctOpt, wrongOpts, rnd) {
  const options = shuffle([correctOpt, ...wrongOpts], rnd);
  return { ...q, options, correct: options.findIndex((o) => o.id === correctOpt.id) };
}

function itemQuestion(cat, item, rnd) {
  const answers = known(item.c);
  const correct = answers[Math.floor(rnd() * answers.length)];
  const wrong = pickDistractors(distractorPool(cat, item), correct, OPTION_COUNT - 1, rnd);
  return withOptions(
    {
      key: `${cat.id}:${item.id}`,
      cat: cat.id,
      v: item.v,
      prompt: 'Welches Land passt dazu?',
      cap: item.cap,
      explain: item.text,
      also: answers.filter((a) => a !== correct),
    },
    countryOption(correct),
    wrong.map(countryOption),
    rnd,
  );
}

function driveQuestion(c) {
  const opts = [
    { id: 'L', label: 'Linksverkehr', icon: '⬅️' },
    { id: 'R', label: 'Rechtsverkehr', icon: '➡️' },
  ];
  return {
    key: `fahrseite:${c.id}`,
    cat: 'fahrseite',
    subject: c.id,
    prompt: `${countryName(c.id)}: Links- oder Rechtsverkehr?`,
    v: { type: 'road', center: { color: '#f4f4f4', style: 'dashed' }, edge: { color: '#f4f4f4', style: 'solid' } },
    options: opts,
    correct: c.drive === 'L' ? 0 : 1,
    explain: `${countryName(c.id)}: ${c.drive === 'L' ? 'Linksverkehr' : 'Rechtsverkehr'}.`,
    binary: true,
  };
}

function valueQuestions(cat, field, rnd) {
  const groups = new Map();
  for (const c of COUNTRIES) groups.set(c[field], [...(groups.get(c[field]) || []), c.id]);
  return [...groups].map(([value, ids]) => {
    const correct = ids[Math.floor(rnd() * ids.length)];
    const pool = COUNTRIES.map((c) => c.id).filter((id) => !ids.includes(id));
    const wrong = pickDistractors(pool, correct, OPTION_COUNT - 1, rnd);
    const names = ids.map(countryName);
    const label = field === 'tld' ? `www.beispiel${value}` : `${value} …`;
    return withOptions(
      {
        key: `${cat.id}:${value}`,
        cat: cat.id,
        v: { type: 'text', text: label, style: field === 'tld' ? 'mono' : 'mono phone' },
        prompt: field === 'tld' ? `Zu welchem Land gehört die Domain ${value}?` : `Zu welchem Land gehört die Vorwahl ${value}?`,
        explain: `${value} → ${names.join(', ')}`,
        also: ids.filter((i) => i !== correct),
      },
      countryOption(correct),
      wrong.map(countryOption),
      rnd,
    );
  });
}

/** Alle Fragen einer Kategorie (gemischt, ggf. auf size begrenzt) */
export function buildCategoryQuestions(catId, rnd = Math.random, size) {
  const cat = CATEGORY_BY_ID[catId];
  let qs;
  if (cat.kind === 'items') qs = cat.items.map((it) => itemQuestion(cat, it, rnd));
  else if (cat.kind === 'drive') qs = COUNTRIES.map(driveQuestion);
  else if (cat.kind === 'tld') qs = valueQuestions(cat, 'tld', rnd);
  else if (cat.kind === 'tel') qs = valueQuestions(cat, 'tel', rnd);
  qs = shuffle(qs, rnd);
  const n = size ?? cat.size;
  return n ? qs.slice(0, n) : qs;
}

/** Gemischtes Quiz über alle Merkmal-Kategorien */
export function buildMixQuestions(n = 25, rnd = Math.random) {
  const all = CATEGORIES.flatMap((c) => buildCategoryQuestions(c.id, rnd, 0));
  return shuffle(all, rnd).slice(0, n);
}

/** Regionen-Quiz für ein Land: Hinweis → Region */
export function buildRegionQuestions(countryId, rnd = Math.random) {
  const data = REGIONS[countryId];
  if (!data) return [];
  const regions = data.regions;
  return shuffle(
    regions.map((r, i) => {
      const others = shuffle(
        regions.filter((x) => x !== r),
        rnd,
      ).slice(0, OPTION_COUNT - 1);
      const opts = [r, ...others].map((x) => ({ id: String(regions.indexOf(x)), label: x.n }));
      return withOptions(
        {
          key: `region:${countryId}:${i}`,
          cat: `region-${countryId}`,
          map: { country: countryId, region: i },
          prompt: `${countryName(countryId)}: In welcher Region bist du?`,
          clues: r.t,
          explain: `${r.n}: ${r.t.join(' · ')}`,
        },
        opts[0],
        opts.slice(1),
        rnd,
      );
    }),
    rnd,
  );
}

/** Welche Merkmale (Lernkarten) es zu einem Land gibt */
export function itemsForCountry(id) {
  const out = [];
  for (const cat of CATEGORIES) {
    if (cat.kind !== 'items') continue;
    for (const it of cat.items) if (it.c.includes(id)) out.push({ cat, item: it });
  }
  return out;
}

export function questionKeys(catId) {
  const cat = CATEGORY_BY_ID[catId];
  if (!cat) return [];
  if (cat.kind === 'items') return cat.items.map((i) => `${cat.id}:${i.id}`);
  if (cat.kind === 'drive') return COUNTRIES.map((c) => `fahrseite:${c.id}`);
  const field = cat.kind === 'tld' ? 'tld' : 'tel';
  return [...new Set(COUNTRIES.map((c) => `${cat.id}:${c[field]}`))];
}
