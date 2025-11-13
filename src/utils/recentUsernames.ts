// src/utils/recentUsernames.ts
const STORAGE_KEY = "recentUsernames";
const MAX_ITEMS = 3;

export type RecentUsername = {
  value: string;        // processedUsername: "prenom.nom"
  lastUsedAt: number;   // epoch ms
};

export function getRecentUsernames(): RecentUsername[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) as RecentUsername[] : [];
    // Tri décroissant par dernière utilisation
    return list.sort((a, b) => b.lastUsedAt - a.lastUsedAt);
  } catch {
    return [];
  }
}

export function addRecentUsername(value: string) {
  const now = Date.now();
  const list = getRecentUsernames();

  // Dédoublonnage: retire l’existant
  const filtered = list.filter(u => u.value.toLowerCase() !== value.toLowerCase());

  // Ajoute en tête
  const updated = [{ value, lastUsedAt: now }, ...filtered].slice(0, MAX_ITEMS);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function removeRecentUsername(value: string) {
  const list = getRecentUsernames().filter(u => u.value.toLowerCase() !== value.toLowerCase());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function clearRecentUsernames() {
  localStorage.removeItem(STORAGE_KEY);
}
