import React from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  isSameMonth,
  isToday,
} from "date-fns";
import { fr } from "date-fns/locale";
import { Day, Course } from "@/types/schedule";
import CourseBlock from "./CourseBlock";

interface MonthViewProps {
  schedule: Day[];
  currentDate: Date;
  onSelectDay: (dayName: string) => void;
}

const MonthView: React.FC<MonthViewProps> = ({
  schedule,
  currentDate,
  onSelectDay,
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Adjust for week starting on Monday
  const startingDayOfWeek = (getDay(monthStart) + 6) % 7;
  const daysFromPrevMonth = Array.from({ length: startingDayOfWeek }).map(
    (_, i) => null
  );

  const coursesByDate = React.useMemo(() => {
    const map = new Map<string, Course[]>();
    schedule.forEach((day) => {
      map.set(day.date, day.courses);
    });
    return map;
  }, [schedule]);

  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return (
    <div className="p-4 border rounded-lg bg-card dark:bg-black-800">
      <div className="grid grid-cols-7 gap-1 text-center font-bold text-muted-foreground mb-2">
        {weekDays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {daysFromPrevMonth.map((_, i) => (
          <div key={`empty-${i}`} className="h-28 border rounded bg-background/50 dark:bg-black-900/50"></div>
        ))}
        {daysInMonth.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const courses = coursesByDate.get(dateStr) || [];
          return (
            <div
              key={dateStr}
              className={`h-28 border rounded p-1.5 overflow-y-auto relative bg-background dark:bg-black-900 ${
                isToday(day) ? "border-primary" : ""
              } ${
                !isSameMonth(day, currentDate) ? "text-muted-foreground" : ""
              }`}
              onClick={() => onSelectDay(format(day, "EEEE", { locale: fr }))}
            >
              <span
                className={`text-sm font-semibold ${
                  isToday(day) ? "text-primary" : ""
                }`}
              >
                {format(day, "d")}
              </span>
              <div className="mt-1 space-y-1">
                {courses.map((course, index) => (
                  <CourseBlock key={index} course={course} viewMode="month" />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;
