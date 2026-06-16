// Typed, defensive localStorage wrappers. Safari private mode throws on write,
// so every access is guarded and degrades to a no-op rather than crashing.

export function readJSON<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeJSON(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Quota exceeded or private-mode write block — degrade silently.
    return false;
  }
}

export function remove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
