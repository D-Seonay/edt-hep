import axios from 'axios';

export interface Course {
  debut: string;
  fin: string;
  matiere: string;
  salle: string;
  prof: string;
  color: string;
}

export interface Day {
  day: string;
  date: string;
  courses: Course[];
}

const COLORS = [
  'course-blue',
  'course-purple',
  'course-pink',
  'course-orange',
  'course-cyan',
  'course-yellow',
  'course-green',
];

// Fonction pour valider le format prenom.nom
export const isStringDotString = (input: string): boolean => {
  const regex = /^[a-zA-Z]+\.[a-zA-Z]+$/;
  return regex.test(input);
};

// Assigner une couleur unique à chaque matière
const assignColors = (schedule: Day[]): Day[] => {
  const matiereColors = new Map<string, string>();
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

// Récupérer l'emploi du temps via l'API
export const fetchSchedule = async (username: string, weekOffset: number = 0): Promise<Day[]> => {
  try {
    const baseUrl = 'https://edtmobiliteng.wigorservices.net/api/edtBis.php';
    const proxyUrl = 'https://corsproxy.io/?';
    
    // Calculer la date de la semaine demandée
    const today = new Date();
    today.setDate(today.getDate() + (weekOffset * 7));
    const dateStr = today.toISOString().split('T')[0];

    const url = `${proxyUrl}${encodeURIComponent(`${baseUrl}?tel=${username}&date=${dateStr}`)}`;
    
    const response = await axios.get(url);
    const data = response.data;

    // Transformer les données de l'API en format utilisable
    const schedule: Day[] = [];
    
    if (data && Array.isArray(data)) {
      data.forEach((dayData: any) => {
        const day: Day = {
          day: dayData.day || dayData.jour,
          date: dayData.date,
          courses: []
        };

        if (dayData.courses && Array.isArray(dayData.courses)) {
          day.courses = dayData.courses.map((course: any) => ({
            debut: course.debut || course.start,
            fin: course.fin || course.end,
            matiere: course.matiere || course.subject,
            salle: course.salle || course.room,
            prof: course.prof || course.teacher,
            color: ''
          }));
        }

        schedule.push(day);
      });
    }

    return assignColors(schedule);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'emploi du temps:', error);
    throw new Error('Impossible de récupérer l\'emploi du temps');
  }
};

// Obtenir les matières uniques du planning
export const getUniqueSubjects = (schedule: Day[]): string[] => {
  const subjects = new Set<string>();
  schedule.forEach(day => {
    day.courses.forEach(course => {
      subjects.add(course.matiere);
    });
  });
  return Array.from(subjects);
};
