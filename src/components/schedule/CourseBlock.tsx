// src/components/schedule/CourseBlock.tsx

import { useState, useEffect, useRef } from "react";
import { Clock, MapPin, User, X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { CourseBlockProps } from "@/types/schedule";

// Génère une couleur HSL stable selon la matière
function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function getCourseColors(subject: string) {
  // Hue stable 0..360 basé sur hash
  const hue = hashString(subject) % 360;
  // Saturation/Lightness modérées pour bon rendu sur light/dark
  const saturation = 70; // %
  const lightness = 50; // %
  // Background translucide
  const bg = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.18)`;
  const border = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.35)`;
  // Texte: noir en light, blanc en dark avec alpha contrôlé via util classes
  // On laissera Tailwind gérer la couleur de texte via classes et on n’applique pas de text color inline.
  return { bg, border };
}

export const CourseSkeleton = () => (
  <div className="animate-pulse bg-gray-200/20 rounded-xl h-16 w-full border border-white/10" />
);

const CourseBlock = ({
  course,
  viewMode = "week",
  style,
}: CourseBlockProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    if (!isModalOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        closeModal();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  const { bg, border } = getCourseColors(course.matiere);

  return (
    <>
      <motion.div
        onClick={openModal}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.18 }}
        className={cn(
          "relative rounded-xl cursor-pointer transition-all backdrop-blur-md shadow-sm overflow-hidden h-full box-border",
          viewMode === "month"
            ? "p-2 text-xs h-auto"
            : "p-2.5 text-sm min-h-[36px]"
        )}
        style={{
          ...style,
          background: bg,
          border: `1px solid ${border}`,
        }}
      >
        {/* Titre - limite à 2 lignes pour ne pas déborder */}
        <h4 className="font-semibold text-foreground">
          {course.matiere}
        </h4>

        {viewMode !== "month" && (
          <div className="mt-1 space-y-1 text-xs text-muted-foreground">
            <div className="text-[11px] text-muted-foreground leading-tight">
              <span>
                {course.debut} – {course.fin}
              </span>
              {course.salle && (
                <>
                  {" • "}
                  <span className="truncate">
                    {" "}
                    {course.salle?.startsWith("SALLE") ? "🏠" : course.salle}
                  </span>
                </>
              )}
            </div>

            {course.prof && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" /> {course.prof}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            ref={modalRef}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg max-w-md w-full p-6 relative"
          >
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold mb-4 text-foreground">
              {course.matiere}
            </h2>

            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                {course.debut} - {course.fin}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>
                {course.salle?.startsWith("SALLE")
                  ? "DISTANCIEL 🏠"
                  : course.salle}
              </span>
            </div>

            {course.prof && (
              <div className="flex items-center gap-2 mb-2 text-muted-foreground">
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
