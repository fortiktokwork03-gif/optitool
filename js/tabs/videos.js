const VideosTab = (() => {
  const EMOTIONS = ['Fear', 'Curiosity', 'Inspiration', 'Surprise', 'Anger'];
  const HOOK_TYPES = ['Question', 'Statement', 'Problem', 'Story', 'Data'];
  const EFFECTIVENESS = ['Weak', 'Moderate', 'Strong', 'Viral'];
  const TONES = ['Authoritative', 'Conversational', 'Emotional', 'Educational', 'Comedic'];
  const BROLL_TYPES = ['Screen recording', 'Stock footage', 'Animations', 'Text overlay'];
  const DENSITY = ['Light', 'Medium', 'Heavy'];
  const SPEED = ['Slow', 'Medium', 'Fast'];
  const STRUCT_LABELS = ['Hook', 'Problem statement', 'Story/Evidence', 'Solution/Key insight', 'Closing/CTA'];

  let draft = freshDraft();
  let editingId = null;

  function freshDraft() {
    return {
      title: '', channel: '', subs: '', views: '', likes: '', ctr: '', uploadDate: '', velocity: '',
      hookLine: '', emotion: EMOTIONS[1], hookType: HOOK_TYPES[0], effectiveness: EFFECTIVENESS[2], whyWorks: '',
      dropoff: '', structure: STRUCT_LABELS.map(() => ({ text: '', duration: '' })),
      totalLength: '', pacing: SPEED[1],
      phrases: ['', '', '', '', ''], tone: TONES[1],
      brollType: BROLL_TYPES[0], animSpeed: SPEED[1], cutFreq: '', textDensity: DENSITY[1],
      tactics: '',
    };
  }

  function render() {
    const root = document.getElementById('tab-videos');
    root.innerHTML = `
      <div class="section-head">
        <h2>Viral Video Analysis System</h2>
        <p>Break down each of the top-10 videos in your niche, then let the tool extract winning patterns once you've logged a few.</p>
      </div>

      <div class="card">
        <div class="card-title">${editingId ? 'Editing breakdown' : 'New Competitor Video Breakdown'}</div>
        <div class="card-sub">Fill what you can — nothing is required except a title</div>

        <div class="grid grid-2">
          <div class="field"><label>Video title</label><input type="text" value="${esc(draft.title)}" oninput="VideosTab.set('title', this.value)" placeholder="e.g. How I Made $10K in 30 Days" /></div>
          <div class="field"><label>Channel name</label><input type="text" value="${esc(draft.channel)}" oninput="VideosTab.set('channel', this.value)" /></div>
        </div>
        <div class="grid grid-4">
          <div class="field"><label>Subscribers</label><input type="text" value="${esc(draft.subs)}" oninput="VideosTab.set('subs', this.value)" placeholder="120K" /></div>
          <div class="field"><label>Views</label><input type="text" value="${esc(draft.views)}" oninput="VideosTab.set('views', this.value)" placeholder="2.4M" /></div>
          <div class="field"><label>Likes</label><input type="text" value="${esc(draft.likes)}" oninput="VideosTab.set('likes', this.value)" /></div>
          <div class="field"><label>CTR estimate %</label><input type="number" value="${esc(draft.ctr)}" oninput="VideosTab.set('ctr', this.value)" /></div>
        </div>
        <div class="grid grid-3">
          <div class="field"><label>Upload date</label><input type="date" value="${esc(draft.uploadDate)}" oninput="VideosTab.set('uploadDate', this.value)" /></div>
          <div class="field"><label>Performance velocity</label><input type="text" value="${esc(draft.velocity)}" oninput="VideosTab.set('velocity', this.value)" placeholder="e.g. 80k views/week" /></div>
          <div class="field"><label>Total video length (min)</label><input type="number" value="${esc(draft.totalLength)}" oninput="VideosTab.set('totalLength', this.value)" /></div>
        </div>

        <div class="divider"></div>
        <div class="card-title" style="font-size:13.5px;">Hook Analysis (0-5s)</div>
        <div class="field"><label>Opening line</label><input type="text" value="${esc(draft.hookLine)}" oninput="VideosTab.set('hookLine', this.value)" /></div>
        <div class="grid grid-3">
          <div class="field"><label>Emotion triggered</label><select onchange="VideosTab.set('emotion', this.value)">${opts(EMOTIONS, draft.emotion)}</select></div>
          <div class="field"><label>Hook type</label><select onchange="VideosTab.set('hookType', this.value)">${opts(HOOK_TYPES, draft.hookType)}</select></div>
          <div class="field"><label>Effectiveness</label><select onchange="VideosTab.set('effectiveness', this.value)">${opts(EFFECTIVENESS, draft.effectiveness)}</select></div>
        </div>
        <div class="field"><label>Why it works</label><textarea oninput="VideosTab.set('whyWorks', this.value)">${esc(draft.whyWorks)}</textarea></div>
        <div class="field"><label>Estimated drop-off points</label><input type="text" value="${esc(draft.dropoff)}" oninput="VideosTab.set('dropoff', this.value)" placeholder="e.g. 0:45 — pacing dips; 4:30 — CTA feels early" /></div>

        <div class="divider"></div>
        <div class="card-title" style="font-size:13.5px;">Script Structure Pattern</div>
        <div class="grid grid-2">
          ${STRUCT_LABELS.map((label, i) => `
            <div class="field">
              <label>${i+1}. ${label}</label>
              <div style="display:flex;gap:6px;">
                <input type="text" style="flex:1;" value="${esc(draft.structure[i].text)}" oninput="VideosTab.setStruct(${i}, 'text', this.value)" placeholder="What happens here" />
                <input type="text" style="width:70px;" value="${esc(draft.structure[i].duration)}" oninput="VideosTab.setStruct(${i}, 'duration', this.value)" placeholder="__s" />
              </div>
            </div>`).join('')}
        </div>
        <div class="field" style="max-width:260px;"><label>Pacing speed</label><select onchange="VideosTab.set('pacing', this.value)">${opts(SPEED, draft.pacing)}</select></div>

        <div class="divider"></div>
        <div class="card-title" style="font-size:13.5px;">Language Patterns & Tone</div>
        <div class="grid grid-2">
          ${draft.phrases.map((p, i) => `<div class="field"><label>Trending phrase ${i+1}</label><input type="text" value="${esc(p)}" oninput="VideosTab.setPhrase(${i}, this.value)" /></div>`).join('')}
        </div>
        <div class="field" style="max-width:260px;"><label>Tone</label><select onchange="VideosTab.set('tone', this.value)">${opts(TONES, draft.tone)}</select></div>

        <div class="divider"></div>
        <div class="card-title" style="font-size:13.5px;">B-Roll Strategy</div>
        <div class="grid grid-4">
          <div class="field"><label>Most common cuts</label><select onchange="VideosTab.set('brollType', this.value)">${opts(BROLL_TYPES, draft.brollType)}</select></div>
          <div class="field"><label>Animation speed</label><select onchange="VideosTab.set('animSpeed', this.value)">${opts(SPEED, draft.animSpeed)}</select></div>
          <div class="field"><label>Cut frequency</label><input type="text" value="${esc(draft.cutFreq)}" oninput="VideosTab.set('cutFreq', this.value)" placeholder="every __s" /></div>
          <div class="field"><label>Text overlay density</label><select onchange="VideosTab.set('textDensity', this.value)">${opts(DENSITY, draft.textDensity)}</select></div>
        </div>

        <div class="divider"></div>
        <div class="field"><label>Engagement tactics noticed (comma separated)</label><textarea oninput="VideosTab.set('tactics', this.value)">${esc(draft.tactics)}</textarea></div>

        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:6px;">
          ${editingId ? `<button class="btn btn-ghost" onclick="VideosTab.cancelEdit()">Cancel</button>` : ''}
          <button class="btn btn-primary" onclick="VideosTab.saveVideo()">💾 ${editingId ? 'Update' : 'Save'} Breakdown</button>
        </div>
      </div>

      <div style="margin-top:24px;">
        <h3 style="font-size:16px;margin-bottom:12px;">Pattern Recognition (${Store.get('videos').length} videos analyzed)</h3>
        ${renderPatterns()}
      </div>

      <div style="margin-top:24px;">
        <h3 style="font-size:16px;margin-bottom:12px;">Saved Breakdowns</h3>
        ${renderSaved()}
      </div>
    `;
  }

  function opts(list, current) {
    return list.map(o => `<option ${o === current ? 'selected' : ''}>${o}</option>`).join('');
  }

  function renderPatterns() {
    const videos = Store.get('videos');
    if (videos.length < 2) {
      return `<div class="empty-state"><div class="emoji">🧩</div>Analyze at least 2 videos to see winning patterns emerge (aim for 10, per the guide).</div>`;
    }
    const count = arr => arr.reduce((m, v) => { if (v) m[v] = (m[v] || 0) + 1; return m; }, {});
    const topOf = m => Object.entries(m).sort((a, b) => b[1] - a[1])[0];

    const hookTypes = count(videos.map(v => v.hookType));
    const emotions = count(videos.map(v => v.emotion));
    const pacing = count(videos.map(v => v.pacing));
    const lengths = videos.map(v => Number(v.totalLength)).filter(n => !isNaN(n) && n > 0);
    const avgLen = lengths.length ? (lengths.reduce((a, b) => a + b, 0) / lengths.length).toFixed(1) : '—';
    const allPhrases = videos.flatMap(v => v.phrases.filter(p => p && p.trim()));
    const phraseCounts = count(allPhrases.map(p => p.trim().toLowerCase()));
    const topPhrases = Object.entries(phraseCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const topHook = topOf(hookTypes), topEmotion = topOf(emotions), topPacing = topOf(pacing);

    return `
      <div class="card">
        <div class="kv-grid">
          <div class="kv"><div class="k">Winning hook type</div><div class="v">${topHook ? topHook[0] : '—'}</div><div class="stat-note">${topHook ? `${topHook[1]}/${videos.length} videos` : ''}</div></div>
          <div class="kv"><div class="k">Dominant emotion</div><div class="v">${topEmotion ? topEmotion[0] : '—'}</div><div class="stat-note">${topEmotion ? `${topEmotion[1]}/${videos.length} videos` : ''}</div></div>
          <div class="kv"><div class="k">Common pacing</div><div class="v">${topPacing ? topPacing[0] : '—'}</div><div class="stat-note">${topPacing ? `${topPacing[1]}/${videos.length} videos` : ''}</div></div>
          <div class="kv"><div class="k">Avg video length</div><div class="v">${avgLen}${avgLen !== '—' ? ' min' : ''}</div></div>
        </div>
        ${topPhrases.length ? `
          <div class="divider"></div>
          <div style="font-size:12px;font-weight:800;color:var(--text-faint);text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px;">Phrases repeating across videos</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            ${topPhrases.map(([p, c]) => `<span class="tag">"${esc(p)}" · ${c}×</span>`).join('')}
          </div>` : ''}
      </div>`;
  }

  function renderSaved() {
    const videos = Store.get('videos');
    if (!videos.length) return `<div class="empty-state"><div class="emoji">🔍</div>No breakdowns saved yet.</div>`;
    return videos.slice().reverse().map(v => `
      <div class="list-item">
        <div class="list-item-head">
          <div>
            <div class="list-item-title">${esc(v.title || 'Untitled video')}</div>
            <div class="list-item-meta">${esc(v.channel || 'Unknown channel')} ${v.views ? '· ' + esc(v.views) + ' views' : ''} ${v.uploadDate ? '· ' + fmtDate(v.uploadDate) : ''}</div>
          </div>
          <div class="list-item-actions">
            ${v.hookType ? `<span class="badge badge-accent">${esc(v.hookType)}</span>` : ''}
            <button class="icon-btn" title="Edit" onclick="VideosTab.editVideo('${v.id}')">✎</button>
            <button class="icon-btn" title="Delete" onclick="VideosTab.deleteVideo('${v.id}')">🗑</button>
          </div>
        </div>
        ${v.hookLine ? `<div style="margin-top:8px;font-size:13px;color:var(--text-dim);font-style:italic;">"${esc(v.hookLine)}"</div>` : ''}
      </div>`).join('');
  }

  // ---- handlers ----
  function set(key, val) { draft[key] = val; }
  function setStruct(i, key, val) { draft.structure[i][key] = val; }
  function setPhrase(i, val) { draft.phrases[i] = val; }

  function saveVideo() {
    if (!draft.title.trim()) { toast('Give the video a title first'); return; }
    const record = { ...structuredClone(draft), id: editingId || uid(), createdAt: new Date().toISOString() };
    if (editingId) {
      Store.update('videos', arr => arr.map(v => v.id === editingId ? record : v));
      toast('Breakdown updated');
    } else {
      Store.update('videos', arr => [...arr, record]);
      toast('Breakdown saved');
    }
    editingId = null;
    draft = freshDraft();
    render();
  }

  function editVideo(id) {
    const v = Store.get('videos').find(x => x.id === id);
    if (!v) return;
    draft = structuredClone(v);
    editingId = id;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() { editingId = null; draft = freshDraft(); render(); }

  function deleteVideo(id) {
    if (!confirmDelete('Delete this breakdown?')) return;
    Store.update('videos', arr => arr.filter(v => v.id !== id));
    render();
  }

  return { render, set, setStruct, setPhrase, saveVideo, editVideo, cancelEdit, deleteVideo };
})();
