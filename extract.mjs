// Builds wishes.json and wishes.csv for the open-data repo wish-tree-app/birthday-wishes from the wish lines in
// the guides on mywishtree.link. Every guide page comes from site/seo/content.mjs, so the lines are read from there.
//
//   node pazarlama/github/birthday-wishes/extract.mjs
//
// What counts as a wish line:
// - every item of a <ul class="wishes"> list (the copy-ready lists on the guides), except the lists in SKIP;
// - the plain lists in QUOTED, where a guide offers a few lines to borrow, each one in quote marks.
// Advice, how-to steps, gift and party ideas, FAQ answers and quoted examples inside explanations stay out.
//
// "occasion" and "for" come from the section a list sits in (TABLE). A bold label on an item can narrow them
// (LABELS), for example "For a sibling:" in a mixed list. A wishes list that isn't in TABLE or SKIP stops the
// script, and so does a row that no longer matches a section, so new or renamed sections get sorted by hand.

import { writeFileSync } from 'node:fs';
import { PAGES, SITE } from '../../../site/seo/content.mjs';

const OUT = new URL('./', import.meta.url);

// Order of the occasions in the output files
const OCCASIONS = ['birthday', 'christmas', 'new-year', 'farewell', 'retirement', 'get-well', 'sympathy', 'wedding', 'baby', 'graduation', 'anniversary', 'new-job', 'first-day-of-college'];

// Page slug -> the occasion of its lines, and for each list: who the lines are for. A list key is the section's
// h2, plus " | " and the label right above the list when one section holds several lists (an h3, or a bold line
// such as "For a partner:"), plus " #2" for a second list under the same heading. A value is the audience, or
// { occasion, for } when a list has its own occasion. for: null means each item's label must name it.
const TABLE = {
  'christmas-wish-tree': { occasion: 'christmas', lists: {
    'Short Christmas card messages to copy | For family and friends': 'family',
    'Short Christmas card messages to copy | For friends': 'friend',
    'Short Christmas card messages to copy | For coworkers': 'coworker',
    'Short Christmas card messages to copy | For grandparents and nursing home residents': 'elderly',
    'Short Christmas card messages to copy | For clients': 'client',
    'Short Christmas card messages to copy | Short and heartwarming': 'anyone',
  } },
  'birthday-wishes': { occasion: 'birthday', lists: {
    'Birthday wishes for a best friend': 'best-friend',
    'Birthday wishes for mom': 'mom',
    'Birthday wishes for dad': 'dad',
    'Birthday wishes for a sister': 'sister',
    'Birthday wishes for a brother': 'brother',
    'Birthday wishes for a daughter': 'daughter',
    'Birthday wishes for a son': 'son',
    'Birthday wishes for a niece or nephew': 'niece-nephew',
    'Birthday wishes for an aunt or uncle': 'aunt-uncle',
    'Birthday wishes for in-laws': 'in-law',
    'Birthday wishes for a coworker': 'coworker',
    'Birthday wishes for your boss': 'boss',
    'Birthday wishes for a partner': 'partner',
    'Birthday wishes for a husband': 'husband',
    'Birthday wishes for a wife': 'wife',
    'Funny birthday wishes': 'anyone',
    'Short birthday wishes': 'anyone',
    'Birthday wishes for a friend far away': 'friend',
    'Milestone birthday wishes': 'anyone',
  } },
  'what-to-write-in-a-birthday-card': { occasion: 'birthday', lists: {
    'Should a birthday card be funny or heartfelt?': 'anyone',
    'What to write in a birthday card for a best friend or partner | For a best friend': 'best-friend',
    'What to write in a birthday card for a best friend or partner | For a partner': 'partner',
    'What to write in a birthday card for family and kids | For family': 'family',
    'What to write in a birthday card for family and kids | For a kid': 'kid',
    'What to write in a birthday card for a coworker or boss | For a coworker': 'coworker',
    'What to write in a birthday card for a coworker or boss | For a boss': 'boss',
    'What to write in a birthday card for someone you don’t know well': 'acquaintance',
    'What do you write in a group birthday card?': 'coworker',
    'How do you write a belated birthday message?': 'anyone',
  } },
  'how-to-make-someone-feel-special-on-their-birthday': { occasion: 'birthday', lists: {
    'How to make someone feel special on their birthday through text': 'anyone',
  } },
  'birthday-memory-book': { occasion: 'birthday', lists: {
    'What do you write in a birthday memory book?': 'anyone',
  } },
  'group-christmas-card': { occasion: 'christmas', lists: {
    'Christmas card messages for coworkers': 'coworker',
    'Christmas card messages for coworkers #2': 'team',
    'What do you write in a Christmas card for a boss or a client?': null,
  } },
  'short-christmas-card-messages': { occasion: 'christmas', lists: {
    'What to write on a friend’s or coworker’s tree': 'anyone',
    'Short Christmas card messages for family and friends': 'family',
    'Merry Christmas messages for coworkers': 'coworker',
    'Christmas card messages for your boss': 'boss',
    'What to write in a Christmas card for clients': 'client',
    'Christmas messages for teachers': 'teacher',
    'Christmas card messages for neighbors': 'neighbor',
    'Christmas messages for nursing home residents and the elderly': 'elderly',
    'Christmas wishes for someone who is grieving': 'grieving',
    'Christmas wishes for someone who is ill': 'ill',
    'Short and sweet Christmas messages': 'anyone',
    'Heartwarming Christmas messages': 'anyone',
  } },
  'christmas-wishes-for-family-far-away': { occasion: 'christmas', lists: {
    'Christmas wishes for parents far away': 'parent',
    'Christmas wishes for grandparents far away': 'grandparent',
    'Christmas wishes for a brother or sister far away': 'sibling',
    'Christmas wishes for in-laws far away': 'in-law',
    'Christmas wishes for kids, nieces and nephews': 'kid',
    'Christmas messages for the family group chat': 'family',
    'Missing family at Christmas: quotes to send as your own': 'family',
    'Short Christmas texts for family far away': 'family',
    'New Year wishes to add to a Christmas message': { occasion: 'new-year', for: 'family' },
  } },
  'long-distance-birthday-wishes': { occasion: 'birthday', lists: {
    'Long-distance birthday wishes for a best friend': 'best-friend',
    'Long-distance birthday messages for a boyfriend or girlfriend': 'partner',
    'Birthday wishes for mom or dad far away': 'parent',
    'Birthday wishes for a brother or sister far away': 'sibling',
    'Birthday wishes for a friend who just moved away': 'friend',
    'Birthday wishes for family abroad or in another time zone': 'family',
    'Happy birthday from afar: short wishes for a text': 'anyone',
    'Funny long-distance birthday wishes': 'anyone',
    'What to say when you can’t make it to the birthday party': 'anyone',
  } },
  'birthday-wishes-for-coworker': { occasion: 'birthday', lists: {
    'Short birthday messages for a colleague': 'coworker',
    'Funny birthday wishes for a coworker': 'coworker',
    'Heartfelt birthday wishes for a work friend': 'coworker',
    'Birthday wishes from a manager to an employee': 'employee',
    'Birthday wishes for your boss': 'boss',
    'Birthday wishes for a remote or new coworker | For a remote coworker': 'coworker',
    'Birthday wishes for a remote or new coworker | For a new coworker': 'coworker',
    'Belated birthday wishes for a coworker': 'coworker',
    'Milestone birthday wishes for a coworker': 'coworker',
  } },
  'virtual-farewell-card': { occasion: 'farewell', lists: {
    'What should you write in a farewell card?': 'coworker',
  } },
  'farewell-messages-for-coworker': { occasion: 'farewell', lists: {
    'Farewell messages for a coworker leaving for a new job': 'coworker',
    'Goodbye messages for a work friend': 'coworker',
    'Farewell messages for a boss who is leaving': 'boss',
    'Farewell messages from a manager to a team member': 'employee',
    'Short farewell messages': 'coworker',
    'Funny farewell messages for coworkers': 'coworker',
    'Farewell messages for a remote coworker': 'coworker',
    'Heartfelt goodbye messages for a coworker': 'coworker',
    'Farewell messages for a coworker who is retiring': { occasion: 'retirement', for: 'coworker' },
  } },
  'farewell-message-for-boss': { occasion: 'farewell', lists: {
    'Farewell messages for a boss leaving for a new job': 'boss',
    'Farewell messages for a boss who was your mentor': 'boss',
    'Farewell messages from the whole team': 'boss',
    'Professional farewell messages for a manager': 'boss',
    'Short farewell messages for a boss': 'boss',
    'Funny farewell messages for a boss': 'boss',
    'Farewell message for an ex boss': 'boss',
    'Farewell messages for a boss who is retiring': { occasion: 'retirement', for: 'boss' },
  } },
  'farewell-message-for-friend-moving-away': { occasion: 'farewell', lists: {
    'Farewell messages for a best friend moving away': 'best-friend',
    'Goodbye messages for a friend moving to another state or country': 'friend',
    'Farewell messages for a neighbor who is moving': 'neighbor',
    'Short goodbye messages for a friend': 'friend',
    'Heartfelt farewell messages for a friend': 'friend',
    'Funny goodbye messages for a friend moving away': 'friend',
    'Goodbye messages from a group of friends': 'friend',
  } },
  'group-retirement-card': { occasion: 'retirement', lists: {
    'What do you write in a retirement card from a team?': 'coworker',
  } },
  'retirement-messages': { occasion: 'retirement', lists: {
    'Retirement messages for coworkers': 'coworker',
    'Retirement messages from the team': 'coworker',
    'Retirement messages for a manager or boss': 'boss',
    'Messages to a retiring employee': 'employee',
    'Retirement wishes after a long career': 'coworker',
    'Short retirement messages': 'coworker',
    'Funny retirement messages': 'coworker',
    'Heartfelt retirement messages': 'coworker',
    'What do you say to your team when you retire?': 'team',
  } },
  'get-well-soon-group-card': { occasion: 'get-well', lists: {
    'What do you write in a get well card from a group?': 'coworker',
    'Get well soon messages for a coworker': 'coworker',
    'Best wishes for someone having surgery': 'anyone',
    'Get well messages for a friend or family member': 'friend',
    'Short get well soon messages': 'anyone',
  } },
  'group-sympathy-card': { occasion: 'sympathy', lists: {
    'What do you write in a sympathy card from a group?': 'anyone',
    'Sympathy messages for a coworker': 'coworker',
    'Sympathy messages that share a memory': 'anyone',
    'When you didn’t know the person who died': 'anyone',
    'Short sympathy messages': 'anyone',
    'Religious sympathy messages': 'anyone',
  } },
  'wishing-tree-wedding-guest-book': { occasion: 'wedding', lists: {
    'What do guests write on a wedding wishing tree?': 'couple',
    'Marriage advice for the wishing tree': 'couple',
    'Funny wedding wishes': 'couple',
    'Wedding wishes from friends and family': 'couple',
    'Short wedding wishes for a tag': 'couple',
  } },
  'virtual-baby-shower-guest-book': { occasion: 'baby', lists: {
    'Baby shower wishes for the baby': 'baby',
    'Advice for the parents-to-be': 'new-parents',
    'Funny baby shower wishes': 'new-parents',
    'New baby messages from coworkers': 'coworker',
    'Short wishes for the guest book': 'new-parents',
  } },
  'graduation-message-board': { occasion: 'graduation', lists: {
    'Graduation messages from parents': 'child',
    'Graduation messages from teachers': 'student',
    'Graduation messages from friends': 'friend',
    'Funny graduation messages': 'anyone',
    'Short graduation messages': 'anyone',
  } },
  // the example letters name their own day in a bold label (see LABELS)
  'open-when-letters': { occasion: null, lists: {
    'What do you write in an open when letter?': 'anyone',
  } },
};

// Wishes lists that hold something other than messages to the person: "slug | list key" -> what they are
const SKIP = {
  'birthday-memory-book | Memory book prompts to send friends and family': 'sentence starters for a memory book',
  'group-christmas-card | What reminder should you paste in Slack, Teams or a group chat?': 'reminders for the people signing',
  'share-your-tree-on-instagram-story | What should your story say?': 'captions for your own tree',
  'open-when-letters | Open when letter ideas for feelings': 'envelope labels',
  'open-when-letters | Open when letters for dates and milestones': 'envelope labels',
  'open-when-letters | Open when letters for a long-distance relationship': 'envelope labels',
  'open-when-letters | Open when letters for a college student': 'envelope labels',
  'open-when-letters | Funny open when letter ideas': 'envelope labels',
};

// Plain lists where a guide offers lines to borrow, each in quote marks after a bold label
const QUOTED = {
  'last-minute-birthday-gift-ideas | What to write with a last-minute gift': { occasion: 'birthday', for: 'anyone' },
  'long-distance-birthday-ideas | What do you write when you can’t be there for a birthday?': { occasion: 'birthday', for: 'anyone' },
  'long-distance-christmas-ideas | What do you write when you can’t be home for Christmas?': { occasion: 'christmas', for: 'family' },
};

// A bold label at the start of an item that names who the line is for, or the day it is for
const LABELS = [
  [/^For a friend$/, { for: 'friend' }],
  [/^(For a|A) sibling$/, { for: 'sibling' }],
  [/^For a coworker$/, { for: 'coworker' }],
  [/^For family$/, { for: 'family' }],
  [/^A parent$/, { for: 'parent' }],
  [/^A grandparent$/, { for: 'grandparent' }],
  [/^An in-law$/, { for: 'in-law' }],
  [/^A neighbor$/, { for: 'neighbor' }],
  [/^Boss, /, { for: 'boss' }],
  [/^Client, /, { for: 'client' }],
  [/^The couple$/, { for: 'partner' }],
  [/^Open on your birthday$/, { occasion: 'birthday' }],
  [/^Open on New Year’s Day$/, { occasion: 'new-year' }],
  [/^Open on our anniversary$/, { occasion: 'anniversary', for: 'partner' }],
  [/^Open on your graduation day$/, { occasion: 'graduation' }],
  [/^Open on the first day of your new job$/, { occasion: 'new-job' }],
  [/^Open on your first day of college$/, { occasion: 'first-day-of-college' }],
];

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: '\'', nbsp: ' ' };
const decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
  if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
  if (e in ENTITIES) return ENTITIES[e];
  throw new Error(`unknown entity ${m}`);
});
const plain = (html) => decode(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

// The lists in one section body, each with its key (see TABLE) and its items' HTML
function listsIn(h2, body) {
  const out = [];
  const seen = {};
  let from = 0;
  for (const m of body.matchAll(/<ul( class="wishes")?>([\s\S]*?)<\/ul>/g)) {
    const between = body.slice(from, m.index);
    from = m.index + m[0].length;
    const labels = [...between.matchAll(/<h3>([\s\S]*?)<\/h3>|<p><strong>([\s\S]*?)<\/strong><\/p>/g)];
    const label = labels.length ? plain(labels.at(-1)[1] ?? labels.at(-1)[2]).replace(/:$/, '') : '';
    let key = label ? `${h2} | ${label}` : h2;
    const n = (seen[(m[1] ? 'w ' : 'p ') + key] = (seen[(m[1] ? 'w ' : 'p ') + key] || 0) + 1); // wishes and plain lists counted apart
    if (n > 1) key += ` #${n}`;
    out.push({ key, wishes: Boolean(m[1]), items: [...m[2].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((x) => x[1]) });
  }
  return out;
}

// One item -> its bold label (if any) and its text
function split(html) {
  const m = html.match(/^\s*<strong>([\s\S]*?)<\/strong>\s*([\s\S]*)$/);
  return m ? { label: plain(m[1]).replace(/[:.]$/, ''), text: plain(m[2]) } : { label: '', text: plain(html) };
}

const rows = [];
const used = new Set();
const skipped = [];
for (const p of PAGES) {
  for (const s of p.sections) {
    for (const list of listsIn(plain(s.h2), s.body || '')) {
      const id = `${p.slug} | ${list.key}`;
      let base;
      if (list.wishes) {
        if (id in SKIP) { used.add(id); skipped.push(`${id} (${list.items.length} ${SKIP[id]})`); continue; }
        const page = TABLE[p.slug];
        if (!page || !(list.key in page.lists)) throw new Error(`Sort this list into TABLE or SKIP: "${id}"`);
        used.add(id);
        const v = page.lists[list.key];
        base = v && typeof v === 'object' ? { occasion: v.occasion, for: v.for } : { occasion: page.occasion, for: v };
      } else if (id in QUOTED) {
        used.add(id);
        base = { ...QUOTED[id] };
      } else continue;
      for (const html of list.items) {
        let { label, text } = split(html);
        if (!list.wishes) {
          const q = text.match(/^“(.+)”$/);
          if (!q) throw new Error(`Expected one quoted line in "${id}": ${text}`);
          text = q[1];
        }
        const row = { ...base };
        for (const [re, set] of LABELS) if (label && re.test(label)) Object.assign(row, set);
        if (!row.occasion || !row.for) throw new Error(`No occasion or audience for a line in "${id}": ${text}`);
        if (!OCCASIONS.includes(row.occasion)) throw new Error(`Unknown occasion ${row.occasion}`);
        if (/[<>]/.test(text) || !text) throw new Error(`Markup left in a line in "${id}": ${text}`);
        rows.push({ text, occasion: row.occasion, for: row.for, length: [...text].length, source: `${SITE.url}/${p.slug}` });
      }
    }
  }
}

// Every row of TABLE, SKIP and QUOTED must still match a list on the site
const expected = [...Object.entries(TABLE).flatMap(([slug, t]) => Object.keys(t.lists).map((k) => `${slug} | ${k}`)), ...Object.keys(SKIP), ...Object.keys(QUOTED)];
const stale = expected.filter((k) => !used.has(k));
if (stale.length) throw new Error(`These rows match no list on the site any more:\n  ${stale.join('\n  ')}`);

// One copy of each line: the same words in a second place (ignoring case, quote style and spacing) are dropped
const norm = (t) => t.normalize('NFC').toLowerCase().replace(/[‘’]/g, '\'').replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();
const seen = new Map();
const dupes = [];
const wishes = [];
for (const r of rows) {
  const k = norm(r.text);
  if (seen.has(k)) { dupes.push(`${r.text}\n    kept from ${seen.get(k).source}, dropped from ${r.source}`); continue; }
  seen.set(k, r);
  wishes.push(r);
}
wishes.sort((a, b) => OCCASIONS.indexOf(a.occasion) - OCCASIONS.indexOf(b.occasion)); // stable: page order within

// Files: pretty JSON (UTF-8, characters as written), and CSV after RFC 4180 (CRLF, quotes only where needed)
writeFileSync(new URL('wishes.json', OUT), JSON.stringify(wishes, null, 2) + '\n');
const COLS = ['text', 'occasion', 'for', 'length', 'source'];
const cell = (v) => { const s = String(v); return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
writeFileSync(new URL('wishes.csv', OUT), [COLS, ...wishes.map((w) => COLS.map((c) => w[c]))].map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n');

// Report
const tally = (key) => Object.entries(wishes.reduce((n, w) => ((n[w[key]] = (n[w[key]] || 0) + 1), n), {}));
const table = (title, entries) => console.log(`\n${title}\n` + entries.map(([k, n]) => `  ${k.padEnd(22)}${String(n).padStart(5)}`).join('\n'));
console.log(`${wishes.length} wishes from ${new Set(wishes.map((w) => w.source)).size} pages -> wishes.json, wishes.csv`);
table('By occasion', tally('occasion').sort((a, b) => OCCASIONS.indexOf(a[0]) - OCCASIONS.indexOf(b[0])));
table('By audience ("for")', tally('for').sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));
console.log(`\nSkipped lists (not messages to the person):\n  ${skipped.join('\n  ')}`);
console.log(dupes.length ? `\nDuplicates dropped (${dupes.length}):\n  ${dupes.join('\n  ')}` : '\nNo duplicate lines.');
