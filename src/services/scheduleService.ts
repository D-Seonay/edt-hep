import axios from 'axios';

export interface Course {
  debut: string;
  fin: string;
  matiere: string;
  salle: string;
  prof: string;
  color: { bg: string; text: string };
}

export interface Day {
  day: string;
  date: string;
  courses: Course[];
}

const COLORS = [
  { bg: 'hsl(var(--course-blue))', text: 'hsl(var(--foreground))' },
  { bg: 'hsl(var(--course-purple))', text: 'hsl(var(--foreground))' },
  { bg: 'hsl(var(--course-pink))', text: 'hsl(var(--foreground))' },
  { bg: 'hsl(var(--course-orange))', text: 'hsl(var(--foreground))' },
  { bg: 'hsl(var(--course-cyan))', text: 'hsl(var(--foreground))' },
  { bg: 'hsl(var(--course-yellow))', text: 'hsl(var(--foreground))' },
  { bg: 'hsl(var(--course-green))', text: 'hsl(var(--foreground))' },
];

// --- 🆕 Ajout : validation prenom.nom ---
export const isStringDotString = (input: string): boolean => {
  const regex = /^[a-zA-Z]+\.[a-zA-Z]+$/;
  return regex.test(input);
};

// --- 🆕 Assignation des couleurs par matière ---
const assignColors = (schedule: Day[]): Day[] => {
  const matiereColors = new Map<string, { bg: string; text: string }>();
  let colorIndex = 0;

  schedule.forEach(day => {
    day.courses.forEach(course => {
      if (!matiereColors.has(course.matiere)) {
        matiereColors.set(course.matiere, COLORS[colorIndex % COLORS.length]);
        colorIndex++;
      }
      course.color = matiereColors.get(course.matiere)!;
    });
  });

  return schedule;
};

// --- 🆕 Calcul des jours de travail corrects ---
function getWorkingDays(dateInput?: string | number | null): string[] {
  const workingDays: Date[] = [];
  let currentDate: Date;

  console.debug('[getWorkingDays] dateInput (raw):', dateInput);

  // --- Gestion spéciale si dateInput est un nombre de semaines à ajouter ---
  const weeksToAdd = (typeof dateInput === 'string' && /^\d+$/.test(dateInput))
    ? parseInt(dateInput)
    : typeof dateInput === 'number' ? dateInput : 0;

  currentDate = new Date();
  if (weeksToAdd > 0) {
    currentDate.setDate(currentDate.getDate() + weeksToAdd * 7);
    console.debug(`[getWorkingDays] Adding ${weeksToAdd} week(s) ->`, currentDate);
  } 
  // --- Sinon parsing normal si ce n'est pas un nombre ---
  else if (!dateInput || dateInput === 0 || dateInput === "0") {
    console.debug('[getWorkingDays] using current system date');
  } else if (typeof dateInput === 'string') {
    if (dateInput.includes('/')) {
      const [day, month, year] = dateInput.split('/').map(Number);
      currentDate = new Date(year, month - 1, day);
      console.debug('[getWorkingDays] parsed dd/mm/yyyy ->', currentDate);
    } else {
      currentDate = new Date(dateInput);
      console.debug('[getWorkingDays] parsed string (ISO?) ->', currentDate);
    }
  } else if (typeof dateInput === 'number') {
    currentDate = new Date(dateInput);
    console.debug('[getWorkingDays] parsed number timestamp ->', currentDate);
  }

  // --- Régler l'heure à midi pour éviter les effets fuseau ---
  currentDate.setHours(12, 0, 0, 0);

  const dayOfWeek = currentDate.getDay();
  const currentHour = currentDate.getHours();

  const addDays = (d: Date, n: number) => {
    const res = new Date(d);
    res.setDate(res.getDate() + n);
    return res;
  };

  // --- Construire les 5 jours ouvrés ---
  switch (dayOfWeek) {
    case 0: for (let i = 1; i <= 5; i++) workingDays.push(addDays(currentDate, i)); break;
    case 6: for (let i = 2; i <= 6; i++) workingDays.push(addDays(currentDate, i - 2)); break;
    case 1: for (let i = 0; i < 5; i++) workingDays.push(addDays(currentDate, i)); break;
    case 2: for (let i = -1; i <= 3; i++) workingDays.push(addDays(currentDate, i)); break;
    case 3: for (let i = -2; i <= 2; i++) workingDays.push(addDays(currentDate, i)); break;
    case 4: for (let i = -3; i <= 1; i++) workingDays.push(addDays(currentDate, i)); break;
    case 5:
      if (currentHour >= 20) {
        for (let i = 3; i <= 7; i++) workingDays.push(addDays(currentDate, i));
      } else {
        for (let i = -4; i <= 0; i++) workingDays.push(addDays(currentDate, i));
      }
      break;
    default:
      for (let i = 0; i < 5; i++) workingDays.push(addDays(currentDate, i));
  }

  const isoDays = workingDays.map(d => d.toISOString().split('T')[0]);
  console.debug('[getWorkingDays] workingDays (ISO strings):', isoDays);

  return isoDays;
}









// --- 🆕 Parser un seul jour depuis le HTML ---
const parseHtmlDay = (html: string): Course[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const courses: Course[] = [];
  doc.querySelectorAll(".Ligne").forEach(ligne => {
    const debut = (ligne.querySelector(".Debut")?.textContent || "").trim();
    const fin = (ligne.querySelector(".Fin")?.textContent || "").trim();
    const matiere = (ligne.querySelector(".Matiere")?.textContent || "").trim();
    const salle = (ligne.querySelector(".Salle")?.textContent || "").trim();
    const prof = (ligne.querySelector(".Prof")?.textContent || "").trim();

    if (debut && fin && matiere) {
      courses.push({
        debut,
        fin,
        matiere,
        salle,
        prof,
        color: { bg: '', text: '' }, // ajouté plus tard
      });
    }
  });

  console.log('[DEBUG] Parsed courses for day:', courses);
  return courses;
};

// --- 🆕 Récupérer le planning complet d'une semaine ---
export const fetchSchedule = async (username: string, dateInput?: string | null): Promise<Day[]> => {
  if (!isStringDotString(username)) {
    console.error('[DEBUG] Invalid username:', username);
    return [];
  }

  const workingDays = getWorkingDays(dateInput);
  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  const schedule: Day[] = [];

  for (let i = 0; i < workingDays.length; i++) {
    const dayDate = workingDays[i];
    const url = `https://corsproxy.io/?https://edtmobiliteng.wigorservices.net/WebPsDyn.aspx?Action=posETUD&serverid=C&tel=${username}&date=${encodeURIComponent(dayDate)}%208:00`;
    console.log('[DEBUG] Fetching URL:', url);

    try {
      const response = await axios.get(url);
      const courses = parseHtmlDay(response.data);

      schedule.push({
        day: daysOfWeek[i],
        date: dayDate,
        courses
      });
    } catch (error) {
      console.error('[DEBUG] Error fetching day:', dayDate, error);
      schedule.push({ day: daysOfWeek[i], date: dayDate, courses: [] });
    }
  }

  return assignColors(schedule);
};

// --- Obtenir toutes les matières uniques ---
export const getUniqueSubjects = (schedule: Day[]): string[] => {
  const subjects = new Set<string>();
  schedule.forEach(day => {
    day.courses.forEach(course => subjects.add(course.matiere));
  });
  return Array.from(subjects);
};
