import { UserRole } from "../types";

export type StoredUser = {
  uid: string;
  email: string | null;
  role: Exclude<UserRole, null>;
  name?: string;
  phone?: string;
};

const CURRENT_USER_STORAGE_KEY = "user";
const USER_PROFILE_PREFIX = "user_profile:";

const parseStoredValue = (raw: string | null): StoredUser | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredUser;
    if (parsed && parsed.role && (parsed.role === "shopkeeper" || parsed.role === "customer")) {
      return parsed;
    }
  } catch (error) {
    console.warn("Failed to parse stored user data", error);
  }
  return null;
};

export const loadStoredUser = (uid?: string | null): StoredUser | null => {
  if (typeof window === "undefined") return null;

  if (uid) {
    const byUid = parseStoredValue(localStorage.getItem(`${USER_PROFILE_PREFIX}${uid}`));
    if (byUid) return byUid;
  }

  return parseStoredValue(localStorage.getItem(CURRENT_USER_STORAGE_KEY));
};

export const persistUserProfile = (data: StoredUser) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${USER_PROFILE_PREFIX}${data.uid}`, JSON.stringify(data));
  localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(data));
};

export const clearStoredUser = (uid?: string | null) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    if (uid) {
      localStorage.removeItem(`${USER_PROFILE_PREFIX}${uid}`);
    }
  } catch (error) {
    console.warn("Failed to clear stored user data", error);
  }
};

export const USER_STORAGE_KEYS = {
  current: CURRENT_USER_STORAGE_KEY,
  profilePrefix: USER_PROFILE_PREFIX,
} as const;

