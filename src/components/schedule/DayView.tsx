import { Clock, MapPin, User } from "lucide-react";
import type { DayViewProps } from '@/types/schedule';

const HOURS = [
  "8:00",
  "9:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

const convertHourToNumber = (hourString: string): number => {
  const [hours, minutes] = hourString.split(":").map(Number);
  return hours + minutes / 60;
};

const calculateCourseHeight = (debut: string, fin: string): number => {
  const start = convertHourToNumber(debut);
  const end = convertHourToNumber(fin);
  return (end - start) * 45;
};

const calculateTopOffset = (debut: string): number => {
  const start = convertHourToNumber(debut);
  return (start - 8) * 45;
};

const DayView = ({ day, isToday }: DayViewProps) => {
  if (!day) {
    return (
      <div className="bg-card dark:text-muted-foreground/70 rounded-2xl shadow-card dark:shadow-none border border-border/50   p-8 text-center">
        <p className="text-muted-foreground dark:text-slate-300">
          Aucun cours pour ce jour
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card dark:text-muted-foreground/70 rounded-2xl shadow-card dark:shadow-none border border-border/50  overflow-hidden">
      {/* Header */}
      <div className="border-b border-border/50 bg-muted/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground dark:text-slate-100">
              {day.day}
            </h2>
            <p className="text-sm text-muted-foreground mt-1 dark:text-slate-300">
              {day.date}
            </p>
          </div>
          {isToday && (
            <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
              Aujourd'hui
            </span>
          )}
        </div>
      </div>

      {/* Time grid */}
      <div className="grid grid-cols-[100px_1fr] relative">
        {/* Hour labels */}
        <div className="border-r border-border/50">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="h-[60px] px-4 py-3 text-sm text-muted-foreground border-b border-border/20 flex items-center dark:text-slate-300"
            >
              {hour}
            </div>
          ))}
        </div>

        {/* Courses */}
        <div className="relative">
          {/* Hour lines */}
          {HOURS.map((hour) => (
            <div key={hour} className="h-[60px] border-b border-border/20  " />
          ))}

          {/* Courses positioned absolutely */}
          {day.courses.map((course, idx) => {
            const height = calculateCourseHeight(course.debut, course.fin);
            const top = calculateTopOffset(course.debut);

            return (
              <div
                key={idx}
                className="absolute left-2 right-2 rounded-xl p-4 shadow-card border border-white/20 dark:border-slate-800 dark:shadow-none overflow-hidden hover:shadow-elevated dark:hover:shadow-elevated transition-all cursor-pointer"
                style={{
                  top: `${(top * 60) / 45}px`,
                  height: `${(height * 60) / 45 - 8}px`,
                  backgroundColor: course.color.bg,
                  color: course.color.text,
                }}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-base line-clamp-1 dark:text-black">
                      {course.matiere}
                    </h3>
                    <div className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full whitespace-nowrap dark:bg-white/30 dark:text-black">
                      <Clock className="w-3 h-3" />
                      <span>
                        {course.debut} - {course.fin}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 dark:text-black">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        {course.salle.startsWith("SALLE")
                          ? "DISTANCIEL"
                          : course.salle}
                      </span>
                    </div>
                    {course.prof && course.prof.trim() !== "" && (
                      <div className="flex items-center gap-2 mb-2 text-foreground/80 dark:text-black">
                        <User className="w-4 h-4" />
                        <span>{course.prof}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DayView;
