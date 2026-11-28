// Erzeugt Quizfragen aus den Lerndaten. Ohne DOM – wird auch von den Tests benutzt.

import { ENTRY_BY_ID } from '../../src/data/entries.js';
import { COUNTRIES, COUNTRY_BY_ID } from './data/countries.js';
import { CATEGORIES, CATEGORY_BY_ID } from './data/categories.js';
import { REGIONS } from './data/regions.js';

/** Deutscher Name eines Landes (aus dem Hauptstadt-Quiz) */
export function countryName(id) {
  return ENTRY_BY_ID[id]?.name || id;
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

// Jede Frage wird eingetippt (keine Auswahl-Antworten):
//   kind    'country' | 'drive' | 'region'
//   accept  IDs, die als richtig gelten (bei Merkmalen, die es in mehreren Ländern gibt, jedes davon)
//   answer  Text der richtigen Antwort für die Auflösung

function itemQuestion(cat, item) {
  const accept = known(item.c);
  return {
    key: `${cat.id}:${item.id}`,
    cat: cat.id,
    kind: 'country',
    v: item.v,
    prompt: accept.length > 1 ? 'Welches Land passt dazu? (Eines reicht.)' : 'Welches Land passt dazu?',
    cap: item.cap,
    explain: item.text,
    accept,
    answer: accept.map(countryName).join(', '),
  };
}

function driveQuestion(c) {
  return {
    key: `fahrseite:${c.id}`,
    cat: 'fahrseite',
    kind: 'drive',
    subject: c.id,
    prompt: `${countryName(c.id)}: Links- oder Rechtsverkehr?`,
    v: { type: 'road', center: { color: '#f4f4f4', style: 'dashed' }, edge: { color: '#f4f4f4', style: 'solid' } },
    accept: [c.drive],
    answer: c.drive === 'L' ? 'Linksverkehr' : 'Rechtsverkehr',
    explain: `${countryName(c.id)}: ${c.drive === 'L' ? 'Linksverkehr' : 'Rechtsverkehr'}.`,
  };
}

function valueQuestions(cat, field) {
  const groups = new Map();
  for (const c of COUNTRIES) groups.set(c[field], [...(groups.get(c[field]) || []), c.id]);
  return [...groups].map(([value, ids]) => ({
    key: `${cat.id}:${value}`,
    cat: cat.id,
    kind: 'country',
    v: { type: 'text', text: field === 'tld' ? `www.beispiel${value}` : `${value} …`, style: field === 'tld' ? 'mono' : 'mono phone' },
    prompt:
      (field === 'tld' ? `Zu welchem Land gehört die Domain ${value}?` : `Zu welchem Land gehört die Vorwahl ${value}?`) +
      (ids.length > 1 ? ' (Eines reicht.)' : ''),
    explain: `${value} → ${ids.map(countryName).join(', ')}`,
    accept: ids,
    answer: ids.map(countryName).join(', '),
  }));
}

/** Alle Fragen einer Kategorie (gemischt, ggf. auf size begrenzt) */
export function buildCategoryQuestions(catId, rnd = Math.random, size) {
  const cat = CATEGORY_BY_ID[catId];
  let qs;
  if (cat.kind === 'items') qs = cat.items.map((it) => itemQuestion(cat, it));
  else if (cat.kind === 'drive') qs = COUNTRIES.map(driveQuestion);
  else if (cat.kind === 'tld') qs = valueQuestions(cat, 'tld');
  else if (cat.kind === 'tel') qs = valueQuestions(cat, 'tel');
  qs = shuffle(qs, rnd);
  const n = size ?? cat.size;
  return n ? qs.slice(0, n) : qs;
}

/** Gemischtes Quiz über alle Merkmal-Kategorien */
export function buildMixQuestions(n = 25, rnd = Math.random) {
  const all = CATEGORIES.flatMap((c) => buildCategoryQuestions(c.id, rnd, 0));
  return shuffle(all, rnd).slice(0, n);
}

/** Regionen-Quiz für ein Land: Hinweis → Region (eintippen) */
export function buildRegionQuestions(countryId, rnd = Math.random) {
  const data = REGIONS[countryId];
  if (!data) return [];
  return shuffle(
    data.regions.map((r, i) => ({
      key: `region:${countryId}:${i}`,
      cat: `region-${countryId}`,
      kind: 'region',
      country: countryId,
      map: { country: countryId, region: i },
      prompt: `${countryName(countryId)}: In welcher Region bist du?`,
      clues: r.t,
      explain: `${r.n}: ${r.t.join(' · ')}`,
      accept: [String(i)],
      answer: r.n,
    })),
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
