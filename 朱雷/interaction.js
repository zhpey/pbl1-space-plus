export function handleAction(action, value, { state, update }) {
  if (action === 'constellation') {
    location.hash = 'atlas/' + value;
    return true;
  }
  if (action === 'atlas-clear') {
    state.atlasLines = false;
    state.atlasLabels = false;
    state.atlasGrid = false;
    update();
    return true;
  }
  return false;
}
