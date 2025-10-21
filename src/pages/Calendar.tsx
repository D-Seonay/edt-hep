import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutGrid, CalendarDays, Sun, Moon, CalendarSearch } from "lucide-react";
import {
  fetchSchedule,
  getUniqueSubjects,
  Day,
} from "@/services/scheduleService";
import { toast } from "@/hooks/use-toast";
import WeekNavigator from "@/components/schedule/WeekNavigator";
import TimeGrid from "@/components/schedule/TimeGrid";
import DayView from "@/components/schedule/DayView";
import SubjectFilter from "@/components/schedule/SubjectFilter";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Footer from "@/components/ui/footer";

import { motion, AnimatePresence } from "framer-motion";
import CalendarSkeleton from "@/components/schedule/CalendarSkeleton";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as DatePicker } from "@/components/ui/calendar";

const Calendar = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [schedule, setSchedule] = useState<Day[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(
    new Set()
  );
  const [filterDistanciel, setFilterDistanciel] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [selectedDay, setSelectedDay] = useState<string>("Lundi");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [pickerOpen, setPickerOpen] = useState(false);

  // --- Dark mode ---
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // --- Load username & schedule ---
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) {
      navigate("/");
      return;
    }
    setUsername(storedUsername);
    loadSchedule(storedUsername, 0);
  }, [navigate]);

  const loadSchedule = async (user: string, weekOffset: number) => {
    setIsLoading(true);
    try {
      const data = await fetchSchedule(user, weekOffset.toString());
      setSchedule(data);
      const allSubjects = getUniqueSubjects(data);
      setSubjects(allSubjects);
      setSelectedSubjects(new Set(allSubjects));
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'emploi du temps",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Filtres appliqués ---
  const filteredSchedule = useMemo(() => {
    return schedule.map((day) => ({
      ...day,
      courses: day.courses.filter((course) => {
        const matchSubject = selectedSubjects.has(course.matiere);
        const matchDistanciel =
          !filterDistanciel || course.salle.startsWith("SALLE");
        return matchSubject && matchDistanciel;
      }),
    }));
  }, [schedule, selectedSubjects, filterDistanciel]);

  useEffect(() => {
    if (viewMode === "day") {
      const today = new Date();
      const dayOfWeek = today.toLocaleDateString("fr-FR", { weekday: "long" });
      setSelectedDay(dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1));
    }
  }, [viewMode]);

  const handleWeekChange = (offset: number) => {
    const newWeek = currentWeek + offset;
    setCurrentWeek(newWeek);
    loadSchedule(username, newWeek);
  };

  const handleToday = () => {
    setCurrentWeek(0);
    loadSchedule(username, 0);
  };

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    // Conserver l'heure à minuit
    d.setHours(0, 0, 0, 0);
    // JS: 0 = dimanche, 1 = lundi ... On veut que la semaine commence lundi
    const day = d.getDay();
    const diff = (day + 6) % 7; // nombre de jours à retrancher pour arriver au lundi
    d.setDate(d.getDate() - diff);
    return d;
  };

  const getWeekOffset = (date: Date) => {
    const startSelected = getStartOfWeek(date).getTime();
    const startToday = getStartOfWeek(new Date()).getTime();
    const diffMs = startSelected - startToday;
    return Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
  };

  const handleDateSelect = (date: Date | undefined | null) => {
    if (!date) return;
    setSelectedDate(date);
    const offset = getWeekOffset(date);
    setCurrentWeek(offset);
    // si le username est déjà chargé, on recharge le planning
    if (username) loadSchedule(username, offset);
    setPickerOpen(false);
  };

  const handleSubjectToggle = (subject: string) => {
    const newSelected = new Set(selectedSubjects);
    if (newSelected.has(subject)) newSelected.delete(subject);
    else newSelected.add(subject);
    setSelectedSubjects(newSelected);
  };

  const handleLogout = () => {
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès.",
      variant: "default",
    });
    localStorage.removeItem("username");
    navigate("/");
  };

  const getCurrentDay = (): Day | null =>
    filteredSchedule.find((d) => d.day === selectedDay) || null;
  const isCurrentDayToday = (): boolean => {
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString("fr-FR", { weekday: "long" });
    const capitalizedDay =
      dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
    return selectedDay === capitalizedDay && currentWeek === 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:from-black dark:via-black-800 dark:to-black-900 transition-colors duration-300"
    >
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="border-b border-border/50 bg-card/50 dark:bg-black-800 backdrop-blur-sm sticky top-0 z-10 shadow-soft transition-colors duration-300"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            <span className="hidden sm:inline">Emploi du temps - </span>
            <span className="sm:hidden">EDT </span>C&D
          </h1>
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <Button
              variant="outline"
              onClick={toggleTheme}
              className="rounded-xl shadow-soft hover:shadow-card transition-all flex items-center gap-2"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="hidden sm:inline">
                {darkMode ? "Clair" : "Sombre"}
              </span>
            </Button>

            {/* Deconnexion */}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="rounded-xl shadow-soft hover:shadow-card transition-all flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-6">
        {/* Navigation & View Toggle */}
        <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-col">
              <WeekNavigator
              currentWeek={currentWeek}
              onPrevious={() => handleWeekChange(-1)}
              onNext={() => handleWeekChange(1)}
              onToday={handleToday}
              />


            </div>
            <div className="flex items-center gap-4">
            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as "week" | "day")}
              className="w-auto"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="day" className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Jour
                </TabsTrigger>
                <TabsTrigger value="week" className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4" />
                  Semaine
                </TabsTrigger>
              </TabsList>
            </Tabs>
              {/* Datepicker */}
              <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="rounded-xl shadow-soft hover:shadow-card">
                    {selectedDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <DatePicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => handleDateSelect(d as Date)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {viewMode === "day" && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground dark:text-muted-foreground/70">
                Sélectionner un jour:
              </span>
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
          <aside className="space-y-4">
            {!isLoading && subjects.length > 0 && (
              <SubjectFilter
                subjects={subjects}
                selectedSubjects={selectedSubjects}
                onToggle={handleSubjectToggle}
                filterDistanciel={filterDistanciel}
                onToggleDistanciel={() => setFilterDistanciel((v) => !v)}
              />
            )}
          </aside>

          <main>
            {isLoading ? (
              <CalendarSkeleton />
            ) : filteredSchedule.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground dark:text-muted-foreground/70">
                  Aucun cours pour cette semaine
                </p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {viewMode === "week" ? (
                  <motion.div
                    key="week"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TimeGrid
                      schedule={filteredSchedule}
                      currentDate={new Date()}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="day"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <DayView
                      day={getCurrentDay()}
                      isToday={isCurrentDayToday()}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </motion.div>
  );
};

export default Calendar;
