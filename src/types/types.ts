import { Course } from "./schedule";

export type PositionedCourse = {
  course: Course;
  top: number;
  height: number;
  colIndex: number;
  colCount: number;
};
