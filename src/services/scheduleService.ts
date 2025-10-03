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
  // accepte prenom.nom ou prenom.nom123 (chiffres optionnels à la fin)
  const regex = /^[a-zA-Z]+\.[a-zA-Z]+\d*$/;
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
  let currentDate = new Date();

  // --- Décalage en semaines (facultatif) ---
  let weeksToAdd = 0;
  if (typeof dateInput === 'string' && /^-?\d+$/.test(dateInput)) {
    weeksToAdd = parseInt(dateInput);
  } else if (typeof dateInput === 'number') {
    weeksToAdd = dateInput;
  }

  if (weeksToAdd !== 0) {
    currentDate.setDate(currentDate.getDate() + weeksToAdd * 7);
  }

  // --- Trouver le lundi de la semaine ---
  const dayOfWeek = currentDate.getDay(); // 0 = dimanche, 1 = lundi, ...
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
  const monday = new Date(currentDate);
  monday.setDate(currentDate.getDate() + diffToMonday);

  // --- Générer lundi → vendredi ---
  const workingDays: Date[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    d.setHours(12, 0, 0, 0); // éviter fuseau
    workingDays.push(d);
  }

  return workingDays.map(d => d.toISOString().split('T')[0]);
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
