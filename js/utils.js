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

/* ---- YouTube Data API v3 helpers (shared by Title Strategy + Video Analyzer) ---- */

async function ytApiFetch(path, params, apiKey) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  url.searchParams.set('key', apiKey);
  const res = await fetch(url.toString());
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const reason = data?.error?.errors?.[0]?.reason || data?.error?.status || res.status;
    const msg = data?.error?.message || 'Request failed';
    const err = new Error(msg); err.reason = reason; throw err;
  }
  return data;
}

function extractYouTubeVideoId(input) {
  const raw = input.trim();
  let m = raw.match(/[?&]v=([\w-]{11})/); if (m) return m[1];
  m = raw.match(/youtu\.be\/([\w-]{11})/); if (m) return m[1];
  m = raw.match(/\/shorts\/([\w-]{11})/); if (m) return m[1];
  m = raw.match(/\/embed\/([\w-]{11})/); if (m) return m[1];
  if (/^[\w-]{11}$/.test(raw)) return raw;
  return null;
}

function aiAvailable() {
  return typeof window !== 'undefined' && !!window.claude;
}

function parseISODuration(iso) {
  const m = String(iso || '').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const h = Number(m[1] || 0), min = Number(m[2] || 0), s = Number(m[3] || 0);
  return h * 60 + min + s / 60;
}
