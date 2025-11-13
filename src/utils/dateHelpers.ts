export function parseHHmmToMinutes(hhmm: string): number {
  if (!/^\d{1,2}:\d{2}$/.test(hhmm)) {
    console.warn(`Heure invalide: ${hhmm}`);
    return 0;
  }
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function parseHHmmToDate(
  course: { start: string; end: string },
  dayDateStr: string,
  now: Date
): boolean {
  const [yyyy, mm, dd] = extractYMD(dayDateStr);
  if (!yyyy) return false;

  const startMin = parseHHmmToMinutes(course.start);
  const endMin = parseHHmmToMinutes(course.end);

  const endDate = new Date(yyyy, mm - 1, dd, Math.floor(endMin / 60), endMin % 60);
  return now.getTime() > endDate.getTime();
}

export function getNowTopForDay(dayDateStr: string, now: Date, minutesToTop: (m: number) => number): number | null {
  const [yyyy, mm, dd] = extractYMD(dayDateStr);
  if (!yyyy) return null;

  if (now.getFullYear() !== yyyy || now.getMonth() !== mm - 1 || now.getDate() !== dd) return null;
  const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
  return minutesToTop(minutesSinceMidnight);
}

// Helper interne
function extractYMD(dateStr: string): [number, number, number] {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [d, m, y] = dateStr.split("/").map(Number);
    return [y, m, d];
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return [y, m, d];
  }
  console.warn(`Format de date inconnu : ${dateStr}`);
  return [0, 0, 0];
}
