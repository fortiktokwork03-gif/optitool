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
  let linkInput = '';
  let autoLoading = false;
  let autoLoadingMsg = '';
  let autoError = '';
  let autoNote = null; // { real: [...], inferred: [...], source: 'ai'|'rules' } after a successful auto-fill

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

      <div class="card" style="margin-bottom:16px;">
        <div class="card-title">Analyze From a Video Link</div>
        <div class="card-sub">Paste one video's link — the tool pulls its real stats via the YouTube Data API and auto-fills the whole breakdown below${aiAvailable() ? ' (Claude fills in the judgment calls)' : ' using pattern-matching (open the Artifact link for AI-written analysis)'}.</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;">
          <div class="field" style="flex:1;min-width:180px;margin-bottom:0;">
            <label>YouTube API key</label>
            <input type="text" value="${esc(Store.get('titleStrategy').apiKey)}" placeholder="AIza..." oninput="VideosTab.setApiKey(this.value)" />
          </div>
          <div class="field" style="flex:2;min-width:260px;margin-bottom:0;">
            <label>Video link</label>
            <input type="text" value="${esc(linkInput)}" placeholder="https://www.youtube.com/watch?v=..."
              oninput="VideosTab.setLinkInput(this.value)" onkeydown="if(event.key==='Enter'){VideosTab.autoFill();}" />
          </div>
          <button class="btn btn-primary" ${autoLoading ? 'disabled' : ''} onclick="VideosTab.autoFill()">${autoLoading ? '⏳ ' + esc(autoLoadingMsg) : '⚡ Auto-Fill Breakdown'}</button>
        </div>
        ${autoError ? `<div class="badge badge-bad" style="margin-top:10px;display:inline-block;">${esc(autoError)}</div>` : ''}
        ${autoNote ? `
          <div class="divider"></div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px;">
            <span class="badge ${autoNote.source === 'ai' ? 'badge-good' : 'badge-info'}">${autoNote.source === 'ai' ? 'AI-assisted' : 'Pattern-matched'}</span>
            <span class="hint">Fields filled below — review before saving</span>
          </div>
          <div class="hint"><strong style="color:var(--good);">From the API (real):</strong> ${autoNote.real.join(', ')}</div>
          <div class="hint" style="margin-top:4px;"><strong style="color:var(--warn);">Inferred from title/description — verify by watching:</strong> ${autoNote.inferred.join(', ')}</div>
        ` : ''}
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

  // ---------------- auto-fill from a single video link ----------------
  function setApiKey(v) { Store.update('titleStrategy', ts => ({ ...ts, apiKey: v })); }
  function setLinkInput(v) { linkInput = v; }

  async function fetchVideoAndChannel(apiKey, videoId) {
    const vdata = await ytApiFetch('videos', { part: 'snippet,statistics,contentDetails', id: videoId }, apiKey);
    const v = vdata.items && vdata.items[0];
    if (!v) throw new Error('Video not found — check the link');
    let subscriberCount = null;
    try {
      const cdata = await ytApiFetch('channels', { part: 'statistics', id: v.snippet.channelId }, apiKey);
      const c = cdata.items && cdata.items[0];
      if (c) subscriberCount = Number(c.statistics.subscriberCount || 0);
    } catch (e) { /* non-fatal */ }
    return { v, subscriberCount };
  }

  function inferHook(title, description) {
    const lower = (title + ' ' + (description || '').slice(0, 400)).toLowerCase();
    let hookType = 'Statement';
    if (/\?\s*$/.test(title.trim())) hookType = 'Question';
    else if (/\d/.test(title)) hookType = 'Data';
    else if (/\b(i|i'm|my)\b/i.test(title)) hookType = 'Story';
    else if (/\b(mistake|problem|struggling|stuck)\b/i.test(lower)) hookType = 'Problem';

    let emotion = 'Curiosity';
    if (/secret|hidden|truth|nobody|shocking|weird trick/.test(lower)) emotion = 'Curiosity';
    else if (/warning|mistake|stop|never|worst|danger/.test(lower)) emotion = 'Fear';
    else if (/best|amazing|incredible|proven|ultimate|life.?chang/.test(lower)) emotion = 'Inspiration';
    else if (/insane|crazy|shocking|unbelievable/.test(lower)) emotion = 'Surprise';

    const matchedPower = TITLE_POWER_WORDS.filter(w => lower.includes(w));
    const effectiveness = matchedPower.length >= 3 ? 'Viral' : matchedPower.length === 2 ? 'Strong' : matchedPower.length === 1 ? 'Moderate' : 'Weak';
    return { hookType, emotion, effectiveness, matchedPower };
  }

  function guessTemplateName(title) {
    const t = title.toLowerCase();
    if (/\d+\s*(ways|tips|reasons|things|secrets|tools|mistakes|hacks|steps|signs)/.test(t)) return 'Top-X Listicle';
    if (/\b(data|stats|statistics|study|research|report|%|million|billion)\b/.test(t)) return 'Data-Insight';
    if (/\b(i |my |story|journey|how i)\b/.test(t)) return 'Story-Lesson';
    return 'Problem-Solution';
  }

  function guessTone(title) {
    if (/\b(i|my)\b/i.test(title)) return 'Conversational';
    if (/\d/.test(title)) return 'Educational';
    if (/!|shocking|insane|crazy/i.test(title)) return 'Emotional';
    return 'Authoritative';
  }

  function extractTactics(description) {
    const tactics = [];
    const d = (description || '').toLowerCase();
    if (/comment below|let me know|what do you think/.test(d)) tactics.push('Asks viewers to comment');
    if (/subscribe/.test(d)) tactics.push('Subscribe CTA in description');
    if (/link in (the )?description|check out|click here|shop now/.test(d)) tactics.push('External link CTA');
    if (/\d\d:\d\d/.test(d)) tactics.push('Timestamps included');
    if (/part \d|part one|part two|series/.test(d)) tactics.push('Part of a series');
    return tactics;
  }

  function extractPhrases(title, description) {
    const text = `${title}. ${(description || '').slice(0, 500)}`;
    const sentences = text.split(/[\n.!?]+/).map(s => s.trim()).filter(Boolean);
    return sentences.filter(s => TITLE_POWER_WORDS.some(w => s.toLowerCase().includes(w))).slice(0, 5);
  }

  async function aiEnhanceBreakdown(title, description, stats) {
    const sample = await claude.use('sample');
    if (!sample) return null;
    const prompt = `You are analyzing a YouTube video for a competitor breakdown. You only have the metadata below (no transcript/audio):
Title: "${title}"
Description (first 600 chars): "${(description || '').slice(0, 600)}"
Views: ${stats.viewCount}, Likes: ${stats.likeCount}, Comments: ${stats.commentCount}, Length: ${stats.lengthMin} min

Based ONLY on this metadata, give your best educated-guess analysis. Respond with ONLY a JSON object, no other text, in this exact shape:
{"hookType":"Question|Statement|Problem|Story|Data","emotion":"Fear|Curiosity|Inspiration|Surprise|Anger","effectiveness":"Weak|Moderate|Strong|Viral","whyWorks":"1-2 sentence explanation","tone":"Authoritative|Conversational|Emotional|Educational|Comedic","structureTemplate":"Problem-Solution|Story-Lesson|Data-Insight|Top-X Listicle","phrases":["up to 5 short notable phrases pulled from the title/description"],"tactics":["up to 4 engagement tactics visible in the description, e.g. asks for comments, has a CTA link, timestamps"]}`;
    const result = await sample.json(prompt, { modelTier: 'quick' });
    return result;
  }

  async function autoFill() {
    const apiKey = Store.get('titleStrategy').apiKey.trim();
    if (!apiKey) { autoError = 'Add your YouTube API key first'; render(); return; }
    const videoId = extractYouTubeVideoId(linkInput);
    if (!videoId) { autoError = 'Paste a valid YouTube video link'; render(); return; }

    autoError = ''; autoLoading = true; autoLoadingMsg = 'Fetching video data...'; autoNote = null; render();
    try {
      const { v, subscriberCount } = await fetchVideoAndChannel(apiKey, videoId);
      const title = v.snippet.title;
      const description = v.snippet.description || '';
      const stats = {
        viewCount: Number(v.statistics.viewCount || 0),
        likeCount: Number(v.statistics.likeCount || 0),
        commentCount: Number(v.statistics.commentCount || 0),
        lengthMin: Math.round(parseISODuration(v.contentDetails.duration) * 10) / 10,
      };

      let ai = null;
      if (aiAvailable()) {
        autoLoadingMsg = 'Asking Claude for the judgment calls...'; render();
        try { ai = await aiEnhanceBreakdown(title, description, stats); } catch (e) { console.error(e); }
      }
      const rule = inferHook(title, description);

      draft = freshDraft();
      draft.title = title;
      draft.channel = v.snippet.channelTitle || '';
      draft.subs = subscriberCount !== null ? String(subscriberCount) : '';
      draft.views = String(stats.viewCount);
      draft.likes = String(stats.likeCount);
      draft.uploadDate = (v.snippet.publishedAt || '').slice(0, 10);
      draft.totalLength = String(stats.lengthMin);
      draft.hookType = ai?.hookType || rule.hookType;
      draft.emotion = ai?.emotion || rule.emotion;
      draft.effectiveness = ai?.effectiveness || rule.effectiveness;
      draft.whyWorks = ai?.whyWorks || (rule.matchedPower.length ? `Uses proven power word(s): ${rule.matchedPower.join(', ')}` : '');
      draft.tone = ai?.tone || guessTone(title);
      const phrases = (ai?.phrases && ai.phrases.length ? ai.phrases : extractPhrases(title, description)).slice(0, 5);
      draft.phrases = [0, 1, 2, 3, 4].map(i => phrases[i] || '');
      const tactics = (ai?.tactics && ai.tactics.length ? ai.tactics : extractTactics(description));
      draft.tactics = tactics.join(', ');
      const template = ai?.structureTemplate || guessTemplateName(title);
      draft.structure[0].text = `Suggested structure for this video: ${template}. Watch the video to fill in exact timings/content per beat below.`;

      autoNote = {
        source: ai ? 'ai' : 'rules',
        real: ['title', 'channel', 'subscribers', 'views', 'likes', 'upload date', 'video length'],
        inferred: ['emotion', 'hook type', 'effectiveness', 'why it works', 'tone', 'phrases', 'engagement tactics', 'suggested structure template'],
      };
      toast('Breakdown auto-filled — review and save');
    } catch (err) {
      console.error(err);
      if (err.reason === 'quotaExceeded') autoError = 'YouTube API quota exceeded for today';
      else if (err.reason === 'keyInvalid' || err.reason === 'badRequest') autoError = 'API key looks invalid';
      else autoError = err.message || 'Could not fetch this video';
    } finally {
      autoLoading = false; render();
    }
  }

  return { render, set, setStruct, setPhrase, saveVideo, editVideo, cancelEdit, deleteVideo, setApiKey, setLinkInput, autoFill };
})();
