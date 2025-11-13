import { useEffect, useState } from "react";
import CourseBlock from "./CourseBlock";
import type { TimeGridProps } from "@/types/schedule";
import { DAYS, HOURS, HOUR_HEIGHT_PX, DAY_START_MINUTES } from "@/constants/schedule";
import { parseHHmmToDate, parseHHmmToMinutes } from "@/utils/dateHelpers";
import { PositionedCourse } from "@/types/types";

const GRID_PADDING_X = 4;

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

function assignColumns(courses: any[]): PositionedCourse[] {
  // FIX: use start/end (english keys) everywhere
  const items = courses.map((c) => {
    const startMin = parseHHmmToMinutes(c.start);
    const endMin = parseHHmmToMinutes(c.end);
    return {
      course: c,
      startMin,
      endMin,
      top: minutesToTop(startMin),
      height: Math.max(durationToHeight(startMin, endMin), 36),
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

  for (let i = 0; i < result.length; i++) {
    const aStart = parseHHmmToMinutes(result[i].course.start);
    const aEnd = parseHHmmToMinutes(result[i].course.end);
    let maxCol = result[i].colIndex;

    for (let j = 0; j < result.length; j++) {
      if (i === j) continue;
      const bStart = parseHHmmToMinutes(result[j].course.start);
      const bEnd = parseHHmmToMinutes(result[j].course.end);
      if (isOverlap(aStart, aEnd, bStart, bEnd)) {
        maxCol = Math.max(maxCol, result[j].colIndex);
      }
    }
    result[i].colCount = maxCol + 1;
  }

  return result;
}

// Position verticale de la barre “maintenant” pour une date donnée
function getNowTopForDay(dayDateStr: string, now: Date): number | null {
  let yyyy = 0, mm = 0, dd = 0;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dayDateStr)) {
    const parts = dayDateStr.split("/").map(Number);
    dd = parts[0]; mm = parts[1]; yyyy = parts[2];
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(dayDateStr)) {
    const parts = dayDateStr.split("-").map(Number);
    yyyy = parts[0]; mm = parts[1]; dd = parts[2];
  } else {
    return null;
  }

  // Si le jour n’est pas aujourd’hui, ne pas afficher la barre
  if (
    now.getFullYear() !== yyyy ||
    now.getMonth() !== mm - 1 ||
    now.getDate() !== dd
  ) {
    return null;
  }

  const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
  return minutesToTop(minutesSinceMidnight);
}

const TimeGrid = ({ schedule, currentDate = new Date(), onSelectDay }: TimeGridProps) => {
  const [now, setNow] = useState<Date>(new Date());
  // rafraîchit l’heure actuelle toutes les 30s (assez fin sans trop de re-render)
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

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
          {/* Header cliquable */}
          <div className="hidden md:block">
            <div className="grid grid-cols-[80px_repeat(5,1fr)] border-b border-border/50 bg-muted/30">
              <div className="p-4 border-r border-border/50" />
              {DAYS.map((day) => {
                const dayData = schedule.find((d) => d.day === day);
                const todayCell = dayData && isToday(dayData?.date || "");

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => onSelectDay?.(day)}
                    className={`p-4 text-center border-r border-border/50 last:border-r-0 focus:outline-none hover:bg-muted/50 transition-colors ${
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
                  </button>
                );
              })}
            </div>

            {/* Grille horaire */}
            <div className="grid grid-cols-[80px_repeat(5,1fr)] relative">
              {/* Colonne heures */}
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

              {/* Colonnes jours */}
              {DAYS.map((day) => {
                const dayData = schedule.find((d) => d.day === day);
                const todayCell = dayData && isToday(dayData?.date || "");
                const positioned = dayData?.courses?.length ? assignColumns(dayData.courses) : [];

                // calc barre “maintenant”
                const nowTop = dayData?.date ? getNowTopForDay(dayData.date, now) : null;

                return (
                  <div
                    key={day}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectDay?.(day)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") onSelectDay?.(day);
                    }}
                    className={`border-r border-border/50 last:border-r-0 relative cursor-pointer hover:bg-muted/30 transition-colors ${
                      todayCell ? "bg-primary/5" : ""
                    }`}
                    aria-label={`Voir le jour ${day}`}
                  >
                    {/* Lignes horaires */}
                    {HOURS.map((hour) => (
                      <div key={hour} className="h-[45px] border-b border-border/20" />
                    ))}

                    {/* Barre “maintenant” */}
                    {nowTop !== null && nowTop >= 0 && (
                      <div
                        className="absolute left-0 right-0 pointer-events-none"
                        style={{
                          top: `${Math.min(nowTop, HOURS.length * HOUR_HEIGHT_PX)}px`,
                        }}
                      >
                        {/* ligne */}
                        <div className="h-px bg-red-500/80" />
                        {/* petit marqueur à gauche */}
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-[-4px] ml-[-1px]" />
                      </div>
                    )}

                    {/* Cours positionnés */}
                    {positioned.map((pc, idx) => {
                      const colGapPx = 6;
                      const colCount = Math.max(pc.colCount, 1);
                      const widthPercent = 100 / colCount;
                      const leftPercent = widthPercent * pc.colIndex;

                      const isPast =
                        dayData?.date ? parseHHmmToDate(pc.course, dayData.date, now) : false;

                      return (
                        <div
                          key={idx}
                          className="absolute"
                          style={{
                            top: `${pc.top}px`,
                            height: `${pc.height}px`,
                            left: `calc(${leftPercent}% + ${GRID_PADDING_X}px)`,
                            width: `calc(${widthPercent}% - ${colGapPx}px - ${GRID_PADDING_X * 2}px)`,
                            // dim léger si passé
                            opacity: isPast ? 0.55 : 1,
                            filter: isPast ? "saturate(0.85)" : "none",
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

          {/* Mobile */}
          <div className="block md:hidden p-4 space-y-4">
            {schedule.map((dayData) => {
              const todayCell = dayData?.date ? isToday(dayData.date) : false;
              const nowTop = dayData?.date ? getNowTopForDay(dayData.date, now) : null;

              return (
                <div
                  key={dayData.day}
                  className={`border rounded-lg p-3 ${todayCell ? "bg-primary/5" : "bg-card"} relative`}
                >
                  {/* Barre “maintenant” pour le jour courant */}
                  {nowTop !== null && nowTop >= 0 && (
                    <div
                      className="absolute left-3 right-3 pointer-events-none"
                      style={{
                        top: `${Math.min(nowTop, HOURS.length * HOUR_HEIGHT_PX)}px`,
                      }}
                    >
                      <div className="h-px bg-red-500/80" />
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-[-4px]" />
                    </div>
                  )}

                  <div
                    className="flex justify-between items-center mb-2 cursor-pointer hover:opacity-80"
                    onClick={() => onSelectDay?.(dayData.day)}
                  >
                    <div className="font-semibold">{dayData.day}</div>
                    <div className="text-xs text-muted-foreground">{dayData.date}</div>
                  </div>

                  <div className="space-y-2">
                    {dayData.courses.length > 0 ? (
                      dayData.courses
                        .slice()
                        .sort(
                          (a, b) =>
                            parseHHmmToMinutes(a.start) - parseHHmmToMinutes(b.start)
                        )
                        .map((course, idx) => {
                          const isPast = dayData?.date ? parseHHmmToDate(course, dayData.date, now) : false;
                          return (
                            <div key={idx} style={{ opacity: isPast ? 0.6 : 1, filter: isPast ? "saturate(0.85)" : "none" }}>
                              <CourseBlock
                                course={course}
                                viewMode="day"
                                style={{ minHeight: 40 }}
                              />
                            </div>
                          );
                        })
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
