const STORAGE_KEY = "process-stack:mvp:v1";

export function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Failed to load saved data:", err);
    return null;
  }
}

export function saveToStorage(value: any) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch (err) {
    console.warn("Failed to save data:", err);
  }
}