// src/services/scheduleService.ts
import { COLORS } from "@/constants/schedule";
import { Course, Day } from "@/types/schedule";
import axios from "axios";

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

  const dayOfWeek = currentDate.getDay(); // 0 = dimanche
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(currentDate);
  monday.setDate(currentDate.getDate() + diffToMonday);

  const workingDays: Date[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    d.setHours(12, 0, 0, 0);
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
        color: { background: "", text: "" },
      });
    }
  });

  return courses;
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
      const url = `/api/wigor-proxy?tel=${encodeURIComponent(
        username
      )}&date=${encodeURIComponent(date)}&time=${encodeURIComponent("8:00")}`;

      try {
        const { data } = await axios.get<string>(url, { responseType: "text" });
        return { day: daysOfWeek[i], date, courses: parseHtmlDay(data) };
      } catch {
        return { day: daysOfWeek[i], date, courses: [] };
      }
    })
  );

  return assignColors(schedule);
};

export const getUniqueSubjects = (schedule: Day[]): string[] => {
  const subjects = new Set<string>();
  schedule.forEach((day) => {
    day.courses.forEach((course) => subjects.add(course.subject));
  });
  return Array.from(subjects);
};
