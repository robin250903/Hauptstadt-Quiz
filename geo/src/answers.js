// Prüft eingetippte Antworten im Geo-Trainer – wie beim Hauptstadt-Quiz:
// Groß-/Kleinschreibung, Akzente und ä/ae sind egal, kleine Tippfehler zählen trotzdem.

import { ENTRY_BY_ID } from '../../src/data/entries.js';
import { normalize, distance, allowedErrors } from '../../src/matching.js';
import { COUNTRIES } from './data/countries.js';

// Weitere akzeptierte Namen je Land (der deutsche Name aus dem Hauptstadt-Quiz gilt immer)
const ALIASES = {
  al: ['Albania', 'Shqipëria'],
  ad: [],
  at: ['Austria'],
  be: ['Belgium', 'Belgique', 'België'],
  bg: ['Bulgaria'],
  hr: ['Croatia', 'Hrvatska'],
  cz: ['Czechia', 'Czech Republic', 'Tschechische Republik', 'Tschechei'],
  dk: ['Denmark', 'Danmark'],
  ee: ['Estonia', 'Eesti'],
  fi: ['Finland', 'Suomi'],
  fr: ['France'],
  de: ['Germany', 'BRD'],
  gr: ['Greece', 'Hellas'],
  hu: ['Hungary', 'Magyarország'],
  is: ['Iceland', 'Ísland'],
  ie: ['Ireland', 'Éire', 'Republik Irland'],
  it: ['Italy', 'Italia'],
  lv: ['Latvia'],
  lt: ['Lithuania'],
  lu: ['Luxembourg'],
  mt: [],
  me: ['Crna Gora'],
  nl: ['Netherlands', 'Holland', 'Nederland'],
  mk: ['North Macedonia', 'Macedonia', 'Mazedonien'],
  no: ['Norway', 'Norge'],
  pl: ['Poland', 'Polska'],
  pt: [],
  ro: ['Romania'],
  ru: ['Russia', 'Russische Föderation'],
  rs: ['Serbia', 'Srbija'],
  sk: ['Slovakia'],
  si: ['Slovenia'],
  es: ['Spain', 'España'],
  se: ['Sweden', 'Sverige'],
  ch: ['Switzerland', 'Suisse', 'Svizzera'],
  tr: ['Turkey', 'Türkiye'],
  ua: [],
  gb: ['United Kingdom', 'UK', 'Großbritannien', 'Great Britain', 'Britain', 'England', 'Schottland', 'Scotland', 'Wales'],
  fo: ['Faroe Islands', 'Färöer-Inseln', 'Färöer Inseln'],
  bd: [],
  bt: [],
  kh: ['Cambodia'],
  hk: ['Hong Kong'],
  in: ['India'],
  id: ['Indonesia'],
  il: [],
  jp: ['Nippon'],
  jo: ['Jordan'],
  kz: ['Kazakhstan'],
  kg: ['Kyrgyzstan', 'Kirgisistan'],
  la: [],
  lb: ['Lebanon'],
  my: [],
  mn: ['Mongolia'],
  np: [],
  ph: ['Philippines'],
  qa: ['Qatar'],
  sg: ['Singapore'],
  kr: ['South Korea', 'Korea'],
  lk: [],
  tw: [],
  th: [],
  ae: ['VAE', 'UAE', 'United Arab Emirates', 'Emirate', 'Dubai'],
  vn: [],
  mo: ['Macau', 'Macao'],
  bw: [],
  sz: ['Swasiland', 'Swaziland'],
  gh: [],
  ke: ['Kenya'],
  ls: [],
  mg: ['Madagascar'],
  ng: [],
  rw: ['Rwanda'],
  sn: [],
  za: ['South Africa', 'RSA'],
  tn: ['Tunisia'],
  ug: [],
  re: ['Reunion'],
  us: ['USA', 'US', 'United States', 'Amerika', 'America', 'Vereinigte Staaten von Amerika'],
  ca: ['Canada'],
  mx: ['Mexico'],
  gt: [],
  cr: [],
  pa: ['Panamá'],
  do: ['Dominican Republic', 'Dom Rep', 'Dominikanische Rep'],
  pr: [],
  gl: ['Greenland'],
  vi: ['US Virgin Islands', 'Jungferninseln', 'Amerikanische Jungferninseln', 'Virgin Islands'],
  bm: [],
  ar: ['Argentina'],
  bo: ['Bolivia'],
  br: ['Brazil', 'Brasil'],
  cl: [],
  co: ['Colombia'],
  ec: [],
  pe: ['Perú'],
  uy: [],
  au: ['Australia'],
  nz: ['New Zealand', 'Aotearoa'],
};

const umlautForm = (s) => normalize(s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue'));
const forms = (s) => [...new Set([normalize(s), umlautForm(s)])];

/** Alle Schreibweisen eines Landes */
export function countryNames(id) {
  return [...new Set([ENTRY_BY_ID[id]?.name || id, ...(ALIASES[id] || [])])];
}

/** Auswahl-Liste für die Prüfung: [{ id, label, names }] */
const COUNTRY_CHOICES = COUNTRIES.map((c) => ({ id: c.id, label: ENTRY_BY_ID[c.id]?.name || c.id, names: countryNames(c.id) }));

export const DRIVE_CHOICES = [
  { id: 'L', label: 'Linksverkehr', names: ['Links', 'Linksverkehr', 'Left', 'L'] },
  { id: 'R', label: 'Rechtsverkehr', names: ['Rechts', 'Rechtsverkehr', 'Right', 'R'] },
];

/** Region „Zentral-West (Cerrado)“ → auch „Zentral-West“ und „Cerrado“; „A / B“ → beide Teile */
export function regionNames(name) {
  const out = [name];
  const m = name.match(/^(.*?)\s*\((.*)\)$/);
  if (m) out.push(m[1], m[2]);
  for (const n of [...out]) for (const sep of [' / ', ' & ']) if (n.includes(sep)) out.push(...n.split(sep));
  return [...new Set(out.map((s) => s.trim()).filter(Boolean))];
}

export function choicesFor(q, regions) {
  if (q.kind === 'drive') return DRIVE_CHOICES;
  if (q.kind === 'region') return regions.map((r, i) => ({ id: String(i), label: r.n, names: regionNames(r.n) }));
  return COUNTRY_CHOICES;
}

/**
 * Prüft eine Eingabe.
 * @param input   Eingabe
 * @param accept  IDs, die als richtig gelten
 * @param choices alle möglichen Antworten [{ id, label, names }]
 * @returns {{ result: 'exact'|'close'|'wrong', id: string|null, match: string|null }}
 *   id/match = das gemeinte Land bzw. die gemeinte Schreibweise (auch bei falscher Antwort, wenn erkannt)
 */
export function checkTyped(input, accept, choices) {
  const raw = (input || '').trim();
  if (!raw) return { result: 'wrong', id: null, match: null };
  const typed = forms(raw);
  // 1. exakte Schreibweise
  for (const c of choices) {
    for (const n of c.names) {
      if (forms(n).some((f) => typed.includes(f))) {
        return { result: accept.includes(c.id) ? 'exact' : 'wrong', id: c.id, match: n };
      }
    }
  }
  // 2. Tippfehler: die ähnlichste Schreibweise über alle Antworten gewinnt
  let best = null;
  for (const c of choices) {
    for (const n of c.names) {
      for (const f of forms(n)) {
        const d = Math.min(...typed.map((t) => distance(t, f)));
        if (d <= allowedErrors(f.length) && (!best || d < best.d)) best = { d, id: c.id, match: n };
      }
    }
  }
  if (best) return { result: accept.includes(best.id) ? 'close' : 'wrong', id: best.id, match: best.match };
  return { result: 'wrong', id: null, match: null };
}
