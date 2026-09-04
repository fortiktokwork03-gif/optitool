const WorkflowTab = (() => {
  function render() {
    const root = document.getElementById('tab-workflow');
    const weekly = Store.get('weekly');
    root.innerHTML = `
      <div class="section-head">
        <h2>Weekly Implementation Workflow</h2>
        <p>Your content-creation rhythm — check off each task as you go through the week. Progress resets whenever you're ready for a new cycle.</p>
      </div>

      <div class="grid grid-2" style="align-items:start;">
        <div>
          ${WEEKLY_WORKFLOW.map((d, di) => `
            <div class="card week-day">
              <div class="week-day-title">${esc(d.day)}</div>
              ${d.tasks.map((t, ti) => {
                const key = `${di}-${ti}`;
                const checked = !!weekly[key];
                return `<label class="checkline">
                  <input type="checkbox" ${checked ? 'checked' : ''} onchange="WorkflowTab.toggle('${key}')" />
                  <span>${esc(t)}</span>
                </label>`;
              }).join('')}
            </div>`).join('')}
          <div style="display:flex;justify-content:flex-end;"><button class="btn btn-ghost btn-sm" onclick="WorkflowTab.clearWeek()">Reset week</button></div>
        </div>

        <div>
          <div class="card" style="margin-bottom:16px;">
            <div class="card-title">Advanced Techniques</div>
            ${ADVANCED_TECHNIQUES.map(a => `
              <div style="margin-bottom:14px;">
                <div style="font-weight:700;font-size:13.5px;">${esc(a.title)}</div>
                <div style="font-size:12.5px;color:var(--text-dim);margin-top:3px;">${esc(a.body)}</div>
              </div>`).join('')}
          </div>

          <div class="card">
            <div class="card-title">Common Mistakes to Avoid</div>
            ${COMMON_MISTAKES.map(m => `
              <div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--border-soft);">
                <div style="font-size:13px;"><span class="badge badge-bad" style="margin-right:6px;">✕</span>${esc(m.mistake)}</div>
                <div style="font-size:12.5px;color:var(--good);margin-top:5px;padding-left:26px;">→ ${esc(m.fix)}</div>
              </div>`).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function toggle(key) {
    Store.update('weekly', w => ({ ...w, [key]: !w[key] }));
    render();
  }

  function clearWeek() {
    if (!confirmDelete('Reset all checked tasks for this week?')) return;
    Store.set('weekly', {});
    render();
  }

  return { render, toggle, clearWeek };
})();
