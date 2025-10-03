import { Day } from '@/services/scheduleService';

interface TimeGridProps {
  schedule: Day[];
  currentDate?: Date;
}

const HOURS = [
  "8:00", "9:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

// Convert "HH:mm" to decimal hours
const convertHourToNumber = (hourString: string): number => {
  const [hours, minutes] = hourString.split(":").map(Number);
  return hours + (minutes / 60);
};

// Calculate height in pixels (45px per hour)
const calculateCourseHeight = (debut: string, fin: string): number => {
  const start = convertHourToNumber(debut);
  const end = convertHourToNumber(fin);
  return (end - start) * 45;
};

// Calculate top position offset from 8:00
const calculateTopOffset = (debut: string): number => {
  const start = convertHourToNumber(debut);
  return (start - 8) * 45;
};

const TimeGrid = ({ schedule, currentDate = new Date() }: TimeGridProps) => {
  // Check if a day is today
  const isToday = (dateStr: string): boolean => {
    const today = currentDate.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return dateStr === today;
  };
  return (
    <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
      {/* Header with days */}
      <div className="grid grid-cols-[80px_repeat(5,1fr)] border-b border-border/50 bg-muted/30">
        <div className="p-4 border-r border-border/50"></div>
        {DAYS.map((day) => {
          const dayData = schedule.find(d => d.day === day);
          const isTodayCell = dayData && isToday(dayData.date);
          
          return (
            <div 
              key={day} 
              className={`p-4 text-center border-r border-border/50 last:border-r-0 ${
                isTodayCell ? 'bg-primary/10' : ''
              }`}
            >
              <div className={`font-semibold ${isTodayCell ? 'text-primary' : 'text-foreground'}`}>
                {day}
              </div>
              {dayData && (
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-1">
                  {isTodayCell && (
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                  )}
                  <span>{dayData.date}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="grid grid-cols-[80px_repeat(5,1fr)] relative">
        {/* Hour labels column */}
        <div className="border-r border-border/50">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="h-[45px] px-3 py-2 text-xs text-muted-foreground border-b border-border/20 flex items-center"
            >
              {hour}
            </div>
          ))}
        </div>

        {/* Days columns with courses */}
        {DAYS.map((day) => {
          const dayData = schedule.find(d => d.day === day);
          const isTodayCell = dayData && isToday(dayData.date);
          
          return (
            <div
              key={day}
              className={`border-r border-border/50 last:border-r-0 relative ${
                isTodayCell ? 'bg-primary/5' : ''
              }`}
            >
              {/* Hour lines */}
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="h-[45px] border-b border-border/20"
                />
              ))}

              {/* Courses positioned absolutely */}
              {dayData?.courses.map((course, idx) => {
                const height = calculateCourseHeight(course.debut, course.fin);
                const top = calculateTopOffset(course.debut);
                
                return (
                  <div
                    key={idx}
                    className="absolute left-1 right-1 rounded-lg p-2 shadow-card border border-white/20 overflow-hidden"
                    style={{
                      top: `${top}px`,
                      height: `${height - 4}px`,
                      backgroundColor: course.color.bg,
                      color: course.color.text,
                    }}
                  >
                    <div className="text-xs font-semibold text-foreground mb-1 line-clamp-1">
                      {course.matiere}
                    </div>
                    <div className="text-[10px] text-foreground/80 space-y-0.5">
                      <div className="truncate">
                        {course.salle.startsWith("SALLE") ? "DISTANCIEL" : course.salle}
                      </div>
                      <div className="truncate">{course.prof}</div>
                      <div className="font-medium">{course.debut} - {course.fin}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimeGrid;
