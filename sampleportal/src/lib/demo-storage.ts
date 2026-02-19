export function cloneSeed<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function loadDemoState<T>(key: string, fallback: T): T {
  const raw = window.localStorage.getItem(key);
  if (!raw) return cloneSeed(fallback);

  try {
    return JSON.parse(raw) as T;
  } catch {
    return cloneSeed(fallback);
  }
}

export function saveDemoState<T>(key: string, value: T): void {
  window.localStorage.setItem(key, JSON.stringify(value));
}
