import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  LayoutGrid,
  CalendarDays,
  Download,
  Settings,
} from "lucide-react";
import {
  fetchSchedule,
  getUniqueSubjects,
} from "@/services/scheduleService";
import { toast } from "@/hooks/use-toast";
import WeekNavigator from "@/components/schedule/WeekNavigator";
import TimeGrid from "@/components/schedule/TimeGrid";
import DayView from "@/components/schedule/DayView";
import SubjectFilter from "@/components/schedule/SubjectFilter";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Calendar as DatePicker,
  Footer,
  Button,
  AdBanner,
} from "@/lib";

import { motion, AnimatePresence } from "framer-motion";
import CalendarSkeleton from "@/components/schedule/CalendarSkeleton";
import { usePrimaryColor } from "@/hooks/usePrimaryColor";
import { useExportImage } from "@/hooks/useExportImage";
import { Day } from "@/types/schedule";
import {
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
  differenceInWeeks,
  addMonths,
  subMonths,
} from "date-fns";
import { useTheme } from "@/context/ThemeContext";
import MonthView from "@/components/schedule/MonthView";
import Legend from "@/components/Legend";

const Calendar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [username, setUsername] = useState("");
  const [schedule, setSchedule] = useState<Day[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(
    new Set()
  );
  const [filterDistanciel, setFilterDistanciel] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"week" | "day" | "month">("week");
  const [selectedDay, setSelectedDay] = useState<string>("Lundi");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [pickerOpen, setPickerOpen] = useState(false);

  // Primary color (via hook)
  const { primaryColor, setPrimaryColor } = usePrimaryColor("#4169e1");

  const captureRef = useRef<HTMLDivElement | null>(null);
  const fileName = `emploi_du_temps_${username || "utilisateur"}.png`;

  const { exportImage, isExporting } = useExportImage({
    filename: fileName,
    scale: 2,
    backgroundColor: null,
    onError: () => {
      toast({
        title: "Export échoué",
        description: "Réessaie.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Export réussi",
        description: "Image téléchargée.",
        variant: "default",
      });
    },
  });

  // Load username & schedule
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) {
      navigate("/login");
      return;
    }
    setUsername(storedUsername);
  }, [navigate]);

  useEffect(() => {
    if (username) {
      if (viewMode === "month") {
        loadMonthSchedule(username, selectedDate);
      } else {
        loadSchedule(username, currentWeek);
      }
    }
  }, [username, viewMode, selectedDate, currentWeek]);

  const loadSchedule = async (user: string, weekOffset: number) => {
    setIsLoading(true);
    try {
      const data = await fetchSchedule(user, weekOffset.toString());
      setSchedule(data);
      const allSubjects = getUniqueSubjects(data);
      setSubjects(allSubjects);
      setSelectedSubjects(new Set(allSubjects));
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

  const loadMonthSchedule = async (user: string, date: Date) => {
    setIsLoading(true);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    const weeks = eachWeekOfInterval(
      { start: monthStart, end: monthEnd },
      { weekStartsOn: 1 }
    );

    try {
      const allWeeksData: Day[] = [];
      for (const weekStart of weeks) {
        const weekOffset = getWeekOffset(weekStart);
        const weeklyData = await fetchSchedule(user, weekOffset.toString());
        allWeeksData.push(...weeklyData);
      }

      const uniqueDays = allWeeksData.filter(
        (day, index, self) =>
          index === self.findIndex((d) => d.date === day.date)
      );

      setSchedule(uniqueDays);
      const allSubjects = getUniqueSubjects(uniqueDays);
      setSubjects(allSubjects);
      setSelectedSubjects(new Set(allSubjects));
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger l'emploi du temps du mois",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const userRule = localStorage.getItem("userRule")
    ? JSON.parse(localStorage.getItem("userRule") || "{}")
    : null;

  const filteredSchedule = useMemo(() => {
    return schedule.map((day) => ({
      ...day,
      courses: day.courses.filter((course) => {
        const matchSubject = selectedSubjects.has(course.subject);
        const matchDistanciel =
          !filterDistanciel || course.room.startsWith("SALLE");
        return matchSubject && matchDistanciel;
      }),
    }));
  }, [schedule, selectedSubjects, filterDistanciel]);

  useEffect(() => {
    if (viewMode === "day") {
      setSelectedDay((prev) => {
        if (prev && prev.trim().length > 0) {
          return prev;
        }
        const today = new Date();
        const dayOfWeek = today
          .toLocaleDateString("fr-FR", { weekday: "long" })
          .replace(/^./, (c) => c.toUpperCase());
        return dayOfWeek;
      });
    }
  }, [viewMode]);

  const handleWeekChange = (offset: number) => {
    const newWeek = currentWeek + offset;
    setCurrentWeek(newWeek);
    loadSchedule(username, newWeek);
  };

  const handleToday = () => {
    setCurrentWeek(0);
    setSelectedDate(new Date());
    if (username) {
      if (viewMode === "month") {
        loadMonthSchedule(username, new Date());
      } else {
        loadSchedule(username, 0);
      }
    }
  };

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = (day + 6) % 7;
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
    if (viewMode !== 'month') {
      const offset = getWeekOffset(date);
      setCurrentWeek(offset);
      if (username) loadSchedule(username, offset);
    }
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
    navigate("/login");
  };

  const getCurrentDay = (): Day | null =>
    filteredSchedule.find((d) => d.day === selectedDay) || null;

  const daysOfWeek = useMemo(
    () => [
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
      "Dimanche",
    ],
    []
  );

  const handleNextDay = () => {
    const currentIndex = daysOfWeek.indexOf(selectedDay);
    if (currentIndex < daysOfWeek.length - 1) {
      setSelectedDay(daysOfWeek[currentIndex + 1]);
    } else {
      handleWeekChange(1);
      setSelectedDay(daysOfWeek[0]);
    }
  };

  const handlePreviousDay = () => {
    const currentIndex = daysOfWeek.indexOf(selectedDay);
    if (currentIndex > 0) {
      setSelectedDay(daysOfWeek[currentIndex - 1]);
    } else {
      handleWeekChange(-1);
      setSelectedDay(daysOfWeek[daysOfWeek.length - 1]);
    }
  };

  const isCurrentDayToday = (): boolean => {
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString("fr-FR", { weekday: "long" });
    const capitalizedDay =
      dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
    return selectedDay === capitalizedDay && currentWeek === 0;
  };

  const hasAnyCourse = useMemo(() => {
    return filteredSchedule.some(
      (day) => Array.isArray(day.courses) && day.courses.length > 0
    );
  }, [filteredSchedule]);

  // snippet patch in Calendar.tsx

  const normalizeDay = (s: string) => s.normalize().trim();

  const handleDayClick = (day: string | Date) => {
    if (typeof day === "string") {
      const normalized = normalizeDay(day);
      setViewMode("day");
      setSelectedDay(normalized);

      const dayData = filteredSchedule.find(
        (d) => normalizeDay(d.day) === normalized
      );
      if (dayData?.date) {
        // Supports both "dd/mm/yyyy" and "yyyy-mm-dd"
        let newDate: Date | null = null;
        const val = dayData.date.trim();

        if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
          const [dd, mm, yyyy] = val.split("/").map(Number);
          newDate = new Date(yyyy, mm - 1, dd);
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
          const [yyyy, mm, dd] = val.split("-").map(Number);
          newDate = new Date(yyyy, mm - 1, dd);
        }

        if (newDate && !isNaN(newDate.getTime())) {
          setSelectedDate(newDate);
        }
      }
    } else {
      // Date object from MonthView
      const offset = getWeekOffset(day);
      setCurrentWeek(offset);
      setSelectedDate(day);
      setViewMode("week");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:from-black dark:via-black-800 dark:to-black-900 transition-colors duration-300"
    >
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
            <Button
              variant="outline"
              disabled={isExporting || !hasAnyCourse}
              onClick={() => {
                if (!hasAnyCourse) {
                  toast({
                    title: "Export indisponible",
                    description:
                      "Aucun cours à exporter pour cette semaine (ou vérifiez vos filtres).",
                    variant: "destructive",
                  });
                  return;
                }
                exportImage(captureRef.current);
              }}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">
                {isExporting ? "Export..." : "Exporter en image"}
              </span>
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/settings")}
              className="rounded-xl shadow-soft hover:shadow-card transition-all flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Paramètres</span>
            </Button>
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

      {/* Corps */}
      <div className="container mx-auto px-4 py-6">
        {/* Navigation */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <WeekNavigator
                currentWeek={currentWeek}
                onPrevious={() =>
                  viewMode === "month"
                    ? setSelectedDate(subMonths(selectedDate, 1))
                    : handleWeekChange(-1)
                }
                onNext={() =>
                  viewMode === "month"
                    ? setSelectedDate(addMonths(selectedDate, 1))
                    : handleWeekChange(1)
                }
                onToday={handleToday}
                viewMode={viewMode}
                selectedDate={selectedDate}
              />
            </div>
            <div className="flex items-center gap-4">
              <Tabs
                value={viewMode}
                onValueChange={(v) => {
                  setViewMode(v as "week" | "day" | "month");
                }}
              >
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="day" className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" /> Jour
                  </TabsTrigger>
                  <TabsTrigger value="week" className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4" /> Semaine
                  </TabsTrigger>
                  <TabsTrigger
                    value="month"
                    className="flex items-center gap-2"
                  >
                    <CalendarDays className="w-4 h-4" /> Mois
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* DatePicker */}
              <Popover
                open={pickerOpen}
                onOpenChange={(open) => {
                  setPickerOpen(open);
                }}
              >
                <PopoverTrigger asChild>
                  <Button variant="outline" className="rounded-xl shadow-soft">
                    {selectedDate.toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
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
              <span className="text-sm text-muted-foreground">
                Sélectionner un jour:
              </span>
              <Select
                value={selectedDay}
                onValueChange={(value) => {
                  setSelectedDay(value);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Lundi",
                    "Mardi",
                    "Mercredi",
                    "Jeudi",
                    "Vendredi",
                    "Samedi",
                    "Dimanche",
                  ].map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Contenu principal */}
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          <aside className="space-y-4">
            {!isLoading && subjects.length > 0 && (
              <SubjectFilter
                subjects={subjects}
                selectedSubjects={selectedSubjects}
                onToggle={handleSubjectToggle}
                filterDistanciel={filterDistanciel}
                onToggleDistanciel={() => {
                  setFilterDistanciel((v) => !v);
                }}
              />
            )}
            {userRule && userRule.ad && <AdBanner username={username} />}
            <Legend />
          </aside>

          <main>
            {isLoading ? (
              <CalendarSkeleton />
            ) : filteredSchedule.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {viewMode === "month"
                  ? "Aucun cours pour ce mois"
                  : "Aucun cours pour cette semaine"}
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {viewMode === "month" ? (
                  <motion.div
                    key="month"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MonthView
                      schedule={filteredSchedule}
                      currentDate={selectedDate}
                      onSelectDay={handleDayClick}
                    />
                  </motion.div>
                ) : viewMode === "week" ? (
                  <motion.div
                    ref={captureRef}
                    key="week"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    onAnimationComplete={() => {
                      const cssVar = getComputedStyle(document.documentElement)
                        .getPropertyValue("--primary")
                        .trim();
                    }}
                  >
                    <TimeGrid
                      schedule={filteredSchedule}
                      currentDate={new Date()}
                      onSelectDay={handleDayClick}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="day"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.3 }}
                    onAnimationComplete={() => {
                      const cssVar = getComputedStyle(document.documentElement)
                        .getPropertyValue("--primary")
                        .trim();
                    }}
                  >
                    <DayView
                      day={getCurrentDay()}
                      isToday={isCurrentDayToday()}
                      onNextDay={handleNextDay}
                      onPreviousDay={handlePreviousDay}
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
