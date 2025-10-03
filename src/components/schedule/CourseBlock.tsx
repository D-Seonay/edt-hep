import { useState } from 'react';
import { Course } from '@/services/scheduleService';
import { Clock, MapPin, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseBlockProps {
  course: Course;
}

const CourseBlock = ({ course }: CourseBlockProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      {/* --- Bloc du cours --- */}
      <div
        onClick={openModal}
        className={cn(
          "p-3 rounded-xl shadow-card hover:shadow-elevated transition-all cursor-pointer",
          "border border-white/20 backdrop-blur-sm"
        )}
        style={{
          backgroundColor: course.color.bg,
          color: course.color.text,
        }}
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm text-foreground line-clamp-2">
              {course.matiere}
            </h3>
            <div className="flex items-center gap-1 text-xs text-foreground/80 bg-white/20 px-2 py-0.5 rounded-full whitespace-nowrap">
              <Clock className="w-3 h-3" />
              <span>{course.debut} - {course.fin}</span>
            </div>
          </div>

          <div className="space-y-1 text-xs text-foreground/80">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{course.salle}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{course.prof}</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Modale --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-2xl shadow-lg max-w-md w-full p-6 relative">
            {/* Bouton fermer */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-foreground/70 hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold mb-4">{course.matiere}</h2>

            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4" />
              <span>{course.debut} - {course.fin}</span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4" />
              <span>{course.salle.startsWith("SALLE") ? "DISTANCIEL" : course.salle}</span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4" />
              <span>{course.prof}</span>
            </div>

            {/* Exemple : ajouter plus d’infos si besoin */}
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Informations complémentaires peuvent être ajoutées ici.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseBlock;
