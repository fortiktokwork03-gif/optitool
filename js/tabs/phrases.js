const PhrasesTab = (() => {
  let newPhrase = '';

  function render() {
    const root = document.getElementById('tab-phrases');
    const phrases = Store.get('phrases');
    root.innerHTML = `
      <div class="section-head">
        <h2>Trending Phrase Library</h2>
        <p>Seeded from the guide's September 2026 list. Add new ones as you discover them each week, and use 5+ per script naturally.</p>
      </div>

      <div class="card">
        <div style="display:flex;gap:8px;">
          <input type="text" placeholder="Add a new trending phrase..." value="${esc(newPhrase)}" oninput="PhrasesTab.setNew(this.value)" onkeydown="if(event.key==='Enter'){PhrasesTab.add();}" />
          <button class="btn btn-primary" onclick="PhrasesTab.add()">+ Add</button>
        </div>
      </div>

      <div style="margin-top:18px;">
        ${phrases.length ? phrases.map((p, i) => `
          <div class="phrase-item">
            <span>"${esc(p)}"</span>
            <div style="display:flex;gap:6px;">
              <button class="icon-btn" title="Copy" onclick='copyToClipboard(${JSON.stringify(p)})'>📋</button>
              <button class="icon-btn" title="Remove" onclick="PhrasesTab.remove(${i})">🗑</button>
            </div>
          </div>`).join('') : `<div class="empty-state"><div class="emoji">💬</div>No phrases yet.</div>`}
      </div>

      <div style="display:flex;justify-content:flex-end;margin-top:14px;gap:8px;">
        <button class="btn btn-ghost btn-sm" onclick="PhrasesTab.resetSeed()">Restore Sept 2026 seed list</button>
      </div>
    `;
  }

  function setNew(v) { newPhrase = v; }
  function add() {
    if (!newPhrase.trim()) return;
    Store.update('phrases', arr => [...arr, newPhrase.trim()]);
    newPhrase = '';
    render();
    toast('Phrase added');
  }
  function remove(i) {
    Store.update('phrases', arr => arr.filter((_, idx) => idx !== i));
    render();
  }
  function resetSeed() {
    if (!confirmDelete('Replace your current list with the Sept 2026 seed phrases?')) return;
    Store.set('phrases', [...SEED_PHRASES]);
    render();
  }

  return { render, setNew, add, remove, resetSeed };
})();
