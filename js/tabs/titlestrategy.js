const TitleStrategyTab = (() => {
  let channelInput = '';
  let subtopic = '';
  let loading = false;
  let loadingMsg = '';
  let errorMsg = '';
  let current = null; // the active analysis being viewed (not yet necessarily saved)
  let generating = false;
  let ideas = [];
  let ideasSource = ''; // 'ai' | 'rules'
  let mcpStatus = 'checking'; // 'checking' | 'connected' | 'unavailable'
  let mcpChecked = false;

  async function checkMcp() {
    if (mcpChecked) return;
    mcpChecked = true;
    const mcp = await getMcp();
    mcpStatus = mcp ? 'connected' : 'unavailable';
    render();
  }

  function renderSourceCard(ts) {
    if (mcpStatus === 'checking') {
      return `<div class="card-title">1 · Data Source</div><div class="hint">Checking for a connected NexLev connector...</div>`;
    }
    if (mcpStatus === 'connected') {
      return `
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
          <div>
            <div class="card-title" style="margin-bottom:2px;">1 · Data Source</div>
            <div class="card-sub" style="margin-bottom:0;">Connected via your <strong>NexLev</strong> connector — no API key needed.</div>
          </div>
          <span class="badge badge-good">✓ Connected</span>
        </div>
        <div class="hint" style="margin-top:8px;">If a channel lookup ever fails with an auth error, reconnect NexLev in claude.ai Settings → Connectors.</div>`;
    }
    return `
      <div class="card-title">1 · YouTube Data API Key</div>
      <div class="card-sub">No NexLev connector detected in this view — free key from Google Cloud Console, stored only in your browser.</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;">
        <div class="field" style="flex:1;min-width:240px;margin-bottom:0;">
          <label>API key</label>
          <input type="text" id="ytApiKeyInput" value="${esc(ts.apiKey)}" placeholder="AIza..." oninput="TitleStrategyTab.setApiKey(this.value)" />
        </div>
        <button class="btn btn-ghost btn-sm" onclick="TitleStrategyTab.toggleKeyVisible()">👁 Show/Hide</button>
      </div>
      <div class="hint" style="margin-top:8px;">Don't have one? Google Cloud Console → APIs & Services → enable "YouTube Data API v3" → Credentials → Create API Key. Or connect the NexLev connector in claude.ai Settings → Connectors to skip this.</div>`;
  }

  function render() {
    if (!mcpChecked) checkMcp();
    const root = document.getElementById('tab-titlestrategy');
    const ts = Store.get('titleStrategy');
    root.innerHTML = `
      <div class="section-head">
        <h2>Title Strategy Analyzer</h2>
        <p>Paste any channel's link, pull its real upload history, and see exactly what its highest-performing titles have in common — then generate new title ideas in that same style for a subtopic of your choice.</p>
      </div>

      <div class="card" style="margin-bottom:16px;">
        ${renderSourceCard(ts)}
      </div>

      <div class="card" style="margin-bottom:16px;">
        <div class="card-title">2 · Analyze a Channel</div>
        <div class="card-sub">Paste a channel URL, @handle, or handle name</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <input type="text" style="flex:1;min-width:240px;" value="${esc(channelInput)}" placeholder="https://www.youtube.com/@MrBeast or @MrBeast"
            oninput="TitleStrategyTab.setChannelInput(this.value)" onkeydown="if(event.key==='Enter'){TitleStrategyTab.analyze();}" />
          <button class="btn btn-primary" ${loading ? 'disabled' : ''} onclick="TitleStrategyTab.analyze()">${loading ? '⏳ ' + esc(loadingMsg) : '🔍 Analyze Channel'}</button>
        </div>
        ${errorMsg ? `<div class="badge badge-bad" style="margin-top:10px;display:inline-block;">${esc(errorMsg)}</div>` : ''}
      </div>

      ${current ? renderAnalysis(current) : `<div class="empty-state"><div class="emoji">🎬</div>Paste a channel link above to pull real title data and see the strategy behind it.</div>`}

      <div style="margin-top:24px;">
        <h3 style="font-size:16px;margin-bottom:12px;">Saved Channel Analyses</h3>
        ${renderSavedList(ts.analyses)}
      </div>
    `;
  }

  function renderAnalysis(a) {
    const p = a.patterns;
    return `
      <div class="card" style="margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
          ${a.channel.thumbnail ? `<img src="${esc(a.channel.thumbnail)}" alt="" style="width:52px;height:52px;border-radius:50%;object-fit:cover;" />` : ''}
          <div style="flex:1;min-width:180px;">
            <div class="card-title" style="margin-bottom:2px;">${esc(a.channel.title)}</div>
            <div class="card-sub" style="margin-bottom:0;">${fmtNum(a.channel.subscriberCount)} subscribers · ${fmtNum(a.channel.videoCount)} total videos</div>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="TitleStrategyTab.saveAnalysis()">💾 Save Analysis</button>
        </div>

        <div class="divider"></div>
        <div class="kv-grid">
          <div class="kv"><div class="k">Videos scanned</div><div class="v">${a.titles.length}</div></div>
          <div class="kv"><div class="k">Top performers used</div><div class="v">${a.topTitles.length}</div></div>
          <div class="kv"><div class="k">Avg title length</div><div class="v">${p.avgWords} words</div></div>
          <div class="kv"><div class="k">Avg views (top set)</div><div class="v">${fmtNum(p.avgViews)}</div></div>
        </div>

        <div class="divider"></div>
        <div style="font-size:12px;font-weight:800;color:var(--text-faint);text-transform:uppercase;letter-spacing:.04em;margin-bottom:10px;">Title Strategy Signature</div>
        <div class="grid grid-2">
          <div>
            ${patternRow('Uses a number', p.pctNumber)}
            ${patternRow('Brackets / parentheses e.g. "(2026)"', p.pctBracket)}
            ${patternRow('Question format', p.pctQuestion)}
            ${patternRow('Colon subtitle ("Main: Detail")', p.pctColon)}
            ${patternRow('Personal / first-person ("I ...")', p.pctPersonal)}
            ${patternRow('Title Case capitalization', p.pctTitleCase)}
          </div>
          <div>
            <div style="font-size:12px;color:var(--text-faint);font-weight:700;margin-bottom:6px;">Recurring power words</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;">
              ${p.topPowerWords.length ? p.topPowerWords.map(([w,c]) => `<span class="tag">${esc(w)} · ${c}×</span>`).join('') : '<span class="hint">None detected</span>'}
            </div>
            <div style="font-size:12px;color:var(--text-faint);font-weight:700;margin-bottom:6px;">Recurring words overall</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;">
              ${p.topWords.map(([w,c]) => `<span class="tag">${esc(w)} · ${c}×</span>`).join('')}
            </div>
          </div>
        </div>

        <div class="divider"></div>
        <div style="font-size:12px;font-weight:800;color:var(--text-faint);text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px;">Top-Performing Titles Used for This Analysis</div>
        ${a.topTitles.slice(0, 12).map(t => `
          <div style="display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid var(--border-soft);font-size:13px;">
            <span style="color:var(--text-dim);">${esc(t.title)}</span>
            <span class="mono" style="color:var(--text-faint);flex-shrink:0;font-size:12px;">${fmtNum(t.viewCount)} views</span>
          </div>`).join('')}
      </div>

      <div class="card">
        <div class="card-title">3 · Generate New Title Ideas</div>
        <div class="card-sub">${aiAvailable() ? 'Claude will match this channel\'s exact title strategy to your subtopic.' : 'Rule-based generator (matches detected patterns) — open this tool\'s Artifact link for AI-written titles.'}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <input type="text" style="flex:1;min-width:220px;" value="${esc(subtopic)}" placeholder="e.g. budget travel in Japan"
            oninput="TitleStrategyTab.setSubtopic(this.value)" onkeydown="if(event.key==='Enter'){TitleStrategyTab.generate();}" />
          <button class="btn btn-primary" ${generating ? 'disabled' : ''} onclick="TitleStrategyTab.generate()">${generating ? '⏳ Generating...' : '✨ Generate Titles'}</button>
        </div>
        ${ideas.length ? `
          <div class="divider"></div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
            <span class="badge ${ideasSource === 'ai' ? 'badge-good' : 'badge-info'}">${ideasSource === 'ai' ? 'AI-generated' : 'Rule-based'}</span>
            <span class="hint">for "${esc(subtopic)}"</span>
          </div>
          ${ideas.map(t => `
            <div class="phrase-item">
              <span>${esc(t)}</span>
              <button class="icon-btn" title="Copy" onclick='copyToClipboard(${JSON.stringify(t)})'>📋</button>
            </div>`).join('')}
        ` : ''}
      </div>
    `;
  }

  function patternRow(label, pct) {
    return `
      <div style="margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:4px;">
          <span style="color:var(--text-dim);">${label}</span>
          <span style="font-weight:700;">${pct}%</span>
        </div>
        ${progressBar(pct)}
      </div>`;
  }

  function renderSavedList(analyses) {
    if (!analyses.length) return `<div class="empty-state"><div class="emoji">📼</div>No channel analyses saved yet.</div>`;
    return analyses.slice().reverse().map(a => `
      <div class="list-item">
        <div class="list-item-head">
          <div>
            <div class="list-item-title">${esc(a.channel.title)}</div>
            <div class="list-item-meta">Saved ${fmtDate(a.createdAt)} · ${a.titles.length} videos scanned · avg ${a.patterns.avgWords} words/title</div>
          </div>
          <div class="list-item-actions">
            <button class="icon-btn" title="View" onclick="TitleStrategyTab.viewSaved('${a.id}')">👁</button>
            <button class="icon-btn" title="Delete" onclick="TitleStrategyTab.deleteAnalysis('${a.id}')">🗑</button>
          </div>
        </div>
      </div>`).join('');
  }

  // ---------------- data helpers ----------------
  function fmtNum(n) {
    n = Number(n) || 0;
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  }

  function parseChannelInput(input) {
    const raw = input.trim();
    const chMatch = raw.match(/\/channel\/(UC[\w-]{10,})/);
    if (chMatch) return { type: 'id', value: chMatch[1] };
    const handleMatch = raw.match(/@([\w.-]+)/);
    if (handleMatch) return { type: 'handle', value: '@' + handleMatch[1] };
    if (/^UC[\w-]{10,}$/.test(raw)) return { type: 'id', value: raw };
    const cMatch = raw.match(/\/(?:c|user)\/([\w-]+)/);
    if (cMatch) return { type: 'handle', value: '@' + cMatch[1] };
    return { type: 'handle', value: raw.startsWith('@') ? raw : '@' + raw };
  }

  async function fetchChannel(apiKey, parsed) {
    const params = { part: 'snippet,contentDetails,statistics' };
    if (parsed.type === 'id') params.id = parsed.value; else params.forHandle = parsed.value;
    let data = await ytApiFetch('channels', params, apiKey);
    if ((!data.items || !data.items.length) && parsed.type === 'handle') {
      // fallback to search if forHandle doesn't resolve
      const search = await ytApiFetch('search', { part: 'snippet', q: parsed.value.replace(/^@/, ''), type: 'channel', maxResults: 1 }, apiKey);
      const chId = search.items?.[0]?.snippet?.channelId || search.items?.[0]?.id?.channelId;
      if (!chId) throw new Error('Channel not found');
      data = await ytApiFetch('channels', { part: 'snippet,contentDetails,statistics', id: chId }, apiKey);
    }
    const item = data.items && data.items[0];
    if (!item) throw new Error('Channel not found');
    return {
      id: item.id,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.default?.url || '',
      uploadsPlaylistId: item.contentDetails.relatedPlaylists.uploads,
      subscriberCount: Number(item.statistics.subscriberCount || 0),
      videoCount: Number(item.statistics.videoCount || 0),
    };
  }

  async function fetchUploadIds(apiKey, playlistId, maxVideos) {
    let ids = [];
    let pageToken = '';
    while (ids.length < maxVideos) {
      const data = await ytApiFetch('playlistItems', {
        part: 'contentDetails', playlistId, maxResults: 50, ...(pageToken ? { pageToken } : {}),
      }, apiKey);
      ids.push(...(data.items || []).map(i => i.contentDetails.videoId));
      pageToken = data.nextPageToken;
      if (!pageToken) break;
    }
    return ids.slice(0, maxVideos);
  }

  async function fetchVideoStats(apiKey, ids) {
    const out = [];
    for (let i = 0; i < ids.length; i += 50) {
      const chunk = ids.slice(i, i + 50);
      const data = await ytApiFetch('videos', { part: 'snippet,statistics', id: chunk.join(',') }, apiKey);
      (data.items || []).forEach(v => {
        out.push({
          id: v.id, title: v.snippet.title, publishedAt: v.snippet.publishedAt,
          viewCount: Number(v.statistics.viewCount || 0),
        });
      });
    }
    return out;
  }

  function extractPatterns(topTitles) {
    const n = topTitles.length || 1;
    const words = topTitles.flatMap(t => t.title.toLowerCase().match(/[a-z0-9']+/g) || []);
    const wordCounts = {};
    words.forEach(w => { if (!STOPWORDS.has(w) && w.length > 2) wordCounts[w] = (wordCounts[w] || 0) + 1; });
    const topWords = Object.entries(wordCounts).filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1]).slice(0, 10);

    const powerCounts = {};
    topTitles.forEach(t => {
      const lower = t.title.toLowerCase();
      TITLE_POWER_WORDS.forEach(w => { if (lower.includes(w)) powerCounts[w] = (powerCounts[w] || 0) + 1; });
    });
    const topPowerWords = Object.entries(powerCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

    const pct = (fn) => Math.round((topTitles.filter(fn).length / n) * 100);
    const totalWords = topTitles.reduce((a, t) => a + t.title.trim().split(/\s+/).length, 0);
    const totalViews = topTitles.reduce((a, t) => a + t.viewCount, 0);

    return {
      avgWords: Math.round(totalWords / n),
      avgViews: Math.round(totalViews / n),
      pctNumber: pct(t => /\d/.test(t.title)),
      pctBracket: pct(t => /[()\[\]]/.test(t.title)),
      pctQuestion: pct(t => t.title.trim().endsWith('?')),
      pctColon: pct(t => t.title.includes(':') || t.title.includes('|')),
      pctPersonal: pct(t => /\b(i|i'm|my|me)\b/i.test(t.title)),
      pctTitleCase: pct(t => {
        const w = t.title.split(/\s+/).filter(x => /[a-zA-Z]/.test(x));
        const capped = w.filter(x => /^[A-Z]/.test(x));
        return w.length > 0 && capped.length / w.length > 0.6;
      }),
      topWords, topPowerWords,
    };
  }

  async function generateAITitles(a, subtopic) {
    const sample = await claude.use('sample');
    if (!sample) return null;
    const titleList = a.topTitles.slice(0, 15).map(t => `- ${t.title} (${t.viewCount} views)`).join('\n');
    const prompt = `You are a YouTube title strategist. Here are the highest-performing video titles from the channel "${a.channel.title}":\n${titleList}\n\nStudy the exact title strategy at work here — length, structure, punctuation, power words, numbers, tone, capitalization. Then write 8 brand-new YouTube video title ideas for a related subtopic: "${subtopic}". They must feel like they came from this same channel and match its winning style, but must be original and specific to the subtopic. Output ONLY the 8 titles, one per line, no numbering, no extra commentary.`;
    const result = await sample(prompt, { modelTier: 'default' });
    return result.text.split('\n').map(s => s.replace(/^[-*\d.)\s]+/, '').trim()).filter(Boolean).slice(0, 8);
  }

  function generateRuleTitles(a, subtopic, patterns) {
    const topic = subtopic.trim();
    const Topic = topic.replace(/\b\w/g, c => c.toUpperCase());
    const usesNumber = patterns.pctNumber >= 40;
    const usesQuestion = patterns.pctQuestion >= 25;
    const usesBracket = patterns.pctBracket >= 25;
    const usesPersonal = patterns.pctPersonal >= 25;
    const power = patterns.topPowerWords.map(([w]) => w);
    const pick = (arr, i) => arr[i % arr.length];
    const numbers = [3, 5, 7, 10];

    const templates = [
      () => `${pick(numbers, 0)} ${Topic} Mistakes You're Probably Making`,
      () => `Why ${Topic} Is Harder Than Everyone Says`,
      () => `The Truth About ${Topic} Nobody Tells You`,
      () => `I Tried ${Topic} For 30 Days — Here's What Happened`,
      () => `${Topic}: The Ultimate Beginner's Guide`,
      () => `How To Master ${Topic} (Even If You're a Beginner)`,
      () => `${pick(numbers, 1)} ${Topic} Secrets That Actually Work`,
      () => `Stop Doing ${Topic} Wrong — Do This Instead`,
      () => `Is ${Topic} Worth It In 2026?`,
      () => `${Topic} Explained In ${pick(numbers, 2)} Minutes`,
    ];

    let ideas = templates.map(fn => fn());
    const singleWordPower = power.find(w => !/[\s']/.test(w));
    if (singleWordPower) {
      ideas.unshift(`The ${singleWordPower.charAt(0).toUpperCase() + singleWordPower.slice(1)} Behind ${Topic}`);
    }
    if (usesBracket) ideas = ideas.map(t => (Math.random() < 0.3 ? `${t} (${new Date().getFullYear()})` : t));
    if (!usesQuestion) ideas = ideas.filter(t => !t.endsWith('?')).concat(ideas.filter(t => t.endsWith('?')));
    return [...new Set(ideas)].slice(0, 8);
  }

  // ---------------- handlers ----------------
  function setApiKey(v) {
    Store.update('titleStrategy', ts => ({ ...ts, apiKey: v }));
  }
  function toggleKeyVisible() {
    const input = document.getElementById('ytApiKeyInput');
    if (input) input.type = input.type === 'password' ? 'text' : 'password';
  }
  function setChannelInput(v) { channelInput = v; }
  function setSubtopic(v) { subtopic = v; }

  async function analyzeViaMcp(mcp) {
    loadingMsg = 'Resolving channel...'; render();
    const channelId = await resolveChannelId(mcp, channelInput);

    loadingMsg = 'Fetching channel info...'; render();
    const about = await nexlevChannelAbout(mcp, { channel_id: channelId }).catch(() => null);

    loadingMsg = 'Fetching uploads (sorted by popularity)...'; render();
    let raw = []; let token; let metaTitle = '';
    for (let page = 0; page < 3 && raw.length < 120; page++) {
      const data = await nexlevChannelVideos(mcp, channelId, 'popular', token);
      if (!metaTitle) metaTitle = data.meta?.title || '';
      raw.push(...(data.data || []));
      token = data.continuation;
      if (!token) break;
    }

    const titles = raw
      .filter(v => v.videoId && v.title)
      .map(v => ({ id: v.videoId, title: v.title, publishedAt: v.publishedAt || v.publishDate, viewCount: Number(v.viewCount) || 0 }));
    const topTitles = titles.slice().sort((a, b) => b.viewCount - a.viewCount).slice(0, Math.max(10, Math.round(titles.length * 0.2)));
    const patterns = extractPatterns(topTitles);
    const channel = {
      id: channelId,
      title: about?.title || metaTitle || channelInput,
      thumbnail: about?.avatar?.[0]?.url || '',
      subscriberCount: about?.subscriberCount || 0,
      videoCount: Number(about?.videosCount) || titles.length,
    };
    current = { id: uid(), channel, titles, topTitles, patterns, createdAt: new Date().toISOString() };
  }

  async function analyzeViaApiKey(apiKey) {
    loadingMsg = 'Finding channel...'; render();
    const parsed = parseChannelInput(channelInput);
    const channel = await fetchChannel(apiKey, parsed);
    loadingMsg = 'Fetching uploads...'; render();
    const ids = await fetchUploadIds(apiKey, channel.uploadsPlaylistId, 100);
    loadingMsg = `Reading stats for ${ids.length} videos...`; render();
    const titles = await fetchVideoStats(apiKey, ids);
    const topTitles = titles.slice().sort((a, b) => b.viewCount - a.viewCount).slice(0, Math.max(10, Math.round(titles.length * 0.2)));
    const patterns = extractPatterns(topTitles);
    current = { id: uid(), channel, titles, topTitles, patterns, createdAt: new Date().toISOString() };
  }

  async function analyze() {
    if (!channelInput.trim()) { errorMsg = 'Paste a channel link or handle'; render(); return; }
    errorMsg = ''; loading = true; ideas = []; loadingMsg = 'Starting...'; render();
    try {
      const mcp = mcpStatus === 'connected' ? await getMcp() : null;
      if (mcp) {
        await analyzeViaMcp(mcp);
      } else {
        const apiKey = Store.get('titleStrategy').apiKey.trim();
        if (!apiKey) throw new Error('Add your YouTube API key first, or connect the NexLev connector in claude.ai');
        await analyzeViaApiKey(apiKey);
      }
    } catch (err) {
      console.error(err);
      if (err.code) errorMsg = mcpErrorMessage(err);
      else if (err.reason === 'quotaExceeded') errorMsg = 'YouTube API quota exceeded for today';
      else if (err.reason === 'keyInvalid' || err.reason === 'badRequest') errorMsg = 'API key looks invalid';
      else errorMsg = err.message || 'Could not analyze this channel';
    } finally {
      loading = false; render();
    }
  }

  async function generate() {
    if (!current) return;
    if (!subtopic.trim()) { toast('Enter a subtopic first'); return; }
    generating = true; ideas = []; render();
    try {
      if (aiAvailable()) {
        const aiIdeas = await generateAITitles(current, subtopic.trim());
        if (aiIdeas && aiIdeas.length) { ideas = aiIdeas; ideasSource = 'ai'; return; }
      }
      ideas = generateRuleTitles(current, subtopic.trim(), current.patterns);
      ideasSource = 'rules';
    } catch (err) {
      console.error(err);
      ideas = generateRuleTitles(current, subtopic.trim(), current.patterns);
      ideasSource = 'rules';
      toast('AI generation failed — used rule-based ideas instead');
    } finally {
      generating = false; render();
    }
  }

  function saveAnalysis() {
    if (!current) return;
    Store.update('titleStrategy', ts => ({ ...ts, analyses: [...ts.analyses, current] }));
    toast('Analysis saved');
    render();
  }

  function viewSaved(id) {
    const a = Store.get('titleStrategy').analyses.find(x => x.id === id);
    if (!a) return;
    current = a; ideas = []; window.scrollTo({ top: 0, behavior: 'smooth' }); render();
  }

  function deleteAnalysis(id) {
    if (!confirmDelete('Delete this saved analysis?')) return;
    Store.update('titleStrategy', ts => ({ ...ts, analyses: ts.analyses.filter(a => a.id !== id) }));
    render();
  }

  return {
    render, setApiKey, toggleKeyVisible, setChannelInput, setSubtopic,
    analyze, generate, saveAnalysis, viewSaved, deleteAnalysis,
  };
})();
