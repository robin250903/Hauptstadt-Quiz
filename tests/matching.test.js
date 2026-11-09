import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkAnswer, diffWords, normalize } from '../src/matching.js';
import { ENTRIES, ENTRY_BY_ID, buildCategories } from '../src/data/entries.js';

const check = (input, id) => checkAnswer(input, ENTRY_BY_ID[id], ENTRIES).result;

test('richtige Antworten, auch ohne Akzente und in anderen Sprachen', () => {
  assert.equal(check('Paris', 'fr'), 'exact');
  assert.equal(check('  paris ', 'fr'), 'exact');
  assert.equal(check('Bogota', 'co'), 'exact');
  assert.equal(check('Reykjavik', 'is'), 'exact');
  assert.equal(check('Vienna', 'at'), 'exact');
  assert.equal(check('Pjoengjang', 'kp'), 'exact');
  assert.equal(check('Pyongyang', 'kp'), 'exact');
  assert.equal(check('Saint Johns', 'ag'), 'exact');
  assert.equal(check("St John's", 'ag'), 'exact');
  assert.equal(check('Washington', 'us'), 'exact');
  assert.equal(check('La Paz', 'bo'), 'exact');
  assert.equal(check('Ramallah', 'ps'), 'exact');
  assert.equal(check('Chisinau', 'md'), 'exact');
});

test('Tippfehler zählen als fast richtig', () => {
  assert.equal(check('Reikjavik', 'is'), 'close');
  assert.equal(check('Kopenhagn', 'dk'), 'close');
  assert.equal(check('Ouagadogou', 'bf'), 'close');
  assert.equal(check('Tegucigalpha', 'hn'), 'close');
  assert.equal(check('Bratsilava', 'sk'), 'close');
  assert.equal(check('Ulan Bator', 'mn'), 'exact');
  assert.equal(check('Ulanbatar', 'mn'), 'close');
});

test('falsche Antworten', () => {
  assert.equal(check('', 'fr'), 'wrong');
  assert.equal(check('Lyon', 'fr'), 'wrong');
  assert.equal(check('Sydney', 'au'), 'wrong');
  assert.equal(check('Bern', 'de'), 'wrong');
  // Eine andere echte Hauptstadt ist falsch, auch wenn sie ähnlich aussieht
  assert.equal(check('Niamey', 'ml'), 'wrong');
  assert.equal(check('Abuja', 'ng'), 'exact');
  assert.equal(check('Accra', 'ng'), 'wrong');
});

test('normalize', () => {
  assert.equal(normalize('São Tomé'), 'saotome');
  assert.equal(normalize('Saint-Denis'), 'stdenis');
  assert.equal(normalize('St. Denis'), 'stdenis');
});

test('diffWords markiert abweichende Buchstaben', () => {
  const d = diffWords('Reikjavik', 'Reykjavík');
  assert.deepEqual(d.typed.filter((p) => p.diff).map((p) => p.text), ['i']);
  assert.deepEqual(d.correct.filter((p) => p.diff).map((p) => p.text), ['y']);
});

test('Kategorien und Daten sind vollständig', () => {
  const cats = buildCategories();
  const byKey = Object.fromEntries(cats.map((c) => [c.key, c]));
  assert.equal(byKey['world-s'].ids.length, 197);
  assert.equal(byKey['world-all'].ids.length, byKey['world-s'].ids.length + byKey['world-t'].ids.length);
  for (const e of ENTRIES) {
    assert.ok(e.ll[0] >= -90 && e.ll[0] <= 90, e.name);
    assert.ok(e.ll[1] >= -180 && e.ll[1] <= 180, e.name);
    assert.ok(['eu', 'as', 'af', 'na', 'sa', 'oc'].includes(e.cont), e.name);
  }
});
