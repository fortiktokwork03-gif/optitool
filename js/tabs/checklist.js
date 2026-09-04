const ChecklistTab = (() => {
  let active = 'pre';

  const SECTIONS = {
    pre: { title: 'Pre-Writing Optimization', sub: 'Run through this before you start writing', flat: PRE_WRITING_CHECKS },
    during: { title: 'During Script Writing', sub: 'Check every ~100 words as you write', flat: DURING_WRITING_CHECKS },
    post: { title: 'Post-Writing Optimization', sub: 'Read the script aloud, then check every box', groups: POST_WRITING_CHECKS },
    viral: { title: 'Viral Angle Checklist', sub: '5+ angle categories fully covered = ready for production', groups: VIRAL_ANGLE_CHECKS },
  };

  function render() {
    const root = document.getElementById('tab-checklist');
    root.innerHTML = `
      <div class="section-head">
        <h2>Optimization Checkpoints</h2>
        <p>Four checkpoints from the guide — pre-writing, during-writing, post-writing, and the viral-angle pass. State is saved automatically.</p>
      </div>

      <div class="tabs-row">
        ${Object.entries(SECTIONS).map(([key, s]) => `<button class="${active === key ? 'active' : ''}" onclick="ChecklistTab.setActive('${key}')">${s.title}</button>`).join('')}
      </div>

      ${renderSection(active)}
    `;
  }

  function renderSection(key) {
    const s = SECTIONS[key];
    const state = Store.get('checklists')[storeKey(key)] || {};
    let items = [];
    if (s.flat) items = s.flat.map((label, i) => ({ id: `${key}-${i}`, label }));
    else items = s.groups.flatMap((g, gi) => g.items.map((label, i) => ({ id: `${key}-${gi}-${i}`, label, group: g.group, groupIndex: gi })));

    const checkedCount = items.filter(it => state[it.id]).length;
    const total = items.length;

    let scoreBlock;
    if (key === 'viral') {
      const groupsFull = s.groups.filter((g, gi) => g.items.every((_, i) => state[`${key}-${gi}-${i}`])).length;
      const ready = groupsFull >= 5;
      scoreBlock = `
        <div class="card" style="margin-bottom:16px;display:flex;align-items:center;gap:18px;flex-wrap:wrap;">
          ${scoreRing(groupsFull, s.groups.length, 84)}
          <div>
            <div style="font-weight:800;font-size:15px;">${groupsFull}/${s.groups.length} angle categories fully covered</div>
            <span class="badge ${ready ? 'badge-good' : 'badge-warn'}" style="margin-top:6px;display:inline-block;">${ready ? 'Ready for production' : 'Needs more angles'}</span>
          </div>
        </div>`;
    } else {
      const tier = optimizationTier(key, checkedCount, total);
      scoreBlock = `
        <div class="card" style="margin-bottom:16px;display:flex;align-items:center;gap:18px;flex-wrap:wrap;">
          ${scoreRing(checkedCount, total, 84)}
          <div>
            <div style="font-weight:800;font-size:15px;">${checkedCount}/${total} checked</div>
            <span class="badge ${tier.cls}" style="margin-top:6px;display:inline-block;">${tier.label}</span>
          </div>
          ${progressBar(total ? checkedCount/total*100 : 0)}
        </div>`;
    }

    let body;
    if (s.flat) {
      body = `<div class="card">${items.map(it => checkline(it, state)).join('')}</div>`;
    } else {
      const byGroup = {};
      items.forEach(it => { (byGroup[it.group] = byGroup[it.group] || []).push(it); });
      body = `<div class="grid grid-2">${Object.entries(byGroup).map(([g, its]) => `
        <div class="card">
          <div class="card-title" style="font-size:13.5px;">${esc(g)}</div>
          ${its.map(it => checkline(it, state)).join('')}
        </div>`).join('')}</div>`;
    }

    return `${scoreBlock}${body}
      <div style="display:flex;justify-content:flex-end;margin-top:14px;">
        <button class="btn btn-ghost btn-sm" onclick="ChecklistTab.clearSection('${key}')">Clear this checklist</button>
      </div>`;
  }

  function checkline(it, state) {
    const checked = !!state[it.id];
    return `<label class="checkline">
      <input type="checkbox" ${checked ? 'checked' : ''} onchange="ChecklistTab.toggle('${it.id}')" />
      <span>${esc(it.label)}</span>
    </label>`;
  }

  function optimizationTier(key, checked, total) {
    const pct = total ? checked / total : 0;
    if (key === 'pre' || key === 'during') {
      if (pct >= 1) return { label: 'All set', cls: 'badge-good' };
      if (pct >= 0.7) return { label: 'Almost there', cls: 'badge-info' };
      if (pct >= 0.4) return { label: 'In progress', cls: 'badge-warn' };
      return { label: 'Just started', cls: 'badge-bad' };
    }
    // post-writing: guide uses /13 bands, scaled to actual item count
    if (pct >= 12/13) return { label: 'READY TO PRODUCE', cls: 'badge-good' };
    if (pct >= 10/13) return { label: 'GOOD · Minor tweaks', cls: 'badge-info' };
    if (pct >= 8/13) return { label: 'NEEDS WORK', cls: 'badge-warn' };
    return { label: 'REWRITE', cls: 'badge-bad' };
  }

  function storeKey(key) {
    return { pre: 'preWriting', during: 'duringWriting', post: 'postWriting', viral: 'viralAngle' }[key];
  }

  function setActive(key) { active = key; render(); }

  function toggle(id) {
    const key = id.split('-')[0];
    const sk = storeKey(key);
    Store.update('checklists', c => {
      const next = { ...c };
      next[sk] = { ...next[sk], [id]: !next[sk]?.[id] };
      return next;
    });
    render();
  }

  function clearSection(key) {
    if (!confirmDelete('Clear all checks in this checklist?')) return;
    const sk = storeKey(key);
    Store.update('checklists', c => ({ ...c, [sk]: {} }));
    render();
  }

  return { render, setActive, toggle, clearSection };
})();
