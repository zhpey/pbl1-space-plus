export function renderAtlasControls(s) {
  return `<div class="atlas-tools" aria-label="星图显示设置">
    <label><input type="checkbox" data-action="atlas-lines" ${s.atlasLines ? 'checked' : ''}>星座连线</label>
    <label><input type="checkbox" data-action="atlas-labels" ${s.atlasLabels ? 'checked' : ''}>恒星标注</label>
    <label><input type="checkbox" data-action="atlas-night" ${s.atlasNight ? 'checked' : ''}>红光夜视</label>
    <label><input type="checkbox" data-action="atlas-grid" ${s.atlasGrid ? 'checked' : ''}>参考网格</label>
    <button class="text-button" data-action="atlas-clear">裸眼星空 ↺</button>
  </div>`;
}
