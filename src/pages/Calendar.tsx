import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/lib";
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
} from "@/lib";

import { motion, AnimatePresence } from "framer-motion";
import CalendarSkeleton from "@/components/schedule/CalendarSkeleton";

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

  // --- Primary color picker ---
  const [primaryColor, setPrimaryColor] = useState<string>("#7c3aed");

  // helpers: hex <-> hsl
  const hexToHsl = (H: string) => {
    let hex = H.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h = h * 60;
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const hslToHex = (h: number, s: number, l: number) => {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const color = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const parseHslStringToHex = (s: string) => {
    // expected format: "<h> <s>% <l>%"
    const parts = s.trim().split(/\s+/);
    if (parts.length >= 3) {
      const h = parseFloat(parts[0]);
      const sv = parts[1].replace('%', '');
      const lv = parts[2].replace('%', '');
      const sat = parseFloat(sv);
      const lig = parseFloat(lv);
      return hslToHex(h, sat, lig);
    }
    return undefined;
  };

  useEffect(() => {
    // load saved primary color from localStorage or from CSS variable --primary
    const saved = localStorage.getItem('primaryColor');
    if (saved) {
      setPrimaryColor(saved);
      const { h, s, l } = hexToHsl(saved);
      document.documentElement.style.setProperty('--primary', `${h} ${s}% ${l}%`);
      document.documentElement.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${saved} 0%, ${saved} 100%)`);
      document.documentElement.style.setProperty('--accent', `${h + 10} ${s}% ${l}%`);
    } else {
      const computed = getComputedStyle(document.documentElement).getPropertyValue('--primary');
      const val = computed && computed.trim();
      if (val) {
        const hex = parseHslStringToHex(val);
        if (hex) setPrimaryColor(hex);
      }
    }
  }, []);

  const handlePrimaryColorChange = (color: string) => {
    setPrimaryColor(color);
    const { h, s, l } = hexToHsl(color);
    document.documentElement.style.setProperty('--primary', `${h} ${s}% ${l}%`);
    document.documentElement.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${color} 0%, ${color} 100%)`);
    localStorage.setItem('primaryColor', color);
  };

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

            {/* Primary color picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="rounded-xl shadow-soft hover:shadow-card p-2">
                  <span className="w-4 h-4 rounded-full" style={{ background: primaryColor, display: 'inline-block' }} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <label htmlFor="primary-color-picker" className="sr-only">
                      Choisir la couleur primaire
                    </label>
                    <input
                      id="primary-color-picker"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => handlePrimaryColorChange(e.target.value)}
                      className="w-10 h-10 p-0 border-0"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="primary-color-hex" className="text-sm text-muted-foreground">
                      Couleur primaire
                    </label>
                    <input
                      id="primary-color-hex"
                      type="text"
                      value={primaryColor}
                      onChange={(e) => handlePrimaryColorChange(e.target.value)}
                      className="border rounded px-2 py-1 w-40 dark:bg-black/10"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

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
