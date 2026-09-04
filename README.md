# Opti Tool — Faceless YouTube Script Optimizer

A static, no-build web app that turns the "YouTube Script Optimizer — Faceless Channels Mastery" guide (`docs/opti-tool-guide.md`) into an interactive toolkit:

- **Dashboard** — quick stats and shortcuts into every stage.
- **Topic Selector** — trending-keyword scoring (0-10), niche saturation rating, and the 15-point Topic Score Card.
- **Video Analyzer** — full competitor video breakdown template (hook, retention pattern, structure, language, B-roll, engagement tactics) plus automatic pattern recognition across everything you've logged.
- **Hook Lab** — Tier 1-3 hook formulas, formula combinations, a best-hooks-by-niche table, and a 3-variation hook tester with a recommended winner.
- **Script Templates** — the four proven structures (Problem-Solution, Story-Lesson, Data-Insight, Top-X Listicle) rendered as timing-blocked timelines, plus optimal length and pacing reference tables.
- **Optimization Checklist** — pre-writing, during-writing, post-writing, and viral-angle checkpoints with live scoring against the guide's bands.
- **Performance Tracker** — pre-production estimator, post-upload 24h/week-1 dashboard, and niche baseline comparison.
- **Weekly Workflow** — the Monday–Friday content pipeline as a checklist, plus advanced techniques and common mistakes reference.
- **Phrase Library** — editable trending-phrase list, seeded from the guide, with one-click copy.

## Running it

No build step — it's plain HTML/CSS/JS. Just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Data

Everything you enter (topics, video breakdowns, hook tests, checklist state, estimates, uploads, baselines, phrases) is saved to your browser's `localStorage` — nothing leaves your machine. Use the **Export** / **Import** buttons in the top bar to back up or move your data between browsers.
