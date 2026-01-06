import { COLORS } from "@/constants/schedule";
import { Course, Day } from "@/types/schedule";
import axios from "axios";
import ICAL from "ical.js";

export const isStringDotString = (input: string): boolean => {
  const regex = /^[a-zA-Z]+\.[a-zA-Z]+\d*$/;
  return regex.test(input);
};

const assignColors = (schedule: Day[]): Day[] => {
  const subjectColors = new Map<string, { background: string; text: string }>();
  let colorIndex = 0;

  schedule.forEach((day) => {
    day.courses.forEach((course) => {
      if (!subjectColors.has(course.subject)) {
        subjectColors.set(course.subject, COLORS[colorIndex % COLORS.length]);
        colorIndex++;
      }
      course.color = subjectColors.get(course.subject)!;
    });
  });

  return schedule;
};

function getWorkingDays(dateInput?: string | number | null): string[] {
    const currentDate = new Date();

    let weeksToAdd = 0;
    if (typeof dateInput === "string" && /^-?\d+$/.test(dateInput)) {
        weeksToAdd = parseInt(dateInput, 10);
    } else if (typeof dateInput === "number") {
        weeksToAdd = dateInput;
    }

    if (weeksToAdd !== 0) {
        currentDate.setDate(currentDate.getDate() + weeksToAdd * 7);
    }

    const dayOfWeek = currentDate.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() + diffToMonday);

    const workingDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        workingDays.push(d);
    }

    return workingDays.map((d) => d.toISOString().split("T")[0]);
}

const parseHtmlDay = (html: string): Course[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const courses: Course[] = [];
  doc.querySelectorAll(".Ligne").forEach((ligne) => {
    const start = (ligne.querySelector(".Debut")?.textContent || "").trim();
    const end = (ligne.querySelector(".Fin")?.textContent || "").trim();
    const subject = (ligne.querySelector(".Matiere")?.textContent || "").trim();
    const roomRaw = (ligne.querySelector(".Salle")?.textContent || "").trim();
    const teacherRaw = (ligne.querySelector(".Prof")?.textContent || "").trim();

    const room = roomRaw || "";
    const teacher = teacherRaw || "";

    if (start && end && subject) {
      courses.push({
        start,
        end,
        subject,
        room,
        teacher,
        color: { background: "", text: "" }, // sera rempli par assignColors
      });
    }
  });

  return courses;
};

const dayOfWeekMap: { [key: number]: string } = {
    1: "Lundi",
    2: "Mardi",
    3: "Mercredi",
    4: "Jeudi",
    5: "Vendredi",
    6: "Samedi",
    0: "Dimanche",
};

const parseICalData = (icalData: string, weekOffset: number): Day[] => {
    const jcalData = ICAL.parse(icalData);
    const vcalendar = new ICAL.Component(jcalData);
    const vevents = vcalendar.getAllSubcomponents("vevent");

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() + weekOffset * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const coursesByDay: { [key: string]: Course[] } = {};

    vevents.forEach((vevent: any) => {
        const event = new ICAL.Event(vevent);
        const dtstart = event.startDate.toJSDate();

        if (dtstart >= weekStart && dtstart < weekEnd) {
            const dayOfWeek = dtstart.getDay();
            const dayName = dayOfWeekMap[dayOfWeek];
            const date = dtstart.toISOString().split("T")[0];

            if (!coursesByDay[dayName]) {
                coursesByDay[dayName] = [];
            }

            coursesByDay[dayName].push({
                start: event.startDate.toJSDate().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
                end: event.endDate.toJSDate().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
                subject: event.summary,
                room: event.location || "",
                teacher: "", // iCal doesn't always have a teacher field in the same way
                color: { background: "", text: "" },
            });
        }
    });

    const schedule: Day[] = Object.keys(dayOfWeekMap).map(dayIndex => {
        const dayName = dayOfWeekMap[dayIndex as unknown as number];
        return {
            day: dayName,
            date: "", // This would need to be calculated based on the week
            courses: coursesByDay[dayName] || []
        };
    });

    return schedule;
};

export const fetchSchedule = async (
  username: string,
  dateInput?: string | null
): Promise<Day[]> => {
  if (!isStringDotString(username)) return [];

  const workingDays = getWorkingDays(dateInput ?? null);
  const daysOfWeek = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

  const schedule = await Promise.all(
    workingDays.map(async (date, i) => {
      const url = `https://corsproxy.io/?https://edtmobiliteng.wigorservices.net/WebPsDyn.aspx?Action=posETUD&serverid=C&tel=${username}&date=${encodeURIComponent(
        date
      )}%208:00`;

      try {
        const { data } = await axios.get<string>(url);
        return { day: daysOfWeek[i], date, courses: parseHtmlDay(data) };
      } catch {
        return { day: daysOfWeek[i], date, courses: [] };
      }
    })
  );

  return assignColors(schedule);
};

export const fetchCustomSchedule = async (
    icalUrl: string,
    weekOffset: number
): Promise<Day[]> => {
    const url = `https://corsproxy.io/?${encodeURIComponent(icalUrl)}`;
    try {
        const { data } = await axios.get<string>(url);
        const schedule = parseICalData(data, weekOffset);
        return assignColors(schedule);
    } catch (error) {
        console.error("Error fetching or parsing iCal data:", error);
        return [];
    }
};

export const getUniqueSubjects = (schedule: Day[]): string[] => {
  const subjects = new Set<string>();
  schedule.forEach((day) => {
    day.courses.forEach((course) => subjects.add(course.subject));
  });
  return Array.from(subjects);
};