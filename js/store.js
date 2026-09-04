/* Tiny localStorage-backed store */
const STORAGE_KEY = 'optitool.v1';

const DEFAULT_STATE = {
  topics: [],
  videos: [],
  hookTests: [],
  checklists: { preWriting: {}, duringWriting: {}, postWriting: {}, viralAngle: {} },
  estimates: [],
  uploads: [],
  baselines: [],
  weekly: {},
  phrases: [...SEED_PHRASES],
  titleStrategy: { apiKey: '', analyses: [] },
};

const Store = (() => {
  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(DEFAULT_STATE);
      const parsed = JSON.parse(raw);
      return { ...structuredClone(DEFAULT_STATE), ...parsed };
    } catch (e) {
      console.warn('optitool: failed to load state', e);
      return structuredClone(DEFAULT_STATE);
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('optitool: failed to save state', e);
    }
  }

  return {
    get(key) { return state[key]; },
    getAll() { return state; },
    set(key, value) { state[key] = value; save(); },
    update(key, updater) { state[key] = updater(state[key]); save(); },
    replaceAll(newState) { state = { ...structuredClone(DEFAULT_STATE), ...newState }; save(); },
    reset() { state = structuredClone(DEFAULT_STATE); save(); },
  };
})();
