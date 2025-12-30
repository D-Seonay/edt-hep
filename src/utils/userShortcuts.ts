// src/utils/userShortcuts.ts
import defaultShortcuts from '../data/usernameShortcuts.json';

const CUSTOM_STORAGE_KEY = 'custom-user-shortcuts';

type Shortcuts = Record<string, string>;

// --- Custom Shortcuts Management ---

// Function to get only custom shortcuts from localStorage
export const getCustomShortcuts = (): Shortcuts => {
  try {
    const storedShortcuts = localStorage.getItem(CUSTOM_STORAGE_KEY);
    return storedShortcuts ? JSON.parse(storedShortcuts) : {};
  } catch (error) {
    console.error("Failed to parse custom shortcuts from localStorage", error);
    return {};
  }
};

// Function to save only custom shortcuts to localStorage
export const saveCustomShortcuts = (shortcuts: Shortcuts) => {
  try {
    localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(shortcuts));
  } catch (error) {
    console.error("Failed to save custom shortcuts to localStorage", error);
  }
};

// --- Combined Shortcut Logic ---

// Function to get the processed username, applying any matching shortcut.
// Custom shortcuts have priority over default ones.
export const getProcessedUsername = (input: string): string => {
  const key = input.toLowerCase();
  const customShortcuts = getCustomShortcuts();
  
  // 1. Check custom shortcuts first
  if (customShortcuts[key]) {
    return customShortcuts[key];
  }

  // 2. Fallback to default shortcuts
  const defaultMapping = defaultShortcuts as Shortcuts;
  if (defaultMapping[key]) {
    return defaultMapping[key];
  }

  // 3. Return original input if no shortcut is found
  return input;
};

