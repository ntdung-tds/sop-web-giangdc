export const REMEMBERED_USERNAME_KEY = "sop.rememberedUsername";

export interface UsernameStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function loadRememberedUsername(storage: UsernameStorage): string {
  try {
    return storage.getItem(REMEMBERED_USERNAME_KEY)?.trim() ?? "";
  } catch {
    return "";
  }
}

export function persistRememberedUsername(
  storage: UsernameStorage,
  username: string,
  remember: boolean,
): void {
  try {
    if (!remember) {
      storage.removeItem(REMEMBERED_USERNAME_KEY);
      return;
    }

    const normalized = username.trim();
    if (normalized) storage.setItem(REMEMBERED_USERNAME_KEY, normalized);
    else storage.removeItem(REMEMBERED_USERNAME_KEY);
  } catch {
    // Storage can be unavailable in hardened/private browser contexts.
  }
}
