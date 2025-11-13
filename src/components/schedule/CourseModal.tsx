import { useEffect, useRef } from "react";
import { Clock, MapPin, User, X } from "lucide-react";

// We duplicate the color util used by blocks to keep a consistent look.
// If you already have a shared util, import it instead.
function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}
function getCourseColors(subject: string) {
  const hue = hashString(subject) % 360;
  const saturation = 100;
  const lightness = 50;
  const bg = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.18)`;
  const border = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.35)`;
  return { bg, border };
}

export type Course = {
  matiere: string;
  debut: string; // "HH:mm"
  fin: string;   // "HH:mm"
  salle?: string | null;
  prof?: string | null;
};

type CourseModalProps = {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
};

const CourseModal = ({ course, isOpen, onClose }: CourseModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !course) return null;

  const { bg, border } = getCourseColors(course.matiere);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg max-w-md w-full p-6 relative"
        style={{ background: bg, border: `1px solid ${border}` }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-black dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold mb-4 text-foreground text-black dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">{course.matiere}</h2>

        <div className="flex items-center gap-2 mb-2 text-muted-foreground text-black dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
          <Clock className="w-4 h-4" />
          <span>
            {course.debut} - {course.fin}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2 text-muted-foreground text-black dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
          <MapPin className="w-4 h-4" />
          <span>
            {course.salle?.startsWith("SALLE") ? "DISTANCIEL 🏠" : course.salle}
          </span>
        </div>

        {course.prof && (
          <div className="flex items-center gap-2 mb-2 text-muted-foreground text-black dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
            <User className="w-4 h-4" />
            <span>{course.prof}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseModal;
