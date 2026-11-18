import { planets } from './data.js';
export function handleAction(action, value, { state, update }) {
  if (action === 'planet') {
    location.hash = 'explore/' + value;
    return true;
  }
  if (action === 'compare-swap') {
    [state.compareA, state.compareB] = [state.compareB, state.compareA];
    update();
    return true;
  }
  if (action === 'gravity-planet') {
    if (planets.some((p) => p.id === value)) {
      state.planet = value;
      history.replaceState(null, '', '#explore/' + value);
      update();
    }
    return true;
  }
  return false;
}
