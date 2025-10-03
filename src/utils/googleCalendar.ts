import { Course, Day } from '@/services/scheduleService';

// Fonction pour créer un événement au format Google Calendar
const createGoogleCalendarEvent = (course: Course, date: string): string => {
  const [day, month, year] = date.split('/');
  const courseDate = `${year}${month}${day}`;
  
  const startTime = course.debut.replace(':', '');
  const endTime = course.fin.replace(':', '');
  
  const title = encodeURIComponent(course.matiere);
  const location = encodeURIComponent(course.salle.startsWith("SALLE") ? "DISTANCIEL" : course.salle);
  const description = encodeURIComponent(`Professeur: ${course.prof}\nSalle: ${course.salle}`);
  
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${courseDate}T${startTime}00/${courseDate}T${endTime}00&details=${description}&location=${location}`;
};

// Exporter un cours unique vers Google Calendar
export const exportCourseToGoogleCalendar = (course: Course, date: string) => {
  const url = createGoogleCalendarEvent(course, date);
  window.open(url, '_blank');
};

// Exporter toute la semaine vers Google Calendar
export const exportWeekToGoogleCalendar = (schedule: Day[]) => {
  // Note: Google Calendar ne permet pas d'ajouter plusieurs événements à la fois
  // On ouvre donc chaque cours dans un nouvel onglet
  schedule.forEach((day) => {
    day.courses.forEach((course) => {
      const url = createGoogleCalendarEvent(course, day.date);
      window.open(url, '_blank');
    });
  });
};

// Générer un fichier ICS pour tout le planning (alternative à Google Calendar)
export const exportToICS = (schedule: Day[], filename: string = 'emploi-du-temps.ics') => {
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mon Emploi du Temps//FR',
    'CALNAME:Emploi du Temps',
    'TIMEZONE:Europe/Paris',
  ];

  schedule.forEach((day) => {
    day.courses.forEach((course) => {
      const [dayNum, month, year] = day.date.split('/');
      const startHour = course.debut.replace(':', '');
      const endHour = course.fin.replace(':', '');
      
      const dateStr = `${year}${month}${dayNum}`;
      
      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`DTSTART:${dateStr}T${startHour}00`);
      icsContent.push(`DTEND:${dateStr}T${endHour}00`);
      icsContent.push(`SUMMARY:${course.matiere}`);
      icsContent.push(`LOCATION:${course.salle.startsWith("SALLE") ? "DISTANCIEL" : course.salle}`);
      icsContent.push(`DESCRIPTION:Professeur: ${course.prof}`);
      icsContent.push('END:VEVENT');
    });
  });

  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
