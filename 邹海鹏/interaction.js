import { solarZones } from './data.js';
export function handleAction(action, value, { state, update }) {
  if (action !== 'solar-zone') return false;
  if (solarZones.some((z) => z.id === value)) {
    state.solarZone = value;
    update();
  }
  return true;
}
