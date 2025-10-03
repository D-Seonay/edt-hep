import { Day } from '@/services/scheduleService';
import CourseBlock from './CourseBlock'; // import du composant CourseBlock

interface TimeGridProps {
  schedule: Day[];
  currentDate?: Date;
}

const HOURS = [
  "8:00", "9:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

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

const TimeGrid = ({ schedule, currentDate = new Date() }: TimeGridProps) => {
  const isToday = (dateStr: string): boolean => {
    const today = currentDate.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return dateStr === today;
  };

  // Vérifie s'il y a au moins un cours cette semaine
  const hasAnyCourse = schedule.some(day => Array.isArray(day.courses) && day.courses.length > 0);

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
      {!hasAnyCourse ? (
        // Message affiché si pas de cours (visible sur tous les écrans)
        <div className="p-8 text-center text-sm text-muted-foreground">
          Semaine en entreprise / pas de cours cette semaine / vérifier vos filtres 
        </div>
      ) : (
        <>
          {/* --- Grand écran : Grille --- */}
          <div className="hidden md:block">
            {/* Header */}
            <div className="grid grid-cols-[80px_repeat(5,1fr)] border-b border-border/50 bg-muted/30">
              <div className="p-4 border-r border-border/50"></div>
              {DAYS.map(day => {
                const dayData = schedule.find(d => d.day === day);
                const todayCell = dayData && isToday(dayData.date);

                return (
                  <div
                    key={day}
                    className={`p-4 text-center border-r border-border/50 last:border-r-0 ${
                      todayCell ? 'bg-primary/10' : ''
                    }`}
                  >
                    <div className={`font-semibold ${todayCell ? 'text-primary' : 'text-foreground'}`}>
                      {day}
                    </div>
                    {dayData && (
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                        {todayCell && <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>}
                        <span>{dayData.date}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Grille horaire */}
            <div className="grid grid-cols-[80px_repeat(5,1fr)] relative">
              <div className="border-r border-border/50">
                {HOURS.map(hour => (
                  <div
                    key={hour}
                    className="h-[45px] px-3 py-2 text-xs text-muted-foreground border-b border-border/20 flex items-center"
                  >
                    {hour}
                  </div>
                ))}
              </div>

              {DAYS.map(day => {
                const dayData = schedule.find(d => d.day === day);
                const todayCell = dayData && isToday(dayData.date);

                return (
                  <div
                    key={day}
                    className={`border-r border-border/50 last:border-r-0 relative ${
                      todayCell ? 'bg-primary/5' : ''
                    }`}
                  >
                    {HOURS.map(hour => (
                      <div
                        key={hour}
                        className="h-[45px] border-b border-border/20"
                      />
                    ))}

                    {dayData?.courses.map((course, idx) => {
                      const height = calculateCourseHeight(course.debut, course.fin);
                      const top = calculateTopOffset(course.debut);

                      return (
                        <div
                          key={idx}
                          className="absolute left-1 right-1"
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                          }}
                        >
                          <CourseBlock course={course} />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- Petit écran : Liste --- */}
          <div className="block md:hidden p-4 space-y-4">
            {schedule.map(dayData => {
              const todayCell = isToday(dayData.date);

              return (
                <div key={dayData.day} className={`border rounded-lg p-3 ${todayCell ? 'bg-primary/5' : 'bg-card'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-semibold">{dayData.day}</div>
                    <div className="text-xs text-muted-foreground">{dayData.date}</div>
                  </div>
                  <div className="space-y-2">
                    {dayData.courses.length > 0 ? (
                      dayData.courses.map((course, idx) => (
                        <CourseBlock key={idx} course={course} />
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
