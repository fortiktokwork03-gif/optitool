const TopicsTab = (() => {
  const VIRALITY_ITEMS = [
    'Emotional trigger potential (fear, inspiration, curiosity, surprise)',
    'Problem-solution format applicable',
    'Story-based angle possible',
    'Actionable learning value',
    'Controversial or debatable element',
    'Personal transformation element',
  ];
  const AUDIENCE_ITEMS = [
    'Search volume ↑ in last 30 days',
    'Multiple variations possible (5+ angles)',
    'Evergreen + timely balance',
    'Monetizable audience (high RPM niche)',
  ];
  const COMPETITIVE_ITEMS = [
    'Faceless format optimal for this topic',
    'Unique angle not saturated',
    'Format differentiation possible',
    'B-roll / stock footage readily available',
  ];
  const ALL_ITEMS = [...VIRALITY_ITEMS, ...AUDIENCE_ITEMS, ...COMPETITIVE_ITEMS];
  const MAX_SCORE = ALL_ITEMS.length; // 14, matches guide's ~15-pt scale

  let draft = freshDraft();

  function freshDraft() {
    return {
      name: '', checks: {},
      kw: { volume: 0, competition: 0, audience: 0, monetization: 0 },
      sat: { totalViews: '', avgViews: '', growth: '', newChannels: '', sentiment: 'Mixed' },
    };
  }

  function render() {
    const root = document.getElementById('tab-topics');
    const kwTotal = Object.values(draft.kw).reduce((a, b) => a + Number(b || 0), 0);
    const checkedCount = Object.values(draft.checks).filter(Boolean).length;
    const tier = viabilityTier(checkedCount);
    const satRating = saturationRating(draft.sat.totalViews);

    root.innerHTML = `
      <div class="section-head">
        <h2>Topic Selector</h2>
        <p>Score trending keywords, check niche saturation, then run the 15-point viability score card before you commit to a topic.</p>
      </div>

      <div class="grid grid-2" style="align-items:start;">
        <div class="card">
          <div class="card-title">1 · Trending Keyword Score</div>
          <div class="card-sub">Rate each factor, threshold is 6+/10 to be viable</div>
          ${kwRow('Search volume increase', 'volume', 3)}
          ${kwRow('Competition level (lower = better)', 'competition', 3)}
          ${kwRow('Audience size potential', 'audience', 2)}
          ${kwRow('Monetization value (CTR potential)', 'monetization', 2)}
          <div class="divider"></div>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div style="font-size:13px;color:var(--text-faint);font-weight:700;">TOTAL SCORE</div>
              <div style="font-size:22px;font-weight:800;">${kwTotal}<span style="font-size:13px;color:var(--text-faint);">/10</span></div>
            </div>
            <span class="badge ${kwTotal >= 6 ? 'badge-good' : 'badge-bad'}">${kwTotal >= 6 ? 'Viable' : 'Below threshold'}</span>
          </div>
        </div>

        <div class="card">
          <div class="card-title">2 · Niche Saturation Analysis</div>
          <div class="card-sub">Based on the top 10 videos in this niche</div>
          <div class="field"><label>Total views across top 10 (millions)</label>
            <input type="number" min="0" value="${draft.sat.totalViews}" oninput="TopicsTab.setSat('totalViews', this.value)" placeholder="e.g. 42" />
          </div>
          <div class="grid grid-2">
            <div class="field"><label>Avg views / video</label><input type="number" min="0" value="${draft.sat.avgViews}" oninput="TopicsTab.setSat('avgViews', this.value)" /></div>
            <div class="field"><label>Growth rate MoM (%)</label><input type="number" value="${draft.sat.growth}" oninput="TopicsTab.setSat('growth', this.value)" /></div>
          </div>
          <div class="grid grid-2">
            <div class="field"><label>New channels breaking in (90d)</label><input type="number" min="0" value="${draft.sat.newChannels}" oninput="TopicsTab.setSat('newChannels', this.value)" /></div>
            <div class="field"><label>Comment sentiment</label>
              <select onchange="TopicsTab.setSat('sentiment', this.value)">
                ${['Positive','Mixed','Negative'].map(s => `<option ${draft.sat.sentiment===s?'selected':''}>${s}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="divider"></div>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <div style="font-size:13px;color:var(--text-faint);font-weight:700;">SATURATION RATING</div>
            <span class="badge ${satRating.cls}">${satRating.label}</span>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top:16px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;">
          <div style="flex:1;min-width:240px;">
            <div class="card-title">3 · Topic Score Card</div>
            <div class="card-sub">Check every box that applies to this topic</div>
            <div class="field" style="max-width:420px;">
              <label>Topic name</label>
              <input type="text" placeholder="e.g. How to make $1,000/month passive income" value="${esc(draft.name)}" oninput="TopicsTab.setName(this.value)" />
            </div>
          </div>
          ${scoreRing(checkedCount, MAX_SCORE, 90)}
        </div>

        <div class="grid grid-3" style="margin-top:8px;">
          ${checkGroup('Virality Factors', VIRALITY_ITEMS, 'v')}
          ${checkGroup('Audience Demand', AUDIENCE_ITEMS, 'a')}
          ${checkGroup('Competitive Edge', COMPETITIVE_ITEMS, 'c')}
        </div>

        <div class="divider"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
          <div>
            <span class="badge ${tier.cls}">${tier.label}</span>
            <span style="font-size:12.5px;color:var(--text-faint);margin-left:8px;">${tier.hint}</span>
          </div>
          <button class="btn btn-primary" onclick="TopicsTab.saveTopic()">💾 Save Topic</button>
        </div>
      </div>

      <div style="margin-top:26px;">
        <h3 style="font-size:16px;margin-bottom:12px;">Saved Topics (${Store.get('topics').length})</h3>
        ${renderSaved()}
      </div>
    `;
  }

  function kwRow(label, key, max) {
    return `
      <div class="field">
        <label>${label} <span class="hint">(0-${max})</span></label>
        <input type="range" min="0" max="${max}" step="1" value="${draft.kw[key]}" oninput="TopicsTab.setKw('${key}', this.value); TopicsTab.render();" />
        <div class="hint">${draft.kw[key]} / ${max}</div>
      </div>`;
  }

  function checkGroup(title, items, prefix) {
    return `
      <div>
        <div style="font-size:12px;font-weight:800;color:var(--text-faint);text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px;">${title}</div>
        ${items.map((item, i) => {
          const key = prefix + i;
          const checked = !!draft.checks[key];
          return `<label class="checkline">
            <input type="checkbox" ${checked ? 'checked' : ''} onchange="TopicsTab.toggleCheck('${key}')" />
            <span>${item}</span>
          </label>`;
        }).join('')}
      </div>`;
  }

  function viabilityTier(score) {
    if (score >= 12) return { label: 'GOLD · Launch immediately', cls: 'badge-good', hint: `${score}/${MAX_SCORE} checked` };
    if (score >= 9) return { label: 'SILVER · Develop angle', cls: 'badge-info', hint: `${score}/${MAX_SCORE} checked` };
    if (score >= 6) return { label: 'BRONZE · Monitor', cls: 'badge-warn', hint: `${score}/${MAX_SCORE} checked` };
    return { label: 'PASS · Skip', cls: 'badge-bad', hint: `${score}/${MAX_SCORE} checked` };
  }

  function saturationRating(totalViewsM) {
    const v = Number(totalViewsM);
    if (!totalViewsM) return { label: 'Enter data', cls: 'badge-info' };
    if (v < 50) return { label: 'GREEN · Opportunity', cls: 'badge-good' };
    if (v <= 200) return { label: 'YELLOW · Competitive', cls: 'badge-warn' };
    return { label: 'RED · Saturated', cls: 'badge-bad' };
  }

  function renderSaved() {
    const topics = Store.get('topics');
    if (!topics.length) return `<div class="empty-state"><div class="emoji">🎯</div>No topics saved yet. Score one above and hit Save.</div>`;
    return topics.slice().reverse().map(t => {
      const tier = viabilityTier(t.total);
      const sat = saturationRating(t.sat?.totalViews);
      return `
        <div class="list-item">
          <div class="list-item-head">
            <div>
              <div class="list-item-title">${esc(t.name || 'Untitled topic')}</div>
              <div class="list-item-meta">Saved ${fmtDate(t.createdAt)} · Keyword score ${t.kwTotal}/10 · <span class="badge ${sat.cls}" style="margin-left:2px;">${sat.label}</span></div>
            </div>
            <div class="list-item-actions">
              <span class="badge ${tier.cls}">${t.total}/${MAX_SCORE}</span>
              <button class="icon-btn" title="Delete" onclick="TopicsTab.deleteTopic('${t.id}')">🗑</button>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  // ---- handlers ----
  function setKw(key, val) { draft.kw[key] = Number(val); }
  function setSat(key, val) { draft.sat[key] = val; render(); }
  function setName(val) { draft.name = val; }
  function toggleCheck(key) { draft.checks[key] = !draft.checks[key]; render(); }

  function saveTopic() {
    if (!draft.name.trim()) { toast('Give the topic a name first'); return; }
    const checkedCount = Object.values(draft.checks).filter(Boolean).length;
    const kwTotal = Object.values(draft.kw).reduce((a, b) => a + Number(b || 0), 0);
    const topic = {
      id: uid(), name: draft.name.trim(), total: checkedCount, kwTotal,
      kw: { ...draft.kw }, sat: { ...draft.sat }, checks: { ...draft.checks },
      createdAt: new Date().toISOString(),
    };
    Store.update('topics', arr => [...arr, topic]);
    draft = freshDraft();
    render();
    toast('Topic saved');
  }

  function deleteTopic(id) {
    if (!confirmDelete('Delete this saved topic?')) return;
    Store.update('topics', arr => arr.filter(t => t.id !== id));
    render();
  }

  return { render, setKw, setSat, setName, toggleCheck, saveTopic, deleteTopic };
})();
