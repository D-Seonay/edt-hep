import type { Day, Course } from "@/services/scheduleService";
import type { CSSProperties } from "react";

export interface WeekNavigatorProps {
  currentWeek: number; // Semaine affichée actuellement (0 = cette semaine)
  onPrevious: () => void; // Callback pour passer à la semaine précédente
  onNext: () => void; // Callback pour passer à la semaine suivante
  onToday: () => void; // Callback pour revenir à la semaine actuelle
}

export interface SubjectFilterProps {
  subjects: string[];
  selectedSubjects: Set<string>;
  onToggle: (subject: string) => void;
  filterDistanciel: boolean;
  onToggleDistanciel: () => void;
  defaultOpen?: boolean;
}

export interface TimeGridProps {
  schedule: Day[];
  currentDate?: Date;
}

export interface DayViewProps {
  day: Day | null;
  isToday?: boolean;
}

export interface CourseBlockProps {
  course: Course;
  viewMode?: "day" | "week" | "month";
  style?: CSSProperties;
}
