/* Shared helper functions */

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function esc(str) {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtDate(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch (e) { return iso; }
}

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => t.classList.remove('show'), 2200);
}

function tierFromScore(score, max, bands) {
  // bands: array of {min, label, cls} sorted desc by min, e.g. [{min:12,label:'GOLD',cls:'good'} ...]
  for (const b of bands) if (score >= b.min) return b;
  return bands[bands.length - 1];
}

function scoreRing(score, max, size = 84) {
  const pct = Math.max(0, Math.min(1, max ? score / max : 0));
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);
  let color = 'var(--bad)';
  if (pct >= 0.8) color = 'var(--good)';
  else if (pct >= 0.55) color = 'var(--warn)';
  else if (pct >= 0.35) color = 'var(--info)';
  return `
    <div class="score-ring" style="width:${size}px;height:${size}px;">
      <svg width="${size}" height="${size}">
        <circle class="ring-bg" cx="${size/2}" cy="${size/2}" r="${r}"></circle>
        <circle class="ring-fg" cx="${size/2}" cy="${size/2}" r="${r}" stroke="${color}"
          stroke-dasharray="${c}" stroke-dashoffset="${offset}"></circle>
      </svg>
      <div class="ring-label">${score}<span style="font-size:11px;color:var(--text-faint);font-weight:600;">/${max}</span></div>
    </div>`;
}

function progressBar(pct) {
  return `<div class="progress"><div style="width:${Math.max(0,Math.min(100,pct))}%"></div></div>`;
}

function stars(n, max = 5) {
  return '★'.repeat(n) + '☆'.repeat(Math.max(0, max - n));
}

function copyToClipboard(text) {
  navigator.clipboard?.writeText(text).then(() => toast('Copied to clipboard')).catch(() => toast('Copy failed'));
}

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function confirmDelete(msg) {
  return window.confirm(msg || 'Delete this item? This cannot be undone.');
}
