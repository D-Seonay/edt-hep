// components/schedule/DayView.tsx
import { useEffect, useState } from "react";
import { Clock, MapPin, User } from "lucide-react";
import type { DayViewProps } from "@/types/schedule";
import { HOURS, HOUR_HEIGHT_PX, DAY_START_MINUTES } from "@/constants/schedule";
import CourseModal from "@/components/schedule/CourseModal";

// Helpers temps
const parseHHmmToMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
};
const minutesToTop = (minutesSinceMidnight: number): number => {
  const deltaMin = minutesSinceMidnight - DAY_START_MINUTES;
  return Math.max(0, (deltaMin / 60) * HOUR_HEIGHT_PX);
};
const durationToHeight = (startMin: number, endMin: number): number => {
  const durMin = Math.max(0, endMin - startMin);
  return (durMin / 60) * HOUR_HEIGHT_PX;
};

// Couleurs stables
function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}
function getCourseColors(subject: string) {
  const hue = hashString(subject) % 360;
  const saturation = 70;
  const lightness = 50;
  const bg = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.18)`;
  const border = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.35)`;
  return { bg, border };
}

const DayView = ({ day, isToday }: DayViewProps) => {
  const [nowMinutes, setNowMinutes] = useState(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

  // New: modal state handled here
  const [selectedCourse, setSelectedCourse] = useState<{
    matiere: string;
    debut: string;
    fin: string;
    salle?: string | null;
    prof?: string | null;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openCourse = (course: typeof selectedCourse) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };
  const closeCourse = () => {
    setIsModalOpen(false);
    // Optional: keep selectedCourse, or clear it
    setSelectedCourse(null);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const d = new Date();
      setNowMinutes(d.getHours() * 60 + d.getMinutes());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!day) {
    return (
      <div className="bg-card rounded-2xl shadow-card border border-border/50 p-8 text-center">
        <p className="text-muted-foreground">Aucun cours pour ce jour</p>
      </div>
    );
  }

  const coursesSorted = [...day.courses].sort(
    (a, b) => parseHHmmToMinutes(a.debut) - parseHHmmToMinutes(b.debut)
  );

  const nowTop = minutesToTop(nowMinutes);

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
      {/* Header */}
      <div className="border-b border-border/50 bg-muted/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{day.day}</h2>
            <p className="text-sm text-muted-foreground mt-1">{day.date}</p>
          </div>
          {isToday && (
            <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
              Aujourd'hui
            </span>
          )}
        </div>
      </div>

      {/* Grille */}
      <div className="grid grid-cols-[100px_1fr] relative">
        {/* Heures */}
        <div className="border-r border-border/50">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="h-[45px] px-4 py-1.5 text-sm text-muted-foreground border-b border-border/20 flex items-start"
            >
              {hour}
            </div>
          ))}
        </div>

        {/* Colonne des cours */}
        <div className="relative">
          {HOURS.map((hour) => (
            <div key={hour} className="h-[45px] border-b border-border/20" />
          ))}

          {/* Ligne maintenant */}
          {isToday && nowTop >= 0 && (
            <div
              className="absolute left-0 right-0 z-20 pointer-events-none"
              style={{ top: `${nowTop}px` }}
            >
              <div className="h-px bg-red-500 dark:bg-red-400 w-full" />
              <div className="mt-[-4px] ml-1 px-1.5 py-0.5 text-[10px] rounded bg-red-500/20 text-red-600 dark:text-red-300 inline-block">
                {String(Math.floor(nowMinutes / 60)).padStart(2, "0")}:
                {String(nowMinutes % 60).padStart(2, "0")}
              </div>
            </div>
          )}

          {/* Cours */}
          {coursesSorted.map((course, idx) => {
            const startMin = parseHHmmToMinutes(course.debut);
            const endMin = parseHHmmToMinutes(course.fin);
            const top = Math.round(minutesToTop(startMin));
            const height = Math.max(Math.round(durationToHeight(startMin, endMin)), 36);
            const { bg, border } = getCourseColors(course.matiere);

            let stateClass = "";
            if (isToday) {
              if (endMin <= nowMinutes) {
                stateClass = "opacity-55 saturate-75";
              } else if (startMin <= nowMinutes && nowMinutes < endMin) {
                stateClass = "ring-2 ring-primary/40";
              }
            }

            return (
              <div
                key={idx}
                className={`absolute left-2 right-2 rounded-xl backdrop-blur-md shadow-sm overflow-hidden transition-all cursor-pointer ${stateClass}`}
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                  background: bg,
                  border: `1px solid ${border}`,
                }}
                onClick={() => openCourse(course)}
              >
                <div className="p-2.5 h-full flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm line-clamp-2 text-foreground">
                      {course.matiere}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground bg-background/40 px-2 py-0.5 rounded-full whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      <span>
                        {course.debut} - {course.fin}
                      </span>
                    </div>
                  </div>

                  <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">
                        {course.salle?.startsWith("SALLE") ? "DISTANCIEL 🏠" : course.salle}
                      </span>
                    </div>
                    {course.prof && course.prof.trim() !== "" && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span className="truncate">{course.prof}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal controlled here */}
      <CourseModal course={selectedCourse} isOpen={isModalOpen} onClose={closeCourse} />
    </div>
  );
};

export default DayView;
