// Kartendarstellung: Ausschnitt um das gesuchte Land, markierte Fläche,
// Pin an der Hauptstadt und ein kleiner Globus zur Orientierung.
// Die Karte lässt sich mit dem Finger verschieben und mit zwei Fingern zoomen.

import { geoOrthographic, geoPath, geoDistance, geoArea, geoCentroid, geoCircle, geoGraticule10 } from 'd3-geo';
import { feature } from 'topojson-client';

const EARTH_KM = 6371;
const SVG_NS = 'http://www.w3.org/2000/svg';

let polygons = []; // alle Flächen der Welt mit Mittelpunkt und Radius
let byName = new Map(); // Name in den Kartendaten → Flächen
let landSmall = null; // grobe Landmassen für den Globus

function el(name, attrs = {}, parent) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (parent) parent.appendChild(node);
  return node;
}

function describePolygon(coordinates) {
  let poly = { type: 'Polygon', coordinates };
  // d3 erwartet Außenringe im Uhrzeigersinn; sonst wäre die Fläche "die ganze Welt minus Land"
  if (geoArea(poly) > 2 * Math.PI) {
    coordinates = coordinates.map((ring) => [...ring].reverse());
    poly = { type: 'Polygon', coordinates };
  }
  const centroid = geoCentroid(poly);
  let radius = 0;
  for (const p of coordinates[0]) radius = Math.max(radius, geoDistance(centroid, p));
  return { coordinates, centroid, radius, area: geoArea(poly) };
}

export async function loadMapData(baseUrl) {
  if (polygons.length) return;
  const [world, extra, land] = await Promise.all(
    ['world', 'extra', 'land'].map((n) => fetch(`${baseUrl}data/${n}.json`).then((r) => r.json())),
  );
  const add = (topo, background) => {
    for (const f of feature(topo, topo.objects[Object.keys(topo.objects)[0]]).features) {
      const g = f.geometry;
      if (!g) continue;
      const parts = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
      const list = parts.map(describePolygon);
      if (background) polygons.push(...list);
      byName.set(f.properties.n, (byName.get(f.properties.n) || []).concat(list));
    }
  };
  add(world, true); // Hintergrund nur aus den Ländern
  add(extra, false);
  landSmall = feature(land, land.objects.land);
}

const toLonLat = (ll) => [ll[1], ll[0]];
const multi = (polys) => ({ type: 'MultiPolygon', coordinates: polys.map((p) => p.coordinates) });

/** Welche Flächen markiert werden und welcher Ausschnitt gezeigt wird. */
function targetFor(entry) {
  const cap = toLonLat(entry.ll);
  let polys = [].concat(entry.geo).flatMap((n) => byName.get(n) || []);
  if (entry.r) polys = polys.filter((p) => geoDistance(p.centroid, cap) * EARTH_KM <= entry.r);

  let fit;
  if (entry.view) {
    const [w, s, e, n] = entry.view;
    const pts = [];
    for (let i = 0; i <= 8; i++) {
      const lon = w + ((e - w) * i) / 8;
      const lat = s + ((n - s) * i) / 8;
      pts.push([lon, s], [lon, n], [w, lat], [e, lat]);
    }
    fit = { type: 'MultiPoint', coordinates: pts };
  } else {
    let view = polys.filter((p) => geoDistance(p.centroid, cap) * EARTH_KM <= 2500);
    const largest = polys.reduce((a, b) => (!a || b.area > a.area ? b : a), null);
    if (largest && !view.includes(largest)) view.push(largest);
    const minCircle = geoCircle().center(cap).radius(2.6)();
    fit = { type: 'GeometryCollection', geometries: [minCircle, ...(view.length ? [multi(view)] : [])] };
  }

  const center = geoCentroid(fit);
  // Die Insel / Fläche rund um die Hauptstadt – ist sie winzig, wird ein Kreis gezeichnet
  const byDist = polys.map((p) => ({ p, d: geoDistance(p.centroid, cap) * EARTH_KM })).sort((a, b) => a.d - b.d);
  const near = byDist.filter((x) => x.d - x.p.radius * EARTH_KM <= 250).map((x) => x.p);
  if (!near.length && byDist.length && byDist[0].d < 1500) near.push(byDist[0].p);
  const closest = byDist.length ? byDist[0].p : null;
  return { cap, polys, near, closest, fit, center };
}

export class QuizMap {
  constructor(container) {
    this.container = container;
    this.svg = el('svg', { class: 'map-svg', role: 'img', 'aria-label': 'Landkarte' }, container);
    const defs = el('defs', {}, this.svg);
    const grad = el('radialGradient', { id: 'ocean', cx: '50%', cy: '45%', r: '75%' }, defs);
    el('stop', { offset: '0%', class: 'ocean-a' }, grad);
    el('stop', { offset: '100%', class: 'ocean-b' }, grad);
    const shadow = el('filter', { id: 'pin-shadow', x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
    el('feDropShadow', { dx: '0', dy: '2', stdDeviation: '2', 'flood-opacity': '.35' }, shadow);

    this.sphere = el('path', { class: 'sphere', fill: 'url(#ocean)' }, this.svg);
    this.grid = el('path', { class: 'graticule' }, this.svg);
    this.land = el('path', { class: 'land' }, this.svg);
    this.target = el('path', { class: 'target' }, this.svg);
    this.ring = el('circle', { class: 'target-ring', r: 18 }, this.svg);
    this.pin = el('g', { class: 'pin', filter: 'url(#pin-shadow)' }, this.svg);
    const pinInner = el('g', { class: 'pin-inner' }, this.pin);
    el('path', { d: 'M0 0C-3-9-11-13-11-23a11 11 0 1 1 22 0C11-13 3-9 0 0Z', class: 'pin-body' }, pinInner);
    el('circle', { cx: 0, cy: -23, r: 4.2, class: 'pin-dot' }, pinInner);
    this.label = el('g', { class: 'map-label' }, this.svg);
    this.labelText = el('text', { 'text-anchor': 'middle' }, this.label);

    // kleiner Globus
    this.globe = el('svg', { class: 'globe', viewBox: '0 0 72 72', 'aria-hidden': 'true' }, container);
    this.gSphere = el('circle', { cx: 36, cy: 36, r: 34, class: 'globe-sphere' }, this.globe);
    this.gLand = el('path', { class: 'globe-land' }, this.globe);
    this.gDot = el('circle', { r: 3.4, class: 'globe-dot' }, this.globe);

    this.projection = geoOrthographic().clipAngle(90).precision(0.3);
    this.path = geoPath(this.projection);
    this.state = null;

    this.resizeObserver = new ResizeObserver(() => this.state && this.fitAndRender(!this.container.classList.contains('moved')));
    this.resizeObserver.observe(container);
    this.setupGestures();
  }

  size() {
    const r = this.container.getBoundingClientRect();
    return { w: Math.max(50, r.width), h: Math.max(50, r.height) };
  }

  show(entry) {
    this.state = { entry, ...targetFor(entry) };
    this.label.classList.remove('visible');
    this.pin.classList.remove('drop');
    void this.pin.getBBox(); // Animation neu starten
    this.pin.classList.add('drop');
    this.fitAndRender(true);
  }

  fitAndRender(resetView) {
    const { w, h } = this.size();
    this.svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    if (resetView || !this.view) {
      const st = this.state;
      const pad = Math.min(w, h) * 0.1 + 12;
      this.projection.rotate([-st.center[0], -st.center[1]]).fitExtent([[pad, pad + 10], [w - pad, h - pad]], st.fit);
      const minScale = Math.min(w, h) * 0.42;
      if (this.projection.scale() < minScale) {
        this.projection.scale(minScale).translate([w / 2, h / 2]);
      }
      this.view = { rotate: this.projection.rotate(), scale: this.projection.scale(), translate: this.projection.translate() };
      this.home = { ...this.view };
      this.container.classList.remove('moved');
    } else {
      this.projection.rotate(this.view.rotate).scale(this.view.scale).translate(this.view.translate);
    }
    this.render();
  }

  render() {
    const st = this.state;
    if (!st) return;
    const { w, h } = this.size();
    const proj = this.projection;
    const scale = proj.scale();
    const [tx, ty] = proj.translate();

    // Nur Flächen berechnen, die im Bild liegen könnten
    const corner = Math.max(Math.hypot(tx, ty), Math.hypot(w - tx, ty), Math.hypot(tx, h - ty), Math.hypot(w - tx, h - ty));
    const visibleAngle = corner >= scale ? Math.PI / 2 : Math.asin(corner / scale);
    const rot = proj.rotate();
    const viewCenter = [-rot[0], -rot[1]];
    const visible = polygons.filter((p) => geoDistance(viewCenter, p.centroid) - p.radius < visibleAngle + 0.02);

    this.sphere.setAttribute('d', this.path({ type: 'Sphere' }));
    this.grid.setAttribute('d', this.path(geoGraticule10()) || '');
    this.land.setAttribute('d', this.path(multi(visible)) || '');
    this.target.setAttribute('d', st.polys.length ? this.path(multi(st.polys)) || '' : '');

    // Kleine Länder / Inseln bekommen einen Kreis, damit man sie sieht
    const capXY = proj(st.cap);
    let ringAt = null;
    if (st.near.length) {
      const area = this.path.area(multi(st.near));
      if (!(area > 250)) ringAt = proj(st.closest.centroid) || capXY;
    } else if (capXY) {
      ringAt = capXY;
    }
    const capVisible = capXY && geoDistance(viewCenter, st.cap) < Math.PI / 2;
    if (ringAt && capVisible) {
      this.ring.setAttribute('cx', ringAt[0]);
      this.ring.setAttribute('cy', ringAt[1]);
      this.ring.style.display = '';
    } else {
      this.ring.style.display = 'none';
    }

    if (capVisible) {
      this.pin.setAttribute('transform', `translate(${capXY[0].toFixed(1)},${capXY[1].toFixed(1)})`);
      this.pin.style.display = '';
      const below = capXY[1] + 40 < h;
      this.labelText.setAttribute('dominant-baseline', below ? 'hanging' : 'auto');
      const lx = Math.max(60, Math.min(w - 60, capXY[0]));
      this.label.setAttribute('transform', `translate(${lx.toFixed(1)},${(below ? capXY[1] + 8 : capXY[1] - 36).toFixed(1)})`);
      this.label.style.display = '';
    } else {
      this.pin.style.display = 'none';
      this.label.style.display = 'none';
    }

    this.renderGlobe(viewCenter);
  }

  renderGlobe(viewCenter) {
    const st = this.state;
    const gp = geoOrthographic().scale(34).translate([36, 36]).clipAngle(90).rotate([-viewCenter[0], -Math.max(-60, Math.min(60, viewCenter[1]))]);
    this.gLand.setAttribute('d', geoPath(gp)(landSmall) || '');
    const p = gp(st.cap);
    const vis = geoDistance([-gp.rotate()[0], -gp.rotate()[1]], st.cap) < Math.PI / 2;
    if (p && vis) {
      this.gDot.setAttribute('cx', p[0]);
      this.gDot.setAttribute('cy', p[1]);
      this.gDot.style.display = '';
    } else this.gDot.style.display = 'none';
  }

  showLabel(text, kind) {
    this.labelText.textContent = text;
    this.label.setAttribute('class', `map-label visible ${kind || ''}`);
    this.render();
  }

  zoomBy(factor) {
    if (!this.view) return;
    const { w, h } = this.size();
    this.view.scale = Math.max(Math.min(w, h) * 0.3, Math.min(this.view.scale * factor, 60000));
    this.view.translate = [w / 2, h / 2];
    this.container.classList.add('moved');
    this.fitAndRender(false);
  }

  resetView() {
    if (!this.state) return;
    this.fitAndRender(true);
  }

  setupGestures() {
    const pointers = new Map();
    let start = null;
    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        this.fitAndRender(false);
      });
    };
    const snapshot = () => {
      const pts = [...pointers.values()];
      const mid = pts.reduce((a, p) => [a[0] + p[0] / pts.length, a[1] + p[1] / pts.length], [0, 0]);
      const dist = pts.length > 1 ? Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]) : 0;
      return { mid, dist, rotate: [...this.view.rotate], scale: this.view.scale };
    };
    this.svg.addEventListener('pointerdown', (e) => {
      if (!this.view) return;
      this.svg.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, [e.clientX, e.clientY]);
      start = snapshot();
    });
    this.svg.addEventListener('pointermove', (e) => {
      if (!pointers.has(e.pointerId) || !start) return;
      pointers.set(e.pointerId, [e.clientX, e.clientY]);
      const now = snapshot();
      const scale = start.dist && now.dist ? Math.max(80, Math.min(start.scale * (now.dist / start.dist), 60000)) : start.scale;
      const k = 180 / Math.PI / scale;
      const dx = now.mid[0] - start.mid[0];
      const dy = now.mid[1] - start.mid[1];
      if (Math.abs(dx) + Math.abs(dy) + Math.abs(now.dist - start.dist) < 3) return;
      const { w, h } = this.size();
      this.view.rotate = [start.rotate[0] + dx * k, Math.max(-89, Math.min(89, start.rotate[1] - dy * k)), start.rotate[2]];
      this.view.scale = scale;
      this.view.translate = [w / 2, h / 2];
      this.container.classList.add('moved');
      schedule();
    });
    const end = (e) => {
      pointers.delete(e.pointerId);
      start = pointers.size ? snapshot() : null;
    };
    this.svg.addEventListener('pointerup', end);
    this.svg.addEventListener('pointercancel', end);
    this.svg.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.zoomBy(e.deltaY < 0 ? 1.25 : 0.8);
      },
      { passive: false },
    );
  }
}
