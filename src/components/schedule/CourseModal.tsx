import { useEffect, useRef } from "react";
import { Clock, MapPin, User, X } from "lucide-react";
import { Course, CourseModalProps } from "@/types/schedule";

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
  const bg = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.30)`;
  const border = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.5)`;
  return { bg, border };
}

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

  const { bg, border } = getCourseColors(course.subject);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 p-4"
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
          className="absolute top-3 right-3 text-black hover:text-gray-900"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold mb-4 text-black">{course.subject}</h2>

        <div className="flex items-center gap-2 mb-2 text-black hover:text-gray-900">
          <Clock className="w-4 h-4" />
          <span>
            {course.start} - {course.end}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2 text-black">
          <MapPin className="w-4 h-4" />
          <span>
            {course.room?.startsWith("SALLE") ? "DISTANCIEL 🏠" : course.room}
          </span>
        </div>

        {course.teacher && (
          <div className="flex items-center gap-2 mb-2 text-black">
            <User className="w-4 h-4" />
            <span>{course.teacher}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseModal;
