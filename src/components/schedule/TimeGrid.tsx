import CourseBlock from "./CourseBlock";
import type { TimeGridProps } from "@/types/schedule";

// Heures affichées
const HOURS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
];

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

// Echelle verticale: 1h = 45px (aligné avec ton code)
const HOUR_HEIGHT_PX = 45;
const DAY_START_MINUTES = 8 * 60; // 08:00
const GRID_PADDING_X = 4; // marge horizontale interne par bloc

type PositionedCourse = {
  course: any;
  top: number;
  height: number;
  colIndex: number;
  colCount: number;
};

function parseHHmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

function minutesToTop(minutesSinceMidnight: number): number {
  const deltaMin = minutesSinceMidnight - DAY_START_MINUTES;
  return Math.max(0, (deltaMin / 60) * HOUR_HEIGHT_PX);
}

function durationToHeight(startMin: number, endMin: number): number {
  const durMin = Math.max(0, endMin - startMin);
  return (durMin / 60) * HOUR_HEIGHT_PX;
}

function isOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

// Détection de colonnes pour éviter les chevauchements horizontaux
function assignColumns(courses: any[]): PositionedCourse[] {
  const items = courses.map((c) => {
    const startMin = parseHHmmToMinutes(c.debut);
    const endMin = parseHHmmToMinutes(c.fin);
    return {
      course: c,
      startMin,
      endMin,
      top: minutesToTop(startMin),
      height: Math.max(durationToHeight(startMin, endMin), 36), // min-height
    };
  });

  items.sort((a, b) => {
    if (a.startMin !== b.startMin) return a.startMin - b.startMin;
    return a.endMin - b.endMin;
  });

  const activeCols: { endMin: number }[] = [];
  const result: PositionedCourse[] = [];

  for (const item of items) {
    let placed = false;
    for (let col = 0; col < activeCols.length; col++) {
      if (item.startMin >= activeCols[col].endMin) {
        activeCols[col].endMin = item.endMin;
        result.push({
          course: item.course,
          top: Math.round(item.top),
          height: Math.round(item.height),
          colIndex: col,
          colCount: 0,
        });
        placed = true;
        break;
      }
    }
    if (!placed) {
      activeCols.push({ endMin: item.endMin });
      result.push({
        course: item.course,
        top: Math.round(item.top),
        height: Math.round(item.height),
        colIndex: activeCols.length - 1,
        colCount: 0,
      });
    }
  }

  // Calcul du nombre de colonnes simultanées maximal pour chaque bloc
  for (let i = 0; i < result.length; i++) {
    const aStart = parseHHmmToMinutes(result[i].course.debut);
    const aEnd = parseHHmmToMinutes(result[i].course.fin);
    let maxCol = result[i].colIndex;

    for (let j = 0; j < result.length; j++) {
      if (i === j) continue;
      const bStart = parseHHmmToMinutes(result[j].course.debut);
      const bEnd = parseHHmmToMinutes(result[j].course.fin);
      if (isOverlap(aStart, aEnd, bStart, bEnd)) {
        maxCol = Math.max(maxCol, result[j].colIndex);
      }
    }
    result[i].colCount = maxCol + 1;
  }

  return result;
}

const TimeGrid = ({ schedule, currentDate = new Date() }: TimeGridProps) => {
  const isToday = (dateStr: string): boolean => {
    const today = currentDate.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return dateStr === today;
  };

  const hasAnyCourse = schedule.some(
    (day) => Array.isArray(day.courses) && day.courses.length > 0
  );

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
      {!hasAnyCourse ? (
        <div className="p-8 text-center text-sm text-muted-foreground">
          Semaine en entreprise / pas de cours cette semaine / vérifier vos filtres
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="hidden md:block">
            <div className="grid grid-cols-[80px_repeat(5,1fr)] border-b border-border/50 bg-muted/30">
              <div className="p-4 border-r border-border/50"></div>
              {DAYS.map((day) => {
                const dayData = schedule.find((d) => d.day === day);
                const todayCell = dayData && isToday(dayData.date);
                return (
                  <div
                    key={day}
                    className={`p-4 text-center border-r border-border/50 last:border-r-0 ${
                      todayCell ? "bg-primary/10" : ""
                    }`}
                  >
                    <div className={`font-semibold ${todayCell ? "text-primary" : "text-foreground"}`}>
                      {day}
                    </div>
                    {dayData && (
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                        {todayCell && <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />}
                        <span>{dayData.date}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Grille horaire */}
            <div className="grid grid-cols-[80px_repeat(5,1fr)] relative">
              {/* Heures */}
              <div className="border-r border-border/50">
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="h-[45px] px-3 py-1 text-xs text-muted-foreground border-b border-border/20 flex items-start"
                  >
                    {hour}
                  </div>
                ))}
              </div>

              {/* Jours */}
              {DAYS.map((day) => {
                const dayData = schedule.find((d) => d.day === day);
                const todayCell = dayData && isToday(dayData?.date || "");
                const positioned = dayData?.courses?.length
                  ? assignColumns(dayData.courses)
                  : [];

                return (
                  <div
                    key={day}
                    className={`border-r border-border/50 last:border-r-0 relative ${
                      todayCell ? "bg-primary/5" : ""
                    }`}
                  >
                    {HOURS.map((hour) => (
                      <div key={hour} className="h-[45px] border-b border-border/20" />
                    ))}

                    {positioned.map((pc, idx) => {
                      const colGapPx = 6;
                      const colCount = Math.max(pc.colCount, 1);
                      const widthPercent = 100 / colCount;
                      const leftPercent = widthPercent * pc.colIndex;

                      return (
                        <div
                          key={idx}
                          className="absolute left-0 right-0"
                          style={{
                            top: `${pc.top}px`,
                            height: `${pc.height}px`,
                            left: `calc(${leftPercent}% + ${GRID_PADDING_X}px)`,
                            width: `calc(${widthPercent}% - ${colGapPx}px - ${GRID_PADDING_X * 2}px)`,
                          }}
                        >
                          <CourseBlock
                            course={pc.course}
                            viewMode="week"
                            style={{
                              height: "100%",
                              overflow: "hidden",
                              borderRadius: 10,
                              display: "flex",
                              flexDirection: "column",
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile: liste */}
          <div className="block md:hidden p-4 space-y-4">
            {schedule.map((dayData) => {
              const todayCell = isToday(dayData.date);
              return (
                <div
                  key={dayData.day}
                  className={`border rounded-lg p-3 ${todayCell ? "bg-primary/5" : "bg-card"}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-semibold">{dayData.day}</div>
                    <div className="text-xs text-muted-foreground">{dayData.date}</div>
                  </div>
                  <div className="space-y-2">
                    {dayData.courses.length > 0 ? (
                      dayData.courses
                        .slice()
                        .sort(
                          (a, b) =>
                            parseHHmmToMinutes(a.debut) - parseHHmmToMinutes(b.debut)
                        )
                        .map((course, idx) => (
                          <CourseBlock
                            key={idx}
                            course={course}
                            viewMode="day"
                            style={{ minHeight: 40 }}
                          />
                        ))
                    ) : (
                      <div className="text-xs text-muted-foreground">Pas de cours</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default TimeGrid;
