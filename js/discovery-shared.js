export const icon = (action, symbol, label, extra = '') =>
  `<button class="discovery-icon" data-action="${action}" aria-label="${label}" title="${label}" ${extra}>${symbol}</button>`;
export const title = (en, name) =>
  `<header class="discovery-heading"><span class="eyebrow">${en}</span><h2>${name}</h2></header>`;
export function renderDiscoveryLink(label) {
  return `<a class="discovery-link" href="#discovery" data-action="discovery-jump">${label}<span aria-hidden="true">↓</span></a>`;
}
