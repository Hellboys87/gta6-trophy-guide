// views.js — rendering for Leonida Platinum: checklist rows, the four-stage
// roadmap, the missables board and the detail pane. Everything is built with
// DOM calls and textContent, so trophy text is never parsed as markup.

import { KIND_LABELS, GRADE_LABELS, displayName, displayDescription, isSpoilerHidden, formatTarget } from './filters.js';

export const STAGES = [
  {
    n: 1,
    title: 'Play the story — and catch the set pieces',
    blurb:
      'Run the campaign from Gone Fishing to the final mission. Story trophies cannot be missed, but four flagged moments live inside story scenes — the VCIA departure, the Rhino tanks, the showroom escape and a fail-then-retry beat — so keep a manual save before big missions and do not reload away a first failure. Start Bret\u2019s unique-animal hunt the moment it appears, too.',
  },
  {
    n: 2,
    title: 'Cleanup — strands, spots and one-of-everything',
    blurb:
      'With Leonida fully open, clear the stranger strands (Andy, Kenton, Billy, Randy, Tyrone and three more), meditate at every spot, finish three card sets, explore every area and try each activity type once. This stage feeds Strangers & Freaks and most of the 100% checklist.',
  },
  {
    n: 3,
    title: 'The grinds — counts, cash and championships',
    blurb:
      'Now the long counters: 250 stunts, 42 shooting-range golds, 20 race wins, 50 challenges, five bank vaults, one operation per gang, $250,000 laundered and $100,000 spent. Register vehicles and make choices as you go so On the Spot and Actions Speak Louder finish inside this stage instead of after it.',
  },
  {
    n: 4,
    title: 'The platinum finale',
    blurb:
      'Two trophies remain by design: 100% completion, which should be a short sweep of whatever the in-game checklist still shows, and the platinum itself, which unlocks the moment the other 54 are yours. Congratulations in advance — you\u2019re a Leonida Legend.',
  },
];

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

export function buildTrophyRow(trophy, store, selectedId, onSelect, onToggle) {
  const hidden = isSpoilerHidden(trophy, store);
  const earnedNow = store.isEarned(trophy.id);
  const row = el('div', 'trophy-row' + (earnedNow ? ' is-earned' : '') + (trophy.id === selectedId ? ' is-selected' : '') + (hidden ? ' spoiler-hidden' : ''));
  row.setAttribute('role', 'button');
  row.setAttribute('tabindex', '0');

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earnedNow;
  box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  box.addEventListener('click', (event) => event.stopPropagation());
  box.addEventListener('change', () => onToggle(trophy.id));
  row.append(box);

  row.append(el('span', `medal medal-${trophy.grade}`));

  const main = el('div', 'row-main');
  const top = el('div', 'row-top');
  top.append(el('span', 'row-name', displayName(trophy, store)));
  main.append(top);
  main.append(el('p', 'row-desc', displayDescription(trophy, store)));

  const meta = el('div', 'row-meta');
  meta.append(el('span', `tag tag-grade tag-grade-${trophy.grade}`, GRADE_LABELS[trophy.grade]));
  meta.append(el('span', 'tag', KIND_LABELS[trophy.kind] ?? trophy.kind));
  if (trophy.missable) meta.append(el('span', 'tag tag-missable', 'Missable'));
  const target = formatTarget(trophy);
  if (target && !hidden) meta.append(el('span', 'tag tag-target', target));
  if (hidden) meta.append(el('span', 'tag tag-spoiler', 'Spoiler hidden'));
  meta.append(el('span', 'tag', `Stage ${trophy.stage}`));
  main.append(meta);
  row.append(main);

  row.addEventListener('click', () => onSelect(trophy.id));
  row.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(trophy.id);
    }
  });
  return row;
}

export function renderChecklist(container, trophies, store, selectedId, handlers) {
  container.replaceChildren();
  if (trophies.length === 0) {
    const note = el('div', 'empty-note');
    const strong = el('strong', null, 'Nothing matches those filters. ');
    note.append(strong, document.createTextNode('Try a different kind or grade — and note that this list genuinely has no online trophies: every one of the 55 is earned in the single-player game, so the Online filter is here to prove the point, not to hide content.'));
    container.append(note);
    return;
  }
  for (const trophy of trophies) {
    container.append(buildTrophyRow(trophy, store, selectedId, handlers.onSelect, handlers.onToggle));
  }
}

export function renderRoadmap(container, trophies, store, selectedId, handlers) {
  container.replaceChildren();
  const intro = el('p', 'stage-blurb', 'One route through all 55: story first with the missables caught on the way, cleanup second, the long counters third, and the 100% sweep last. Click any trophy to read its guide.');
  container.append(intro);
  for (const stage of STAGES) {
    const block = el('section', 'stage-block');
    const head = el('div', 'stage-head');
    head.append(el('span', 'stage-num', String(stage.n)));
    head.append(el('h2', null, stage.title));
    const inStage = trophies.filter((t) => t.stage === stage.n);
    const done = inStage.filter((t) => store.isEarned(t.id)).length;
    head.append(el('span', 'stage-count', `${done} of ${inStage.length} earned`));
    block.append(head);
    block.append(el('p', 'stage-blurb', stage.blurb));
    for (const trophy of inStage) {
      block.append(buildTrophyRow(trophy, store, selectedId, handlers.onSelect, handlers.onToggle));
    }
    container.append(block);
  }
}

export function renderMissables(container, trophies, store, selectedId, handlers) {
  container.replaceChildren();
  const intro = el('div', 'missable-intro');
  const strong = el('strong', null, 'Five trophies look like one-chance moments. ');
  intro.append(
    strong,
    document.createTextNode(
      'Each flag below is reasoned from the official description — a unique animal, an unscheduled airport departure, tanks that only appear in set pieces, a showroom escape, a fail-then-retry beat — and each guide explains the reasoning and the safe way to play it. GTA VI has only just released, so treat these as insurance: cheap to grab during the story, expensive to discover missing afterwards.',
    ),
  );
  container.append(intro);
  const flagged = trophies.filter((t) => t.missable);
  for (const trophy of flagged) {
    container.append(buildTrophyRow(trophy, store, selectedId, handlers.onSelect, handlers.onToggle));
  }
  const safe = el('p', 'stage-blurb', `The other ${trophies.length - flagged.length} trophies show no one-chance wording in their official descriptions: story chapters, repeatable activities, collectibles and counters can all be finished after the credits.`);
  container.append(safe);
}

export function renderDetail(card, emptyState, trophy, store, onToggle) {
  if (!trophy) {
    card.hidden = true;
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;
  card.hidden = false;
  card.replaceChildren();

  const hidden = isSpoilerHidden(trophy, store);
  card.append(el('h2', null, displayName(trophy, store)));

  const meta = el('div', 'row-meta');
  meta.append(el('span', `tag tag-grade tag-grade-${trophy.grade}`, GRADE_LABELS[trophy.grade]));
  meta.append(el('span', 'tag', KIND_LABELS[trophy.kind] ?? trophy.kind));
  meta.append(el('span', 'tag', `Roadmap stage ${trophy.stage}`));
  const target = formatTarget(trophy);
  if (target) meta.append(el('span', 'tag tag-target', target));
  if (trophy.missable) meta.append(el('span', 'tag tag-missable', 'Missable'));
  card.append(meta);

  card.append(el('p', 'detail-official', hidden ? displayDescription(trophy, store) : `Official description: \u201C${trophy.description}\u201D`));

  if (trophy.missable) {
    const warn = el('p', 'detail-missable');
    const b = el('strong', null, 'Missable — read before you play past it. ');
    warn.append(b, document.createTextNode('This flag comes from the wording of the official description, as explained in the guide below. When in doubt, make a manual save first.'));
    card.append(warn);
  } else {
    card.append(el('p', 'detail-safe', 'Not missable on the evidence of its official description: this can be earned in free roam or cleanup, after the story if you prefer.'));
  }

  card.append(el('h3', null, 'Guide'));
  card.append(el('p', 'detail-guide', hidden ? 'Spoiler mode is hiding this guide too — it names story beats. Earn the trophy in game, or switch spoiler mode off above, to read it.' : trophy.guide));

  card.append(el('h3', null, 'Sources'));
  const list = el('ul', 'detail-sources');
  for (const source of trophy.sources) list.append(el('li', null, source));
  card.append(list);

  const actions = el('div', 'detail-actions');
  const toggleBtn = el('button', store.isEarned(trophy.id) ? 'is-earned' : '', store.isEarned(trophy.id) ? 'Earned ✓ — tap to undo' : 'Mark as earned');
  toggleBtn.type = 'button';
  toggleBtn.addEventListener('click', () => onToggle(trophy.id));
  actions.append(toggleBtn);
  card.append(actions);
}
