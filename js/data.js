/* Static reference data extracted from the Opti Tool guide (docs/opti-tool-guide.md) */

const HOOK_TIERS = [
  {
    tier: 'Tier 1 — Highest Viral Potential', usage: 'Use ~70% of the time', color: 'var(--accent)',
    hooks: [
      { name: 'Controversial Question', score: 8.5, examples: ['What if everything you learned about ___ is wrong?', 'Do you really need ___ to succeed?'] },
      { name: 'Shocking Data / Number', score: 8, examples: ['Americans waste $2 trillion on this every year...', 'One simple change increased my income by 300%...'] },
      { name: 'Pain Point Mirror', score: 8, examples: ["You're probably ___ right now without realizing it...", "The reason you're struggling with ___ is..."] },
      { name: 'Curiosity Gap', score: 8, examples: ["There's a weird trick that ___ doesn't want you to know...", 'This one habit separates the top 1% from everyone else...'] },
    ]
  },
  {
    tier: 'Tier 2 — Strong Performance', usage: 'Use ~25% of the time', color: 'var(--info)',
    hooks: [
      { name: 'Personal Story Opener', score: 7, examples: ["Last year, I was broke and depressed. Here's what changed..."] },
      { name: 'Contrarian Statement', score: 7, examples: ['Nobody talks about this, but ___...', 'The common advice about ___ is completely wrong...'] },
      { name: 'Bold Promise', score: 6.5, examples: ["I'm going to show you the exact system that made me ___..."] },
    ]
  },
  {
    tier: 'Tier 3 — Moderate Performance', usage: 'Use ~5% of the time', color: 'var(--text-faint)',
    hooks: [
      { name: 'Simple Direct Statement', score: 5, examples: ["Here's what you need to know about ___..."] },
    ]
  }
];

const HOOK_COMBOS = [
  { name: 'Question + Data', example: "Do you know how much money you're leaving on the table?\nIt's $2,847 per year on average. Here's how to claim it..." },
  { name: 'Story + Contrarian', example: "Everyone told me I couldn't do it.\n5 years later, I'm making 7 figures doing exactly that..." },
  { name: 'Pain + Solution Teaser', example: "You're probably tired of _____.\nWell, what if I told you there's a 3-step system that fixes it?" },
  { name: 'Data + Personal', example: "Studies show 87% of people _____.\nBut I discovered a method that puts you in the top 13%..." },
  { name: 'Curiosity + Urgency', example: 'This strategy is about to go viral.\nAnd here\'s exactly why it works before everyone starts using it...' },
];

const NICHE_HOOK_GUIDE = [
  { niche: 'Education', best: 'Data-insight, curiosity gap, contrarian', avoid: 'Pure story (too slow)', example: "Schools won't teach you this..." },
  { niche: 'Motivation', best: 'Personal story, pain point mirror, bold promise', avoid: 'Data-heavy (too clinical)', example: 'I was $50K in debt and depressed. Here\'s how I escaped...' },
  { niche: 'Finance', best: 'Shocking data, problem-solution, contrarian', avoid: 'Slow build-ups', example: "Banks don't want you to know about this account..." },
  { niche: 'Self-Improvement', best: 'Problem-solution, story-lesson, curiosity gap', avoid: 'Overly technical', example: 'This one daily habit changed my entire life...' },
  { niche: 'Technology', best: 'Data-insight, controversial question, contrarian', avoid: 'Too emotional', example: 'Apple just made a massive mistake with this...' },
];

const SCRIPT_TEMPLATES = [
  {
    id: 'problem-solution', name: 'Problem-Solution', badge: 'Most Viral',
    idealFor: 'Self-improvement, education, psychology niches', perf: '2-5x better CTR than generic content',
    length: '10-13 minutes', pacing: 'Medium-fast (cut every 10-15s)',
    blocks: [
      { label: 'Hook', range: '0-3s', pct: 4, color: '#ff3d63', detail: 'Shocking statement or question — "Most people waste 10 hours a week doing this..."' },
      { label: 'Pattern Interrupt', range: '3-8s', pct: 6, color: '#ff6b3d', detail: "\"But I'm about to show you the exact system that changed everything\"" },
      { label: 'Problem Deep Dive', range: '8-45s', pct: 22, color: '#ff8a3d', detail: 'Describe the problem relatably, show why people struggle, add social proof, create urgency/curiosity.' },
      { label: 'Solution Explanation', range: '45-120s', pct: 45, color: '#f5c04a', detail: 'Step 1 → Step 2 → Step 3, each revealing more; back it up with a real example or data.' },
      { label: 'Closing Framework', range: '120-end', pct: 23, color: '#35d08b', detail: 'Reinforce benefit, add bonus tip (retention boost), clear CTA.' },
    ]
  },
  {
    id: 'story-lesson', name: 'Story-Lesson', badge: 'High Retention',
    idealFor: 'Motivation, life lessons, personal development', perf: '3-6x longer average view duration',
    length: '12-15 minutes', pacing: 'Slow-medium (let emotions settle) · conversational, intimate, authentic tone',
    blocks: [
      { label: 'Attention Hook', range: '0-3s', pct: 3, color: '#ff3d63', detail: '"5 years ago, I made a decision that changed my life..."' },
      { label: 'Context Setting', range: '3-15s', pct: 10, color: '#ff6b3d', detail: 'Who you were, the situation, the challenge, the stakes.' },
      { label: 'Turning Point', range: '15-60s', pct: 30, color: '#ff8a3d', detail: 'The moment of realization, the unexpected plot twist, emotional connection.' },
      { label: 'Lesson Unfolds', range: '60-120s', pct: 32, color: '#f5c04a', detail: 'Lesson 1 → Lesson 2 → Lesson 3, each made actionable.' },
      { label: 'Application to Viewer', range: '120-end', pct: 25, color: '#35d08b', detail: '"Here\'s how YOU can apply this..." + bonus insight + urgent CTA.' },
    ]
  },
  {
    id: 'data-insight', name: 'Data-Insight', badge: 'Algorithm Favorite',
    idealFor: 'Finance, business, technology', perf: 'Higher RPM + better monetization',
    length: '11-14 minutes', pacing: 'Fast (maintains engagement through data) · heavy text overlays',
    blocks: [
      { label: 'Data Hook', range: '0-2s', pct: 2, color: '#ff3d63', detail: '"Apple just released data showing ___% increase in..."' },
      { label: 'Why It Matters', range: '2-8s', pct: 8, color: '#ff6b3d', detail: '"Here\'s what this means for your business..."' },
      { label: 'Context & Background', range: '8-25s', pct: 20, color: '#ff8a3d', detail: 'Previous data point, why the shift happened, market implications.' },
      { label: 'Deep Analysis', range: '25-120s', pct: 50, color: '#f5c04a', detail: 'Breaking down each statistic, real-world implications, competitor perspective, future predictions.' },
      { label: 'Action Steps', range: '120-end', pct: 20, color: '#35d08b', detail: '3-5 concrete things to do, resources/links, urgency angle.' },
    ]
  },
  {
    id: 'top-x', name: 'Top-X Listicle', badge: 'Easiest to Produce',
    idealFor: 'Tips, tools, hacks, reviews', perf: 'Consistent 50K-500K views',
    length: '9-12 minutes', pacing: 'Fast, rhythmic cuts · B-roll + text + quick transitions',
    blocks: [
      { label: 'Hook', range: '0-3s', pct: 3, color: '#ff3d63', detail: '"Here are the 5 tools that saved me 10 hours per week..."' },
      { label: 'Pattern Interrupt', range: '3-8s', pct: 6, color: '#ff6b3d', detail: '"(And 3 of them are completely free)"' },
      { label: 'Intro Setup', range: '8-15s', pct: 8, color: '#ff8a3d', detail: 'Brief context, why these specific ones, what to expect.' },
      { label: 'List Items', range: '15-120s', pct: 60, color: '#f5c04a', detail: 'Repeat per item: name, why it\'s good, use case, price/availability, unique benefit.' },
      { label: 'Closing', range: '120-end', pct: 23, color: '#35d08b', detail: 'Best overall pick, best budget option, bonus recommendation, CTA with link.' },
    ]
  },
];

const PRE_WRITING_CHECKS = [
  'Is the topic trending? (checked last 7 days data)',
  'Analyzed at least 10 top videos in this niche?',
  'Identified unique angle not saturated?',
  'Selected strongest hook formula?',
  'Planned video length (optimal range)?',
  'Decided primary story structure?',
  'Identified 5+ trending phrases to include?',
  'Listed B-roll strategy (screen / stock / animation)?',
  'Planned CTA position (target %)?',
  'Set retention targets for each checkpoint?',
];

const DURING_WRITING_CHECKS = [
  'Is language conversational (not robotic)?',
  'Are sentences short (8-12 words average)?',
  'Is there story/evidence/data every 30 seconds?',
  'Am I using trending phrases naturally?',
  'Is pacing speed appropriate for content type?',
  'Any unnecessary filler words removed?',
  'Is value being delivered continuously?',
  'Would the audience want to share this moment?',
  'Engagement spike every 30-45s (revelation / turn / data / humor / powerful statement)?',
];

const POST_WRITING_CHECKS = [
  { group: 'Readability', items: ['Flows naturally when spoken?', 'No awkward pauses?', 'Rhythm matches pacing style?', 'Tone consistent throughout?', 'Language grade level 6-8 (easy to understand)?'] },
  { group: 'Engagement', items: ['Hooks tested (strongest variation chosen)?', 'Hook duration perfect (not rushed)?', 'First 15 seconds command attention?', 'Every section has a micro-retention element?', 'CTA is compelling and clear?'] },
  { group: 'Value Delivery', items: ['Single core message is clear?', 'Supporting evidence is strong?', 'Actionable steps provided?', 'Conclusion reinforces opening hook?', 'Bonus element adds surprise value?'] },
  { group: 'Viral Potential', items: ['Emotional journey obvious?', 'Shareable moment identified?', 'Benefit to viewer crystal clear?', 'Stands out from similar content?', 'Would friends send this to each other?'] },
];

const VIRAL_ANGLE_CHECKS = [
  { group: 'Emotional Angle', items: ['Triggers ONE dominant emotion (fear, inspiration, curiosity)', 'Builds emotional journey throughout', 'Payoff feels earned'] },
  { group: 'Educational Angle', items: ['Teaches something new/useful', 'Actionable (not just information)', 'Clear takeaway audience remembers'] },
  { group: 'Entertainment Angle', items: ['Has moments of humor or surprise', 'Not boring or monotone', 'Variety in pacing and content'] },
  { group: 'Relatable Angle', items: ['Audience sees themselves in the content', 'Problems/solutions match audience pain points', 'Authentic voice (not corporate)'] },
  { group: 'Shareability Angle', items: ['Contains a surprising moment', 'Has a strong closing quote', 'Social currency (makes sharer look good)'] },
  { group: 'Monetization Angle (RPM)', items: ['Attracts higher-value audience?', 'Content matches advertiser-friendly criteria?', 'Audience likely to click links/take action?', 'Retention high enough for YouTube to push?'] },
];

const WEEKLY_WORKFLOW = [
  { day: 'Monday', tasks: [
    'Research 3 trending topics (30m) — Google Trends, YouTube, Reddit',
    'Score each topic with the Topic Score Card',
    'Select #1 topic and analyze top 10 videos (60m)',
    'Fill Competitor Video Breakdown for each, extract winning patterns',
    'Identify unique angle (30m) — how is your version different?',
  ]},
  { day: 'Tuesday', tasks: [
    'Write script outline (30m) — select structure template, plan hook, list main points',
    'Full script writing (90m) — follow template, include trending phrases, check engagement every 100 words',
    'Script optimization (30m) — read aloud, run optimization checklist, final tweaks',
  ]},
  { day: 'Wednesday – Thursday', tasks: [
    'Video production (editing, B-roll, effects)',
    'Use identified B-roll strategy, time cuts to script',
    'Add text overlays for emphasis',
  ]},
  { day: 'Friday', tasks: [
    'Upload + optimize metadata — title variations, keyword description, tags, thumbnail A/B',
    'Monitor first 24 hours',
  ]},
  { day: 'Ongoing', tasks: [
    'Track metrics daily for the first 7 days',
    'Analyze what worked / what didn\'t',
    'Document learnings and apply to the next video',
  ]},
];

const ADVANCED_TECHNIQUES = [
  { title: '3-Video Series Strategy', body: 'Video 1 — Problem Identification → Video 2 — Solution Detailed → Video 3 — Advanced/Bonus. Each CTA references the next part. Cross-promotion = 30-60% view increase across the series.' },
  { title: 'The Retention Hack Formula', body: 'Drop a micro-hook every 45-60s right before a likely exit point: "This next part is where it gets crazy...", "What I\'m about to tell you will shock you...", "Here\'s the part everyone misses...". Reduces drop-off by 15-25% at each point.' },
  { title: 'The Comment Hack', body: 'Rewrite flat statements as questions that force engagement. "There are three main strategies" → "Which one do you think works best? Let me show you...". Increases comments 40-80%, boosting algorithmic visibility.' },
  { title: 'Thumbnail-Script Alignment', body: 'The script must make the thumbnail\'s promise come true. If the thumbnail says "$10K/Week from home", the hook and body must actually deliver that with specifics — no false promise, higher retention + more subscriptions.' },
  { title: 'The Seasonal Pivot', body: 'Every 30 days, re-check: trending topics shifting? hook styles evolving? optimal length changing? audience preferences shifting? new competitor strategies? Adjust templates, test new hooks, update the phrase library.' },
];

const COMMON_MISTAKES = [
  { mistake: 'Generic hook ("Today I want to talk about...")', fix: 'Start with an emotional trigger instead.' },
  { mistake: 'Slow first 15 seconds', fix: 'Hook in the first 3 seconds — 40% of viewers leave otherwise.' },
  { mistake: 'No clear value proposition', fix: 'Crystal clear benefit by the 10-second mark.' },
  { mistake: 'Filler words and silence', fix: 'Every second should deliver information or emotion.' },
  { mistake: 'Not analyzing top videos first', fix: 'Always research before writing — you\'ll miss winning formulas otherwise.' },
  { mistake: 'Ignoring trending phrases', fix: 'Study what\'s being said and make it natural — stale language signals outdated content to the algorithm.' },
  { mistake: 'CTA at the end only', fix: 'Multiple CTAs throughout, placed at engagement peaks.' },
  { mistake: 'No story or evidence', fix: 'Always back claims up with a story, data, or a real example.' },
];

const OPTIMAL_LENGTHS = [
  { format: 'Problem-Solution', length: '10-13 minutes', stars: 3 },
  { format: 'Story-Lesson', length: '12-16 minutes', stars: 4 },
  { format: 'Data-Insight', length: '11-14 minutes', stars: 3 },
  { format: 'Top-X Listicle', length: '9-12 minutes', stars: 2 },
  { format: 'Tutorials', length: '8-11 minutes', stars: 2 },
  { format: 'Short-Form (Shorts)', length: '15-45 seconds', stars: 4 },
];

const PACING_GUIDE = [
  { pace: 'Slow (15-20s cuts)', use: 'Story-heavy, emotional, philosophical content' },
  { pace: 'Medium (10-15s cuts)', use: 'Educational content, mixed story + data, most faceless content' },
  { pace: 'Fast (5-10s cuts)', use: 'List-based content, trending topics, listicle/top-X content' },
];

const SEED_PHRASES = [
  'This changed my entire perspective on ___',
  "Most people don't realize ___",
  "Here's the real truth about ___",
  "The algorithm doesn't want you to know ___",
  "I've never seen ___",
  'This sounds crazy but ___',
  'Not many people are talking about this...',
  'The data shows ___',
  'Everyone believes ___, but actually ___',
  'This is why ___ (and it shocked me)',
];

/* Common high-CTR "power words" used to fingerprint a channel's title style */
const TITLE_POWER_WORDS = [
  'secret', 'secrets', 'truth', 'never', 'always', 'best', 'worst', 'stop', 'mistake', 'mistakes',
  'shocking', 'insane', 'crazy', 'proven', 'ultimate', 'easy', 'simple', 'free', 'new', 'exposed',
  'warning', 'nobody', 'everyone', 'finally', 'instantly', 'guaranteed', 'honest', 'real', 'actually',
  'why', 'how', 'what', 'this is', "don't", "you're", 'i tried', 'i made', 'i tested', 'vs',
];

const STOPWORDS = new Set(['a','an','the','and','or','but','of','to','in','on','for','is','are','was','were','with','this','that','it','my','your','you','i','me','be','at','as','by','from','how','why','what']);
