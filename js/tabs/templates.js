const TemplatesTab = (() => {
  function render() {
    const root = document.getElementById('tab-templates');
    root.innerHTML = `
      <div class="section-head">
        <h2>Script Structure Templates</h2>
        <p>Four proven structures from the guide. Each shows the time-blocked outline so you can plan pacing before you write a word.</p>
      </div>

      <div class="grid" style="grid-template-columns: 1fr; gap: 18px;">
        ${SCRIPT_TEMPLATES.map(templateCard).join('')}
      </div>

      <div class="grid grid-2" style="margin-top:22px;">
        <div class="card">
          <div class="card-title">Optimal Video Lengths by Format</div>
          ${OPTIMAL_LENGTHS.map(o => `
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-soft);font-size:13px;">
              <span>${esc(o.format)}</span>
              <span style="color:var(--text-dim);">${esc(o.length)} &nbsp; <span style="color:var(--accent);">${stars(o.stars)}</span></span>
            </div>`).join('')}
          <div class="hint" style="margin-top:10px;">Longer videos only if every second delivers value.</div>
        </div>
        <div class="card">
          <div class="card-title">Pacing Guidelines</div>
          ${PACING_GUIDE.map(p => `
            <div style="padding:10px 0;border-bottom:1px solid var(--border-soft);">
              <div style="font-weight:700;font-size:13px;">${esc(p.pace)}</div>
              <div style="font-size:12.5px;color:var(--text-faint);margin-top:2px;">${esc(p.use)}</div>
            </div>`).join('')}
        </div>
      </div>
    `;
  }

  function templateCard(t) {
    const outlineText = buildOutlineText(t);
    return `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;">
          <div>
            <div style="display:flex;align-items:center;gap:8px;">
              <div class="card-title" style="margin-bottom:0;">${esc(t.name)}</div>
              <span class="badge badge-accent">${esc(t.badge)}</span>
            </div>
            <div class="card-sub" style="margin-top:6px;">Ideal for: ${esc(t.idealFor)}</div>
          </div>
          <button class="btn btn-ghost btn-sm" onclick='copyToClipboard(${JSON.stringify(outlineText)})'>📋 Copy outline</button>
        </div>

        <div class="timeline">
          ${t.blocks.map(b => `<div style="width:${b.pct}%;background:${b.color};" title="${esc(b.label)} (${esc(b.range)})">${b.pct >= 8 ? esc(b.label) : ''}</div>`).join('')}
        </div>
        <div class="timeline-legend">
          ${t.blocks.map(b => `<div class="item"><span class="dot" style="background:${b.color};"></span>${esc(b.label)} <span style="color:var(--text-faint);">(${esc(b.range)})</span></div>`).join('')}
        </div>

        <div class="divider"></div>
        <div class="grid grid-2">
          ${t.blocks.map((b, i) => `
            <div class="kv" style="background:var(--bg-elev-2);border:1px solid var(--border-soft);border-radius:8px;padding:10px 12px;">
              <div class="k" style="color:${b.color};">${i+1}. ${esc(b.label)} · ${esc(b.range)}</div>
              <div style="font-size:12.5px;color:var(--text-dim);margin-top:4px;">${esc(b.detail)}</div>
            </div>`).join('')}
        </div>

        <div class="divider"></div>
        <div class="kv-grid">
          <div class="kv"><div class="k">Optimal length</div><div class="v" style="font-size:14px;">${esc(t.length)}</div></div>
          <div class="kv"><div class="k">Pacing</div><div class="v" style="font-size:14px;">${esc(t.pacing)}</div></div>
          <div class="kv"><div class="k">Performance</div><div class="v" style="font-size:14px;">${esc(t.perf)}</div></div>
        </div>
      </div>`;
  }

  function buildOutlineText(t) {
    const lines = [`${t.name.toUpperCase()} — SCRIPT OUTLINE`, `Ideal for: ${t.idealFor}`, `Length: ${t.length} | Pacing: ${t.pacing}`, ''];
    t.blocks.forEach((b, i) => lines.push(`[${b.range}] ${b.label.toUpperCase()}\n${b.detail}\n`));
    return lines.join('\n');
  }

  return { render };
})();
