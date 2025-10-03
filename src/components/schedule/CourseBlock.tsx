import { useState, useEffect, useRef } from 'react';
import { Course } from '@/services/scheduleService';
import { Clock, MapPin, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseBlockProps {
  course: Course;
}

const CourseBlock = ({ course }: CourseBlockProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // --- Fermer la modale sur clic en dehors ---
  useEffect(() => {
    if (!isModalOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeModal();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isModalOpen]);

  // --- Fermer la modale sur touche Échap ---
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  return (
    <>
      {/* --- Bloc du cours --- */}
      <div
        onClick={openModal}
        className={cn(
          "p-3 rounded-xl shadow-card hover:shadow-elevated transition-all cursor-pointer border border-white/20 backdrop-blur-sm",
          "dark:border-gray-700"
        )}
        style={{
          backgroundColor: course.color.bg,
          color: course.color.text,
        }}
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm text-foreground dark:text-white line-clamp-2">
              {course.matiere}
            </h3>
          </div>

          <div className="space-y-1 text-xs text-foreground/80 dark:text-gray-300">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{course.salle.startsWith("SALLE") ? "DISTANCIEL 🏠" : course.salle}</span>
            </div>
            {course.prof && course.prof.trim() !== "" && (
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4" />
                <span>{course.prof}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Modale --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4">
          <div
            ref={modalRef}
            className="bg-card dark:bg-gray-800 rounded-2xl shadow-lg max-w-md w-full p-6 relative transition-colors duration-300"
          >
            {/* Bouton fermer */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-foreground/70 dark:text-gray-300 hover:text-foreground dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold mb-4 text-foreground dark:text-white">{course.matiere}</h2>

            <div className="flex items-center gap-2 mb-2 text-foreground/80 dark:text-gray-300">
              <Clock className="w-4 h-4" />
              <span>{course.debut} - {course.fin}</span>
            </div>

            <div className="flex items-center gap-2 mb-2 text-foreground/80 dark:text-gray-300">
              <MapPin className="w-4 h-4" />
              <span>{course.salle.startsWith("SALLE") ? "DISTANCIEL 🏠" : course.salle}</span>
            </div>

            {course.prof && course.prof.trim() !== "" && (
              <div className="flex items-center gap-2 mb-2 text-foreground/80 dark:text-gray-300">
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
