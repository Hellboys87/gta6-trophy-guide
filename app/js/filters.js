// filters.js — which trophies a view shows, and how spoiler mode masks them.
// Filtering is pure: state in, list out. The spoiler rule lives here too so the
// checklist, the roadmap and the detail pane can never disagree about what is
// hidden: with spoiler mode on, an unearned story trophy shows a mask instead
// of its real name and description until the player earns it.

export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
  platinum: 'Platinum',
};

export const GRADE_LABELS = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

export function isSpoilerHidden(trophy, store) {
  return store.spoilersOn() && trophy.kind === 'story' && !store.isEarned(trophy.id);
}

export function displayName(trophy, store) {
  return isSpoilerHidden(trophy, store) ? 'Hidden story trophy' : trophy.name;
}

export function displayDescription(trophy, store) {
  return isSpoilerHidden(trophy, store)
    ? 'Spoiler mode is on: this story trophy reveals itself once you earn it in game.'
    : trophy.description;
}

export function matchesFilters(trophy, filterState) {
  const { kind, grade, query } = filterState;
  if (kind === 'missable') {
    if (!trophy.missable) return false;
  } else if (kind !== 'all' && trophy.kind !== kind) {
    return false;
  }
  if (grade !== 'all' && trophy.grade !== grade) return false;
  if (query) {
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide} ${KIND_LABELS[trophy.kind] ?? ''}`.toLowerCase();
    if (!haystack.includes(query.toLowerCase())) return false;
  }
  return true;
}

export function applyFilters(trophies, filterState) {
  return trophies.filter((t) => matchesFilters(t, filterState));
}

export function formatTarget(trophy) {
  if (trophy.target == null) return null;
  return `Target: ${trophy.target.toLocaleString('en-US')}`;
}
