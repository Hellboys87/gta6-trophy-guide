// main.js — boot and wiring for Leonida Platinum.
// Loads the trophy data (a relative fetch, so the app works fully offline),
// builds the store, and keeps the header counters, filters, tabs and detail
// pane in sync. All rendering lives in views.js; all rules in filters.js.

import { createStore } from './store.js';
import { applyFilters, GRADE_LABELS } from './filters.js';
import { renderChecklist, renderRoadmap, renderMissables, renderDetail } from './views.js';

const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;
const store = createStore(trophies);

const state = {
  view: 'checklist',
  kind: 'all',
  grade: 'all',
  query: '',
  selectedId: null,
};

const els = {
  earnedCount: document.getElementById('earned-count'),
  scoreBar: document.getElementById('score-bar'),
  scoreFill: document.getElementById('score-fill'),
  gradeTally: document.getElementById('grade-tally'),
  search: document.getElementById('search'),
  gradeFilter: document.getElementById('grade-filter'),
  spoilerToggle: document.getElementById('spoiler-toggle'),
  filterNote: document.getElementById('filter-note'),
  missableBadge: document.getElementById('missable-badge'),
  views: {
    checklist: document.getElementById('view-checklist'),
    roadmap: document.getElementById('view-roadmap'),
    missables: document.getElementById('view-missables'),
  },
  detailCard: document.getElementById('detail-card'),
  detailEmpty: document.getElementById('detail-empty'),
};

const handlers = {
  onSelect(id) {
    state.selectedId = id;
    render();
  },
  onToggle(id) {
    store.toggle(id);
  },
};

function selectedTrophy() {
  return trophies.find((t) => t.id === state.selectedId) ?? null;
}

function renderHeader() {
  const count = store.earnedCount();
  els.earnedCount.textContent = String(count);
  els.scoreBar.setAttribute('aria-valuenow', String(count));
  els.scoreFill.style.width = `${(count / trophies.length) * 100}%`;
  els.gradeTally.replaceChildren();
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const li = document.createElement('li');
    const b = document.createElement('b');
    b.textContent = `${store.countByGrade(grade)} / ${store.totalByGrade(grade)}`;
    li.append(b, document.createTextNode(` ${GRADE_LABELS[grade]}`));
    els.gradeTally.append(li);
  }
  const remainingMissables = trophies.filter((t) => t.missable && !store.isEarned(t.id)).length;
  els.missableBadge.textContent = String(remainingMissables);
}

function render() {
  renderHeader();
  els.spoilerToggle.checked = store.spoilersOn();

  for (const [name, node] of Object.entries(els.views)) {
    node.hidden = name !== state.view;
  }
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.classList.toggle('is-active', tab.dataset.view === state.view);
  });

  if (state.view === 'checklist') {
    const visible = applyFilters(trophies, state);
    renderChecklist(els.views.checklist, visible, store, state.selectedId, handlers);
    els.filterNote.textContent =
      visible.length === trophies.length
        ? `Showing all ${trophies.length} trophies.`
        : `Showing ${visible.length} of ${trophies.length} trophies.`;
  } else if (state.view === 'roadmap') {
    renderRoadmap(els.views.roadmap, trophies, store, state.selectedId, handlers);
    els.filterNote.textContent = 'The roadmap always shows every trophy, grouped by stage — filters apply to the Checklist view.';
  } else {
    renderMissables(els.views.missables, trophies, store, state.selectedId, handlers);
    els.filterNote.textContent = 'Only flagged trophies are listed here; the reasoning for each flag is in its guide.';
  }

  renderDetail(els.detailCard, els.detailEmpty, selectedTrophy(), store, handlers.onToggle);
}

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    state.view = tab.dataset.view;
    render();
  });
});

document.querySelectorAll('#kind-chips .chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    state.kind = chip.dataset.kind;
    document.querySelectorAll('#kind-chips .chip').forEach((c) => c.classList.toggle('is-active', c === chip));
    if (state.view !== 'checklist') state.view = 'checklist';
    render();
  });
});

els.search.addEventListener('input', () => {
  state.query = els.search.value.trim();
  if (state.view !== 'checklist') state.view = 'checklist';
  render();
});

els.gradeFilter.addEventListener('change', () => {
  state.grade = els.gradeFilter.value;
  if (state.view !== 'checklist') state.view = 'checklist';
  render();
});

els.spoilerToggle.addEventListener('change', () => {
  store.setSpoilers(els.spoilerToggle.checked);
});

document.getElementById('export-btn').addEventListener('click', () => {
  const blob = new Blob([store.exportJson()], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'leonida-platinum-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
});

document.getElementById('import-input').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const count = store.importJson(await file.text());
    els.filterNote.textContent = `Imported progress: ${count} trophies marked earned.`;
  } catch {
    els.filterNote.textContent = 'That file could not be read as trophy progress — nothing was changed.';
  }
  event.target.value = '';
});

document.getElementById('reset-btn').addEventListener('click', () => {
  store.reset();
  els.filterNote.textContent = 'Progress cleared on this device.';
});

store.subscribe(render);
render();
