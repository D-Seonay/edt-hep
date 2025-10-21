
export const usernameShortcuts: Record<string, string> = {
  "md": "matheo.delaunay",
  "mathéo.delaunay": "matheo.delaunay",
  "marius.bernard": "marius.bernard1",
};

export const getProcessedUsername = (input: string): string => {
  const key = input.toLowerCase();
  return usernameShortcuts[key] || input;
};
