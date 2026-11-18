const escapeAttribute = value => String(value).replace(/[&<>"']/g, character =>
  ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[character]);

// Callers supply the complete supporting content; the main conclusion stays outside.
export function renderReadingDetails(key, label, body) {
  return `<details class="reading-disclosure" data-reading-key="${escapeAttribute(key)}"><summary><span>${label}</span><span class="reading-disclosure-toggle" aria-hidden="true"><span class="when-closed">展开</span><span class="when-open">收起</span><i>+</i></span></summary><div class="reading-disclosure-body">${body}</div></details>`;
}

export function captureReadingDetails() {
  return new Set([...document.querySelectorAll('.reading-disclosure[open]')]
    .map(element => element.dataset.readingKey));
}

// The shell rerenders after scene controls and dialogs; keep the reader's choice.
export function restoreReadingDetails(expanded) {
  for (const element of document.querySelectorAll('.reading-disclosure')) {
    element.open = expanded.has(element.dataset.readingKey);
  }
}
