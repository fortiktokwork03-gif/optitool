const App = (() => {
  const TITLES = {
    dashboard: 'Dashboard', topics: 'Topic Selector', videos: 'Video Analyzer', titlestrategy: 'Title Strategy', hooks: 'Hook Lab',
    templates: 'Script Templates', checklist: 'Optimization Checklist', tracker: 'Performance Tracker',
    workflow: 'Weekly Workflow', phrases: 'Phrase Library',
  };
  const RENDERERS = {
    dashboard: DashboardTab, topics: TopicsTab, videos: VideosTab, titlestrategy: TitleStrategyTab, hooks: HooksTab,
    templates: TemplatesTab, checklist: ChecklistTab, tracker: TrackerTab,
    workflow: WorkflowTab, phrases: PhrasesTab,
  };

  let current = 'dashboard';

  function goTo(tab) {
    if (!RENDERERS[tab]) return;
    current = tab;
    document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `tab-${tab}`));
    document.getElementById('pageTitle').textContent = TITLES[tab];
    RENDERERS[tab].render();
    closeSidebar();
    window.scrollTo(0, 0);
  }

  function refreshCurrent() { RENDERERS[current].render(); }

  function openSidebar() { document.getElementById('sidebar').classList.add('open'); document.getElementById('scrim').classList.add('show'); }
  function closeSidebar() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('scrim').classList.remove('show'); }

  function init() {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => goTo(btn.dataset.tab));
    });
    document.getElementById('hamburger').addEventListener('click', () => {
      const sb = document.getElementById('sidebar');
      sb.classList.contains('open') ? closeSidebar() : openSidebar();
    });
    document.getElementById('scrim').addEventListener('click', closeSidebar);

    document.getElementById('exportBtn').addEventListener('click', () => {
      downloadJSON(Store.getAll(), `opti-tool-backup-${new Date().toISOString().slice(0,10)}.json`);
      toast('Exported');
    });
    document.getElementById('importInput').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          Store.replaceAll(data);
          toast('Data imported');
          refreshCurrent();
        } catch (err) {
          toast('Import failed — invalid file');
        }
        e.target.value = '';
      };
      reader.readAsText(file);
    });

    // render every tab once so first switch is instant / state is initialized
    Object.keys(RENDERERS).forEach(k => RENDERERS[k].render());
    goTo('dashboard');
  }

  document.addEventListener('DOMContentLoaded', init);

  return { goTo, refreshCurrent };
})();
