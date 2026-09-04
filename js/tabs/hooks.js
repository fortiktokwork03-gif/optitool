const HooksTab = (() => {
  const EMOTIONS = ['Fear', 'Curiosity', 'Inspiration', 'Surprise', 'Anger', 'Urgency'];
  const TYPES = ['Question', 'Data/Number', 'Pain Point', 'Curiosity Gap', 'Personal Story', 'Contrarian', 'Bold Promise', 'Direct Statement'];

  let test = freshTest();

  function freshTest() {
    return {
      topic: '',
      hooks: [
        { text: '', emotion: EMOTIONS[1], type: TYPES[0], score: 5 },
        { text: '', emotion: EMOTIONS[1], type: TYPES[0], score: 5 },
        { text: '', emotion: EMOTIONS[1], type: TYPES[0], score: 5 },
      ],
    };
  }

  function render() {
    const root = document.getElementById('tab-hooks');
    root.innerHTML = `
      <div class="section-head">
        <h2>Hook Lab</h2>
        <p>Proven hook tiers, formula combinations, a per-niche cheat sheet, and a 3-variation hook tester.</p>
      </div>

      <h3 style="font-size:15px;margin-bottom:10px;">Hook Types Ranked by Viral Potential</h3>
      <div class="grid grid-3" style="margin-bottom:22px;">
        ${HOOK_TIERS.map(tierBlock).join('')}
      </div>

      <h3 style="font-size:15px;margin-bottom:10px;">Hook Formula Combinations</h3>
      <div class="grid grid-2" style="margin-bottom:22px;">
        ${HOOK_COMBOS.map(c => `
          <div class="card">
            <div class="card-title">${esc(c.name)}</div>
            <div class="mono" style="font-size:12.5px;color:var(--text-dim);white-space:pre-line;line-height:1.6;background:var(--bg-elev-2);border:1px solid var(--border-soft);border-radius:8px;padding:10px 12px;">${esc(c.example)}</div>
            <button class="btn btn-ghost btn-sm copy-btn" style="margin-top:8px;" onclick="copyToClipboard(${JSON.stringify(c.example)})">📋 Copy</button>
          </div>`).join('')}
      </div>

      <h3 style="font-size:15px;margin-bottom:10px;">Best Hook Types by Niche</h3>
      <div class="card" style="margin-bottom:22px;overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;min-width:640px;">
          <thead><tr style="text-align:left;color:var(--text-faint);font-size:11.5px;text-transform:uppercase;letter-spacing:.03em;">
            <th style="padding:8px 10px;">Niche</th><th style="padding:8px 10px;">Best</th><th style="padding:8px 10px;">Avoid</th><th style="padding:8px 10px;">Example</th>
          </tr></thead>
          <tbody>
            ${NICHE_HOOK_GUIDE.map(n => `
              <tr style="border-top:1px solid var(--border-soft);">
                <td style="padding:10px;font-weight:700;">${esc(n.niche)}</td>
                <td style="padding:10px;color:var(--good);">${esc(n.best)}</td>
                <td style="padding:10px;color:var(--bad);">${esc(n.avoid)}</td>
                <td style="padding:10px;color:var(--text-dim);font-style:italic;">"${esc(n.example)}"</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>

      <h3 style="font-size:15px;margin-bottom:10px;">Hook Tester</h3>
      <div class="card">
        <div class="card-sub">Write 3 variations, score each, and the tool tells you which to shoot.</div>
        <div class="field" style="max-width:420px;"><label>Video topic</label><input type="text" value="${esc(test.topic)}" oninput="HooksTab.setTopic(this.value)" placeholder="e.g. Passive income for beginners" /></div>
        <div class="grid grid-3">
          ${test.hooks.map((h, i) => `
            <div class="card" style="background:var(--bg-elev-2);">
              <div class="card-title" style="font-size:13px;">Hook Version ${String.fromCharCode(65 + i)}</div>
              <div class="field"><textarea oninput="HooksTab.setHook(${i}, 'text', this.value)" placeholder="Write the opening line...">${esc(h.text)}</textarea></div>
              <div class="field"><label>Emotion</label><select onchange="HooksTab.setHook(${i}, 'emotion', this.value)">${EMOTIONS.map(e => `<option ${e===h.emotion?'selected':''}>${e}</option>`).join('')}</select></div>
              <div class="field"><label>Type</label><select onchange="HooksTab.setHook(${i}, 'type', this.value)">${TYPES.map(t => `<option ${t===h.type?'selected':''}>${t}</option>`).join('')}</select></div>
              <div class="field"><label>Estimated CTR potential: ${h.score}/10</label>
                <input type="range" min="0" max="10" value="${h.score}" oninput="HooksTab.setHook(${i}, 'score', this.value); HooksTab.render();" />
              </div>
            </div>`).join('')}
        </div>
        ${renderWinner()}
        <div style="display:flex;justify-content:flex-end;margin-top:10px;">
          <button class="btn btn-primary" onclick="HooksTab.saveTest()">💾 Save Hook Test</button>
        </div>
      </div>

      <div style="margin-top:24px;">
        <h3 style="font-size:16px;margin-bottom:12px;">Saved Hook Tests</h3>
        ${renderSaved()}
      </div>
    `;
  }

  function tierBlock(t) {
    return `
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div class="card-title" style="margin-bottom:0;">${t.tier}</div>
        </div>
        <div class="card-sub">${t.usage}</div>
        ${t.hooks.map(h => `
          <div style="margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-weight:700;font-size:13px;">${esc(h.name)}</span>
              <span class="badge badge-accent">${h.score}/10</span>
            </div>
            ${h.examples.map(ex => `<div style="font-size:12px;color:var(--text-faint);font-style:italic;margin-top:3px;">"${esc(ex)}"</div>`).join('')}
          </div>`).join('')}
      </div>`;
  }

  function renderWinner() {
    const withText = test.hooks.filter(h => h.text.trim());
    if (!withText.length) return '';
    const best = test.hooks.reduce((a, b) => (b.score > a.score ? b : a));
    const idx = test.hooks.indexOf(best);
    return `<div class="divider"></div>
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="badge badge-good">Recommended: Version ${String.fromCharCode(65 + idx)}</span>
        <span style="font-size:12.5px;color:var(--text-faint);">Highest score + go with the strongest emotional hit</span>
      </div>`;
  }

  function renderSaved() {
    const tests = Store.get('hookTests');
    if (!tests.length) return `<div class="empty-state"><div class="emoji">🪝</div>No hook tests saved yet.</div>`;
    return tests.slice().reverse().map(t => {
      const best = t.hooks.reduce((a, b) => (b.score > a.score ? b : a));
      const idx = t.hooks.indexOf(best);
      return `
        <div class="list-item">
          <div class="list-item-head">
            <div>
              <div class="list-item-title">${esc(t.topic || 'Untitled test')}</div>
              <div class="list-item-meta">Winner: Version ${String.fromCharCode(65+idx)} — "${esc(best.text || '—')}"</div>
            </div>
            <div class="list-item-actions">
              <span class="badge badge-good">${best.score}/10</span>
              <button class="icon-btn" title="Delete" onclick="HooksTab.deleteTest('${t.id}')">🗑</button>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  function setTopic(v) { test.topic = v; }
  function setHook(i, key, val) { test.hooks[i][key] = key === 'score' ? Number(val) : val; }

  function saveTest() {
    if (!test.hooks.some(h => h.text.trim())) { toast('Write at least one hook variation'); return; }
    const record = { ...structuredClone(test), id: uid(), createdAt: new Date().toISOString() };
    Store.update('hookTests', arr => [...arr, record]);
    test = freshTest();
    render();
    toast('Hook test saved');
  }

  function deleteTest(id) {
    if (!confirmDelete('Delete this hook test?')) return;
    Store.update('hookTests', arr => arr.filter(t => t.id !== id));
    render();
  }

  return { render, setTopic, setHook, saveTest, deleteTest };
})();
