// Einmaliges Hilfsskript: zieht zusätzliche Gebietsformen aus den großen
// Natural-Earth-Dateien und schreibt sie nach scripts/source/extra.geojson.
// Die Natural-Earth-Dateien (geojson) liegen nicht im Repository:
//   node scripts/extract-extra.mjs <ordner-mit-natural-earth-geojson>
// Benötigt: ne_10m_admin_0_map_units, ne_10m_admin_0_disputed_areas,
//           ne_10m_admin_1_states_provinces

import fs from 'node:fs';
import path from 'node:path';
import { topology } from 'topojson-server';
import { merge } from 'topojson-client';

const dir = process.argv[2];
const read = (n) => JSON.parse(fs.readFileSync(path.join(dir, `${n}.geojson`), 'utf8'));
const target = new URL('./source/extra.geojson', import.meta.url);
const extra = JSON.parse(fs.readFileSync(target, 'utf8'));
const has = (n) => extra.features.some((f) => f.properties.name === n);
const add = (name, geometry) => {
  if (has(name)) return;
  if (!geometry) throw new Error(`Keine Form für ${name}`);
  extra.features.push({ type: 'Feature', properties: { name }, geometry });
};

const mapUnits = read('ne_10m_admin_0_map_units');
for (const n of ['Zanzibar', 'Iraqi Kurdistan', 'Bougainville', 'Puntland', 'Azores', 'Madeira', 'Adjara', 'Tokelau']) {
  add(n, mapUnits.features.find((f) => f.properties.NAME === n)?.geometry);
}

const disputed = read('ne_10m_admin_0_disputed_areas');
for (const n of ['Ceuta', 'Melilla', 'Crimea']) {
  add(n, disputed.features.find((f) => f.properties.NAME === n || f.properties.BRK_NAME === n)?.geometry);
}

// Regionen aus mehreren Provinzen werden zu einer Fläche verschmolzen
const admin1 = read('ne_10m_admin_1_states_provinces');
const lonOf = (f) => {
  const c = f.geometry.type === 'Polygon' ? f.geometry.coordinates[0][0] : f.geometry.coordinates[0][0][0];
  return c[0];
};
function union(name, filter) {
  if (has(name)) return;
  const parts = admin1.features.filter(filter);
  if (!parts.length) throw new Error(`Keine Provinzen für ${name}`);
  const topo = topology({ p: { type: 'FeatureCollection', features: parts } });
  add(name, merge(topo, topo.objects.p.geometries));
}
const NAKH = ['Şərur', 'Sədərək', 'Kangarli', 'Babək', 'Şahbuz', 'Culfa', 'Ordubad', 'Naxçıvan'];
union('Nakhchivan', (f) => f.properties.adm0_a3 === 'AZE' && NAKH.includes(f.properties.name) && lonOf(f) < 46.2);
union('Gagauzia', (f) => f.properties.adm0_a3 === 'MDA' && f.properties.name === 'Comrat');
union('Karakalpakstan', (f) => f.properties.adm0_a3 === 'UZB' && f.properties.name === 'Karakalpakstan');
union('Mount Athos', (f) => f.properties.adm0_a3 === 'GRC' && f.properties.name === 'Ayion Oros');
union('Bangsamoro', (f) => f.properties.adm0_a3 === 'PHL' && ['Lanao del Sur', 'Maguindanao', 'Basilan', 'Tawi-Tawi'].includes(f.properties.name));

fs.writeFileSync(target, JSON.stringify(extra));
console.log(extra.features.map((f) => f.properties.name).join(', '));
