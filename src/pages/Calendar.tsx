import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2, Download, Calendar as CalendarIcon, LayoutGrid, CalendarDays } from 'lucide-react';
import { fetchSchedule, getUniqueSubjects, Day } from '@/services/scheduleService';
import { toast } from '@/hooks/use-toast';
import WeekNavigator from '@/components/schedule/WeekNavigator';
import TimeGrid from '@/components/schedule/TimeGrid';
import DayView from '@/components/schedule/DayView';
import SubjectFilter from '@/components/schedule/SubjectFilter';
import { exportToICS } from '@/utils/googleCalendar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Calendar = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [schedule, setSchedule] = useState<Day[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
  const [currentWeek, setCurrentWeek] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [selectedDay, setSelectedDay] = useState<string>('Lundi');

  // Au montage → récupérer username et EDT
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    console.log("[DEBUG] storedUsername:", storedUsername);
    if (!storedUsername) {
      navigate('/');
      return;
    }
    setUsername(storedUsername);
    loadSchedule(storedUsername, 0);
  }, [navigate]);

  // Chargement EDT + matières
  const loadSchedule = async (user: string, weekOffset: number) => {
    console.log(`[DEBUG] loadSchedule called for user: ${user}, weekOffset: ${weekOffset}`);
    setIsLoading(true);
    try {
      const data = await fetchSchedule(user, weekOffset.toString());
      console.log("[DEBUG] fetched schedule:", data);
      setSchedule(data);

      // Extraire matières
      const allSubjects = getUniqueSubjects(data);
      console.log("[DEBUG] extracted subjects:", allSubjects);
      setSubjects(allSubjects);
      setSelectedSubjects(new Set(allSubjects));
    } catch (error) {
      console.error("[ERROR] fetching schedule:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'emploi du temps",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrage optimisé des cours
  const filteredSchedule = useMemo(() => {
    const filtered = schedule.map(day => ({
      ...day,
      courses: day.courses.filter(course => selectedSubjects.has(course.matiere))
    }));
    console.log("[DEBUG] filteredSchedule:", filtered);
    return filtered;
  }, [schedule, selectedSubjects]);

  // Quand on passe en vue "jour", on sélectionne le jour actuel
  useEffect(() => {
    if (viewMode === 'day') {
      const today = new Date();
      const dayOfWeek = today.toLocaleDateString('fr-FR', { weekday: 'long' });
      const capitalizedDay = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
      console.log("[DEBUG] Switching to day view, selectedDay set to:", capitalizedDay);
      setSelectedDay(capitalizedDay);
    }
  }, [viewMode]);

  const handleWeekChange = (offset: number) => {
    const newWeek = currentWeek + offset;
    console.log(`[DEBUG] handleWeekChange: newWeek = ${newWeek}`);
    setCurrentWeek(newWeek);
    loadSchedule(username, newWeek);
  };

  const handleToday = () => {
    console.log("[DEBUG] handleToday clicked");
    setCurrentWeek(0);
    loadSchedule(username, 0);
  };

  const handleSubjectToggle = (subject: string) => {
    const newSelected = new Set(selectedSubjects);
    if (newSelected.has(subject)) {
      newSelected.delete(subject);
      console.log(`[DEBUG] Subject removed: ${subject}`);
    } else {
      newSelected.add(subject);
      console.log(`[DEBUG] Subject added: ${subject}`);
    }
    setSelectedSubjects(newSelected);
  };

  const handleLogout = () => {
    console.log("[DEBUG] Logging out");
    localStorage.removeItem('username');
    navigate('/');
  };

  const handleExportICS = () => {
    console.log("[DEBUG] Export ICS clicked");
    exportToICS(filteredSchedule, `edt-semaine-${currentWeek}.ics`);
    toast({
      title: "Export réussi",
      description: "L'emploi du temps a été téléchargé au format ICS",
    });
  };

  const getCurrentDay = (): Day | null => {
    const day = filteredSchedule.find(d => d.day === selectedDay);
    console.log("[DEBUG] getCurrentDay:", selectedDay, "->", day);
    return day || null;
  };

  const isCurrentDayToday = (): boolean => {
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('fr-FR', { weekday: 'long' });
    const capitalizedDay = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
    const result = selectedDay === capitalizedDay && currentWeek === 0;
    console.log("[DEBUG] isCurrentDayToday:", result);
    return result;
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
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-xl shadow-soft hover:shadow-card transition-all"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportICS}>
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Format ICS (Google Calendar, Outlook...)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="outline"
              onClick={handleLogout}
              className="rounded-xl shadow-soft hover:shadow-card transition-all"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Navigation & View Toggle */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <WeekNavigator
              currentWeek={currentWeek}
              onPrevious={() => handleWeekChange(-1)}
              onNext={() => handleWeekChange(1)}
              onToday={handleToday}
            />
            
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'week' | 'day')} className="w-auto">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="week" className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4" />
                  Semaine
                </TabsTrigger>
                <TabsTrigger value="day" className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Jour
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Day selector for day view */}
          {viewMode === 'day' && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Sélectionner un jour:</span>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lundi">Lundi</SelectItem>
                  <SelectItem value="Mardi">Mardi</SelectItem>
                  <SelectItem value="Mercredi">Mercredi</SelectItem>
                  <SelectItem value="Jeudi">Jeudi</SelectItem>
                  <SelectItem value="Vendredi">Vendredi</SelectItem>
                  <SelectItem value="Samedi">Samedi</SelectItem>
                  <SelectItem value="Dimanche">Dimanche</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
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
            ) : viewMode === 'week' ? (
              <TimeGrid schedule={filteredSchedule} currentDate={new Date()} />
            ) : (
              <DayView day={getCurrentDay()} isToday={isCurrentDayToday()} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
