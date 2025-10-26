import { useState, useEffect, useRef } from "react";
import { Course } from "@/services/scheduleService";
import { Clock, MapPin, User, X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CourseBlockProps {
  course: Course;
  viewMode?: "day" | "week" | "month";
  style?: React.CSSProperties;
}

export const CourseSkeleton = () => (
  <div className="animate-pulse bg-gray-200/20 rounded-xl h-16 w-full border border-white/10" />
);

const CourseBlock = ({ course, viewMode = "week", style }: CourseBlockProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Ferme la modale si clic extérieur
  useEffect(() => {
    if (!isModalOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeModal();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModalOpen]);

  // Ferme la modale avec Échap
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  return (
    <>
      <motion.div
        onClick={openModal}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.25 }}
        className={cn(
          "relative rounded-xl cursor-pointer transition-all border border-white/10 backdrop-blur-md shadow-sm overflow-hidden h-full box-border",
          viewMode === "month"
            ? "p-2 text-xs h-auto"
            : "p-3 text-sm min-h-[60px]"
        )}
        style={{ ...style, background: course.color.bg, color: course.color.text }}
      >
        <h3 className="font-semibold line-clamp-2 text-black">{course.matiere}</h3>

        {viewMode !== "month" && (
          <div className="mt-1 space-y-1 text-xs opacity-80 text-black dark:text-black/800">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {course.debut} - {course.fin}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />{" "}
              {course.salle.startsWith("SALLE") ? "DISTANCIEL 🏠" : course.salle}
            </div>
            {course.prof && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" /> {course.prof}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* --- Modale de détails --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            ref={modalRef}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg max-w-md w-full p-6 relative"
          >
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-600 dark:text-black/300 hover:text-black dark:hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold mb-4">{course.matiere}</h2>

            <div className="flex items-center gap-2 mb-2 text-gray-600 dark:text-gray-300">
              <Clock className="w-4 h-4" />
              <span>
                {course.debut} - {course.fin}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2 text-gray-600 dark:text-gray-300">
              <MapPin className="w-4 h-4" />
              <span>
                {course.salle.startsWith("SALLE")
                  ? "DISTANCIEL 🏠"
                  : course.salle}
              </span>
            </div>

            {course.prof && (
              <div className="flex items-center gap-2 mb-2 text-gray-600 dark:text-gray-300">
                <User className="w-4 h-4" />
                <span>{course.prof}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CourseBlock;
