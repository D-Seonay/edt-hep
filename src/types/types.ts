import { Course } from "./schedule";

export type PositionedCourse = {
  course: Course;
  top: number;
  height: number;
  colIndex: number;
  colCount: number;
};


export type InfoModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  storageKey?: string;
};