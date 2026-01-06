import type { CSSProperties } from "react";

/* Day: (day, date, courses sont déjà en anglais) */
export interface Day {
  day: string;
  date: string;
  courses: Course[];
}

/* Course: champs traduits */
export interface Course {
  start: string;          // debut -> start (format "HH:mm")
  end: string;            // fin -> end   (format "HH:mm")
  subject: string;        // matiere -> subject
  room: string;           // salle -> room
  teacher: string;        // prof -> teacher (ou "instructor")
  color: {
    background: string;   // bg -> background
    text: string;         // text -> text
  };
  source?: string; // Ajout de la source
}

/* WeekNavigatorProps: (clés déjà en anglais) */
export interface WeekNavigatorProps {
  currentWeek: number;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  viewMode?: "week" | "day" | "month";
  selectedDate?: Date;
}

/* SubjectFilterProps: distanciel -> remote/online */
export interface SubjectFilterProps {
  subjects: string[];
  selectedSubjects: Set<string>;
  onToggle: (subject: string) => void;
  remoteFilter: boolean;          // filterDistanciel -> remoteFilter (ou "onlineFilter")
  onToggleRemote: () => void;     // onToggleDistanciel -> onToggleRemote
  defaultOpen?: boolean;
}

export interface SourceFilterProps {
  sources: string[];
  selectedSources: Set<string>;
  onToggle: (source: string) => void;
}

/* TimeGridProps: (clés déjà en anglais) */
export type TimeGridProps = {
  schedule: Day[];
  currentDate?: Date;
  onSelectDay?: (day: string | Date) => void;
};

/* DayViewProps: (clés déjà en anglais) */
export interface DayViewProps {
  day: Day | null;
  isToday?: boolean;
  onPreviousDay?: () => void;
  onNextDay?: () => void;
}

/* CourseBlockProps: (clés déjà en anglais) */
export interface CourseBlockProps {
  course: Course;
  viewMode?: "day" | "week" | "month";
  style?: CSSProperties;
}

export interface CourseModalProps {
  course: {
    subject: string;
    start: string;
    end: string;
    room?: string | null;
    teacher?: string | null;
    source?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}