export function handleAction(action, value) {
  if (action !== 'mystery') return false;
  location.hash = 'unknown/' + value;
  return true;
}
