const TrackerTab = (() => {
  let sub = 'estimate';
  let est = freshEstimate();
  let upload = freshUpload();
  let baseline = freshBaseline();

  function freshEstimate() {
    return { topic: '', viability: 10, hook: 7, structure: 7, viralAngle: 4, predictedCtrLow: '', predictedCtrHigh: '', retentionAt50: '', endScreenRetention: '', views24h: '', views7d: '', potential: 'MEDIUM' };
  }
  function freshUpload() {
    return {
      title: '', uploadDate: '', publishTime: '',
      views24h: '', likes24h: '', ctr24h: '', retention50: '', retention25: '', comments24h: '', rpm24h: '',
      viewsWeek1: '', growthWeek1: '', avgViewDuration: '', retentionWeek1: '', likesWeek1: '', likeRatio: '',
      commentsWeek1: '', sentiment: 'Mixed',
      trafficBrowse: '', trafficSearch: '', trafficSuggested: '', trafficOrganic: '', trafficPaid: '', trafficDirect: '',
      dropoffNote: '', spikeNote: '', surpriseNote: '', keep: '', improve: '', test: '',
    };
  }
  function freshBaseline() {
    return { niche: '', videosAnalyzed: '', avgCtr: '', avgRetention: '', avgLength: '', bestVideo: '', bestVideoViews: '', worstVideo: '', worstVideoViews: '', avgRpm: '' };
  }

  function render() {
    const root = document.getElementById('tab-tracker');
    root.innerHTML = `
      <div class="section-head">
        <h2>Performance Metrics & Tracking</h2>
        <p>Estimate a video before you produce it, log real metrics after upload, and compare against your niche baseline.</p>
      </div>
      <div class="tabs-row">
        <button class="${sub==='estimate'?'active':''}" onclick="TrackerTab.setSub('estimate')">Pre-Production Estimate</button>
        <button class="${sub==='upload'?'active':''}" onclick="TrackerTab.setSub('upload')">Post-Upload Dashboard</button>
        <button class="${sub==='baseline'?'active':''}" onclick="TrackerTab.setSub('baseline')">Niche Baseline</button>
      </div>
      ${sub === 'estimate' ? renderEstimate() : sub === 'upload' ? renderUpload() : renderBaseline()}
    `;
  }

  // ---------------- Pre-production estimate ----------------
  function renderEstimate() {
    const total = Number(est.viability) + Number(est.hook) + Number(est.structure) + Number(est.viralAngle);
    const max = 15 + 10 + 10 + 6;
    const confidence = Math.round((total / max) * 100);
    return `
      <div class="grid grid-2" style="align-items:start;">
        <div class="card">
          <div class="card-title">Inputs</div>
          <div class="field"><label>Topic / video</label><input type="text" value="${esc(est.topic)}" oninput="TrackerTab.setEst('topic', this.value)" /></div>
          ${slider('Topic viability score', 'viability', 0, 15, est.viability)}
          ${slider('Hook strength', 'hook', 0, 10, est.hook)}
          ${slider('Structure optimization', 'structure', 0, 10, est.structure)}
          ${slider('Viral angle coverage', 'viralAngle', 0, 6, est.viralAngle)}
          <div class="divider"></div>
          <div class="grid grid-2">
            <div class="field"><label>Predicted CTR low %</label><input type="number" value="${esc(est.predictedCtrLow)}" oninput="TrackerTab.setEst('predictedCtrLow', this.value)" /></div>
            <div class="field"><label>Predicted CTR high %</label><input type="number" value="${esc(est.predictedCtrHigh)}" oninput="TrackerTab.setEst('predictedCtrHigh', this.value)" /></div>
            <div class="field"><label>50% retention at (min)</label><input type="text" value="${esc(est.retentionAt50)}" oninput="TrackerTab.setEst('retentionAt50', this.value)" /></div>
            <div class="field"><label>End screen retention %</label><input type="text" value="${esc(est.endScreenRetention)}" oninput="TrackerTab.setEst('endScreenRetention', this.value)" /></div>
            <div class="field"><label>Views in 24h (est.)</label><input type="text" value="${esc(est.views24h)}" oninput="TrackerTab.setEst('views24h', this.value)" /></div>
            <div class="field"><label>Views in 7d (est.)</label><input type="text" value="${esc(est.views7d)}" oninput="TrackerTab.setEst('views7d', this.value)" /></div>
          </div>
          <div class="field"><label>Long-term potential</label>
            <select onchange="TrackerTab.setEst('potential', this.value)">${['LOW','MEDIUM','HIGH'].map(p=>`<option ${p===est.potential?'selected':''}>${p}</option>`).join('')}</select>
          </div>
          <div style="display:flex;justify-content:flex-end;"><button class="btn btn-primary" onclick="TrackerTab.saveEstimate()">💾 Save Estimate</button></div>
        </div>
        <div class="card" style="text-align:center;">
          <div class="card-title">Confidence Level</div>
          <div style="display:flex;justify-content:center;margin:10px 0;">${scoreRing(confidence, 100, 120)}</div>
          <div class="kv-grid" style="text-align:left;">
            <div class="kv"><div class="k">Total score</div><div class="v">${total}/${max}</div></div>
            <div class="kv"><div class="k">Potential</div><div class="v">${esc(est.potential)}</div></div>
          </div>
        </div>
      </div>
      <div style="margin-top:24px;"><h3 style="font-size:16px;margin-bottom:12px;">Saved Estimates</h3>${renderEstimatesList()}</div>
    `;
  }

  function slider(label, key, min, max, val) {
    return `<div class="field"><label>${label}: ${val}/${max}</label><input type="range" min="${min}" max="${max}" value="${val}" oninput="TrackerTab.setEst('${key}', this.value); TrackerTab.render();" /></div>`;
  }

  function renderEstimatesList() {
    const list = Store.get('estimates');
    if (!list.length) return `<div class="empty-state"><div class="emoji">📈</div>No estimates saved yet.</div>`;
    return list.slice().reverse().map(e => `
      <div class="list-item">
        <div class="list-item-head">
          <div><div class="list-item-title">${esc(e.topic || 'Untitled')}</div>
          <div class="list-item-meta">Saved ${fmtDate(e.createdAt)} · CTR ${esc(e.predictedCtrLow)}-${esc(e.predictedCtrHigh)}% · ${esc(e.potential)} potential</div></div>
          <div class="list-item-actions"><span class="badge badge-accent">${e.confidence}%</span><button class="icon-btn" onclick="TrackerTab.deleteEstimate('${e.id}')">🗑</button></div>
        </div>
      </div>`).join('');
  }

  // ---------------- Post-upload dashboard ----------------
  function renderUpload() {
    return `
      <div class="card">
        <div class="card-title">Log an upload</div>
        <div class="grid grid-3">
          <div class="field"><label>Video title</label><input type="text" value="${esc(upload.title)}" oninput="TrackerTab.setUp('title', this.value)" /></div>
          <div class="field"><label>Upload date</label><input type="date" value="${esc(upload.uploadDate)}" oninput="TrackerTab.setUp('uploadDate', this.value)" /></div>
          <div class="field"><label>Publish time</label><input type="text" value="${esc(upload.publishTime)}" oninput="TrackerTab.setUp('publishTime', this.value)" placeholder="e.g. 3:00 PM EST" /></div>
        </div>
        <div class="divider"></div>
        <div class="card-title" style="font-size:13.5px;">24-Hour Metrics</div>
        <div class="grid grid-4">
          <div class="field"><label>Views</label><input type="text" value="${esc(upload.views24h)}" oninput="TrackerTab.setUp('views24h', this.value)" /></div>
          <div class="field"><label>Likes</label><input type="text" value="${esc(upload.likes24h)}" oninput="TrackerTab.setUp('likes24h', this.value)" /></div>
          <div class="field"><label>CTR %</label><input type="number" value="${esc(upload.ctr24h)}" oninput="TrackerTab.setUp('ctr24h', this.value)" /></div>
          <div class="field"><label>RPM $</label><input type="text" value="${esc(upload.rpm24h)}" oninput="TrackerTab.setUp('rpm24h', this.value)" /></div>
          <div class="field"><label>Retention @50% (min)</label><input type="text" value="${esc(upload.retention50)}" oninput="TrackerTab.setUp('retention50', this.value)" /></div>
          <div class="field"><label>Retention @25% (min)</label><input type="text" value="${esc(upload.retention25)}" oninput="TrackerTab.setUp('retention25', this.value)" /></div>
          <div class="field"><label>Comments</label><input type="text" value="${esc(upload.comments24h)}" oninput="TrackerTab.setUp('comments24h', this.value)" /></div>
        </div>
        <div class="divider"></div>
        <div class="card-title" style="font-size:13.5px;">Week 1 Metrics</div>
        <div class="grid grid-4">
          <div class="field"><label>Views</label><input type="text" value="${esc(upload.viewsWeek1)}" oninput="TrackerTab.setUp('viewsWeek1', this.value)" /></div>
          <div class="field"><label>Growth vs 24h %</label><input type="text" value="${esc(upload.growthWeek1)}" oninput="TrackerTab.setUp('growthWeek1', this.value)" /></div>
          <div class="field"><label>Avg view duration (min)</label><input type="text" value="${esc(upload.avgViewDuration)}" oninput="TrackerTab.setUp('avgViewDuration', this.value)" /></div>
          <div class="field"><label>Retention %</label><input type="text" value="${esc(upload.retentionWeek1)}" oninput="TrackerTab.setUp('retentionWeek1', this.value)" /></div>
          <div class="field"><label>Likes</label><input type="text" value="${esc(upload.likesWeek1)}" oninput="TrackerTab.setUp('likesWeek1', this.value)" /></div>
          <div class="field"><label>Like/view ratio %</label><input type="text" value="${esc(upload.likeRatio)}" oninput="TrackerTab.setUp('likeRatio', this.value)" /></div>
          <div class="field"><label>Comments</label><input type="text" value="${esc(upload.commentsWeek1)}" oninput="TrackerTab.setUp('commentsWeek1', this.value)" /></div>
          <div class="field"><label>Sentiment</label><select onchange="TrackerTab.setUp('sentiment', this.value)">${['Positive','Mixed','Negative'].map(s=>`<option ${s===upload.sentiment?'selected':''}>${s}</option>`).join('')}</select></div>
        </div>
        <div class="field"><label>Traffic source breakdown (%)</label></div>
        <div class="grid grid-4">
          ${['trafficBrowse:Browse','trafficSearch:Search','trafficSuggested:Suggested','trafficOrganic:Organic','trafficPaid:Paid','trafficDirect:Direct'].map(pair => {
            const [k, l] = pair.split(':');
            return `<div class="field"><label>${l}</label><input type="number" value="${esc(upload[k])}" oninput="TrackerTab.setUp('${k}', this.value)" /></div>`;
          }).join('')}
        </div>
        <div class="divider"></div>
        <div class="card-title" style="font-size:13.5px;">Performance Analysis</div>
        <div class="field"><label>What moment caused drop-off, and why?</label><textarea oninput="TrackerTab.setUp('dropoffNote', this.value)">${esc(upload.dropoffNote)}</textarea></div>
        <div class="field"><label>What moment had an engagement spike, and why?</label><textarea oninput="TrackerTab.setUp('spikeNote', this.value)">${esc(upload.spikeNote)}</textarea></div>
        <div class="field"><label>What surprised us?</label><textarea oninput="TrackerTab.setUp('surpriseNote', this.value)">${esc(upload.surpriseNote)}</textarea></div>
        <div class="grid grid-3">
          <div class="field"><label>Keep</label><textarea oninput="TrackerTab.setUp('keep', this.value)">${esc(upload.keep)}</textarea></div>
          <div class="field"><label>Improve</label><textarea oninput="TrackerTab.setUp('improve', this.value)">${esc(upload.improve)}</textarea></div>
          <div class="field"><label>Test next</label><textarea oninput="TrackerTab.setUp('test', this.value)">${esc(upload.test)}</textarea></div>
        </div>
        <div style="display:flex;justify-content:flex-end;"><button class="btn btn-primary" onclick="TrackerTab.saveUpload()">💾 Save Upload Log</button></div>
      </div>
      <div style="margin-top:24px;"><h3 style="font-size:16px;margin-bottom:12px;">Tracked Uploads</h3>${renderUploadsList()}</div>
    `;
  }

  function renderUploadsList() {
    const list = Store.get('uploads');
    if (!list.length) return `<div class="empty-state"><div class="emoji">📊</div>No uploads tracked yet.</div>`;
    return list.slice().reverse().map(u => `
      <div class="list-item">
        <div class="list-item-head">
          <div><div class="list-item-title">${esc(u.title || 'Untitled upload')}</div>
          <div class="list-item-meta">${u.uploadDate ? fmtDate(u.uploadDate) : ''} · ${esc(u.views24h || '—')} views/24h · CTR ${esc(u.ctr24h || '—')}%</div></div>
          <div class="list-item-actions"><button class="icon-btn" onclick="TrackerTab.deleteUpload('${u.id}')">🗑</button></div>
        </div>
      </div>`).join('');
  }

  // ---------------- Niche baseline ----------------
  function renderBaseline() {
    const uploads = Store.get('uploads');
    const yourAvgCtr = avgOf(uploads.map(u => Number(u.ctr24h)));
    const yourAvgRetention = avgOf(uploads.map(u => Number(u.retention50)));
    return `
      <div class="card">
        <div class="card-title">Set your niche baseline</div>
        <div class="card-sub">From analyzing multiple videos in the niche</div>
        <div class="grid grid-3">
          <div class="field"><label>Niche</label><input type="text" value="${esc(baseline.niche)}" oninput="TrackerTab.setBase('niche', this.value)" /></div>
          <div class="field"><label>Videos analyzed</label><input type="number" value="${esc(baseline.videosAnalyzed)}" oninput="TrackerTab.setBase('videosAnalyzed', this.value)" /></div>
          <div class="field"><label>Average CTR %</label><input type="number" value="${esc(baseline.avgCtr)}" oninput="TrackerTab.setBase('avgCtr', this.value)" /></div>
          <div class="field"><label>Average retention @50% (min)</label><input type="text" value="${esc(baseline.avgRetention)}" oninput="TrackerTab.setBase('avgRetention', this.value)" /></div>
          <div class="field"><label>Average video length (min)</label><input type="text" value="${esc(baseline.avgLength)}" oninput="TrackerTab.setBase('avgLength', this.value)" /></div>
          <div class="field"><label>Average RPM $</label><input type="text" value="${esc(baseline.avgRpm)}" oninput="TrackerTab.setBase('avgRpm', this.value)" /></div>
          <div class="field"><label>Best video</label><input type="text" value="${esc(baseline.bestVideo)}" oninput="TrackerTab.setBase('bestVideo', this.value)" /></div>
          <div class="field"><label>Best video views</label><input type="text" value="${esc(baseline.bestVideoViews)}" oninput="TrackerTab.setBase('bestVideoViews', this.value)" /></div>
          <div class="field"><label>Worst video</label><input type="text" value="${esc(baseline.worstVideo)}" oninput="TrackerTab.setBase('worstVideo', this.value)" /></div>
        </div>
        <div style="display:flex;justify-content:flex-end;"><button class="btn btn-primary" onclick="TrackerTab.saveBaseline()">💾 Save Baseline</button></div>
      </div>

      <div class="card" style="margin-top:16px;">
        <div class="card-title">Your performance vs. baseline</div>
        <div class="card-sub">Computed from all tracked uploads above</div>
        <div class="kv-grid">
          <div class="kv"><div class="k">Your avg CTR</div><div class="v">${yourAvgCtr}${yourAvgCtr!=='—'?'%':''}</div></div>
          <div class="kv"><div class="k">Your avg retention@50%</div><div class="v">${yourAvgRetention}${yourAvgRetention!=='—'?' min':''}</div></div>
        </div>
        <div class="hint" style="margin-top:10px;">If CTR is low → improve hook/thumbnail. If retention is low → improve pacing/edit speed. If RPM is low → target higher-value audience keywords.</div>
      </div>

      <div style="margin-top:24px;"><h3 style="font-size:16px;margin-bottom:12px;">Saved Baselines</h3>${renderBaselinesList()}</div>
    `;
  }

  function avgOf(nums) {
    const filtered = nums.filter(n => !isNaN(n) && n !== null);
    if (!filtered.length) return '—';
    return (filtered.reduce((a, b) => a + b, 0) / filtered.length).toFixed(1);
  }

  function renderBaselinesList() {
    const list = Store.get('baselines');
    if (!list.length) return `<div class="empty-state"><div class="emoji">🧭</div>No baselines saved yet.</div>`;
    return list.slice().reverse().map(b => `
      <div class="list-item">
        <div class="list-item-head">
          <div><div class="list-item-title">${esc(b.niche || 'Untitled niche')}</div>
          <div class="list-item-meta">${esc(b.videosAnalyzed || '—')} videos · avg CTR ${esc(b.avgCtr || '—')}% · avg RPM $${esc(b.avgRpm || '—')}</div></div>
          <div class="list-item-actions"><button class="icon-btn" onclick="TrackerTab.deleteBaseline('${b.id}')">🗑</button></div>
        </div>
      </div>`).join('');
  }

  // ---- handlers ----
  function setSub(s) { sub = s; render(); }
  function setEst(k, v) { est[k] = k==='topic'||k==='predictedCtrLow'||k==='predictedCtrHigh'||k==='retentionAt50'||k==='endScreenRetention'||k==='views24h'||k==='views7d'||k==='potential' ? v : Number(v); }
  function setUp(k, v) { upload[k] = v; }
  function setBase(k, v) { baseline[k] = v; }

  function saveEstimate() {
    if (!est.topic.trim()) { toast('Name the topic/video first'); return; }
    const total = Number(est.viability) + Number(est.hook) + Number(est.structure) + Number(est.viralAngle);
    const confidence = Math.round((total / 41) * 100);
    const record = { ...structuredClone(est), id: uid(), confidence, createdAt: new Date().toISOString() };
    Store.update('estimates', arr => [...arr, record]);
    est = freshEstimate(); render(); toast('Estimate saved');
  }
  function deleteEstimate(id) { if (!confirmDelete()) return; Store.update('estimates', arr => arr.filter(e => e.id !== id)); render(); }

  function saveUpload() {
    if (!upload.title.trim()) { toast('Give the video a title first'); return; }
    const record = { ...structuredClone(upload), id: uid(), createdAt: new Date().toISOString() };
    Store.update('uploads', arr => [...arr, record]);
    upload = freshUpload(); render(); toast('Upload logged');
  }
  function deleteUpload(id) { if (!confirmDelete()) return; Store.update('uploads', arr => arr.filter(u => u.id !== id)); render(); }

  function saveBaseline() {
    if (!baseline.niche.trim()) { toast('Name the niche first'); return; }
    const record = { ...structuredClone(baseline), id: uid(), createdAt: new Date().toISOString() };
    Store.update('baselines', arr => [...arr, record]);
    baseline = freshBaseline(); render(); toast('Baseline saved');
  }
  function deleteBaseline(id) { if (!confirmDelete()) return; Store.update('baselines', arr => arr.filter(b => b.id !== id)); render(); }

  return { render, setSub, setEst, setUp, setBase, saveEstimate, deleteEstimate, saveUpload, deleteUpload, saveBaseline, deleteBaseline };
})();
