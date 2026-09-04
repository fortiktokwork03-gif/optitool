const DashboardTab = (() => {
  function render() {
    const topics = Store.get('topics');
    const videos = Store.get('videos');
    const uploads = Store.get('uploads');
    const estimates = Store.get('estimates');

    const goldTopics = topics.filter(t => t.total >= 12).length;
    const avgCtr = uploads.length ? (uploads.reduce((a, u) => a + (Number(u.ctr24h) || 0), 0) / uploads.length).toFixed(1) : '—';
    const lastEstimate = estimates[estimates.length - 1];

    const root = document.getElementById('tab-dashboard');
    root.innerHTML = `
      <div class="section-head">
        <h2>Welcome back, Waqar 👋</h2>
        <p>Everything from your YouTube Script Optimizer guide, turned into a working toolkit. Pick a stage below or jump in from the sidebar.</p>
      </div>

      <div class="grid grid-4" style="margin-bottom:22px;">
        <div class="stat-card">
          <div class="stat-label">Topics Scored</div>
          <div class="stat-value">${topics.length}</div>
          <div class="stat-note">${goldTopics} at GOLD tier (12-15)</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Videos Analyzed</div>
          <div class="stat-value">${videos.length}</div>
          <div class="stat-note">Toward your "top 10" research</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Avg 24h CTR Logged</div>
          <div class="stat-value">${avgCtr}${avgCtr !== '—' ? '%' : ''}</div>
          <div class="stat-note">${uploads.length} upload(s) tracked</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Latest Confidence</div>
          <div class="stat-value">${lastEstimate ? lastEstimate.confidence + '%' : '—'}</div>
          <div class="stat-note">${lastEstimate ? esc(lastEstimate.topic || 'Unnamed estimate') : 'No estimate yet'}</div>
        </div>
      </div>

      <div class="grid grid-3">
        ${quickCard('🎯', 'Score a Topic', 'Run the 15-point Topic Score Card + saturation check before you commit.', 'topics')}
        ${quickCard('🔍', 'Analyze a Viral Video', 'Break down a competitor video: hook, retention pattern, structure, B-roll.', 'videos')}
        ${quickCard('🪝', 'Build Your Hook', 'Tier 1-3 hook formulas, combo formulas, and a 3-variation hook tester.', 'hooks')}
        ${quickCard('📜', 'Pick a Structure', 'Problem-Solution, Story-Lesson, Data-Insight, or Top-X — with timing blocks.', 'templates')}
        ${quickCard('✅', 'Run the Checklist', 'Pre-writing, during-writing, post-writing and viral-angle checkpoints.', 'checklist')}
        ${quickCard('📊', 'Track Performance', 'Estimate before upload, log 24h/week-1 metrics, compare to your niche baseline.', 'tracker')}
      </div>

      <div class="card" style="margin-top: 20px;">
        <div class="card-title">This week's rhythm</div>
        <div class="card-sub">From the Implementation Workflow section of your guide</div>
        <div class="kv-grid">
          <div class="kv"><div class="k">Mon</div><div class="v" style="font-size:13px;">Research + analyze</div></div>
          <div class="kv"><div class="k">Tue</div><div class="v" style="font-size:13px;">Write + optimize</div></div>
          <div class="kv"><div class="k">Wed–Thu</div><div class="v" style="font-size:13px;">Produce</div></div>
          <div class="kv"><div class="k">Fri</div><div class="v" style="font-size:13px;">Upload + monitor</div></div>
          <div class="kv"><div class="k">Ongoing</div><div class="v" style="font-size:13px;">Track + learn</div></div>
        </div>
        <div style="margin-top:14px;"><button class="btn btn-ghost btn-sm" onclick="App.goTo('workflow')">Open full weekly workflow →</button></div>
      </div>
    `;
  }

  function quickCard(emoji, title, desc, tab) {
    return `
      <div class="card" style="cursor:pointer;" onclick="App.goTo('${tab}')">
        <div style="font-size:22px;margin-bottom:8px;">${emoji}</div>
        <div class="card-title">${title}</div>
        <div class="card-sub" style="margin-bottom:0;">${desc}</div>
      </div>`;
  }

  return { render };
})();
