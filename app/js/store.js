// store.js — progress persistence for Leonida Platinum.
// Earned trophy ids live in localStorage as a JSON array; spoiler preference
// lives beside it. Export downloads the same data as a file, import reads it
// back (and also accepts the plain array-of-names format older checklists used).

export const PROGRESS_KEY = 'gta6-trophy-progress';
export const SETTINGS_KEY = 'gta6-trophy-settings';

function readEarnedIds() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(list)) return new Set();
    return new Set(list.filter((v) => Number.isInteger(v)));
  } catch {
    return new Set();
  }
}

function readSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}');
    return { spoilers: parsed.spoilers === true };
  } catch {
    return { spoilers: false };
  }
}

export function createStore(trophies) {
  const byId = new Map(trophies.map((t) => [t.id, t]));
  const byName = new Map(trophies.map((t) => [t.name, t]));
  let earned = readEarnedIds();
  let settings = readSettings();
  const listeners = new Set();

  function persist() {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  function emit() {
    for (const fn of listeners) fn();
  }

  return {
    isEarned(id) {
      return earned.has(id);
    },
    toggle(id) {
      if (earned.has(id)) earned.delete(id);
      else earned.add(id);
      persist();
      emit();
    },
    setEarned(id, value) {
      if (value) earned.add(id);
      else earned.delete(id);
      persist();
      emit();
    },
    earnedCount() {
      return earned.size;
    },
    earnedIds() {
      return [...earned];
    },
    countByGrade(grade) {
      return trophies.filter((t) => t.grade === grade && earned.has(t.id)).length;
    },
    totalByGrade(grade) {
      return trophies.filter((t) => t.grade === grade).length;
    },
    spoilersOn() {
      return settings.spoilers;
    },
    setSpoilers(value) {
      settings = { ...settings, spoilers: value === true };
      persist();
      emit();
    },
    exportJson() {
      return JSON.stringify(
        {
          game: 'Grand Theft Auto VI',
          platform: 'PlayStation 5',
          tool: 'Leonida Platinum trophy tracker',
          earned: [...earned].sort((a, b) => a - b),
          earnedNames: [...earned].map((id) => byId.get(id)?.name).filter(Boolean),
        },
        null,
        2,
      );
    },
    importJson(text) {
      const parsed = JSON.parse(text);
      const list = Array.isArray(parsed) ? parsed : parsed.earned;
      if (!Array.isArray(list)) throw new Error('No earned list found in that file.');
      const next = new Set();
      for (const item of list) {
        if (Number.isInteger(item) && byId.has(item)) next.add(item);
        else if (typeof item === 'string' && byName.has(item)) next.add(byName.get(item).id);
      }
      earned = next;
      persist();
      emit();
      return next.size;
    },
    reset() {
      earned = new Set();
      persist();
      emit();
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
