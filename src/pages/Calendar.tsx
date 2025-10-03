import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';
import { fetchSchedule, getUniqueSubjects, Day } from '@/services/scheduleService';
import { toast } from '@/hooks/use-toast';
import WeekNavigator from '@/components/schedule/WeekNavigator';
import TimeGrid from '@/components/schedule/TimeGrid';
import SubjectFilter from '@/components/schedule/SubjectFilter';

const Calendar = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [schedule, setSchedule] = useState<Day[]>([]);
  const [filteredSchedule, setFilteredSchedule] = useState<Day[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
  const [currentWeek, setCurrentWeek] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (!storedUsername) {
      navigate('/');
      return;
    }
    setUsername(storedUsername);
    loadSchedule(storedUsername, 0);
  }, [navigate]);

  useEffect(() => {
    if (schedule.length > 0) {
      const allSubjects = getUniqueSubjects(schedule);
      setSubjects(allSubjects);
      setSelectedSubjects(new Set(allSubjects));
    }
  }, [schedule]);

  useEffect(() => {
    filterSchedule();
  }, [schedule, selectedSubjects]);

  const loadSchedule = async (user: string, weekOffset: number) => {
    setIsLoading(true);
    try {
      const data = await fetchSchedule(user, weekOffset);
      setSchedule(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger l'emploi du temps",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterSchedule = () => {
    const filtered = schedule.map(day => ({
      ...day,
      courses: day.courses.filter(course => selectedSubjects.has(course.matiere))
    }));
    setFilteredSchedule(filtered);
  };

  const handleWeekChange = (offset: number) => {
    const newWeek = currentWeek + offset;
    setCurrentWeek(newWeek);
    loadSchedule(username, newWeek);
  };

  const handleToday = () => {
    setCurrentWeek(0);
    loadSchedule(username, 0);
  };

  const handleSubjectToggle = (subject: string) => {
    const newSelected = new Set(selectedSubjects);
    if (newSelected.has(subject)) {
      newSelected.delete(subject);
    } else {
      newSelected.add(subject);
    }
    setSelectedSubjects(newSelected);
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Mon Emploi du Temps
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Connecté en tant que <span className="font-medium text-foreground">{username}</span>
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="rounded-xl shadow-soft hover:shadow-card transition-all"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Navigation */}
        <div className="mb-6">
          <WeekNavigator
            currentWeek={currentWeek}
            onPrevious={() => handleWeekChange(-1)}
            onNext={() => handleWeekChange(1)}
            onToday={handleToday}
          />
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Sidebar - Filters */}
          <aside className="space-y-4">
            {!isLoading && subjects.length > 0 && (
              <SubjectFilter
                subjects={subjects}
                selectedSubjects={selectedSubjects}
                onToggle={handleSubjectToggle}
              />
            )}
          </aside>

          {/* Main Calendar */}
          <main>
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredSchedule.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Aucun cours pour cette semaine</p>
              </div>
            ) : (
              <TimeGrid schedule={filteredSchedule} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
