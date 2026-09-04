/**
 * Safe LocalStorage Utility with automatic error handling,
 * quota detection, and JSON parsing fallbacks.
 */

export function safeLocalStorageGet<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return fallback;
    }
    const item = window.localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`[SafeStorage] Error reading key "${key}":`, error);
    return fallback;
  }
}

export function safeLocalStorageSet<T>(key: string, value: T): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`[SafeStorage] Error writing key "${key}":`, error);
    return false;
  }
}

export function safeLocalStorageRemove(key: string): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`[SafeStorage] Error removing key "${key}":`, error);
    return false;
  }
}
