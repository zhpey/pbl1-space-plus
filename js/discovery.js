// Shared assembly only; each member owns their interactive tools.
import { planets } from './data.js';
import { gravityReading, renderSizeComparison, renderGravity } from '../陈冠伟/tools.js';
export { gravityReading, renderSizeComparison, renderGravity };
import { lightTime, renderOrbitControls, renderLight } from '../邹海鹏/tools.js';
export { lightTime, renderOrbitControls, renderLight };
import { renderAtlasControls } from '../朱雷/tools.js';
export { renderAtlasControls };
import { shipTime, renderRelativity } from '../滕紫涵/tools.js';
export { shipTime, renderRelativity };
import { visiblePhotos, renderPhotoViewer, renderVoyage } from '../訾舒然/tools.js';
export { visiblePhotos, renderPhotoViewer, renderVoyage };
export { renderDiscoveryLink } from './discovery-shared.js';
const renderers = {
  explore: renderGravity,
  solar: renderLight,
  unknown: renderRelativity,
  story: renderVoyage,
};
export function renderDiscovery(s) {
  return renderers[s.route]?.(s) || '';
}
export function previewDiscovery(s) {
  const set = (name, value) =>
    document.querySelectorAll(`[data-readout="${name}"]`).forEach((el) => {
      el.textContent = value;
    });
  const p = planets.find((p) => p.id === s.planet);
  const reading = gravityReading(s.bodyMass, p.id);
  set('mass', `${s.bodyMass} kg`);
  set('mass-copy', s.bodyMass);
  set('scale', reading.scale.toFixed(1));
  set('force', reading.force.toFixed(0));
  document
    .querySelector('.gravity-scale')
    ?.style.setProperty('--gravity-fill', `${Math.min(reading.scale / 400, 1) * 100}%`);
  set('ship-time', shipTime(s.shipSpeed).toFixed(2));
  set('ship-speed', `${(s.shipSpeed * 100).toFixed(0)}% 光速`);
  document
    .querySelector('[data-readout="ship-bar"]')
    ?.style.setProperty('width', `${shipTime(s.shipSpeed) * 10}%`);
  set('orbit-speed', `${s.orbitSpeed}×`);
}
