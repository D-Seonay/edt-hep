// src/constants/schedule.ts

export const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"] as const;

export const HOURS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
] as const;

export const HOUR_HEIGHT_PX = 45;
export const DAY_START_MINUTES = 8 * 60;



// constants/schedule.ts
export const COLORS: { background: string; text: string }[] = [
  { background: "hsl(var(--course-blue))", text: "hsl(var(--foreground))" },
  { background: "hsl(var(--course-purple))", text: "hsl(var(--foreground))" },
  { background: "hsl(var(--course-pink))", text: "hsl(var(--foreground))" },
  { background: "hsl(var(--course-orange))", text: "hsl(var(--foreground))" },
  { background: "hsl(var(--course-cyan))", text: "hsl(var(--foreground))" },
  { background: "hsl(var(--course-yellow))", text: "hsl(var(--foreground))" },
  { background: "hsl(var(--course-green))", text: "hsl(var(--foreground))" },
];