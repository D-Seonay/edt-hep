
import shortcuts from "../data/usernameShortcuts.json";

export const getProcessedUsername = (input: string): string => {
  const key = input.toLowerCase();
  return (shortcuts as Record<string, string>)[key] || input;
};
