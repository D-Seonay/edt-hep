// src/utils/userShortcuts.ts
import defaultShortcuts from '../data/usernameShortcuts.json';

const STORAGE_KEY = 'user-shortcuts';

type Shortcuts = Record<string, string>;

// Function to get all shortcuts from localStorage
export const getShortcuts = (): Shortcuts => {
  try {
    const storedShortcuts = localStorage.getItem(STORAGE_KEY);
    if (storedShortcuts) {
      return JSON.parse(storedShortcuts);
    } else {
      // If no shortcuts are in storage, load from the default JSON and save them.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultShortcuts));
      return defaultShortcuts as Shortcuts;
    }
  } catch (error) {
    console.error("Failed to parse shortcuts from localStorage", error);
    // On failure, return default shortcuts without saving
    return defaultShortcuts as Shortcuts;
  }
};

// Function to save all shortcuts to localStorage
export const saveShortcuts = (shortcuts: Shortcuts) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcuts));
  } catch (error) {
    console.error("Failed to save shortcuts to localStorage", error);
  }
};

// Function to add or update a shortcut
export const addShortcut = (key: string, value: string) => {
  const shortcuts = getShortcuts();
  shortcuts[key.toLowerCase()] = value;
  saveShortcuts(shortcuts);
};

// Function to remove a shortcut
export const removeShortcut = (key: string) => {
  const shortcuts = getShortcuts();
  delete shortcuts[key.toLowerCase()];
  saveShortcuts(shortcuts);
};

// Function to get the processed username, applying any matching shortcut
export const getProcessedUsername = (input: string): string => {
  const shortcuts = getShortcuts();
  const key = input.toLowerCase();
  return shortcuts[key] || input;
};
