import { Course } from '@/services/scheduleService';
import { Clock, MapPin, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseBlockProps {
  course: Course; // Données du cours à afficher
  onClick?: () => void; // Callback si on clique sur le cours
}

const CourseBlock = ({ course, onClick }: CourseBlockProps) => {
  // DEBUG : vérifier que le cours est bien reçu
  console.log("[DEBUG] Rendering CourseBlock:", course);

  return (
    <div
      onClick={() => {
        console.log("[DEBUG] Course clicked:", course.matiere, course.debut, course.fin);
        if (onClick) onClick();
      }}
      className={cn(
        "p-3 rounded-xl shadow-card hover:shadow-elevated transition-all cursor-pointer",
        "border border-white/20 backdrop-blur-sm"
      )}
      style={{
        backgroundColor: course.color.bg, // Couleur de fond spécifique au cours
        color: course.color.text, // Couleur du texte
      }}
    >
      <div className="space-y-2">
        {/* Ligne supérieure : nom du cours et horaire */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm text-foreground line-clamp-2">
            {course.matiere}
          </h3>
          <div className="flex items-center gap-1 text-xs text-foreground/80 bg-white/20 px-2 py-0.5 rounded-full whitespace-nowrap">
            <Clock className="w-3 h-3" />
            <span>{course.debut} - {course.fin}</span>
          </div>
        </div>

        {/* Informations supplémentaires : salle et professeur */}
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
  );
};

export default CourseBlock;
